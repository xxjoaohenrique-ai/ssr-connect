/* Uso: node scripts/import-export.mjs ./exportacao-base44
 * Arquivos: News.json, Student.json, Teacher.json etc. (arrays ou {items:[...]}).
 * Executar APENAS após conferir backup e em projeto Supabase dedicado.
 */
import {readFile,readdir} from 'node:fs/promises';
import {resolve,join,basename} from 'node:path';
const ALLOWED=new Set(['News','Notice','CalendarEvent','Testimonial','Student','Teacher','Menu','ContactInfo','Ticker','Setting','GalleryImage','AdminAccount','Parent','Lesson']);
const {SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY}=process.env;
const folder=process.argv[2];
if(!folder || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){console.error('Informe diretório, SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');process.exit(1);}
const files=(await readdir(resolve(folder))).filter(f=>f.endsWith('.json')&&ALLOWED.has(basename(f,'.json')));
if(!files.length){console.error('Nenhum JSON de dados exportados encontrado. Este script não importa código do ZIP.');process.exit(1);}
for(const f of files){
  const entity=basename(f,'.json');
  const decoded=JSON.parse(await readFile(join(resolve(folder),f),'utf8'));
  const arr=Array.isArray(decoded)?decoded:decoded?.items||decoded?.data;
  if(!Array.isArray(arr)) throw new Error(`${f}: formato não reconhecido.`);
  let count=0;
  for(let i=0;i<arr.length;i+=100){
    const chunk=arr.slice(i,i+100).map(input=>{
      if(!input.id) throw new Error(`${f}: há registro sem ID.`);
      const {id,created_date,updated_date,...data}=input;
      return {entity,id:String(id),data,...(created_date?{created_date}:{}),...(updated_date?{updated_date}:{})};
    });
    const res=await fetch(`${SUPABASE_URL.replace(/\/$/,'')}/rest/v1/ssr_records?on_conflict=entity,id`,{
      method:'POST',headers:{apikey:SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(chunk)
    });
    if(!res.ok) throw new Error(`${entity}: falha no lote ${i}: ${res.status} ${await res.text()}`);
    count+=chunk.length;
  }
  console.log(`${entity}: ${count} registro(s) importados.`);
}
console.log('Importação encerrada. Confira contagens e logins antes de trocar o domínio.');
