import { getService } from '../_shared/store.ts';
import { hashPassword, verifyPassword, isLegacyPasswordHash, signToken, verifyToken, TOKEN_TTL_MS } from "../_shared/session-tokens.ts";
import { loginThrottle, TOO_MANY } from '../_shared/auth-throttle.ts';

// Camada de autenticação e dados do Portal Escolar (aluno / professor / pai).
// Roda com service role para contornar o RLS admin-only de Student/Parent/Teacher,
// valida as credenciais e sessões no servidor e NUNCA retorna password_hash.
//
// SEGURANÇA: nenhuma ação privilegiada confia em IDs enviados pelo cliente.
// No login/registro o servidor emite um token de sessão assinado (HMAC-SHA256)
// com { sub, role, exp }. Todas as ações subsequentes exigem esse token e usam
// `sub` como identidade — o cliente não pode escolher o ID de outro usuário.

const LOGIN_DOMAIN = "@aluno.cetisebastiaosoribeiro.edu.br";
const GMAIL_DOMAIN = "@gmail.com";

// Busca aluno pelo login. Logins novos são e-mails Gmail aleatórios; os
// antigos usam o domínio institucional. Aceita o login com ou sem domínio.
async function findStudentByLogin(base44, raw) {
  const l = (raw || "").trim().toLowerCase();
  if (!l) return null;
  const candidates = l.includes("@")
    ? [l]
    : [`${l}${LOGIN_DOMAIN}`, `${l}${GMAIL_DOMAIN}`];
  for (const c of candidates) {
    const rows = await base44.entities.Student.filter({ student_login: c, is_active: true });
    if (rows[0]) return rows[0];
  }
  return null;
}
function normEmail(e) {
  return (e || "").trim().toLowerCase();
}

function parseTurmas(str) {
  return (str || "").split(/[,;]/).map((s) => s.trim()).filter(Boolean);
}

// ---------- Sanitização (nunca expõe password_hash) ----------

function sanitizeStudent(s) {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    student_login: s.student_login,
    turma: s.turma || "",
    course: s.course || "",
    enrollment: s.enrollment || "",
    is_active: s.is_active,
    password_changed: s.password_changed,
  };
}
function sanitizeTeacher(t) {
  if (!t) return null;
  return {
    id: t.id,
    name: t.name,
    email: t.email,
    disciplines: t.disciplines || "",
    turmas: t.turmas || "",
    password_changed: t.password_changed,
  };
}
function sanitizeParent(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    student_ids: p.student_ids || [],
    password_changed: p.password_changed,
  };
}

const UNAUTHORIZED = () =>
  Response.json({ error: "Sessão inválida ou expirada. Faça login novamente." }, { status: 401 });

export async function handlePortal(req) {
  try {
    const svc = getService();
    const body = await req.json();
    const action = body.action;

    const SECRET = Deno.env.get("PORTAL_TOKEN_SECRET");
    if (!SECRET) {
      return Response.json(
        { error: "Servidor sem segredo de sessão configurado (PORTAL_TOKEN_SECRET)." },
        { status: 500 }
      );
    }

    // A sessão é validada contra a conta ativa e a versão atual de sessão.
    // Redefinir a senha invalida os tokens anteriores, inclusive os já emitidos.
    const auth = async (role) => {
      const payload = await verifyToken(body.token, SECRET);
      if (!payload || (role && payload.role !== role)) return null;
      const map = { student: "Student", teacher: "Teacher", parent: "Parent" };
      const entity = map[payload.role];
      if (!entity || typeof payload.sub !== "string") return null;
      const account = await svc.entities[entity].get(payload.sub);
      if (!account || account.is_active === false ||
          (payload.v ?? null) !== (account.session_version ?? null)) return null;
      return payload;
    };
    const issue = (account, role) =>
      signToken({ sub: account.id, role, v: account.session_version ?? null, exp: Date.now() + TOKEN_TTL_MS }, SECRET);

    // ---------- Aluno ----------
    if (action === "studentLogin") {
      if (!(await loginThrottle(svc, "student", body.login))) return TOO_MANY();
      const s = await findStudentByLogin(svc, body.login);
      if (!s || !(await verifyPassword(body.password, s.password_hash))) {
        if (!(await loginThrottle(svc, "student", body.login, "failure"))) return TOO_MANY();
        return Response.json({ error: "Login ou senha incorretos." }, { status: 401 });
      }
      if (isLegacyPasswordHash(s.password_hash) &&
          typeof body.password === "string" && body.password.length >= 8 && body.password.length <= 128) {
        await svc.entities.Student.update(s.id, { password_hash: await hashPassword(body.password) });
      }
      await loginThrottle(svc, "student", body.login, "success");
      const token = await issue(s, "student");
      return Response.json({ student: { ...sanitizeStudent(s), token } });
    }

    if (action === "studentProfile") {
      const a = await auth("student");
      if (!a) return UNAUTHORIZED();
      const s = await svc.entities.Student.get(a.sub);
      if (!s || s.is_active === false) return UNAUTHORIZED();
      return Response.json({ student: sanitizeStudent(s) });
    }

    if (action === "studentChangePassword") {
      const a = await auth("student");
      if (!a) return UNAUTHORIZED();
      const s = await svc.entities.Student.get(a.sub);
      if (!s || !(await verifyPassword(body.current, s.password_hash))) {
        return Response.json({ error: "Senha atual incorreta." }, { status: 400 });
      }
      await svc.entities.Student.update(a.sub, {
        password_hash: await hashPassword(body.next),
        password_changed: true,
        session_version: crypto.randomUUID(),
      });
      return Response.json({ ok: true });
    }

    // ---------- Professor ----------
    if (action === "teacherLogin") {
      if (!(await loginThrottle(svc, "teacher", body.email))) return TOO_MANY();
      const rows = await svc.entities.Teacher.filter({
        email: normEmail(body.email),
        is_active: true,
      });
      const t = rows[0];
      if (!t || !(await verifyPassword(body.password, t.password_hash))) {
        if (!(await loginThrottle(svc, "teacher", body.email, "failure"))) return TOO_MANY();
        return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
      }
      if (isLegacyPasswordHash(t.password_hash) &&
          typeof body.password === "string" && body.password.length >= 8 && body.password.length <= 128) {
        await svc.entities.Teacher.update(t.id, { password_hash: await hashPassword(body.password) });
      }
      await loginThrottle(svc, "teacher", body.email, "success");
      const token = await issue(t, "teacher");
      return Response.json({ teacher: { ...sanitizeTeacher(t), token } });
    }

    if (action === "teacherRegister") {
      const e = normEmail(body.email);
      const exists = await svc.entities.Teacher.filter({ email: e });
      if (exists.length) {
        return Response.json({ error: "E-mail já cadastrado." }, { status: 400 });
      }
      if (!e || !String(body.name || "").trim()) {
        return Response.json({ error: "Preencha nome e e-mail." }, { status: 400 });
      }
      const password_hash = await hashPassword(body.password);
      // Cadastro pendente de aprovação: sem turmas (atribuídas pelo admin) e
      // inativo até a coordenação aprovar. Nenhum token é emitido — o professor
      // só acessa o portal após um administrador ativar a conta e definir turmas.
      await svc.entities.Teacher.create({
        name: (body.name || "").trim(),
        email: e,
        password_hash,
        disciplines: (body.disciplines || "").trim(),
        turmas: "",
        is_active: false,
        password_changed: false,
      });
      return Response.json({
        pending: true,
        message:
          "Cadastro recebido! Aguarde a aprovação da coordenação para acessar o portal.",
      });
    }

    if (action === "teacherChangePassword") {
      const a = await auth("teacher");
      if (!a) return UNAUTHORIZED();
      const t = await svc.entities.Teacher.get(a.sub);
      if (!t || !(await verifyPassword(body.current, t.password_hash))) {
        return Response.json({ error: "Senha atual incorreta." }, { status: 400 });
      }
      await svc.entities.Teacher.update(a.sub, {
        password_hash: await hashPassword(body.next),
        password_changed: true,
        session_version: crypto.randomUUID(),
      });
      return Response.json({ ok: true });
    }

    // ---------- Pai / Mãe ----------
    if (action === "parentLogin") {
      if (!(await loginThrottle(svc, "parent", body.email))) return TOO_MANY();
      const rows = await svc.entities.Parent.filter({
        email: normEmail(body.email),
        is_active: true,
      });
      const p = rows[0];
      if (!p || !(await verifyPassword(body.password, p.password_hash))) {
        if (!(await loginThrottle(svc, "parent", body.email, "failure"))) return TOO_MANY();
        return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
      }
      if (isLegacyPasswordHash(p.password_hash) &&
          typeof body.password === "string" && body.password.length >= 8 && body.password.length <= 128) {
        await svc.entities.Parent.update(p.id, { password_hash: await hashPassword(body.password) });
      }
      await loginThrottle(svc, "parent", body.email, "success");
      const token = await issue(p, "parent");
      return Response.json({ parent: { ...sanitizeParent(p), token } });
    }

    if (action === "parentRegister") {
      const e = normEmail(body.email);
      const exists = await svc.entities.Parent.filter({ email: e });
      if (exists.length) {
        return Response.json({ error: "E-mail já cadastrado." }, { status: 400 });
      }
      if (!e || !String(body.name || "").trim()) {
        return Response.json({ error: "Preencha nome e e-mail." }, { status: 400 });
      }
      const password_hash = await hashPassword(body.password);
      const p = await svc.entities.Parent.create({
        name: (body.name || "").trim(),
        email: e,
        password_hash,
        student_ids: [],
        is_active: true,
        password_changed: true,
      });
      const token = await issue(p, "parent");
      return Response.json({ parent: { ...sanitizeParent(p), token } });
    }

    if (action === "parentChangePassword") {
      const a = await auth("parent");
      if (!a) return UNAUTHORIZED();
      const p = await svc.entities.Parent.get(a.sub);
      if (!p || !(await verifyPassword(body.current, p.password_hash))) {
        return Response.json({ error: "Senha atual incorreta." }, { status: 400 });
      }
      await svc.entities.Parent.update(a.sub, {
        password_hash: await hashPassword(body.next),
        password_changed: true,
        session_version: crypto.randomUUID(),
      });
      return Response.json({ ok: true });
    }

    // ---------- Dados (professor) ----------
    if (action === "studentsByTurma") {
      const a = await auth("teacher");
      if (!a) return UNAUTHORIZED();
      const t = await svc.entities.Teacher.get(a.sub);
      if (!t || !t.is_active) return UNAUTHORIZED();
      const teacherTurmas = parseTurmas(t.turmas);
      if (!teacherTurmas.length) {
        return Response.json({ students: [] });
      }
      const all = await svc.entities.Student.list();
      let filtered = all.filter((s) => teacherTurmas.includes(s.turma));
      // O cliente pode refinar ainda mais, mas nunca ampliar além das turmas do professor.
      if (Array.isArray(body.turmas) && body.turmas.length) {
        filtered = filtered.filter((s) => body.turmas.includes(s.turma));
      }
      filtered.sort((x, y) => (x.name || "").localeCompare(y.name || ""));
      return Response.json({ students: filtered.map(sanitizeStudent) });
    }

    if (action === "updateStudent") {
      const a = await auth("teacher");
      if (!a) return UNAUTHORIZED();
      const t = await svc.entities.Teacher.get(a.sub);
      if (!t || !t.is_active) return UNAUTHORIZED();
      const teacherTurmas = parseTurmas(t.turmas);
      if (!teacherTurmas.length) {
        return Response.json(
          { error: "Defina suas turmas no cadastro para editar alunos." },
          { status: 403 }
        );
      }
      const s = await svc.entities.Student.get(body.id);
      if (!s) return Response.json({ error: "Aluno não encontrado." }, { status: 404 });
      if (!teacherTurmas.includes(s.turma)) {
        return Response.json(
          { error: "Este aluno não pertence às suas turmas." },
          { status: 403 }
        );
      }
      const allowed = ["turma", "course", "enrollment", "is_active"];
      const patch = {};
      for (const k of allowed) {
        if (k in (body.patch || {})) patch[k] = body.patch[k];
      }
      await svc.entities.Student.update(body.id, patch);
      return Response.json({ ok: true });
    }

    // ---------- Dados (pai) ----------
    if (action === "parentChildren") {
      const a = await auth("parent");
      if (!a) return UNAUTHORIZED();
      const p = await svc.entities.Parent.get(a.sub);
      if (!p) return UNAUTHORIZED();
      const ids = p.student_ids || [];
      if (!ids.length) return Response.json({ students: [] });
      const all = await svc.entities.Student.list();
      return Response.json({
        students: all.filter((s) => ids.includes(s.id)).map(sanitizeStudent),
      });
    }

    if (action === "linkChild") {
      const a = await auth("parent");
      if (!a) return UNAUTHORIZED();
      if (!(await loginThrottle(svc, "link-child", body.studentLogin))) return TOO_MANY();
      const p = await svc.entities.Parent.get(a.sub);
      if (!p) return UNAUTHORIZED();
      const s = await findStudentByLogin(svc, body.studentLogin);
      if (!s) {
        if (!(await loginThrottle(svc, "link-child", body.studentLogin, "failure"))) return TOO_MANY();
        return Response.json(
          { error: "Aluno não encontrado. Verifique o login informado." },
          { status: 400 }
        );
      }
      // Comprovação de parentesco: exige a senha escolar do aluno, que a escola
      // entrega à família. Impede que alguém vincule alunos sabendo só o login
      // (que segue padrão enumerável). A senha nunca é retornada.
      if (!body.studentPassword) {
        return Response.json(
          { error: "Informe a senha do aluno para vincular." },
          { status: 400 }
        );
      }
      if (!(await verifyPassword(body.studentPassword, s.password_hash))) {
        if (!(await loginThrottle(svc, "link-child", body.studentLogin, "failure"))) return TOO_MANY();
        return Response.json({ error: "Senha do aluno incorreta." }, { status: 401 });
      }
      await loginThrottle(svc, "link-child", body.studentLogin, "success");
      const cur = p.student_ids || [];
      if (cur.includes(s.id)) {
        return Response.json({ error: "Este filho já está vinculado." }, { status: 400 });
      }
      const updated = [...cur, s.id];
      await svc.entities.Parent.update(a.sub, { student_ids: updated });
      return Response.json({ student_ids: updated });
    }

    // Consulta autenticada: nunca confiar na turma ou nome fornecidos pelo navegador.
    if (action === "studentLessons") {
      const a = await auth("student");
      if (!a) return UNAUTHORIZED();
      const s = await svc.entities.Student.get(a.sub);
      const lessons = await svc.entities.Lesson.filter({ is_active: true }, "-date", 200);
      const turma = s.turma || "";
      return Response.json({ lessons: lessons.filter((l) =>
        !l.turma || l.turma === "Todas" || l.turma === turma
      ) });
    }

    if (action === "teacherLessons") {
      const a = await auth("teacher");
      if (!a) return UNAUTHORIZED();
      const lessons = await svc.entities.Lesson.list("-date", 200);
      return Response.json({ lessons: lessons.filter((l) => l.author_id === a.sub) });
    }

    // ---------- Aulas (professor) ----------
    if (action === "createLesson") {
      const a = await auth("teacher");
      if (!a) return UNAUTHORIZED();
      const t = await svc.entities.Teacher.get(a.sub);
      if (!t || !t.is_active) return UNAUTHORIZED();
      const l = body.lesson || {};
      const requestedTurma = String(l.turma || "").trim();
      const assignedTurmas = parseTurmas(t.turmas);
      if (requestedTurma && requestedTurma !== "Todas" && !assignedTurmas.includes(requestedTurma)) {
        return Response.json({ error: "Você não está autorizado a publicar nessa turma." }, { status: 403 });
      }
      if (!String(l.title || "").trim() || !String(l.url || "").trim()) {
        return Response.json({ error: "Informe título e link do material." }, { status: 400 });
      }
      const rec = await svc.entities.Lesson.create({
        title: (l.title || "").trim(),
        description: (l.description || "").trim(),
        type: l.type || "Vídeo",
        url: (l.url || "").trim(),
        turma: requestedTurma,
        discipline: (l.discipline || "").trim(),
        // O autor é sempre o professor autenticado — não pode ser forjado.
        author: t.name || "Professor",
        author_id: t.id,
        date: new Date().toISOString().slice(0, 10),
        is_active: true,
      });
      return Response.json({ lesson: rec });
    }

    if (action === "deleteLesson") {
      const a = await auth("teacher");
      if (!a) return UNAUTHORIZED();
      const t = await svc.entities.Teacher.get(a.sub);
      if (!t || !t.is_active) return UNAUTHORIZED();
      const l = await svc.entities.Lesson.get(body.id);
      if (!l) return Response.json({ error: "Aula não encontrada." }, { status: 404 });
      // Somente o professor que publicou (ID estável) pode excluir.
      if (l.author_id !== t.id) {
        return Response.json(
          { error: "Você só pode excluir suas próprias aulas." },
          { status: 403 }
        );
      }
      await svc.entities.Lesson.delete(body.id);
      return Response.json({ ok: true });
    }

    // ---------- Exclusão da própria conta (aluno/professor/pai) ----------
    if (action === "deleteAccount") {
      const a = await auth(null);
      if (!a) return UNAUTHORIZED();
      const entityMap = { student: "Student", teacher: "Teacher", parent: "Parent" };
      const entity = entityMap[a.role];
      if (!entity) return Response.json({ error: "Perfil inválido." }, { status: 400 });
      await svc.entities[entity].delete(a.sub);
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Ação desconhecida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
import { preflight, corsResult } from '../_shared/response.ts';
Deno.serve((req) => req.method==='OPTIONS' ? preflight() : corsResult(handlePortal(req)));
