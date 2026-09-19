drop policy if exists "Public can view published directory profiles" on public.business_directory_profiles;
drop policy if exists "Owners can manage directory profiles" on public.business_directory_profiles;
create policy "Directory profiles public or owner select" on public.business_directory_profiles
for select to anon, authenticated
using (listing_status = 'published' or exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "Directory profiles owner insert" on public.business_directory_profiles
for insert to authenticated
with check (exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "Directory profiles owner update" on public.business_directory_profiles
for update to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
create policy "Directory profiles owner delete" on public.business_directory_profiles
for delete to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));