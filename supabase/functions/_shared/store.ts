import { createClient } from 'npm:@supabase/supabase-js@2.95.0';

export const ENTITIES = new Set([
  'News','Notice','CalendarEvent','Testimonial','Student','Teacher',
  'Menu','ContactInfo','Ticker','Setting','GalleryImage','AdminAccount','Parent','Lesson'
]);
export const PUBLIC_ENTITIES: Record<string, Record<string, unknown>> = {
  News: { is_published: true }, Notice: { is_active: true },
  CalendarEvent: { is_active: true }, Testimonial: { is_approved: true },
  Menu: { is_active: true }, ContactInfo: {}, Ticker: { is_active: true },
  GalleryImage: { is_active: true }, Lesson: { is_active: true }
};

function ensureEntity(entity: string) {
  if (!ENTITIES.has(entity)) throw new Error('Entidade não permitida.');
}
function unpack(row: Record<string, any> | null) {
  if (!row) return null;
  return { ...row.data, id: row.id, created_date: row.created_date, updated_date: row.updated_date };
}
const compare = (a: any,b: any) =>
  typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : a === b ? 0 : a > b ? 1 : -1;
export function getService() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no backend SSR.');
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const wrap = (entity: string) => {
    ensureEntity(entity);
    const table = () => supabase.from('ssr_records');
    async function all() {
      let rows: any[] = [];
      for (let start = 0; start < 100000; start += 1000) {
        const { data, error } = await table().select('id,data,created_date,updated_date')
          .eq('entity',entity).order('created_date',{ ascending: false }).range(start,start+999);
        if (error) throw error;
        rows = rows.concat(data || []);
        if (!data || data.length < 1000) return rows.map(unpack);
      }
      throw new Error('Limite de registros atingido.');
    }
    async function list(sort?: string, limit?: number) {
      const data = await all();
      if (sort) {
        const desc=sort.startsWith('-'), key=desc?sort.slice(1):sort;
        data.sort((a:any,b:any) => compare(a?.[key] ?? '',b?.[key] ?? '')*(desc?-1:1));
      }
      return Number.isInteger(limit) && limit! >= 0 ? data.slice(0, limit) : data;
    }
    async function filter(criteria: Record<string,unknown> = {},sort?:string,limit?:number) {
      const data=(await list(sort)).filter((x:any)=>Object.entries(criteria).every(([k,v])=>JSON.stringify(x[k])===JSON.stringify(v)));
      return Number.isInteger(limit) && limit! >= 0 ? data.slice(0,limit) : data;
    }
    async function get(id:string) {
      if (!id) return null;
      const { data,error }=await table().select('*').eq('entity',entity).eq('id',String(id)).maybeSingle();
      if(error) throw error;
      return unpack(data);
    }
    async function create(input:Record<string,unknown> = {}) {
      const { id: proposedId, created_date, updated_date, ...data }=input;
      const payload:Record<string,unknown>={entity,id:proposedId || crypto.randomUUID(),data};
      if(created_date) payload.created_date=created_date;
      if(updated_date) payload.updated_date=updated_date;
      const {data:row,error}=await table().insert(payload).select().single();
      if(error) throw error;
      return unpack(row);
    }
    async function update(id:string, patch:Record<string,unknown>) {
      const existing=await get(id);
      if(!existing) throw new Error('Registro não encontrado.');
      const {id:_id,created_date:_created,updated_date:_updated,...stored}=existing;
      const {id:_nextId,created_date:_nextCreated,updated_date:_nextUpdated,...newData}=patch;
      const {data,error}=await table().update({data:{...stored,...newData},updated_date:new Date().toISOString()})
        .eq('entity',entity).eq('id',id).select().single();
      if(error) throw error;
      return unpack(data);
    }
    async function remove(id:string) {
      const {error}=await table().delete().eq('entity',entity).eq('id',String(id));
      if(error) throw error;
    }
    return {list,filter,get,create,update,delete:remove,bulkCreate:async (records:any[])=>{
      if(!Array.isArray(records)||records.length>500) throw new Error('Limite de 500 registros por lote.');
      const output=[];
      for(const rec of records) output.push(await create(rec));
      return output;
    }};
  };
  return { supabase, entities: new Proxy({} as Record<string,ReturnType<typeof wrap>>, {
    get(_target,entity:string){ return wrap(entity); }
  })};
}
