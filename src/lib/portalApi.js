import { base44 } from "@/api/base44Client";

// Token de sessão assinado pelo backend (emitido no login) — anexado a toda
// chamada para que o portalApi valide a identidade do chamador no servidor.
const SESSION_KEY = "ceti_portal_session";
function readToken() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return s?.token || null;
  } catch {
    return null;
  }
}

// Chamada única ao backend function portalApi — lança Error com a mensagem
// retornada pelo servidor (útil para os formulários do portal).
export async function portalApi(payload) {
  try {
    const token = readToken();
    const res = await base44.functions.invoke("portalApi", token ? { ...payload, token } : payload);
    return res.data;
  } catch (e) {
    const msg = e?.response?.data?.error || e?.message || "Erro de comunicação.";
    throw new Error(msg);
  }
}