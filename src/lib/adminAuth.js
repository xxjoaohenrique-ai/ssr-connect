import { adminLogin } from "@/lib/adminApi";

// Sessão do Painel Administrativo — login por e-mail e senha (igual ao Portal
// Escolar), sem conta Google. O token assinado é emitido pelo backend no login
// e anexado às chamadas pelo adminApi.js (mesma chave de sessão).
const SESSION_KEY = "ceti_admin_session";

export function getAdmin() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
export function setAdminSession(admin) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: admin.id, email: admin.email, token: admin.token }));
}
export function clearAdmin() {
  localStorage.removeItem(SESSION_KEY);
}
export async function loginAdminAccount(email, password) {
  const admin = await adminLogin(email, password);
  setAdminSession(admin);
  return admin;
}