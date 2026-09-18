-- Feni Brain autonomous source refresh
-- Runtime secret "fenix_brain_refresh_secret" is intentionally managed in Supabase Vault,
-- not committed to source control.

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists pgcrypto;

create table if not exists public.fenix_brain_source_refresh (
  source_id uuid primary key references public.fenix_brain_sources(id) on delete cascade,
  enabled boolean not null default true,
  refresh_interval_hours integer not null default 24 check (refresh_interval_hours between 1 and 720),
  next_refresh_at timestamptz not null default now(),
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_http_status integer,
  last_content_hash text,
  etag text,
  last_modified text,
  parser_key text not null default 'generic_html',
  auto_publish boolean not null default false,
  max_bytes integer not null default 2000000 check (max_bytes between 100000 and 10000000),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fenix_brain_update_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.fenix_brain_sources(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running','changed','unchanged','failed','skipped')),
  http_status integer,
  content_hash text,
  bytes_read integer,
  error text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.fenix_brain_update_candidates (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.fenix_brain_sources(id) on delete cascade,
  content_hash text not null,
  title text not null,
  source_url text,
  extracted_content text not null,
  previous_hash text,
  change_summary text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','auto_published')),
  discovered_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  published_document_id uuid references public.fenix_brain_documents(id),
  metadata jsonb not null default '{}'::jsonb,
  unique(source_id, content_hash)
);

create index if not exists idx_fenix_brain_source_refresh_due
  on public.fenix_brain_source_refresh(next_refresh_at) where enabled;
create index if not exists idx_fenix_brain_update_runs_source
  on public.fenix_brain_update_runs(source_id, started_at desc);
create index if not exists idx_fenix_brain_update_candidates_status
  on public.fenix_brain_update_candidates(status, discovered_at desc);

alter table public.fenix_brain_source_refresh enable row level security;
alter table public.fenix_brain_update_runs enable row level security;
alter table public.fenix_brain_update_candidates enable row level security;

drop policy if exists "brain refresh admin read" on public.fenix_brain_source_refresh;
create policy "brain refresh admin read" on public.fenix_brain_source_refresh
  for select to authenticated using ((select public.is_fenix_admin()));

drop policy if exists "brain runs admin read" on public.fenix_brain_update_runs;
create policy "brain runs admin read" on public.fenix_brain_update_runs
  for select to authenticated using ((select public.is_fenix_admin()));

drop policy if exists "brain candidates admin read" on public.fenix_brain_update_candidates;
create policy "brain candidates admin read" on public.fenix_brain_update_candidates
  for select to authenticated using ((select public.is_fenix_admin()));

drop policy if exists "brain candidates admin update" on public.fenix_brain_update_candidates;
create policy "brain candidates admin update" on public.fenix_brain_update_candidates
  for update to authenticated
  using ((select public.is_fenix_admin()))
  with check ((select public.is_fenix_admin()));

revoke all on public.fenix_brain_source_refresh from anon, authenticated;
revoke all on public.fenix_brain_update_runs from anon, authenticated;
revoke all on public.fenix_brain_update_candidates from anon, authenticated;
grant select on public.fenix_brain_source_refresh to authenticated;
grant select on public.fenix_brain_update_candidates to authenticated;
grant update on public.fenix_brain_update_candidates to authenticated;
grant select on public.fenix_brain_update_runs to authenticated;

insert into public.fenix_brain_source_refresh (source_id, refresh_interval_hours, parser_key, auto_publish)
select id, 24, 'generic_html', false
from public.fenix_brain_sources
where status = 'active'
on conflict (source_id) do nothing;

create or replace function public.claim_due_feni_brain_sources(p_limit integer default 10)
returns table (
  source_id uuid, url text, publisher text, title text, trust_tier smallint,
  parser_key text, auto_publish boolean, max_bytes integer, etag text, last_modified text
)
language sql
security invoker
set search_path = public
as $$
  select s.id, s.url, s.publisher, s.title, s.trust_tier,
         r.parser_key, r.auto_publish, r.max_bytes, r.etag, r.last_modified
  from public.fenix_brain_sources s
  join public.fenix_brain_source_refresh r on r.source_id = s.id
  where s.status = 'active' and r.enabled and r.next_refresh_at <= now() and s.url is not null
  order by r.next_refresh_at
  limit greatest(1, least(p_limit, 50));
$$;
revoke all on function public.claim_due_feni_brain_sources(integer) from anon, authenticated;

create or replace function public.fenix_brain_internal_refresh_secret()
returns text
language sql
security definer
set search_path = vault, public
as $$
  select decrypted_secret from vault.decrypted_secrets
  where name = 'fenix_brain_refresh_secret' limit 1;
$$;
revoke all on function public.fenix_brain_internal_refresh_secret() from public, anon, authenticated;
grant execute on function public.fenix_brain_internal_refresh_secret() to service_role;

select cron.unschedule('fenix-brain-source-refresh-daily')
where exists (select 1 from cron.job where jobname = 'fenix-brain-source-refresh-daily');

select cron.schedule(
  'fenix-brain-source-refresh-daily',
  '0 */6 * * *',
  $job$
    select net.http_post(
      url := 'https://lawdsvplbxfziihvmmva.supabase.co/functions/v1/fenix-brain-source-refresh',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-fenix-refresh-secret',
        (select decrypted_secret from vault.decrypted_secrets where name = 'fenix_brain_refresh_secret')
      ),
      body := '{"limit": 1}'::jsonb,
      timeout_milliseconds := 120000
    ) as request_id;
  $job$
);