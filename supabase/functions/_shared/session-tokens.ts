// Tokens de sessão assinados (HMAC-SHA256) — lógica compartilhada pelos
// backend functions portalApi (aluno/professor/pai) e adminApi (painel).
export const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias para novas sessões

export async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Senhas novas: PBKDF2 com salt aleatório por conta (WebCrypto/Deno/Node).
// Hashes legados SHA-256 continuam válidos somente para migração no login.
const PASSWORD_ITERATIONS = 310_000;
const PASSWORD_SCHEME = "pbkdf2_sha256";
function sameBytes(a, b) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
async function derivePassword(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256
  ));
}
export async function hashPassword(password) {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new Error("A senha deve ter entre 8 e 128 caracteres.");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const digest = await derivePassword(password, salt, PASSWORD_ITERATIONS);
  return [PASSWORD_SCHEME, PASSWORD_ITERATIONS, b64url(salt), b64url(digest)].join("$");
}
export function isLegacyPasswordHash(stored) {
  return typeof stored === "string" && /^[0-9a-f]{64}$/i.test(stored);
}
export async function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;
  if (isLegacyPasswordHash(stored)) {
    return sameBytes(
      new TextEncoder().encode(await sha256(password)),
      new TextEncoder().encode(stored.toLowerCase())
    );
  }
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== PASSWORD_SCHEME) return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) return false;
  try {
    const salt = b64urlDecode(parts[2]);
    const expected = b64urlDecode(parts[3]);
    if (salt.length !== 16 || expected.length !== 32) return false;
    return sameBytes(await derivePassword(password, salt, iterations), expected);
  } catch { return false; }
}

function b64url(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(str) {
  const norm = String(str).replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 ? "=".repeat(4 - (norm.length % 4)) : "";
  const bin = atob(norm + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(payload, secret) {
  const data = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return data + "." + b64url(new Uint8Array(sig));
}

export async function verifyToken(token, secret) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const key = await hmacKey(secret);
  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(sig),
      new TextEncoder().encode(data)
    );
  } catch {
    return null;
  }
  if (!valid) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(data)));
    if (!Number.isSafeInteger(payload.exp) || Date.now() >= payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}