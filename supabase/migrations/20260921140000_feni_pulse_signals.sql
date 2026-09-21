-- FeniX Brain aggregate signals. No user ID, raw query, phone or message is stored.
begin;

create table if not exists public.fenix_brain_query_events (
  id uuid primary key default gen_random_uuid(),
  query_hash text not null,
  intent_key text not null default 'GENERAL_GUIDANCE',
  language_code text not null default 'unknown',
  term text not null check (length(trim(term)) between 2 and 80),
  result_count integer not null default 0 check (result_count between 0 and 100),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists fenix_brain_query_events_term_time_idx
  on public.fenix_brain_query_events(term, created_at desc);

create index if not exists fenix_brain_query_events_intent_time_idx
  on public.fenix_brain_query_events(intent_key, created_at desc);

alter table public.fenix_brain_query_events enable row level security;

revoke all on public.fenix_brain_query_events from public, anon, authenticated;

create or replace function public.record_feni_brain_events(
  p_query_hash text,
  p_intent_key text,
  p_language_code text,
  p_terms text[],
  p_result_count integer default 0
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  t text;
  inserted integer := 0;
begin
  if length(coalesce(p_query_hash,'')) < 16 or length(coalesce(p_query_hash,'')) > 128 then
    return 0;
  end if;

  foreach t in array coalesce(p_terms, '{}'::text[]) loop
    t := lower(trim(t));
    if length(t) < 2 or length(t) > 80 then
      continue;
    end if;

    insert into public.fenix_brain_query_events(
      query_hash,intent_key,language_code,term,result_count
    )
    values (
      p_query_hash,
      left(coalesce(p_intent_key,'GENERAL_GUIDANCE'),64),
      left(coalesce(p_language_code,'unknown'),16),
      t,
      greatest(0,least(coalesce(p_result_count,0),100))
    );
    inserted := inserted + 1;
  end loop;

  return inserted;
end;
$function$;

revoke all on function public.record_feni_brain_events(text,text,text,text[],integer) from public;
grant execute on function public.record_feni_brain_events(text,text,text,text[],integer) to anon, authenticated;

create or replace view public.fenix_brain_pulse_terms as
select
  term,
  count(*) filter (where created_at >= now() - interval '7 days')::integer as searches_7d,
  count(*) filter (where created_at >= now() - interval '30 days')::integer as searches_30d,
  count(distinct query_hash) filter (where created_at >= now() - interval '7 days')::integer as unique_queries_7d
from public.fenix_brain_query_events
where created_at >= now() - interval '30 days'
group by term;

revoke all on public.fenix_brain_pulse_terms from public, authenticated;
grant select on public.fenix_brain_pulse_terms to anon, authenticated;

create or replace view public.fenix_brain_pulse_intents as
select
  intent_key,
  count(*) filter (where created_at >= now() - interval '7 days')::integer as searches_7d,
  count(*) filter (where created_at >= now() - interval '30 days')::integer as searches_30d
from public.fenix_brain_query_events
where created_at >= now() - interval '30 days'
group by intent_key;

revoke all on public.fenix_brain_pulse_intents from public, authenticated;
grant select on public.fenix_brain_pulse_intents to anon, authenticated;

commit;
