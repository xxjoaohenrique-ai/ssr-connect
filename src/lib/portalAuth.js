import { portalApi } from "@/lib/portalApi";

// Sessão unificada do Portal Escolar (aluno / professor / pai).
const KEY = "ceti_portal_session";
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}
export function setSession(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
export function clearSession() {
  localStorage.removeItem(KEY);
}

// ---------- Professor ----------
export async function loginTeacher(email, password) {
  const { teacher } = await portalApi({ action: "teacherLogin", email, password });
  return teacher;
}

export async function registerTeacher({ name, email, password, disciplines }) {
  const data = await portalApi({
    action: "teacherRegister",
    name,
    email,
    password,
    disciplines,
  });
  // Cadastro pendente de aprovação: não há sessão nem token. Retorna uma
  // mensagem informativa para o formulário exibir ao professor.
  return {
    pending: true,
    message: data.message || "Cadastro recebido. Aguarde a aprovação da coordenação.",
  };
}

export async function changeTeacherPassword(id, current, next) {
  await portalApi({ action: "teacherChangePassword", id, current, next });
}

// ---------- Pai / Mãe ----------
export async function loginParent(email, password) {
  const { parent } = await portalApi({ action: "parentLogin", email, password });
  return parent;
}

export async function registerParent({ name, email, password }) {
  const { parent } = await portalApi({ action: "parentRegister", name, email, password });
  return parent;
}

export async function changeParentPassword(id, current, next) {
  await portalApi({ action: "parentChangePassword", id, current, next });
}