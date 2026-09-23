-- SSR-CONNECT: limites persistentes de autenticação, isolados do banco de outros projetos.
-- Executar antes de implantar funções que chamam ssr_auth_guard.
create table if not exists public.ssr_auth_throttle (
  key text primary key,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz
);
alter table public.ssr_auth_throttle enable row level security;
revoke all on public.ssr_auth_throttle from public, anon, authenticated;

create or replace function public.ssr_auth_guard(p_key text, p_event text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_row public.ssr_auth_throttle%rowtype;
  v_attempts integer;
begin
  if p_key is null or p_key !~ '^[0-9a-f]{64}$' or
     p_event is null or p_event not in ('check', 'failure', 'success') then
    raise exception 'Invalid throttle request';
  end if;
  insert into public.ssr_auth_throttle(key) values (p_key) on conflict do nothing;
  select * into v_row from public.ssr_auth_throttle where key = p_key for update;

  if p_event = 'success' then
    delete from public.ssr_auth_throttle where key = p_key;
    return true;
  end if;
  if v_row.blocked_until > v_now then return false; end if;
  if p_event = 'check' then return true; end if;

  if v_row.window_started_at <= v_now - interval '10 minutes' then
    v_attempts := 1;
  else
    v_attempts := v_row.attempts + 1;
  end if;
  update public.ssr_auth_throttle
    set attempts = v_attempts,
        window_started_at = case when v_attempts = 1 then v_now else v_row.window_started_at end,
        blocked_until = case when v_attempts >= 8 then v_now + interval '15 minutes' else null end
    where key = p_key;
  return v_attempts < 8;
end;
$$;
revoke all on function public.ssr_auth_guard(text,text) from public, anon, authenticated;
grant execute on function public.ssr_auth_guard(text,text) to service_role;
