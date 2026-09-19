drop policy if exists "Public can view public directory locations" on public.business_directory_locations;
drop policy if exists "Owners can manage directory locations" on public.business_directory_locations;
create policy "Directory locations public or owner select" on public.business_directory_locations
for select to anon, authenticated
using ((is_public = true and exists (
  select 1 from public.business_directory_profiles p
  where p.business_id = business_id and p.listing_status = 'published'
)) or exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "Directory locations owner insert" on public.business_directory_locations
for insert to authenticated with check (exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "Directory locations owner update" on public.business_directory_locations
for update to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
create policy "Directory locations owner delete" on public.business_directory_locations
for delete to authenticated using (exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));

drop policy if exists "Public can view public directory contacts" on public.business_directory_contacts;
drop policy if exists "Owners can manage directory contacts" on public.business_directory_contacts;
create policy "Directory contacts public or owner select" on public.business_directory_contacts
for select to anon, authenticated
using (exists (
  select 1 from public.business_directory_profiles p
  where p.business_id = business_id and p.listing_status = 'published'
) or exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "Directory contacts owner insert" on public.business_directory_contacts
for insert to authenticated with check (exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "Directory contacts owner update" on public.business_directory_contacts
for update to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
create policy "Directory contacts owner delete" on public.business_directory_contacts
for delete to authenticated using (exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));

drop policy if exists "Public can use directory aliases for search" on public.business_directory_aliases;
drop policy if exists "Owners can manage directory aliases" on public.business_directory_aliases;
create policy "Directory aliases public or owner select" on public.business_directory_aliases
for select to anon, authenticated
using (exists (
  select 1 from public.business_directory_profiles p
  where p.business_id = business_id and p.listing_status = 'published'
) or exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "Directory aliases owner insert" on public.business_directory_aliases
for insert to authenticated with check (exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "Directory aliases owner update" on public.business_directory_aliases
for update to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
create policy "Directory aliases owner delete" on public.business_directory_aliases
for delete to authenticated using (exists (
  select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())
));