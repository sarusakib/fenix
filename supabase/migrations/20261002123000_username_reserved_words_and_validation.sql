-- FeniX username validation hardening
-- Reserve platform routes/brand names so they cannot become user profile URLs.

begin;

create or replace function public.is_fenix_username_available(
  p_username text,
  p_exclude_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
set search_path = pg_catalog, public
as $function$
  select case
    when lower(trim(coalesce(p_username, ''))) !~ '^[a-z0-9._]{3,30}$' then false
    when lower(trim(p_username)) like '.%' then false
    when lower(trim(p_username)) like '%.' then false
    when position('..' in lower(trim(p_username))) > 0 then false
    when lower(trim(p_username)) = any (array[
      'admin','administrator','api','contact','directory','emergency',
      'fenix','fenixx','guide','help','invest','login','messages',
      'news','notifications','official','profile','search','security',
      'services','settings','signup','staff','support','system','user'
    ]::text[]) then false
    else not exists (
      select 1
      from public.profiles p
      where lower(p.username) = lower(trim(p_username))
        and p.id is distinct from p_exclude_user_id
    )
  end;
$function$;

comment on function public.is_fenix_username_available(text, uuid)
  is 'Returns whether a normalized FeniX username is valid, not reserved, and not already assigned.';

commit;
