/** Cliente independente: Supabase Auth + funções SSR, sem SDK Base44. */
const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const STORAGE = 'ssr_supabase_session';
const appUrl = (route = '') => new URL(`${import.meta.env.BASE_URL}${route.replace(/^\//, '')}`, window.location.origin).toString();

const ready = () => {
  if (!/^https:\/\/[\w-]+\.supabase\.co$/.test(url) || !key)
    throw new Error('SSR-CONNECT não configurado: informe VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
};
function getSession() {try { return JSON.parse(localStorage.getItem(STORAGE)||'null'); } catch {return null;}}
function saveSession(data) {
  if (data?.access_token) {
    localStorage.setItem(STORAGE,JSON.stringify({access_token:data.access_token,refresh_token:data.refresh_token||'',expires_at:Date.now()+Number(data.expires_in||3600)*1000}));
  }
}
// Links do Supabase entregam tokens em #access_token=...&refresh_token=...
if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
  const params=new URLSearchParams(window.location.hash.substring(1));
  if(params.get('access_token')) saveSession(Object.fromEntries(params));
  if (params.get('type')==='recovery') sessionStorage.setItem('ssr_recovery','true');
  history.replaceState(null,'',window.location.pathname+window.location.search);
}
async function authRequest(path,body,method='POST',accessToken=null) {
  ready();
  const res=await fetch(`${url}/auth/v1/${path}`,{method,headers:{apikey:key,'Content-Type':'application/json',...(accessToken?{Authorization:`Bearer ${accessToken}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.msg||data.error_description||data.message||data.error||'Falha de autenticação.');
  return data;
}
async function accessToken() {
  const sess=getSession();
  if(!sess?.access_token) return null;
  if(Date.now() < sess.expires_at-60000) return sess.access_token;
  if(!sess.refresh_token) return sess.access_token;
  try {
    const next=await authRequest('token?grant_type=refresh_token',{refresh_token:sess.refresh_token});
    saveSession(next);return next.access_token;
  } catch {localStorage.removeItem(STORAGE);return null;}
}
async function api(name,body) {
  ready();
  const res=await fetch(`${url}/functions/v1/${name}`,{
    method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify(body)
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok) {
    const err=new Error(data.error||`Erro no servidor (${res.status}).`);
    err.response={data,status:res.status};throw err;
  }
  return data;
}
const entity=(name)=>({
  list:async(sort,limit)=>(await api('ssrApi',{entity:name,action:'list',sort,limit})).rows,
  filter:async(filter,sort,limit)=>(await api('ssrApi',{entity:name,action:'list',filter,sort,limit})).rows,
  create:async(data)=>(await api('ssrApi',{entity:name,action:'create',data})).record,
  subscribe: (callback)=>{const timer=setInterval(callback,60000);return ()=>clearInterval(timer);}
});
async function upload({file}) {
  ready();
  const s=JSON.parse(localStorage.getItem('ceti_portal_session')||'null');
  const a=JSON.parse(localStorage.getItem('ceti_admin_session')||'null');
  const form=new FormData();form.set('file',file);form.set('token',a?.token||s?.token||'');
  const res=await fetch(`${url}/functions/v1/ssrApi?op=upload`,{method:'POST',headers:{apikey:key},body:form});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error||'Falha ao enviar o arquivo.');
  return data;
}
export const ssr = {
  entities:new Proxy({},{get(_target,name){return entity(String(name));}}),
  functions:{invoke:async(name,payload)=>({data:await api(name,payload)})},
  integrations:{Core:{
    UploadFile:upload,
    ExtractDataFromUploadedFile:async()=>{throw new Error('A extração automática de PDF não está disponível nesta migração. Cole os nomes manualmente.');},
    InvokeLLM:async()=>{throw new Error('Assistente remoto não configurado.');}
  }},
  auth:{
    me:async()=>{const token=await accessToken();if(!token) throw new Error('Não autenticado.');return authRequest('user',null,'GET',token);},
    isAuthenticated:async()=>!!(await accessToken()),
    loginViaEmailPassword:async(email,password)=>{const d=await authRequest('token?grant_type=password',{email,password});saveSession(d);return d;},
    register:async({email,password})=>authRequest('signup?redirect_to='+encodeURIComponent(appUrl()),{email,password}),
    verifyOtp:async({email,otpCode})=>{const d=await authRequest('verify',{type:'email',email,token:otpCode});saveSession(d);return d;},
    resendOtp:async(email)=>authRequest('resend',{type:'signup',email}),
    setToken:(token)=>{const s=getSession()||{};saveSession({...s,access_token:token,expires_in:3600});},
    loginWithProvider:(provider,returnTo)=>{ready();const dest=new URL(returnTo||appUrl(),window.location.origin);if(dest.origin!==window.location.origin) throw new Error('Destino inválido.');window.location.assign(`${url}/auth/v1/authorize?provider=${encodeURIComponent(provider)}&redirect_to=${encodeURIComponent(dest.toString())}`);},
    resetPasswordRequest:async(email)=>authRequest('recover?redirect_to='+encodeURIComponent(appUrl('reset-password')),{email}),
    resetPassword:async({newPassword})=>{const token=await accessToken();if(!token) throw new Error('Abra o link de recuperação enviado por e-mail.');return authRequest('user',{password:newPassword},'PUT',token);},
    logout:()=>{localStorage.removeItem(STORAGE);window.location.href=appUrl();},
    redirectToLogin:()=>{window.location.href=appUrl('login');}
  }
};
