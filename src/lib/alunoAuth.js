// Auth leve do Portal do Aluno (não usa o login de e-mail da plataforma).
// As senhas são guardadas apenas como hash SHA-256 — o administrador vê a
// senha em texto apenas no momento da geração e a entrega ao aluno em mãos.

import { base44 } from "@/api/base44Client";
import { portalApi } from "@/lib/portalApi";

const SESSION_KEY = "aluno_session";
// Domínio dos e-mails de login dos alunos (padrão Gmail).
const GMAIL_DOMAIN = "@gmail.com";

export async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// "João Silva Souza" -> ["joao", "silva", "souza"]
function slugifyName(name) {
  return (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

// Gera um e-mail aleatório no padrão Gmail para o aluno entrar no portal.
// O nome facilita a identificação e a sequência aleatória garante unicidade.
export function genLogin(name, existing = []) {
  const parts = slugifyName(name);
  const base = parts.length ? parts.join(".") : "aluno";
  const taken = new Set((existing || []).map((l) => (l || "").toLowerCase()));
  let login = `${base}.${genPassword(6)}${GMAIL_DOMAIN}`;
  while (taken.has(login.toLowerCase())) {
    login = `${base}.${genPassword(6)}${GMAIL_DOMAIN}`;
  }
  return login;
}

// Senha aleatória curta, sem caracteres ambíguos (0/O, 1/l).
export function genPassword(len = 8) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

export function getAluno() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
export function setAluno(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}
export function clearAluno() {
  localStorage.removeItem(SESSION_KEY);
}

// Login do aluno: busca o cadastro pelo login e compara o hash da senha.
export async function loginAluno(login, password) {
  const { student } = await portalApi({ action: "studentLogin", login, password });
  return student;
}

// Troca de senha pelo próprio aluno: valida a senha atual antes de atualizar.
export async function changeAlunoPassword(id, current, next) {
  await portalApi({ action: "studentChangePassword", id, current, next });
}