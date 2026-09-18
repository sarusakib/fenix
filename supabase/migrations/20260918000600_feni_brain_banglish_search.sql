begin;

create extension if not exists pg_trgm with schema extensions;

create index if not exists fenix_brain_locations_name_en_trgm_idx
  on public.fenix_brain_locations using gin (lower(coalesce(name_en,'')) extensions.gin_trgm_ops);

create index if not exists fenix_brain_locations_name_bn_trgm_idx
  on public.fenix_brain_locations using gin (lower(name_bn) extensions.gin_trgm_ops);

create index if not exists fenix_brain_location_aliases_normalized_trgm_idx
  on public.fenix_brain_location_aliases using gin (normalized_alias extensions.gin_trgm_ops);

create index if not exists fenix_brain_chunks_content_trgm_idx
  on public.fenix_brain_chunks using gin (lower(content) extensions.gin_trgm_ops);

insert into public.fenix_brain_query_terms(intent_key,term,language_code,weight)
select x.intent_key,x.term,'banglish',x.weight
from (values
('location_info','koi',1.5),('location_info','kothay',1.5),('location_info','kothai',1.5),('location_info','koyta',1.5),('location_info','koita',1.5),('location_info','kota',1.5),('location_info','kon kon',1.5),('location_info','union gula',2),('location_info','upazila gula',2),
('business_search','business koi',3),('business_search','business kothay',3),('business_search','shop koi',3),('business_search','dokan koi',3),('business_search','dokaan koi',3),('business_search','byabsha koi',2.5),('business_search','bebsha koi',2.5),
('business_start','business shuru',4),('business_start','business suru',4),('business_start','business korte chai',4),('business_start','business dite chai',4),('business_start','byabsha shuru',4),('business_start','bebsha shuru',4),('business_start','byabsha korte chai',4),('business_start','bebsha korte chai',4),('business_start','dokan dite chai',4),('business_start','dokaan dite chai',4),
('investment','biniyog',3),('investment','binioyog',3),('investment','invest korte chai',4),('investment','invest korbo',4),('investment','investment korte chai',4),('investment','investment korbo',4),
('supplier_search','paikar',3),('supplier_search','paikari',3),('supplier_search','paiker',3),('supplier_search','supplier chai',3),('supplier_search','wholesale chai',3),('supplier_search','paikari mal',4),('supplier_search','mal kothay pabo',3),
('government_service','trade lisence',4),('government_service','license koi',3),('government_service','lisence koi',3),
('health_service','haspatal',3),('health_service','hospital koi',4),('health_service','hospital kothay',4),('health_service','daktar',3),('health_service','doctor koi',4),('health_service','clinic koi',4),
('education','school koi',3),('education','college koi',3),('education','madrasa koi',3),('education','madrasah koi',3),
('tourism','ghurte chai',3),('tourism','ghurar jayga',4),('tourism','tourist place',3),
('agriculture','krishi',3),('agriculture','chash',3),('agriculture','fosol',3),('agriculture','ki chash hoy',4),
('emergency','joruri',3),('emergency','joruri sheba',4),('emergency','ambulance',3),('emergency','fire service',3),('emergency','police',3)
) x(intent_key,term,weight)
where not exists(
  select 1 from public.fenix_brain_query_terms q
  where q.intent_key=x.intent_key and lower(trim(q.term))=lower(trim(x.term))
);

with variants(location_slug,alias) as (
values
('feni','feni zila'),('feni','feni district'),('feni-sadar','feni sadar'),('feni-sadar','feni sadur'),
('chhagalnaiya','chhagalnaiya'),('chhagalnaiya','chagalnaiya'),('chhagalnaiya','chhagolnaiya'),
('daganbhuiyan','daganbhuiyan'),('daganbhuiyan','daganbhuiya'),('fulgazi','fulgazi'),('fulgazi','fulgaji'),('fulgazi','phulgazi'),
('parshuram','parshuram'),('parshuram','parosuram'),('parshuram','porosuram'),('parshuram','poroshuram'),
('sonagazi','sonagazi'),('sonagazi','sonagaji'),('sonagazi','shonagazi')
)
insert into public.fenix_brain_location_aliases(location_id,alias,language_code,alias_type)
select l.id,v.alias,'banglish','banglish'
from variants v
join public.fenix_brain_locations l on l.slug=v.location_slug
where not exists(
  select 1 from public.fenix_brain_location_aliases a
  where a.location_id=l.id and a.normalized_alias=lower(trim(v.alias))
);

create or replace function public.keyword_feni_brain_chunks(query_text text,match_count integer default 8)
returns table(id uuid,document_id uuid,content text,similarity double precision,source_id uuid,source_title text,source_url text,trust_tier smallint,document_title text)
language sql stable security invoker set search_path=pg_catalog,public
as $function$
with q as(select lower(trim(left(coalesce(query_text,''),500))) term),
tokens as(select distinct trim(token) token from q cross join lateral regexp_split_to_table(q.term,'\s+') token where length(trim(token))>=2),
c as(
select c.id,c.document_id,c.content,s.id source_id,s.title source_title,s.url source_url,s.trust_tier,d.title document_title
from public.fenix_brain_chunks c join public.fenix_brain_documents d on d.id=c.document_id join public.fenix_brain_sources s on s.id=d.source_id cross join q
where q.term<>'' and c.status='active' and d.status='active' and s.status='active'
and(lower(c.content) like '%'||q.term||'%' or lower(d.title) like '%'||q.term||'%' or exists(select 1 from tokens t where lower(c.content) like '%'||t.token||'%' or lower(d.title) like '%'||t.token||'%')))
select c.id,c.document_id,c.content,greatest(case when lower(c.content) like '%'||q.term||'%' or lower(c.document_title) like '%'||q.term||'%' then 1.0 else 0.0 end,(select count(*)::double precision from tokens t where lower(c.content) like '%'||t.token||'%' or lower(c.document_title) like '%'||t.token||'%')/greatest((select count(*)::double precision from tokens),1.0)),c.source_id,c.source_title,c.source_url,c.trust_tier,c.document_title
from c cross join q order by 4 desc,c.trust_tier,c.document_title limit least(greatest(match_count,1),50);
$function$;

revoke all on function public.keyword_feni_brain_chunks(text,integer) from public;
grant execute on function public.keyword_feni_brain_chunks(text,integer) to anon,authenticated;

create or replace function public.search_feni_brain_locations(query_text text,match_count integer default 10)
returns table(id uuid,level text,name_bn text,name_en text,slug text,alias text,match_type text)
language sql stable security invoker set search_path=pg_catalog,public,extensions
as $function$
with q as(select lower(trim(left(coalesce(query_text,''),200))) term),
tokens as(
 select distinct trim(token) token from q
 cross join lateral regexp_split_to_table(q.term,'\s+') token
 where length(trim(token))>=2
 and trim(token) not in ('তে','এ','এর','ও','আর','থেকে','জন্য','কি','কোন','কোনটা','কোথায়','কয়টা','কত','আছে','চাই','করতে','করবো','দিতে','লাগবে','আমি','আমার','একটা','একটি','ব্যবসা','বিনিয়োগ','সরবরাহকারী','দোকান','পাইকার','পাইকারি','হাসপাতাল','স্কুল','কলেজ','ক্লিনিক','ডাক্তার','ইউনিয়ন','উপজেলা','জেলা','পৌরসভা','ওয়ার্ড','এলাকা','বাজার')
),
candidates as(
 select l.id,l.level,l.name_bn,l.name_en,l.slug,q.term,
 case when lower(l.name_bn)=q.term then 100 when lower(coalesce(l.name_en,''))=q.term then 100
      when exists(select 1 from public.fenix_brain_location_aliases a where a.location_id=l.id and a.normalized_alias=q.term) then 100 else 0 end
 +coalesce((select count(*)::double precision from tokens t where lower(l.name_bn) like '%'||t.token||'%' or lower(coalesce(l.name_en,'')) like '%'||t.token||'%' or exists(select 1 from public.fenix_brain_location_aliases a where a.location_id=l.id and a.normalized_alias like '%'||t.token||'%')),0)*10
 +coalesce((select max(extensions.similarity(lower(coalesce(l.name_en,'')),t.token)) from tokens t where length(t.token)>=3),0)*5 score
 from public.fenix_brain_locations l cross join q
 where q.term<>'' and l.is_active and(
 lower(l.name_bn) like '%'||q.term||'%' or lower(coalesce(l.name_en,'')) like '%'||q.term||'%'
 or exists(select 1 from public.fenix_brain_location_aliases a where a.location_id=l.id and a.normalized_alias like '%'||q.term||'%')
 or exists(select 1 from tokens t where lower(l.name_bn) like '%'||t.token||'%' or lower(coalesce(l.name_en,'')) like '%'||t.token||'%'
   or exists(select 1 from public.fenix_brain_location_aliases a where a.location_id=l.id and(a.normalized_alias like '%'||t.token||'%' or(length(t.token)>=3 and extensions.similarity(a.normalized_alias,t.token)>=0.45))))
 )
)
select c.id,c.level,c.name_bn,c.name_en,c.slug,
coalesce((select a.alias from public.fenix_brain_location_aliases a where a.location_id=c.id and(a.normalized_alias like '%'||c.term||'%' or exists(select 1 from tokens t where a.normalized_alias like '%'||t.token||'%' or(length(t.token)>=3 and extensions.similarity(a.normalized_alias,t.token)>=0.45))) order by case when a.normalized_alias=c.term then 0 else 1 end,a.alias limit 1),c.name_bn),
case when lower(c.name_bn)=c.term then 'exact_name' when lower(coalesce(c.name_en,''))=c.term then 'exact_name_en'
when exists(select 1 from public.fenix_brain_location_aliases a where a.location_id=c.id and a.normalized_alias=c.term) then 'exact_alias' else 'partial_or_fuzzy' end
from candidates c order by c.score desc,c.level,c.name_bn limit least(greatest(match_count,1),50);
$function$;

revoke all on function public.search_feni_brain_locations(text,integer) from public;
grant execute on function public.search_feni_brain_locations(text,integer) to anon,authenticated;

commit;
