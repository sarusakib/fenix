-- Harden aggregate Brain signal ingestion and enforce globally unique usernames.
begin;

create unique index if not exists profiles_username_lower_uq
  on public.profiles (lower(username))
  where username is not null;

alter table public.fenix_brain_query_events enable row level security;

drop policy if exists fenix_brain_query_events_insert on public.fenix_brain_query_events;
create policy fenix_brain_query_events_insert
on public.fenix_brain_query_events
for insert to anon, authenticated
with check (
  query_hash ~ '^[0-9a-f]{64}$'
  and length(intent_key) between 1 and 64
  and length(language_code) between 1 and 16
  and length(term) between 2 and 80
  and result_count between 0 and 100
);

grant insert on public.fenix_brain_query_events to anon, authenticated;

create or replace function public.record_feni_brain_events(
  p_query_hash text,
  p_intent_key text,
  p_language_code text,
  p_terms text[],
  p_result_count integer default 0
)
returns integer
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $function$
declare
  t text;
  inserted integer := 0;
begin
  if p_query_hash !~ '^[0-9a-f]{64}$' then
    return 0;
  end if;

  foreach t in array coalesce(p_terms, '{}'::text[]) loop
    t := lower(trim(t));
    if length(t) < 2 or length(t) > 80 then
      continue;
    end if;

    insert into public.fenix_brain_query_events(query_hash,intent_key,language_code,term,result_count)
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

revoke execute on function public.record_feni_brain_events(text,text,text,text[],integer) from public;
grant execute on function public.record_feni_brain_events(text,text,text,text[],integer) to anon, authenticated;

commit;
