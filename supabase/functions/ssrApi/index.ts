import { getService, PUBLIC_ENTITIES } from '../_shared/store.ts';
import { verifyToken } from '../_shared/session-tokens.ts';
import { preflight, corsResult } from '../_shared/response.ts';

function json(data:unknown,status=200) {return Response.json(data,{status});}
function safeError(error:any) {
  console.error('SSR backend:',error);
  return json({error:'Não foi possível concluir a operação.'},500);
}
function sanitize(record: Record<string,any>) {
  if(!record) return record;
  const {password_hash,token,...safe} = record;
  return safe;
}
async function isStaff(payload:any, svc: ReturnType<typeof getService>) {
  const secret=Deno.env.get('PORTAL_TOKEN_SECRET');
  if(!secret) return null;
  const a=await verifyToken(payload?.token,secret);
  if(!a || !['admin','teacher'].includes(a.role)) return null;
  const entry=await svc.entities[a.role==='admin'?'AdminAccount':'Teacher'].get(a.sub);
  if(!entry || entry.is_active===false ||
     (a.v ?? null)!==(entry.session_version ?? null)) return null;
  return a;
}
async function handle(req: Request) {
  if(req.method!=='POST') return json({error:'Método não permitido.'},405);
  try {
    const svc=getService();
    if(new URL(req.url).searchParams.get('op')==='upload') {
      const form=await req.formData();
      const a=await isStaff({token:form.get('token')},svc);
      if(!a) return json({error:'Envio permitido apenas para equipe autenticada.'},403);
      const file=form.get('file');
      if(!(file instanceof File)) return json({error:'Arquivo não encontrado.'},400);
      const types=new Set(['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain']);
      if(!types.has(file.type)||file.size>10*1024*1024||file.size===0) return json({error:'Tipo inválido ou arquivo acima de 10 MB.'},400);
      // O Content-Type pode ser falsificado; confira a assinatura dos arquivos binários.
      const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
      const starts=(signature:number[])=>signature.every((v,i)=>bytes[i]===v);
      const valid={
        'image/jpeg':starts([0xff,0xd8,0xff]),
        'image/png':starts([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
        'image/webp':starts([0x52,0x49,0x46,0x46])&&startsAt(8,[0x57,0x45,0x42,0x50]),
        'image/gif':starts([0x47,0x49,0x46,0x38]) && [0x37,0x39].includes(bytes[4]),
        'application/pdf':starts([0x25,0x50,0x44,0x46,0x2d]),
        'text/plain':!bytes.includes(0)
      }[file.type];
      if(!valid) return json({error:'O conteúdo do arquivo não corresponde ao formato declarado.'},400);
      function startsAt(offset:number,signature:number[]) {
        return signature.every((v,i)=>bytes[offset+i]===v);
      }
      const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','application/pdf':'pdf','text/plain':'txt'} as Record<string,string>)[file.type];
      const path=`${a.role}/${crypto.randomUUID()}.${ext}`;
      const {error}=await svc.supabase.storage.from('ssr-public').upload(path,file,{contentType:file.type,upsert:false});
      if(error) throw error;
      const {data}=svc.supabase.storage.from('ssr-public').getPublicUrl(path);
      return json({file_url:data.publicUrl});
    }
    const body=await req.json();
    const {entity,action='list'}=body;
    if(!Object.hasOwn(PUBLIC_ENTITIES,entity)) return json({error:'Recurso não público.'},403);
    const coll=svc.entities[entity];
    if(action==='list') {
      // O filtro público é aplicado SEMPRE no servidor, inclusive quando
      // o navegador pede list() sem filtros.
      const requested=body.filter && typeof body.filter==='object' && !Array.isArray(body.filter) ? body.filter : {};
      // Publicação/ativação não pode ser anulada por filtro do cliente.
      // Aulas destinadas a turmas não podem ser obtidas pela API pública,
      // mesmo com filtro arbitrário fornecido pelo navegador.
      const rows=await coll.filter({...requested,...PUBLIC_ENTITIES[entity]},body.sort,
        entity==='Lesson' ? undefined : body.limit);
      const visible=entity==='Lesson' ? rows.filter((r:any)=>!r.turma || r.turma==='Todas') : rows;
      const limited=entity==='Lesson' && Number.isInteger(body.limit) && body.limit>=0
        ? visible.slice(0,body.limit) : visible;
      return json({rows:limited.map(sanitize)});
    }
    if(action==='create' && entity==='Testimonial') {
      const d=body.data||{};
      if(!String(d.name||'').trim() || !String(d.content||'').trim()) return json({error:'Preencha o depoimento.'},400);
      const record=await coll.create({name:String(d.name).slice(0,120),content:String(d.content).slice(0,2000),role:String(d.role||'Aluno').slice(0,80),rating:Math.min(5,Math.max(1,Number(d.rating)||5)),is_approved:false});
      return json({record:sanitize(record)});
    }
    return json({error:'Ação não permitida.'},403);
  } catch(error) {return safeError(error);}
}
Deno.serve((req)=>req.method==='OPTIONS'?preflight():corsResult(handle(req)));
