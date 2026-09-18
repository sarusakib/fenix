begin;

-- Feni Brain refresh resilience:
-- 1) Internal claim function is service-role only.
-- 2) Official tier-1 sources are eligible for automatic publication.
-- The refresh Edge Function still validates its private x-fenix-refresh-secret.

create or replace function public.claim_due_feni_brain_sources_v2(
  p_limit integer default 10
)
returns table(
  source_id uuid,
  url text,
  publisher text,
  title text,
  trust_tier smallint,
  parser_key text,
  auto_publish boolean,
  max_bytes integer,
  etag text,
  last_modified text,
  refresh_interval_hours integer
)
language sql
stable
security invoker
set search_path = 'pg_catalog','public'
as $function$
  select
    s.id,
    s.url,
    s.publisher,
    s.title,
    s.trust_tier,
    r.parser_key,
    r.auto_publish,
    r.max_bytes,
    r.etag,
    r.last_modified,
    r.refresh_interval_hours
  from public.fenix_brain_sources s
  join public.fenix_brain_source_refresh r
    on r.source_id = s.id
  where s.status = 'active'
    and r.enabled
    and r.next_refresh_at <= now()
    and s.url is not null
  order by r.next_refresh_at
  limit greatest(1, least(p_limit, 50));
$function$;

revoke all
  on function public.claim_due_feni_brain_sources_v2(integer)
  from public, anon, authenticated;

grant execute
  on function public.claim_due_feni_brain_sources_v2(integer)
  to service_role;

update public.fenix_brain_source_refresh r
set
  auto_publish = true,
  updated_at = now()
from public.fenix_brain_sources s
where s.id = r.source_id
  and s.status = 'active'
  and s.trust_tier = 1;

commit;
