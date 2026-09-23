const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};
export const preflight = () => new Response('ok', { headers });
export async function corsResult(promise:Promise<Response> | Response) {
  try {
    const result = await promise;
    const h = new Headers(result.headers);
    for(const [k,v] of Object.entries(headers)) h.set(k,v);
    return new Response(result.body,{status:result.status,headers:h});
  } catch (e) {
    return new Response(JSON.stringify({error:'Erro interno no servidor SSR.'}),{status:500,headers});
  }
}
