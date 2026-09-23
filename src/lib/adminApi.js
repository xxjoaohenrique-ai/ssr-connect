import { base44 } from "@/api/base44Client";

// Chamadas ao backend function adminApi (service role) — contornam o RLS
// admin-only e validam o acesso no servidor. O token de sessão do
// administrador (login por e-mail e senha) é anexado a toda chamada.
const SESSION_KEY = "ceti_admin_session";
function readToken() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return s?.token || null;
  } catch {
    return null;
  }
}

async function call(payload) {
  const token = readToken();
  try {
    const res = await base44.functions.invoke("adminApi", token ? { ...payload, token } : payload);
    return res.data;
  } catch (e) {
    const msg = e?.response?.data?.error || e?.message || "Erro de comunicação.";
    throw new Error(msg);
  }
}

export function adminList(entity, { sort, limit, filter } = {}) {
  return call({ action: "list", entity, sort, limit, filter }).then((d) => d.rows);
}
export function adminCreate(entity, data) {
  return call({ action: "create", entity, data }).then((d) => d.record);
}
export function adminUpdate(entity, id, data) {
  return call({ action: "update", entity, id, data }).then((d) => d.record);
}
export function adminDelete(entity, id) {
  return call({ action: "delete", entity, id });
}
export function adminBulkCreate(entity, records) {
  return call({ action: "bulkCreate", entity, records }).then((d) => d.records);
}
export function adminLogin(email, password) {
  return call({ action: "adminLogin", email, password }).then((d) => d.admin);
}
export function adminMe() {
  return call({ action: "adminMe" }).then((d) => d.admin);
}