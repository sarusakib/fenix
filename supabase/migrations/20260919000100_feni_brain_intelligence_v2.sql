begin;

-- Feni Brain v2: exact fact retrieval, supporting indexes and faster source rotation.

create index if not exists idx_fenix_brain_facts_source_id
  on public.fenix_brain_facts(source_id);

create index if not exists idx_fenix_brain_locations_source_id
  on public.fenix_brain_locations(source_id);

create index if not exists idx_fenix_brain_update_candidates_reviewed_by
  on public.fenix_brain_update_candidates(reviewed_by);

create index if not exists idx_fenix_brain_update_candidates_published_document
  on public.fenix_brain_update_candidates(published_document_id);

create or replace function public.search_feni_brain_facts(
  query_text text,
  match_count integer default 6
)
returns table(
  id uuid,
  document_id uuid,
  subject_key text,
  name_bn text,
  name_en text,
  value_number numeric,
  value_text text,
  value_unit text,
  content text,
  similarity double precision,
  source_id uuid,
  source_title text,
  source_url text,
  trust_tier smallint,
  document_title text
)
language sql
stable
security invoker
set search_path = 'pg_catalog','public','extensions'
as $function$
with q as (
  select lower(trim(left(coalesce(query_text,''),500))) as term
),
tokens as (
  select distinct trim(token) as token
  from q
  cross join lateral regexp_split_to_table(q.term,'\s+') token
  where length(trim(token)) >= 2
),
labels(subject_key, labels) as (
  values
    ('area','আয়তন area square kilometer square_km'),
    ('population','জনসংখ্যা population লোক মানুষ'),
    ('male_population','পুরুষ জনসংখ্যা male population'),
    ('female_population','নারী মহিলা জনসংখ্যা female population'),
    ('hijra_population','হিজড়া জনসংখ্যা hijra population'),
    ('population_density','জনঘনত্ব density population density'),
    ('cultivable_land','চাষযোগ্য আবাদযোগ্য কৃষিজমি cultivable land'),
    ('irrigated_land','সেচযুক্ত জমি সেচের জমি irrigated land'),
    ('forest_land','বনভূমি forest land'),
    ('heavy_industry_count','ভারী শিল্প heavy industry'),
    ('medium_industry_count','মাঝারি শিল্প medium industry'),
    ('small_industry_count','ক্ষুদ্র শিল্প small industry'),
    ('cottage_industry_count','কুটির শিল্প cottage industry'),
    ('upazila_count','উপজেলা upazila'),
    ('municipality_count','পৌরসভা municipality'),
    ('union_count','ইউনিয়ন ইউনিয়ন union'),
    ('village_count','গ্রাম village'),
    ('mouza_count','মৌজা mouza'),
    ('union_land_office_count','ইউনিয়ন ভূমি অফিস land office'),
    ('market_count','হাট বাজার market bazar bazaar'),
    ('ward_count','ওয়ার্ড ওয়ার্ড ward')
),
facts as (
  select
    f.id,
    d.id as document_id,
    f.subject_key,
    l.name_bn,
    l.name_en,
    f.value_number,
    f.value_text,
    f.value_unit,
    f.valid_from,
    f.valid_until,
    f.confidence,
    s.id as source_id,
    s.title as source_title,
    s.url as source_url,
    s.trust_tier,
    coalesce(d.title,s.title) as document_title,
    coalesce(lb.labels,'') as labels,
    q.term,
    (
      (case when q.term like '%' || lower(coalesce(l.name_bn,'')) || '%' then 3 else 0 end) +
      (case when q.term like '%' || lower(coalesce(l.name_en,'')) || '%' then 3 else 0 end) +
      (select count(*)::double precision * 1.0 from tokens t
        where lower(coalesce(l.name_bn,'')) like '%' || t.token || '%'
           or lower(coalesce(l.name_en,'')) like '%' || t.token || '%') +
      (select count(*)::double precision * 4.0 from tokens t
        where lower(coalesce(lb.labels,'')) like '%' || t.token || '%'
           or lower(f.subject_key) like '%' || t.token || '%') +
      (case
         when lower(f.subject_key) = any(array(select t.token from tokens t)) then 8
         else 0
       end) +
      (case when f.valid_from is null or f.valid_from <= now() then 1 else 0 end) +
      (case when f.valid_until is null or f.valid_until >= now() then 1 else -6 end) +
      greatest(0,4-s.trust_tier)*0.5 +
      coalesce(f.confidence,0)
    ) as score
  from public.fenix_brain_facts f
  join public.fenix_brain_sources s on s.id=f.source_id
  join public.fenix_brain_locations l on l.id=f.subject_location_id
  left join labels lb on lb.subject_key=f.subject_key
  left join lateral (
    select d0.id,d0.title
    from public.fenix_brain_documents d0
    where d0.source_id=f.source_id and d0.status='active'
    order by d0.updated_at desc
    limit 1
  ) d on true
  cross join q
  where q.term <> ''
    and f.status='active'
    and s.status='active'
    and (f.valid_from is null or f.valid_from <= now())
    and (f.valid_until is null or f.valid_until >= now())
)
select
  f.id,
  f.document_id,
  f.subject_key,
  f.name_bn,
  f.name_en,
  f.value_number,
  f.value_text,
  f.value_unit,
  case
    when f.value_number is not null and f.value_unit='count' then
      coalesce(f.name_bn,f.name_en,'ফেনী') || ' — ' ||
      case f.subject_key
        when 'upazila_count' then 'উপজেলা'
        when 'municipality_count' then 'পৌরসভা'
        when 'union_count' then 'ইউনিয়ন'
        when 'village_count' then 'গ্রাম'
        when 'mouza_count' then 'মৌজা'
        when 'union_land_office_count' then 'ইউনিয়ন ভূমি অফিস'
        when 'market_count' then 'হাট-বাজার'
        when 'ward_count' then 'ওয়ার্ড'
        when 'heavy_industry_count' then 'ভারী শিল্প'
        when 'medium_industry_count' then 'মাঝারি শিল্প'
        when 'small_industry_count' then 'ক্ষুদ্র শিল্প'
        when 'cottage_industry_count' then 'কুটির শিল্প'
        else f.subject_key
      end || ': ' || f.value_number::text
    when f.value_number is not null then
      coalesce(f.name_bn,f.name_en,'ফেনী') || ' — ' || f.subject_key || ': ' ||
      f.value_number::text || coalesce(' ' || f.value_unit,'')
    when f.value_text is not null then
      coalesce(f.name_bn,f.name_en,'ফেনী') || ' — ' || f.subject_key || ': ' || f.value_text
    else
      coalesce(f.name_bn,f.name_en,'ফেনী') || ' — ' || f.subject_key
  end,
  least(0.995, greatest(0.01, 0.55 + f.score/30.0)),
  f.source_id,
  f.source_title,
  f.source_url,
  f.trust_tier,
  f.document_title
from facts f
order by f.score desc, f.trust_tier asc, f.confidence desc, f.subject_key
limit least(greatest(match_count,1),50);

revoke all on function public.search_feni_brain_facts(text,integer) from public;
grant execute on function public.search_feni_brain_facts(text,integer) to anon,authenticated;

select cron.unschedule('fenix-brain-source-refresh-daily')
where exists (select 1 from cron.job where jobname='fenix-brain-source-refresh-daily');

select cron.schedule(
  'fenix-brain-source-refresh-2hour',
  '0 */2 * * *',
  $job$
    select net.http_post(
      url := 'https://lawdsvplbxfziihvmmva.supabase.co/functions/v1/fenix-brain-source-refresh',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-fenix-refresh-secret',
        (select decrypted_secret from vault.decrypted_secrets where name='fenix_brain_refresh_secret')
      ),
      body := '{"limit":8}'::jsonb,
      timeout_milliseconds := 120000
    ) as request_id;
  $job$
);

commit;
