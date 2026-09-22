-- Execute somente no projeto SSR-CONNECT gczbmneklbmiitsgjvbm.
create table if not exists public.ssr_records (
  entity text not null,
  id text not null default gen_random_uuid()::text,
  data jsonb not null default '{}'::jsonb,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  primary key (entity, id),
  constraint ssr_entity_allowed check(entity in (
    'News','Notice','CalendarEvent','Testimonial','Student','Teacher',
    'Menu','ContactInfo','Ticker','Setting','GalleryImage','AdminAccount','Parent','Lesson'))
);
create index if not exists ssr_records_entity_created_idx on public.ssr_records(entity,created_date desc);
create index if not exists ssr_records_data_idx on public.ssr_records using gin(data);
alter table public.ssr_records enable row level security;
revoke all on public.ssr_records from anon, authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ssr-public','ssr-public',true,10485760,
array['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain'])
on conflict(id) do nothing;
-- Arquivos privados de alunos NUNCA devem ser enviados a esse bucket público.
