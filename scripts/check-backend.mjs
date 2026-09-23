// Read-only checks: no student data or test accounts are created.
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
const cases = [
  ['ssrApi', { entity: 'News' }, 200],
  ['ssrApi', { entity: 'Student' }, 403],
  ['adminApi', { action: 'list', entity: 'Student' }, 403],
  ['portalApi', { action: 'studentProfile' }, 401],
];
for (const [name, body, expected] of cases) {
  const response = await fetch(`${url}/functions/v1/${name}`, {
    method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  console.log(`${name} (${body.action || body.entity}): ${response.status}, esperado ${expected}`);
  if (response.status !== expected) process.exitCode = 1;
}
const direct = await fetch(`${url}/rest/v1/ssr_records?select=id&limit=0`, { headers: { apikey: key } });
console.log(`Acesso direto à tabela: ${direct.status}, esperado 401 ou 403`);
if (![401, 403].includes(direct.status)) process.exitCode = 1;
