begin;

drop policy if exists "Public can view approved vendor public profile" on public.vendor_profiles;

drop policy if exists "Authenticated can view own or admin vendor profile" on public.vendor_profiles;
create policy "Authenticated can view own approved or admin vendor profile"
on public.vendor_profiles
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or public.is_fenix_admin()
  or status = 'approved'
);

create policy "Public can view approved vendor public profile"
on public.vendor_profiles
for select
to anon
using (status = 'approved');

commit;
