import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('chamadas simultâneas compartilham a renovação da sessão', async () => {
  const originals = { localStorage: globalThis.localStorage, fetch: globalThis.fetch };
  const stored = new Map([['ssr_supabase_session', JSON.stringify({access_token:'expired',refresh_token:'refresh',expires_at:0})]]);
  globalThis.localStorage = {getItem:key=>stored.get(key),setItem:(key,value)=>stored.set(key,value),removeItem:key=>stored.delete(key)};
  let refreshes = 0;
  globalThis.fetch = async (url, options) => {
    if (url.includes('grant_type=refresh_token')) {
      refreshes++;
      await new Promise(resolve=>setTimeout(resolve, 15));
      return Response.json({access_token:'fresh',refresh_token:'next',expires_in:3600});
    }
    assert.equal(options.headers.Authorization, 'Bearer fresh');
    return Response.json({id:'user'});
  };
  try {
    const source = readFileSync(new URL('../src/api/ssrClient.js', import.meta.url),'utf8')
      .replaceAll('import.meta.env', JSON.stringify({VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_ANON_KEY:'test',BASE_URL:'/'}));
    const {ssr} = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
    const users = await Promise.all([ssr.auth.me(),ssr.auth.me(),ssr.auth.me()]);
    assert.equal(refreshes,1);
    assert.deepEqual(users,[{id:'user'},{id:'user'},{id:'user'}]);
  } finally {
    for (const [key,value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key]=value;
    }
  }
});
