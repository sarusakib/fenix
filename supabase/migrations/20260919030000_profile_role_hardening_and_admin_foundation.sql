-- FeniX profile role hardening and admin foundation
-- Applied to Supabase before committing this migration as the source-of-truth patch.

begin;

alter table public.profiles
  drop constraint if exists profiles_role_check;

update public.profiles
set role = 'user'
where role = 'customer';

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user','entrepreneur','investor','field_agent','admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'user'
  );
  return new;
end;
$function$;

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  if auth.uid() is not null
     and not public.is_fenix_admin()
     and (
       old.role is distinct from new.role
       or old.id is distinct from new.id
     )
  then
    new.role := old.role;
    new.id := old.id;
  end if;

  return new;
end;
$function$;

revoke all on function public.prevent_profile_privilege_escalation() from public, anon, authenticated;

drop trigger if exists profiles_prevent_privilege_escalation on public.profiles;
create trigger profiles_prevent_privilege_escalation
before update on public.profiles
for each row
execute function public.prevent_profile_privilege_escalation();

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

commit;
