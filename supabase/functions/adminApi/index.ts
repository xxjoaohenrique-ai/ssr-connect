import { getService } from '../_shared/store.ts';
import { hashPassword, verifyPassword, isLegacyPasswordHash, signToken, verifyToken, TOKEN_TTL_MS } from "../_shared/session-tokens.ts";
import { loginThrottle, TOO_MANY } from '../_shared/auth-throttle.ts';

// Camada de autenticação e escrita do Painel Administrativo.
// O acesso é por conta própria (e-mail + senha, igual ao Portal Escolar):
// o login valida o hash da senha no AdminAccount e emite um token de sessão
// assinado (HMAC-SHA256) com { sub, role: "admin", exp }. Todas as demais
// ações exigem esse token e conta administrativa ativa.
// Roda com service role para contornar o RLS admin-only das entidades.

const ALLOWED = ["News", "Notice", "CalendarEvent", "Testimonial", "Student", "Teacher", "Menu", "ContactInfo", "Ticker", "Setting", "GalleryImage", "AdminAccount"];

function normEmail(e) {
  return (e || "").trim().toLowerCase();
}

// Nunca expõe password_hash.
function sanitizeAdmin(a) {
  if (!a) return null;
  return {
    id: a.id,
    email: a.email,
    is_active: a.is_active,
    password_changed: a.password_changed,
  };
}

// Nunca envie hashes ou tokens de sessão em respostas de listagem/edição.
function sanitizeRecord(record) {
  if (!record) return record;
  const { password_hash, password, token, ...safe } = record;
  return safe;
}

async function prepareCredentials(entity, raw, updating = false) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Dados inválidos.");
  }
  const { password, ...data } = raw;
  if (entity !== "AdminAccount" && entity !== "Student" && entity !== "Teacher" && entity !== "Parent") {
    if (password !== undefined || data.password_hash !== undefined) {
      throw new Error("Credenciais não permitidas neste recurso.");
    }
    return data;
  }
  if (password !== undefined) {
    data.password_hash = await hashPassword(password);
    data.password_changed = false;
    if (updating) data.session_version = crypto.randomUUID();
  } else if (data.password_hash !== undefined && !isLegacyPasswordHash(data.password_hash)) {
    // Compatibilidade temporária com a versão anterior do formulário.
    throw new Error("Formato de senha inválido.");
  } else if (data.password_hash !== undefined && updating) {
    data.session_version = crypto.randomUUID();
  }
  return data;
}

const NO_SECRET = () =>
  Response.json({ error: "Servidor sem segredo de sessão configurado (PORTAL_TOKEN_SECRET)." }, { status: 500 });

export async function handleAdmin(req) {
  try {
    const svc = getService();
    const body = await req.json();
    const { action, entity } = body;

    const SECRET = Deno.env.get("PORTAL_TOKEN_SECRET");

    // ---------- Sessão do administrador (e-mail + senha) ----------
    if (action === "adminLogin") {
      if (!SECRET) return NO_SECRET();
      if (!(await loginThrottle(svc, "admin", body.email))) return TOO_MANY();
      const rows = await svc.entities.AdminAccount.filter({
        email: normEmail(body.email),
        is_active: true,
      });
      const acc = rows[0];
      if (!acc || !(await verifyPassword(body.password, acc.password_hash))) {
        if (!(await loginThrottle(svc, "admin", body.email, "failure"))) return TOO_MANY();
        return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
      }
      if (isLegacyPasswordHash(acc.password_hash)) {
        await svc.entities.AdminAccount.update(acc.id, { password_hash: await hashPassword(body.password) });
      }
      await loginThrottle(svc, "admin", body.email, "success");
      const token = await signToken(
        { sub: acc.id, role: "admin", v: acc.session_version ?? null, exp: Date.now() + TOKEN_TTL_MS },
        SECRET
      );
      return Response.json({ admin: { ...sanitizeAdmin(acc), token } });
    }

    if (action === "adminMe") {
      if (!SECRET) return NO_SECRET();
      const payload = await verifyToken(body.token, SECRET);
      if (!payload || payload.role !== "admin") {
        return Response.json({ error: "Sessão inválida ou expirada. Faça login novamente." }, { status: 401 });
      }
      let acc = null;
      try { acc = await svc.entities.AdminAccount.get(payload.sub); } catch { acc = null; }
      if (!acc || acc.is_active === false ||
          (payload.v ?? null) !== (acc.session_version ?? null)) {
        return Response.json({ error: "Conta de administrador desativada." }, { status: 401 });
      }
      return Response.json({ admin: sanitizeAdmin(acc) });
    }

    // Sem fallback à autenticação Base44: exige sessão SSR assinada e conta ativa.
    const isAdmin = async () => {
      if (!SECRET) return false;
      const payload = await verifyToken(body.token, SECRET);
      if (!payload || payload.role !== "admin") return false;
      const acc = await svc.entities.AdminAccount.get(payload.sub);
      return !!acc && acc.is_active !== false &&
        (payload.v ?? null) === (acc.session_version ?? null);
    };

    if (!(await isAdmin())) {
      return Response.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    if (!ALLOWED.includes(entity)) {
      return Response.json({ error: "Entidade não permitida." }, { status: 400 });
    }
    const coll = svc.entities[entity];

    if (action === "list") {
      let rows;
      if (body.filter && Object.keys(body.filter).length) {
        rows = await coll.filter(body.filter, body.sort, body.limit);
      } else {
        rows = await coll.list(body.sort, body.limit);
      }
      return Response.json({ rows: rows.map(sanitizeRecord) });
    }
    if (action === "create") {
      if (entity === "AdminAccount") {
        const email = normEmail(body.data?.email);
        if (!email || !(body.data?.password || body.data?.password_hash)) {
          return Response.json({ error: "Informe e-mail e senha do administrador." }, { status: 400 });
        }
        const accounts = await coll.list();
        if (accounts.length >= 5) {
          return Response.json({ error: "Limite de cinco administradores atingido." }, { status: 400 });
        }
        if (accounts.some((account) => normEmail(account.email) === email)) {
          return Response.json({ error: "Este e-mail já está cadastrado." }, { status: 400 });
        }
        const prepared = await prepareCredentials(entity, body.data);
        const rec = await coll.create({ ...prepared, email });
        return Response.json({ record: sanitizeRecord(rec) });
      }
      const prepared = await prepareCredentials(entity, body.data);
      const rec = await coll.create(prepared);
      return Response.json({ record: sanitizeRecord(rec) });
    }
    if (action === "update") {
      if (entity === "AdminAccount") {
        const account = await coll.get(body.id);
        if (!account) return Response.json({ error: "Conta não encontrada." }, { status: 404 });
        if (body.data?.is_active === false && account.is_active !== false) {
          const active = await coll.filter({ is_active: true });
          if (active.length <= 1) {
            return Response.json({ error: "Não é possível desativar o último administrador ativo." }, { status: 400 });
          }
        }
        if (body.data?.email !== undefined) {
          const email = normEmail(body.data.email);
          if (!email) return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
          const accounts = await coll.list();
          if (accounts.some((other) => other.id !== body.id && normEmail(other.email) === email)) {
            return Response.json({ error: "Este e-mail já está cadastrado." }, { status: 400 });
          }
          body.data = { ...body.data, email };
        }
      }
      const prepared = await prepareCredentials(entity, body.data, true);
      const rec = await coll.update(body.id, prepared);
      return Response.json({ record: sanitizeRecord(rec) });
    }
    if (action === "delete") {
      if (entity === "AdminAccount") {
        const account = await coll.get(body.id);
        if (!account) return Response.json({ error: "Conta não encontrada." }, { status: 404 });
        if (account.is_active !== false) {
          const active = await coll.filter({ is_active: true });
          if (active.length <= 1) {
            return Response.json({ error: "Não é possível excluir o último administrador ativo." }, { status: 400 });
          }
        }
      }
      await coll.delete(body.id);
      return Response.json({ ok: true });
    }
    if (action === "bulkCreate") {
      if (entity === "AdminAccount") {
        return Response.json({ error: "Cadastre os administradores individualmente." }, { status: 400 });
      }
      if (entity === "Student" && (!Array.isArray(body.records) || body.records.length > 60)) {
        return Response.json({ error: "Cadastre até 60 alunos por lote." }, { status: 400 });
      }
      const prepared = await Promise.all((body.records || []).map((record) => prepareCredentials(entity, record)));
      const recs = await coll.bulkCreate(prepared);
      return Response.json({ records: recs.map(sanitizeRecord) });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("adminApi:", error);
    return Response.json({ error: "Não foi possível concluir a operação." }, { status: 500 });
  }
}
import { preflight, corsResult } from '../_shared/response.ts';
Deno.serve((req) => req.method==='OPTIONS' ? preflight() : corsResult(handleAdmin(req)));
