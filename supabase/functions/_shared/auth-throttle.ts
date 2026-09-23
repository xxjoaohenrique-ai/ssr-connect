import { sha256 } from './session-tokens.ts';

// Hash da identidade para não guardar e-mails/logins em texto na tabela de tentativas.
// O contador é transacional no Postgres e persiste entre instâncias Edge Functions.
export async function loginThrottle(svc, role, identifier, event = 'check') {
  const normalized = String(identifier || '').trim().toLowerCase();
  const key = await sha256(`${role}:${normalized}`);
  const { data, error } = await svc.supabase.rpc('ssr_auth_guard', {
    p_key: key, p_event: event,
  });
  if (error) throw error;
  return data === true;
}
export const TOO_MANY = () =>
  Response.json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, { status: 429 });
