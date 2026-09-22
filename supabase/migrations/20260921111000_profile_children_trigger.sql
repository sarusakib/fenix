-- FeniX profile child-row initialization for new accounts.
begin;

create or replace function public.ensure_fenix_profile_children()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  insert into public.profile_settings(user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.profile_contacts(user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$function$;

revoke all on function public.ensure_fenix_profile_children() from public, anon, authenticated;

drop trigger if exists profiles_ensure_settings on public.profiles;
drop trigger if exists profiles_ensure_profile_children on public.profiles;

create trigger profiles_ensure_profile_children
after insert on public.profiles
for each row
execute function public.ensure_fenix_profile_children();

commit;
