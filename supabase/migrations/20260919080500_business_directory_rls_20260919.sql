alter table public.business_directory_profiles enable row level security;
alter table public.business_directory_locations enable row level security;
alter table public.business_directory_contacts enable row level security;
alter table public.business_directory_aliases enable row level security;

create policy "Public can view published directory profiles" on public.business_directory_profiles
for select to anon, authenticated using (listing_status = 'published');
create policy "Owners can manage directory profiles" on public.business_directory_profiles
for all to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));

create policy "Public can view public directory locations" on public.business_directory_locations
for select to anon, authenticated using (
  is_public = true and exists (
    select 1 from public.business_directory_profiles p
    where p.business_id = business_directory_locations.business_id and p.listing_status = 'published'
  )
);
create policy "Owners can manage directory locations" on public.business_directory_locations
for all to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));

create policy "Public can view public directory contacts" on public.business_directory_contacts
for select to anon, authenticated using (exists (
  select 1 from public.business_directory_profiles p
  where p.business_id = business_directory_contacts.business_id and p.listing_status = 'published'
));
create policy "Owners can manage directory contacts" on public.business_directory_contacts
for all to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));

create policy "Public can use directory aliases for search" on public.business_directory_aliases
for select to anon, authenticated using (exists (
  select 1 from public.business_directory_profiles p
  where p.business_id = business_directory_aliases.business_id and p.listing_status = 'published'
));
create policy "Owners can manage directory aliases" on public.business_directory_aliases
for all to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));

grant select on public.business_directory_profiles to anon, authenticated;
grant select, insert, update, delete on public.business_directory_profiles to authenticated;
grant select on public.business_directory_locations to anon, authenticated;
grant insert, update, delete on public.business_directory_locations to authenticated;
grant select on public.business_directory_contacts to anon, authenticated;
grant insert, update, delete on public.business_directory_contacts to authenticated;
grant select on public.business_directory_aliases to anon, authenticated;
grant insert, update, delete on public.business_directory_aliases to authenticated;