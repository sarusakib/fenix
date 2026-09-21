-- FeniX Care & Emergency foundation.
begin;

create table if not exists public.fenix_blood_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  units smallint not null check (units between 1 and 20),
  hospital_name text not null check (length(trim(hospital_name)) between 2 and 180),
  hospital_area text,
  upazila_id uuid references public.fenix_brain_locations(id) on delete set null,
  area_text text,
  needed_at timestamptz,
  urgency text not null default 'urgent' check (urgency in ('critical','urgent','normal')),
  contact_method text not null default 'in_app' check (contact_method in ('in_app','phone','whatsapp')),
  note text check (note is null or length(note) <= 1000),
  status text not null default 'open' check (status in ('open','matched','fulfilled','cancelled','expired')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists fenix_blood_requests_search_idx
  on public.fenix_blood_requests(blood_group, status, urgency, created_at desc);
create index if not exists fenix_blood_requests_upazila_idx
  on public.fenix_blood_requests(upazila_id, status);
create index if not exists fenix_blood_requests_requester_idx
  on public.fenix_blood_requests(requester_id, created_at desc);

create table if not exists public.fenix_blood_donors (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  upazila_id uuid references public.fenix_brain_locations(id) on delete set null,
  area_text text,
  availability text not null default 'available' check (availability in ('available','unavailable','paused')),
  last_donation_date date,
  preferred_contact text not null default 'in_app' check (preferred_contact in ('in_app','phone','whatsapp')),
  is_public boolean not null default false,
  note text check (note is null or length(note) <= 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists fenix_blood_donors_match_idx
  on public.fenix_blood_donors(blood_group, availability, upazila_id)
  where is_public = true;

create table if not exists public.fenix_blood_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.fenix_blood_requests(id) on delete cascade,
  donor_id uuid not null references public.profiles(id) on delete cascade,
  message text check (message is null or length(message) <= 1000),
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  unique(request_id, donor_id)
);

create table if not exists public.fenix_ambulance_providers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  display_name text not null check (length(trim(display_name)) between 2 and 180),
  phone text,
  whatsapp text,
  base_area text,
  service_area text,
  ambulance_type text not null default 'general' check (ambulance_type in ('general','icu','neonatal','patient_transport')),
  ac_available boolean not null default false,
  oxygen_available boolean not null default false,
  available_24_7 boolean not null default false,
  is_verified boolean not null default false,
  status text not null default 'active' check (status in ('active','paused','suspended')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists fenix_ambulance_provider_search_idx
  on public.fenix_ambulance_providers(status, is_verified, available_24_7, base_area);

create table if not exists public.fenix_ambulance_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  pickup_area text not null check (length(trim(pickup_area)) between 2 and 240),
  pickup_upazila_id uuid references public.fenix_brain_locations(id) on delete set null,
  destination_hospital text,
  condition_category text not null default 'other' check (condition_category in ('critical','accident','maternal','child','stable','other')),
  ambulance_type text not null default 'general' check (ambulance_type in ('general','icu','neonatal','patient_transport')),
  oxygen_needed boolean not null default false,
  note text check (note is null or length(note) <= 1000),
  provider_id uuid references public.fenix_ambulance_providers(id) on delete set null,
  status text not null default 'open' check (status in ('open','accepted','in_transit','completed','cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists fenix_ambulance_requests_status_idx
  on public.fenix_ambulance_requests(status, created_at desc);
create index if not exists fenix_ambulance_requests_requester_idx
  on public.fenix_ambulance_requests(requester_id, created_at desc);

alter table public.fenix_blood_requests enable row level security;
alter table public.fenix_blood_donors enable row level security;
alter table public.fenix_blood_responses enable row level security;
alter table public.fenix_ambulance_providers enable row level security;
alter table public.fenix_ambulance_requests enable row level security;

drop policy if exists fenix_blood_requests_own_insert on public.fenix_blood_requests;
create policy fenix_blood_requests_own_insert
on public.fenix_blood_requests for insert to authenticated
with check ((select auth.uid()) = requester_id and public.is_fenix_user_active((select auth.uid())));

drop policy if exists fenix_blood_requests_own_select on public.fenix_blood_requests;
create policy fenix_blood_requests_own_select
on public.fenix_blood_requests for select to authenticated
using ((select auth.uid()) = requester_id or public.is_fenix_admin());

drop policy if exists fenix_blood_requests_own_update on public.fenix_blood_requests;
create policy fenix_blood_requests_own_update
on public.fenix_blood_requests for update to authenticated
using ((select auth.uid()) = requester_id or public.is_fenix_admin())
with check ((select auth.uid()) = requester_id or public.is_fenix_admin());

drop policy if exists fenix_blood_donors_own_select on public.fenix_blood_donors;
create policy fenix_blood_donors_own_select
on public.fenix_blood_donors for select to authenticated
using ((select auth.uid()) = user_id or public.is_fenix_admin());

drop policy if exists fenix_blood_donors_own_insert on public.fenix_blood_donors;
create policy fenix_blood_donors_own_insert
on public.fenix_blood_donors for insert to authenticated
with check ((select auth.uid()) = user_id and public.is_fenix_user_active((select auth.uid())));

drop policy if exists fenix_blood_donors_own_update on public.fenix_blood_donors;
create policy fenix_blood_donors_own_update
on public.fenix_blood_donors for update to authenticated
using ((select auth.uid()) = user_id or public.is_fenix_admin())
with check ((select auth.uid()) = user_id or public.is_fenix_admin());

drop policy if exists fenix_blood_responses_participant_select on public.fenix_blood_responses;
create policy fenix_blood_responses_participant_select
on public.fenix_blood_responses for select to authenticated
using (
  (select auth.uid()) = donor_id
  or exists (
    select 1 from public.fenix_blood_requests r
    where r.id = request_id and r.requester_id = (select auth.uid())
  )
  or public.is_fenix_admin()
);

drop policy if exists fenix_blood_responses_donor_insert on public.fenix_blood_responses;
create policy fenix_blood_responses_donor_insert
on public.fenix_blood_responses for insert to authenticated
with check (
  (select auth.uid()) = donor_id
  and public.is_fenix_user_active((select auth.uid()))
  and exists (
    select 1 from public.fenix_blood_requests r
    where r.id = request_id and r.status = 'open'
  )
);

drop policy if exists fenix_blood_responses_requester_update on public.fenix_blood_responses;
create policy fenix_blood_responses_requester_update
on public.fenix_blood_responses for update to authenticated
using (
  exists (
    select 1 from public.fenix_blood_requests r
    where r.id = request_id and r.requester_id = (select auth.uid())
  )
  or public.is_fenix_admin()
)
with check (
  exists (
    select 1 from public.fenix_blood_requests r
    where r.id = request_id and r.requester_id = (select auth.uid())
  )
  or public.is_fenix_admin()
);

drop policy if exists fenix_ambulance_providers_public_select on public.fenix_ambulance_providers;
create policy fenix_ambulance_providers_public_select
on public.fenix_ambulance_providers for select to anon, authenticated
using (status = 'active');

drop policy if exists fenix_ambulance_providers_owner_insert on public.fenix_ambulance_providers;
create policy fenix_ambulance_providers_owner_insert
on public.fenix_ambulance_providers for insert to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists fenix_ambulance_providers_owner_update on public.fenix_ambulance_providers;
create policy fenix_ambulance_providers_owner_update
on public.fenix_ambulance_providers for update to authenticated
using ((select auth.uid()) = owner_id or public.is_fenix_admin())
with check ((select auth.uid()) = owner_id or public.is_fenix_admin());

drop policy if exists fenix_ambulance_requests_own_insert on public.fenix_ambulance_requests;
create policy fenix_ambulance_requests_own_insert
on public.fenix_ambulance_requests for insert to authenticated
with check ((select auth.uid()) = requester_id and public.is_fenix_user_active((select auth.uid())));

drop policy if exists fenix_ambulance_requests_participant_select on public.fenix_ambulance_requests;
create policy fenix_ambulance_requests_participant_select
on public.fenix_ambulance_requests for select to authenticated
using (
  (select auth.uid()) = requester_id
  or public.is_fenix_admin()
  or exists (
    select 1 from public.fenix_ambulance_providers p
    where p.id = provider_id and p.owner_id = (select auth.uid())
  )
);

drop policy if exists fenix_ambulance_requests_participant_update on public.fenix_ambulance_requests;
create policy fenix_ambulance_requests_participant_update
on public.fenix_ambulance_requests for update to authenticated
using (
  (select auth.uid()) = requester_id
  or public.is_fenix_admin()
  or exists (
    select 1 from public.fenix_ambulance_providers p
    where p.id = provider_id and p.owner_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = requester_id
  or public.is_fenix_admin()
  or exists (
    select 1 from public.fenix_ambulance_providers p
    where p.id = provider_id and p.owner_id = (select auth.uid())
  )
);

revoke all on public.fenix_blood_requests from public, anon;
revoke all on public.fenix_blood_donors from public, anon;
revoke all on public.fenix_blood_responses from public, anon;
revoke all on public.fenix_ambulance_providers from public;
revoke all on public.fenix_ambulance_requests from public, anon;
grant select, insert, update on public.fenix_blood_requests to authenticated;
grant select, insert, update on public.fenix_blood_donors to authenticated;
grant select, insert, update on public.fenix_blood_responses to authenticated;
grant select, insert, update on public.fenix_ambulance_providers to authenticated;
grant select, insert, update on public.fenix_ambulance_requests to authenticated;

create or replace view public.fenix_public_blood_requests as
select
  r.id,
  r.blood_group,
  r.units,
  r.hospital_name,
  r.hospital_area,
  l.name_bn as upazila_bn,
  l.name_en as upazila_en,
  r.area_text,
  r.needed_at,
  r.urgency,
  r.status,
  r.created_at
from public.fenix_blood_requests r
left join public.fenix_brain_locations l on l.id = r.upazila_id
where r.status = 'open';

revoke all on public.fenix_public_blood_requests from public, authenticated;
grant select on public.fenix_public_blood_requests to anon, authenticated;

create or replace view public.fenix_public_blood_donors as
select
  d.user_id,
  p.full_name,
  p.username,
  p.avatar_url,
  d.blood_group,
  d.area_text,
  l.name_bn as upazila_bn,
  l.name_en as upazila_en,
  d.availability,
  d.last_donation_date,
  d.preferred_contact
from public.fenix_blood_donors d
join public.profiles p on p.id=d.user_id
left join public.fenix_brain_locations l on l.id=d.upazila_id
left join public.profile_settings ps on ps.user_id=d.user_id
left join public.fenix_user_moderation m on m.user_id=d.user_id
where d.is_public = true
  and d.availability = 'available'
  and coalesce(ps.profile_visibility,'public')='public'
  and coalesce(m.status,'active')='active';

revoke all on public.fenix_public_blood_donors from public, authenticated;
grant select on public.fenix_public_blood_donors to anon, authenticated;

create or replace view public.fenix_public_ambulance_providers as
select
  p.id,
  p.display_name,
  p.phone,
  p.whatsapp,
  p.base_area,
  p.service_area,
  p.ambulance_type,
  p.ac_available,
  p.oxygen_available,
  p.available_24_7,
  p.is_verified
from public.fenix_ambulance_providers p
where p.status='active';

revoke all on public.fenix_public_ambulance_providers from public, authenticated;
grant select on public.fenix_public_ambulance_providers to anon, authenticated;

commit;
