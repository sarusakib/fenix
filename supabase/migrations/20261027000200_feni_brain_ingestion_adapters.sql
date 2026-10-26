-- Feni Brain 2D: source-specific ingestion adapters.
-- Import only source-backed snapshots into the admin review queue. This migration
-- does not publish content or merge external records into canonical businesses.

begin;

-- Official Feni government pages use a dedicated extract-and-review adapter.
update public.fenix_brain_sources s
set metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
  'parser_key', 'feni_official_html',
  'adapter_version', 1,
  'auto_publish', false
)
where s.source_type = 'government_official'
  and s.url ~* '^https://([a-z0-9-]+\.)*feni\.gov\.bd(/|$)';

update public.fenix_brain_source_refresh r
set parser_key = 'feni_official_html',
    enabled = (s.status = 'active'),
    auto_publish = false,
    next_refresh_at = case when s.status = 'active' then now() else r.next_refresh_at end,
    updated_at = now()
from public.fenix_brain_sources s
where r.source_id = s.id
  and s.source_type = 'government_official'
  and s.url ~* '^https://([a-z0-9-]+\.)*feni\.gov\.bd(/|$)';

-- BizHub and secondary directories are discovery sources only. They remain in the
-- review queue until an admin verifies the exact source, terms, and access method.
update public.fenix_brain_sources s
set status = 'needs_review',
    metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
      'parser_key', 'bizhub_feni_html',
      'adapter_version', 1,
      'access_verified', false,
      'auto_publish', false
    )
where lower(split_part(regexp_replace(coalesce(s.url, ''), '^https://', '', 'i'), '/', 1))
      in ('bizhubfeni.com', 'www.bizhubfeni.com');

update public.fenix_brain_sources s
set status = 'needs_review',
    metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
      'parser_key', 'secondary_directory_html',
      'adapter_version', 1,
      'access_verified', false,
      'auto_publish', false
    )
where lower(split_part(regexp_replace(coalesce(s.url, ''), '^https://', '', 'i'), '/', 1))
      in (
        'biz4bd.com', 'www.biz4bd.com',
        'fbcci.org', 'www.fbcci.org',
        'marketbangladesh.com', 'www.marketbangladesh.com',
        'bdbusinessdirectory.com', 'www.bdbusinessdirectory.com'
      );

update public.fenix_brain_source_refresh r
set enabled = false,
    auto_publish = false,
    parser_key = coalesce(s.metadata->>'parser_key', 'secondary_directory_html'),
    updated_at = now()
from public.fenix_brain_sources s
where r.source_id = s.id
  and s.status = 'needs_review'
  and s.metadata->>'parser_key' in ('bizhub_feni_html', 'secondary_directory_html');

-- Smart Feni explicitly prohibits scraping/bot activity in its published Terms of
-- Service. Keep its registry reference but remove the public homepage from the
-- scheduler. Re-enable only after source-owner authorization and a real JSON feed URL.
update public.fenix_brain_sources s
set url = null,
    title = 'Smart Feni — authorized partner feed (awaiting permission)',
    status = 'needs_review',
    metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
      'parser_key', 'smartfeni_partner_json',
      'adapter_version', 1,
      'reference_url', 'https://smartfeni.com/',
      'terms_url', 'https://www.smartfeni.com/terms-of-service',
      'collection_method', 'authorized_partner_json_only',
      'partner_api_authorized', false,
      'access_verified', false,
      'auto_publish', false,
      'note', 'Do not crawl public HTML. Obtain a source-owner-authorized API/feed and retain only public business/service fields.'
    )
where s.url in ('https://smartfeni.com/', 'https://www.smartfeni.com/');

update public.fenix_brain_source_refresh r
set enabled = false,
    auto_publish = false,
    parser_key = 'smartfeni_partner_json',
    updated_at = now()
from public.fenix_brain_sources s
where r.source_id = s.id
  and s.metadata->>'parser_key' = 'smartfeni_partner_json';

-- Health registry source is a public report view, not a general-purpose crawler.
-- Keep it staged: the adapter accepts only rows whose District column is Feni.
update public.fenix_brain_sources s
set url = 'https://hris.mohfw.gov.bd/public/facility-registry/reports/organization-list',
    title = 'DGHS Facility Registry — Feni-filtered facility report',
    status = 'needs_review',
    metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
      'parser_key', 'health_registry_html',
      'adapter_version', 1,
      'expected_district', 'Feni',
      'access_verified', false,
      'auto_publish', false,
      'note', 'Activate only when the public report returns Feni rows; the adapter rejects unrelated national results.'
    )
where s.url = 'https://hris.mohfw.gov.bd/public/facility-registry/';

update public.fenix_brain_source_refresh r
set enabled = false,
    auto_publish = false,
    parser_key = 'health_registry_html',
    updated_at = now()
from public.fenix_brain_sources s
where r.source_id = s.id
  and s.metadata->>'parser_key' = 'health_registry_html';

-- New registration/edit RPC: merge metadata rather than erasing seed provenance,
-- validate adapter/host combinations, require access confirmation for third-party
-- sources, and never enable automatic publication for user-configured sources.
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
as $$
declare
  v_id uuid;
  v_url text := nullif(trim(p_url), '');
  v_host text;
  v_port text;
  v_path text := '';
  v_refresh_enabled boolean := false;
  v_parser_key text := 'generic_html';
  v_interval integer := 168;
  v_existing_metadata jsonb := '{}'::jsonb;
  v_metadata jsonb := '{}'::jsonb;
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

  if p_id is not null then
    select s.metadata into v_existing_metadata
    from public.fenix_brain_sources s
    where s.id = p_id;
    if not found then
      raise exception 'source_not_found' using errcode = 'P0002';
    end if;
  end if;
  v_metadata := coalesce(v_existing_metadata, '{}'::jsonb) || coalesce(p_metadata, '{}'::jsonb);

  if v_url is not null then
    if v_url !~* '^https://[^/@[:space:]?#]+(:[0-9]+)?(/|[?#]|$)'
       or v_url ~* '^https://[^/]*@' then
      raise exception 'source_url_must_be_https_without_credentials' using errcode = '22023';
    end if;
    v_host := lower(substring(v_url from '^https://([^/:?#]+)'));
    v_port := substring(v_url from '^https://[^/:?#]+:([0-9]+)');
    if v_port is not null and v_port <> '443' then
      raise exception 'source_url_nonstandard_https_port' using errcode = '22023';
    end if;
    v_path := coalesce(substring(v_url from '^https://[^/]+([^?#]*)'), '/');
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

  if v_host in ('fenirshomoy.com','www.fenirshomoy.com','feninewsbd.com','www.feninewsbd.com') then
    v_parser_key := 'news_html';
  else
    v_parser_key := coalesce(nullif(v_metadata->>'parser_key',''), 'generic_html');
  end if;

  if v_parser_key not in (
    'generic_html','notice_html','news_html',
    'feni_official_html','bizhub_feni_html','health_registry_html',
    'secondary_directory_html','smartfeni_partner_json'
  ) then
    raise exception 'invalid_source_parser' using errcode = '22023';
  end if;

  if v_parser_key = 'feni_official_html' and p_source_type <> 'government_official' then
    raise exception 'official_adapter_requires_government_source_type' using errcode = '22023';
  end if;

  if v_parser_key in ('bizhub_feni_html','secondary_directory_html')
     and p_source_type not in ('public_web','verified_business') then
    raise exception 'directory_adapter_requires_public_web_source_type' using errcode = '22023';
  end if;

  if v_parser_key = 'health_registry_html'
     and p_source_type not in ('government_official','official_document') then
    raise exception 'health_adapter_requires_government_source_type' using errcode = '22023';
  end if;

  if v_parser_key = 'smartfeni_partner_json' and p_source_type <> 'public_web' then
    raise exception 'smartfeni_adapter_requires_public_web_source_type' using errcode = '22023';
  end if;

  if v_url is not null and v_parser_key = 'feni_official_html'
     and v_host <> 'feni.gov.bd' and v_host not like '%.feni.gov.bd' then
    raise exception 'official_adapter_requires_feni_gov_bd_host' using errcode = '22023';
  end if;

  if v_url is not null and v_parser_key = 'bizhub_feni_html'
     and v_host not in ('bizhubfeni.com','www.bizhubfeni.com') then
    raise exception 'bizhub_adapter_requires_bizhub_host' using errcode = '22023';
  end if;

  if v_url is not null and v_parser_key = 'secondary_directory_html'
     and v_host not in (
       'biz4bd.com','www.biz4bd.com','fbcci.org','www.fbcci.org',
       'marketbangladesh.com','www.marketbangladesh.com',
       'bdbusinessdirectory.com','www.bdbusinessdirectory.com'
     ) then
    raise exception 'secondary_directory_adapter_requires_known_directory_host' using errcode = '22023';
  end if;

  if v_parser_key = 'health_registry_html'
     and (v_host <> 'hris.mohfw.gov.bd'
          or v_path !~* '^/public/facility-registry/reports/organization-list/?$') then
    raise exception 'health_registry_adapter_requires_public_organization_report' using errcode = '22023';
  end if;

  if v_parser_key = 'smartfeni_partner_json' and v_url is not null then
    if v_host not in ('smartfeni.com','www.smartfeni.com')
       or (v_path not ilike '/api/%' and v_path not ilike '%.json') then
      raise exception 'smartfeni_requires_authorized_json_feed_url' using errcode = '22023';
    end if;
  end if;

  if v_parser_key = 'smartfeni_partner_json' and p_status = 'active' then
    if coalesce(v_metadata->>'partner_api_authorized','false') <> 'true'
       or coalesce(v_metadata->>'access_verified','false') <> 'true' then
      raise exception 'smartfeni_permission_required' using errcode = '42501';
    end if;
  end if;

  if p_status = 'active' and p_source_type <> 'internal' then
    if v_url is null then
      raise exception 'active_external_source_requires_url' using errcode = '22023';
    end if;

    if v_host = 'hris.mohfw.gov.bd' then
      if v_parser_key <> 'health_registry_html'
         or v_path !~* '^/public/facility-registry/reports/organization-list/?
      if v_parser_key <> 'smartfeni_partner_json'
         or coalesce(v_metadata->>'partner_api_authorized','false') <> 'true'
         or coalesce(v_metadata->>'access_verified','false') <> 'true'
         or (v_path not ilike '/api/%' and v_path not ilike '%.json') then
        raise exception 'smartfeni_permission_required' using errcode = '42501';
      end if;
    elsif v_host not in (
      'bangladesh.gov.bd','feni.gov.bd','bbs.feni.gov.bd','sadar.feni.gov.bd',
      'chhagalnaiya.feni.gov.bd','daganbhuiyan.feni.gov.bd','fulgazi.feni.gov.bd',
      'parshuram.feni.gov.bd','sonagazi.feni.gov.bd','lged.sadar.feni.gov.bd',
      'zpfeni.gov.bd','www.zpfeni.gov.bd','feni.judiciary.gov.bd','pourashava.feni.gov.bd',
      'www.ntvbd.com','publisher.ntvbd.com','www.prothomalo.com','www.ajkerpatrika.com',
      'fenirshomoy.com','www.fenirshomoy.com','feninewsbd.com','www.feninewsbd.com',
      'bizhubfeni.com','www.bizhubfeni.com','myfeni.com','www.myfeni.com',
      'biz4bd.com','www.biz4bd.com','fbcci.org','www.fbcci.org',
      'marketbangladesh.com','www.marketbangladesh.com',
      'bdbusinessdirectory.com','www.bdbusinessdirectory.com'
    ) then
      raise exception 'active_source_host_not_allowlisted' using errcode = '22023';
    end if;

    if p_source_type in ('public_web','community','social','verified_business')
       and coalesce(v_metadata->>'access_verified','false') <> 'true' then
      raise exception 'source_access_review_required' using errcode = '22023';
    end if;

    v_refresh_enabled := true;
  end if;

  if v_parser_key = 'smartfeni_partner_json' then
    v_interval := 168;
  elsif v_parser_key in ('news_html','notice_html') then
    v_interval := 24;
  elsif v_metadata->>'refresh_interval_hours' ~ '^[0-9]{1,3}$' then
    v_interval := greatest(1, least((v_metadata->>'refresh_interval_hours')::integer, 720));
  else
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
 then
        raise exception 'health_registry_adapter_requires_public_organization_report' using errcode = '22023';
      end if;
      if coalesce(v_metadata->>'access_verified','false') <> 'true' then
        raise exception 'source_access_review_required' using errcode = '22023';
      end if;
    elsif v_host in ('smartfeni.com','www.smartfeni.com') then
      if v_parser_key <> 'smartfeni_partner_json'
         or coalesce(v_metadata->>'partner_api_authorized','false') <> 'true'
         or coalesce(v_metadata->>'access_verified','false') <> 'true'
         or (v_path not ilike '/api/%' and v_path not ilike '%.json') then
        raise exception 'smartfeni_permission_required' using errcode = '42501';
      end if;
    elsif v_host not in (
      'bangladesh.gov.bd','feni.gov.bd','bbs.feni.gov.bd','sadar.feni.gov.bd',
      'chhagalnaiya.feni.gov.bd','daganbhuiyan.feni.gov.bd','fulgazi.feni.gov.bd',
      'parshuram.feni.gov.bd','sonagazi.feni.gov.bd','lged.sadar.feni.gov.bd',
      'zpfeni.gov.bd','www.zpfeni.gov.bd','feni.judiciary.gov.bd','pourashava.feni.gov.bd',
      'www.ntvbd.com','publisher.ntvbd.com','www.prothomalo.com','www.ajkerpatrika.com',
      'fenirshomoy.com','www.fenirshomoy.com','feninewsbd.com','www.feninewsbd.com',
      'bizhubfeni.com','www.bizhubfeni.com','myfeni.com','www.myfeni.com',
      'biz4bd.com','www.biz4bd.com','fbcci.org','www.fbcci.org',
      'marketbangladesh.com','www.marketbangladesh.com',
      'bdbusinessdirectory.com','www.bdbusinessdirectory.com'
    ) then
      raise exception 'active_source_host_not_allowlisted' using errcode = '22023';
    end if;

    if p_source_type in ('public_web','community','social','verified_business')
       and coalesce(v_metadata->>'access_verified','false') <> 'true' then
      raise exception 'source_access_review_required' using errcode = '22023';
    end if;

    v_refresh_enabled := true;
  end if;

  if v_parser_key = 'smartfeni_partner_json' then
    v_interval := 168;
  elsif v_parser_key in ('news_html','notice_html') then
    v_interval := 24;
  elsif v_metadata->>'refresh_interval_hours' ~ '^[0-9]{1,3}$' then
    v_interval := greatest(1, least((v_metadata->>'refresh_interval_hours')::integer, 720));
  else
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
