-- Final DB performance cleanup for FeniX community, Care and Messenger tables.
begin;

drop index if exists public.profiles_username_lower_uq;

create index if not exists fenix_ambulance_providers_owner_idx
  on public.fenix_ambulance_providers(owner_id);

create index if not exists fenix_ambulance_requests_pickup_upazila_idx
  on public.fenix_ambulance_requests(pickup_upazila_id);

create index if not exists fenix_ambulance_requests_provider_idx
  on public.fenix_ambulance_requests(provider_id);

create index if not exists fenix_blood_donors_upazila_idx
  on public.fenix_blood_donors(upazila_id);

create index if not exists fenix_blood_responses_donor_idx
  on public.fenix_blood_responses(donor_id);

create index if not exists fenix_content_reports_reporter_idx
  on public.fenix_content_reports(reporter_id);

create index if not exists fenix_content_reports_reviewed_by_idx
  on public.fenix_content_reports(reviewed_by)
  where reviewed_by is not null;

create index if not exists fenix_message_reactions_user_idx
  on public.fenix_message_reactions(user_id);

create index if not exists fenix_user_moderation_changed_by_idx
  on public.fenix_user_moderation(changed_by)
  where changed_by is not null;

drop policy if exists "Users can view own profile." on public.profiles;
drop policy if exists profiles_public_select on public.profiles;
create policy profiles_select_visible
on public.profiles
for select to anon, authenticated
using (
  (is_public and private.is_fenix_user_active(id))
  or (select auth.uid()) = id
  or is_fenix_admin()
);

drop policy if exists profile_contacts_own_select on public.profile_contacts;
drop policy if exists profile_contacts_public_select on public.profile_contacts;
create policy profile_contacts_select_visible
on public.profile_contacts
for select to anon, authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1 from public.profiles p
    where p.id = profile_contacts.user_id
      and p.is_public = true
      and private.is_fenix_user_active(p.id)
  )
);

drop policy if exists fenix_blood_requests_own_select on public.fenix_blood_requests;
drop policy if exists fenix_blood_requests_public_select on public.fenix_blood_requests;
create policy fenix_blood_requests_select_visible
on public.fenix_blood_requests
for select to anon, authenticated
using (
  status = 'open'
  or (select auth.uid()) = requester_id
  or is_fenix_admin()
);

commit;
