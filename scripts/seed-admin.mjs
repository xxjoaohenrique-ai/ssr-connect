/* Execute localmente, em um projeto Supabase NOVO, sem publicar esta chave no GitHub. */
import { randomUUID } from 'node:crypto';
import { hashPassword } from '../supabase/functions/_shared/session-tokens.ts';
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD }=process.env;
if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY||!ADMIN_EMAIL||!ADMIN_PASSWORD) {
  console.error('Informe SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD.');
  process.exit(1);
}
if(ADMIN_PASSWORD.length<12) {console.error('Use senha de administrador com pelo menos 12 caracteres.');process.exit(1);}
const email=ADMIN_EMAIL.trim().toLowerCase();
const password_hash=await hashPassword(ADMIN_PASSWORD);
const res=await fetch(`${SUPABASE_URL.replace(/\/$/,'')}/rest/v1/ssr_records?on_conflict=entity,id`,{
  method:'POST',headers:{apikey:SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},
  body:JSON.stringify([{entity:'AdminAccount',id:randomUUID(),data:{email,password_hash,is_active:true,password_changed:false}}])
});
if(!res.ok) {console.error('Erro ao criar o administrador:',res.status,await res.text());process.exit(1);}
console.log('Conta SSR-CONNECT criada:',email);
