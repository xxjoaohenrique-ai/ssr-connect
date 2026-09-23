import { getService } from '../_shared/store.ts';
import { sha256, signToken, verifyToken, TOKEN_TTL_MS } from "../_shared/session-tokens.ts";

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

    // Verifica o token e garante o papel esperado. Retorna o payload ou null.
    const auth = async (role) => {
      const payload = await verifyToken(body.token, SECRET);
      if (!payload) return null;
      if (role && payload.role !== role) return null;
      return payload;
    };
    const issue = (sub, role) =>
      signToken({ sub, role, exp: Date.now() + TOKEN_TTL_MS }, SECRET);

    // ---------- Aluno ----------
    if (action === "studentLogin") {
      const hash = await sha256(body.password);
      const s = await findStudentByLogin(svc, body.login);
      if (!s || s.password_hash !== hash) {
        return Response.json({ error: "Login ou senha incorretos." }, { status: 401 });
      }
      const token = await issue(s.id, "student");
      return Response.json({ student: { ...sanitizeStudent(s), token } });
    }

    if (action === "studentProfile") {
      const a = await auth("student");
      if (!a) return UNAUTHORIZED();
      const s = await svc.entities.Student.get(a.sub);
      if (!s) return Response.json({ error: "Aluno não encontrado." }, { status: 404 });
      return Response.json({ student: sanitizeStudent(s) });
    }

    if (action === "studentChangePassword") {
      const a = await auth("student");
      if (!a) return UNAUTHORIZED();
      const cur = await sha256(body.current);
      const s = await svc.entities.Student.get(a.sub);
      if (!s || s.password_hash !== cur) {
        return Response.json({ error: "Senha atual incorreta." }, { status: 400 });
      }
      await svc.entities.Student.update(a.sub, {
        password_hash: await sha256(body.next),
        password_changed: true,
      });
      return Response.json({ ok: true });
    }

    // ---------- Professor ----------
    if (action === "teacherLogin") {
      const hash = await sha256(body.password);
      const rows = await svc.entities.Teacher.filter({
        email: normEmail(body.email),
        is_active: true,
      });
      const t = rows[0];
      if (!t || t.password_hash !== hash) {
        return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
      }
      const token = await issue(t.id, "teacher");
      return Response.json({ teacher: { ...sanitizeTeacher(t), token } });
    }

    if (action === "teacherRegister") {
      const e = normEmail(body.email);
      const exists = await svc.entities.Teacher.filter({ email: e });
      if (exists.length) {
        return Response.json({ error: "E-mail já cadastrado." }, { status: 400 });
      }
      const password_hash = await sha256(body.password);
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
      const cur = await sha256(body.current);
      const t = await svc.entities.Teacher.get(a.sub);
      if (!t || t.password_hash !== cur) {
        return Response.json({ error: "Senha atual incorreta." }, { status: 400 });
      }
      await svc.entities.Teacher.update(a.sub, {
        password_hash: await sha256(body.next),
        password_changed: true,
      });
      return Response.json({ ok: true });
    }

    // ---------- Pai / Mãe ----------
    if (action === "parentLogin") {
      const hash = await sha256(body.password);
      const rows = await svc.entities.Parent.filter({
        email: normEmail(body.email),
        is_active: true,
      });
      const p = rows[0];
      if (!p || p.password_hash !== hash) {
        return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
      }
      const token = await issue(p.id, "parent");
      return Response.json({ parent: { ...sanitizeParent(p), token } });
    }

    if (action === "parentRegister") {
      const e = normEmail(body.email);
      const exists = await svc.entities.Parent.filter({ email: e });
      if (exists.length) {
        return Response.json({ error: "E-mail já cadastrado." }, { status: 400 });
      }
      const password_hash = await sha256(body.password);
      const p = await svc.entities.Parent.create({
        name: (body.name || "").trim(),
        email: e,
        password_hash,
        student_ids: [],
        is_active: true,
        password_changed: true,
      });
      const token = await issue(p.id, "parent");
      return Response.json({ parent: { ...sanitizeParent(p), token } });
    }

    if (action === "parentChangePassword") {
      const a = await auth("parent");
      if (!a) return UNAUTHORIZED();
      const cur = await sha256(body.current);
      const p = await svc.entities.Parent.get(a.sub);
      if (!p || p.password_hash !== cur) {
        return Response.json({ error: "Senha atual incorreta." }, { status: 400 });
      }
      await svc.entities.Parent.update(a.sub, {
        password_hash: await sha256(body.next),
        password_changed: true,
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
      const p = await svc.entities.Parent.get(a.sub);
      if (!p) return UNAUTHORIZED();
      const s = await findStudentByLogin(svc, body.studentLogin);
      if (!s) {
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
      const pwdHash = await sha256(body.studentPassword);
      if (s.password_hash !== pwdHash) {
        return Response.json({ error: "Senha do aluno incorreta." }, { status: 401 });
      }
      const cur = p.student_ids || [];
      if (cur.includes(s.id)) {
        return Response.json({ error: "Este filho já está vinculado." }, { status: 400 });
      }
      const updated = [...cur, s.id];
      await svc.entities.Parent.update(a.sub, { student_ids: updated });
      return Response.json({ student_ids: updated });
    }

    // ---------- Aulas (professor) ----------
    if (action === "createLesson") {
      const a = await auth("teacher");
      if (!a) return UNAUTHORIZED();
      const t = await svc.entities.Teacher.get(a.sub);
      if (!t || !t.is_active) return UNAUTHORIZED();
      const l = body.lesson || {};
      const rec = await svc.entities.Lesson.create({
        title: (l.title || "").trim(),
        description: (l.description || "").trim(),
        type: l.type || "Vídeo",
        url: (l.url || "").trim(),
        turma: l.turma || "",
        discipline: (l.discipline || "").trim(),
        // O autor é sempre o professor autenticado — não pode ser forjado.
        author: t.name || "Professor",
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
      // Só pode excluir as próprias aulas (mesmo autor).
      if ((l.author || "") !== (t.name || "")) {
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
