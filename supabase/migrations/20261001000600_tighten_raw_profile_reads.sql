-- Tighten raw profile-table reads.
-- Public profile discovery must use fenix_public_profiles so private role,
-- phone and exact-location fields are not exposed by direct table queries.

drop policy if exists profiles_select_own_or_admin on public.profiles;
drop policy if exists profiles_select_visible on public.profiles;

create policy profiles_select_own_or_admin
on public.profiles
for select to authenticated
using (
  (select auth.uid()) = id
  or is_fenix_admin()
);

drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert to authenticated
with check ((select auth.uid()) = id);
