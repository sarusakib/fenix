-- FeniX Directory + business mutation security hardening.
-- Replaces legacy policy forms whose unqualified business_id reference could
-- collapse to a tautology inside correlated EXISTS checks.

begin;

drop policy if exists "Public can view public directory locations" on public.business_directory_locations;
drop policy if exists "Directory locations public or owner select" on public.business_directory_locations;
create policy "Directory locations public or owner select"
on public.business_directory_locations
for select to anon, authenticated
using (
  (
    is_public = true
    and exists (
      select 1
      from public.business_directory_profiles p
      where p.business_id = business_directory_locations.business_id
        and p.listing_status = 'published'
    )
  )
  or exists (
    select 1
    from public.businesses b
    where b.id = business_directory_locations.business_id
      and b.owner_id = (select auth.uid())
  )
);

drop policy if exists "Public can view public directory contacts" on public.business_directory_contacts;
drop policy if exists "Directory contacts public or owner select" on public.business_directory_contacts;
create policy "Directory contacts public or owner select"
on public.business_directory_contacts
for select to anon, authenticated
using (
  exists (
    select 1
    from public.business_directory_profiles p
    where p.business_id = business_directory_contacts.business_id
      and p.listing_status = 'published'
  )
  or exists (
    select 1
    from public.businesses b
    where b.id = business_directory_contacts.business_id
      and b.owner_id = (select auth.uid())
  )
);

drop policy if exists "Public can use directory aliases for search" on public.business_directory_aliases;
drop policy if exists "Directory aliases public or owner select" on public.business_directory_aliases;
create policy "Directory aliases public or owner select"
on public.business_directory_aliases
for select to anon, authenticated
using (
  exists (
    select 1
    from public.business_directory_profiles p
    where p.business_id = business_directory_aliases.business_id
      and p.listing_status = 'published'
  )
  or exists (
    select 1
    from public.businesses b
    where b.id = business_directory_aliases.business_id
      and b.owner_id = (select auth.uid())
  )
);

revoke all on table
  public.business_directory_profiles,
  public.business_directory_locations,
  public.business_directory_contacts,
  public.business_directory_aliases
from public, anon, authenticated;

grant select on table
  public.business_directory_profiles,
  public.business_directory_locations,
  public.business_directory_contacts,
  public.business_directory_aliases
to anon, authenticated;

grant insert, update, delete on table
  public.business_directory_profiles,
  public.business_directory_locations,
  public.business_directory_contacts,
  public.business_directory_aliases
to authenticated;

drop policy if exists "Authenticated users can create businesses." on public.businesses;
create policy "Authenticated users can create businesses."
on public.businesses
for insert to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can update their own businesses." on public.businesses;
create policy "Owners can update their own businesses."
on public.businesses
for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can delete their own businesses." on public.businesses;
create policy "Owners can delete their own businesses."
on public.businesses
for delete to authenticated
using ((select auth.uid()) = owner_id);

commit;
