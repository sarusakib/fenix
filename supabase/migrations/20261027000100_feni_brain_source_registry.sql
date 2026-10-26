-- Feni Brain source registry (roadmap item 2C).
-- Registry seed only: no source content is auto-published by this migration.
-- External fetching remains constrained by the Edge Function host allowlist.

begin;

alter table public.fenix_brain_sources enable row level security;

drop policy if exists "Admins can read all Feni Brain sources"
  on public.fenix_brain_sources;
create policy "Admins can read all Feni Brain sources"
  on public.fenix_brain_sources
  for select
  to authenticated
  using ((select public.is_fenix_admin()));

with seed_sources (
  source_type, publisher, title, url, language_code, trust_tier, status, metadata
) as (
  values
    ('government_official','Feni District Administration','Feni District — English portal',
      'https://feni.gov.bd/en','en',1,'active',
      '{"source_category":"official_government","collection_method":"public_web","refresh_interval_hours":168}'::jsonb),
    ('government_official','Feni District Administration','Feni tourist-spot directory',
      'https://feni.gov.bd/pages/tourist-spot','bn',1,'active',
      '{"source_category":"official_government","topic":"tourism","collection_method":"public_web","refresh_interval_hours":168}'::jsonb),
    ('government_official','Feni District Administration','Registered local newspapers',
      'https://feni.gov.bd/pages/newspapers','bn',1,'active',
      '{"source_category":"official_government","topic":"news_registry","collection_method":"discovery_only","refresh_interval_hours":168}'::jsonb),
    ('government_official','Feni District Council','Feni District Council public portal',
      'https://www.zpfeni.gov.bd/','bn',1,'active',
      '{"source_category":"official_government","collection_method":"public_web","refresh_interval_hours":168}'::jsonb),
    ('government_official','Feni Paurashava','Feni Paurashava public portal',
      'https://pourashava.feni.gov.bd/','bn',1,'active',
      '{"source_category":"official_government","collection_method":"public_web","refresh_interval_hours":168}'::jsonb),
    ('government_official','Ministry of Health and Family Welfare','National Facility Registry',
      'https://hris.mohfw.gov.bd/public/facility-registry/','en',1,'needs_review',
      '{"source_category":"government_health_registry","topic":"health_facilities","collection_method":"public_web","refresh_interval_hours":168,"note":"Registry page only; use an authorized API for structured extraction."}'::jsonb),

    ('public_web','Smart Feni','Smart Feni — local services and listings',
      'https://smartfeni.com/','bn',2,'needs_review',
      '{"source_category":"local_platform","topic":"local_services","collection_method":"public_web","refresh_interval_hours":168,"auto_publish":false}'::jsonb),
    ('public_web','BizHub Feni','BizHub Feni — local business platform',
      'https://bizhubfeni.com/','en',2,'needs_review',
      '{"source_category":"business_directory","topic":"business_discovery","collection_method":"public_web","refresh_interval_hours":168,"auto_publish":false}'::jsonb),
    ('public_web','BizHub Feni','BizHub Feni — about and platform scope',
      'https://bizhubfeni.com/about','en',2,'needs_review',
      '{"source_category":"business_directory","topic":"source_context","collection_method":"public_web","refresh_interval_hours":168,"auto_publish":false}'::jsonb),
    ('public_web','MyFeni','MyFeni — jobs, internships and opportunities',
      'https://myfeni.com/opportunities','en',2,'needs_review',
      '{"source_category":"opportunities","topic":"jobs_internships_volunteering","collection_method":"public_web","refresh_interval_hours":24,"auto_publish":false}'::jsonb),
    ('public_web','Biz4BD','Biz4BD — Feni business directory',
      'https://www.biz4bd.com/district/feni','en',3,'needs_review',
      '{"source_category":"business_directory","topic":"business_discovery","collection_method":"secondary_directory","refresh_interval_hours":168,"auto_publish":false}'::jsonb),
    ('public_web','FBCCI','FBCCI — member directory',
      'https://fbcci.org/web/members?page=3','en',2,'needs_review',
      '{"source_category":"business_directory","topic":"chamber_members","collection_method":"public_web","refresh_interval_hours":168,"auto_publish":false}'::jsonb),
    ('public_web','OpenStreetMap contributors','OpenStreetMap — map and place references',
      'https://www.openstreetmap.org/','en',2,'needs_review',
      '{"source_category":"map","topic":"places_roads","collection_method":"public_map","refresh_interval_hours":168,"attribution_required":true,"note":"Respect OSM licensing and attribution; do not scrape prohibited endpoints."}'::jsonb),
    ('public_web','Market Bangladesh','Market Bangladesh — shopping and market directory',
      'https://www.marketbangladesh.com/','en',3,'needs_review',
      '{"source_category":"business_directory","topic":"shopping_markets","collection_method":"secondary_directory","refresh_interval_hours":168,"auto_publish":false}'::jsonb),
    ('public_web','BD Business Directory','BD Business Directory — discovery index',
      'https://www.bdbusinessdirectory.com/','en',3,'needs_review',
      '{"source_category":"business_directory","topic":"business_discovery","collection_method":"secondary_directory","refresh_interval_hours":168,"auto_publish":false}'::jsonb),

    ('public_web','Dainik Fenir Shomoy','Dainik Fenir Shomoy — local news',
      'https://fenirshomoy.com/','bn',2,'needs_review',
      '{"source_category":"local_news","topic":"local_news","parser_key":"news_html","collection_method":"public_web","refresh_interval_hours":24,"auto_publish":false}'::jsonb),
    ('public_web','Feni News BD','Feni News BD — local news',
      'https://feninewsbd.com/','bn',2,'needs_review',
      '{"source_category":"local_news","topic":"local_news","parser_key":"news_html","collection_method":"public_web","refresh_interval_hours":24,"auto_publish":false}'::jsonb),

    ('social','Feni District Administration','Official public social channels — discovery placeholder',
      null,'bn',4,'needs_review',
      '{"source_category":"social","collection_method":"manual_discovery","requires_manual_url_verification":true,"auto_fetch":false,"note":"Add an exact public URL only after verifying ownership, access method and platform terms."}'::jsonb),

    ('internal','FeniX','FeniX native business and directory records',
      null,'mixed',2,'active',
      '{"source_category":"fenix_owned","data_source":"public.businesses","public_route":"/directory","refresh_mode":"native_database","auto_fetch":false}'::jsonb),
    ('internal','FeniX','FeniX native news and public notices',
      null,'mixed',2,'active',
      '{"source_category":"fenix_owned","data_source":"public.news_posts","public_route":"/news","refresh_mode":"native_database","auto_fetch":false}'::jsonb),
    ('internal','FeniX','FeniX native community and opportunities',
      null,'mixed',2,'active',
      '{"source_category":"fenix_owned","data_source":"FeniX community and opportunity modules","public_route":"/feed","refresh_mode":"native_database","auto_fetch":false}'::jsonb)
)
insert into public.fenix_brain_sources (
  source_type, publisher, title, url, language_code, trust_tier, status, metadata
)
select s.source_type, s.publisher, s.title, s.url, s.language_code, s.trust_tier, s.status, s.metadata
from seed_sources s
where not exists (
  select 1
  from public.fenix_brain_sources existing
  where (s.url is not null and existing.url = s.url)
     or (s.url is null and existing.url is null and existing.title = s.title)
);

-- Seed refresh configuration for active HTTPS sources. Internal data sources are
-- read from FeniX tables and never sent to the external HTML worker.
insert into public.fenix_brain_source_refresh (
  source_id, enabled, refresh_interval_hours, next_refresh_at, parser_key, auto_publish
)
select
  s.id,
  true,
  greatest(1, least(
    case
      when coalesce(s.metadata->>'refresh_interval_hours', '') ~ '^[0-9]{1,3}$'
        then (s.metadata->>'refresh_interval_hours')::integer
      else 24
    end,
    720
  )),
  now(),
  case
    when s.metadata->>'parser_key' in ('generic_html','notice_html','news_html')
      then s.metadata->>'parser_key'
    else 'generic_html'
  end,
  false
from public.fenix_brain_sources s
where s.status = 'active'
  and s.source_type <> 'internal'
  and s.url like 'https://%'
on conflict (source_id) do nothing;

-- Source registry mutations use this one admin-guarded RPC, not direct table
-- writes from the browser. Adding a source never enables auto-publishing.
create or replace function public.fenix_brain_admin_upsert_source(
  p_id uuid,
  p_source_type text,
  p_publisher text,
  p_title text,
  p_url text,
  p_language_code text,
  p_trust_tier smallint,
  p_status text,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $
declare
  v_id uuid;
  v_url text := nullif(trim(p_url), '');
  v_host text;
  v_refresh_enabled boolean := false;
  v_parser_key text := 'generic_html';
  v_interval integer := 24;
  v_existing_metadata jsonb;
  v_metadata jsonb;
begin
  if not coalesce((select public.is_fenix_admin()), false) then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if p_source_type is null or p_source_type not in (
    'government_official','official_document','verified_business',
    'public_web','community','social','internal'
  ) then
    raise exception 'invalid_source_type' using errcode = '22023';
  end if;

  if coalesce(length(trim(p_publisher)), 0) not between 2 and 200
     or coalesce(length(trim(p_title)), 0) not between 2 and 300 then
    raise exception 'publisher_or_title_length_invalid' using errcode = '22023';
  end if;

  if p_status is null or p_status not in ('active','needs_review','archived') then
    raise exception 'invalid_source_status' using errcode = '22023';
  end if;

  if p_language_code is null or p_language_code not in ('bn','en','mixed','unknown') then
    raise exception 'invalid_language_code' using errcode = '22023';
  end if;

  if p_trust_tier is null or p_trust_tier not between 1 and 4 then
    raise exception 'invalid_trust_tier' using errcode = '22023';
  end if;

  if v_url is not null then
    if v_url !~* '^https://[^/@[:space:]?#]+(:[0-9]+)?(/|[?#]|$)'
       or v_url ~* '^https://[^/]*@' then
      raise exception 'source_url_must_be_https_without_credentials' using errcode = '22023';
    end if;
    v_host := lower(substring(v_url from '^https://([^/:?#]+)'));
  end if;

  if p_source_type = 'internal' and v_url is not null then
    raise exception 'internal_source_must_use_native_data' using errcode = '22023';
  end if;

  if v_url is not null and exists (
    select 1 from public.fenix_brain_sources x
    where x.url = v_url and (p_id is null or x.id <> p_id)
  ) then
    raise exception 'source_url_already_registered' using errcode = '23505';
  end if;

  if p_status = 'active' and p_source_type <> 'internal' then
    if v_url is null or v_host not in (
      'bangladesh.gov.bd','feni.gov.bd','bbs.feni.gov.bd','sadar.feni.gov.bd',
      'chhagalnaiya.feni.gov.bd','daganbhuiyan.feni.gov.bd','fulgazi.feni.gov.bd',
      'parshuram.feni.gov.bd','sonagazi.feni.gov.bd','lged.sadar.feni.gov.bd',
      'zpfeni.gov.bd','www.zpfeni.gov.bd','feni.judiciary.gov.bd','pourashava.feni.gov.bd',
      'www.ntvbd.com','publisher.ntvbd.com','www.prothomalo.com','www.ajkerpatrika.com',
      'fenirshomoy.com','www.fenirshomoy.com','feninewsbd.com','www.feninewsbd.com',
      'smartfeni.com','www.smartfeni.com','bizhubfeni.com','www.bizhubfeni.com',
      'myfeni.com','www.myfeni.com',
      'biz4bd.com','www.biz4bd.com','fbcci.org','www.fbcci.org',
      'marketbangladesh.com','www.marketbangladesh.com',
      'bdbusinessdirectory.com','www.bdbusinessdirectory.com'
    ) then
      raise exception 'active_source_host_not_allowlisted' using errcode = '22023';
    end if;
    v_refresh_enabled := true;
  end if;

  if p_id is not null then
    select metadata into v_existing_metadata
    from public.fenix_brain_sources where id = p_id;
    if not found then
      raise exception 'source_not_found' using errcode = 'P0002';
    end if;
  end if;
  v_metadata := coalesce(p_metadata, v_existing_metadata, '{}'::jsonb);

  if v_host in ('fenirshomoy.com','www.fenirshomoy.com','feninewsbd.com','www.feninewsbd.com') then
    v_parser_key := 'news_html';
    v_interval := 24;
  elsif v_metadata->>'parser_key' in ('generic_html','notice_html','news_html') then
    v_parser_key := v_metadata->>'parser_key';
    v_interval := case
      when coalesce(v_metadata->>'refresh_interval_hours', '') ~ '^[0-9]{1,3}$'
        then greatest(1, least((v_metadata->>'refresh_interval_hours')::integer, 720))
      else 168
    end;
  else
    v_parser_key := 'generic_html';
    v_interval := 168;
  end if;

  if p_id is null then
    insert into public.fenix_brain_sources (
      source_type, publisher, title, url, language_code, trust_tier, status, metadata,
      created_at, updated_at
    ) values (
      p_source_type, trim(p_publisher), trim(p_title), v_url, p_language_code,
      p_trust_tier, p_status, v_metadata, now(), now()
    )
    returning id into v_id;
  else
    update public.fenix_brain_sources
    set source_type = p_source_type,
        publisher = trim(p_publisher),
        title = trim(p_title),
        url = v_url,
        language_code = p_language_code,
        trust_tier = p_trust_tier,
        status = p_status,
        metadata = v_metadata,
        updated_at = now()
    where id = p_id
    returning id into v_id;
  end if;

  insert into public.fenix_brain_source_refresh as current_refresh (
    source_id, enabled, refresh_interval_hours, next_refresh_at, parser_key, auto_publish
  ) values (
    v_id, v_refresh_enabled, v_interval, now(), v_parser_key, false
  )
  on conflict (source_id) do update
  set enabled = excluded.enabled,
      refresh_interval_hours = excluded.refresh_interval_hours,
      next_refresh_at = case when excluded.enabled then now()
                             else current_refresh.next_refresh_at end,
      parser_key = excluded.parser_key,
      auto_publish = false,
      updated_at = now();

  return v_id;
end;
$$;

revoke all on function public.fenix_brain_admin_upsert_source(
  uuid,text,text,text,text,text,smallint,text,jsonb
) from public, anon, authenticated;
grant execute on function public.fenix_brain_admin_upsert_source(
  uuid,text,text,text,text,text,smallint,text,jsonb
) to authenticated;

commit;
