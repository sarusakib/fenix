-- Username availability does not need elevated privileges; the unique index remains authoritative.
begin;

create or replace function public.is_fenix_username_available(
  p_username text,
  p_exclude_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public
as $function$
  select case
    when lower(trim(coalesce(p_username,''))) !~ '^[a-z0-9_]{3,32}$' then false
    else not exists (
      select 1
      from public.profiles p
      where lower(p.username) = lower(trim(p_username))
        and p.id is distinct from p_exclude_user_id
    )
  end;
$function$;

revoke execute on function public.is_fenix_username_available(text,uuid) from public, anon;
grant execute on function public.is_fenix_username_available(text,uuid) to authenticated;

commit;
