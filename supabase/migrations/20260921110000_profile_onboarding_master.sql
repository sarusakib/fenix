-- FeniX Profile Onboarding + private location/contact foundation.
begin;

alter table public.profiles
  add column if not exists country_code text not null default 'BD',
  add column if not exists district_id uuid,
  add column if not exists upazila_id uuid,
  add column if not exists locality_id uuid,
  add column if not exists area_text text,
  add column if not exists road_text text,
  add column if not exists house_details text,
  add column if not exists holding_no text,
  add column if not exists location_public_level text not null default 'district',
  add column if not exists exact_location_visibility text not null default 'private';

alter table public.profiles
  drop constraint if exists profiles_country_code_check;
alter table public.profiles
  add constraint profiles_country_code_check
  check (country_code = 'BD');

alter table public.profiles
  drop constraint if exists profiles_location_public_level_check;
alter table public.profiles
  add constraint profiles_location_public_level_check
  check (location_public_level in ('district','upazila','locality'));

alter table public.profiles
  drop constraint if exists profiles_exact_location_visibility_check;
alter table public.profiles
  add constraint profiles_exact_location_visibility_check
  check (exact_location_visibility in ('private','connections'));

alter table public.profiles
  drop constraint if exists profiles_area_text_length_check;
alter table public.profiles
  add constraint profiles_area_text_length_check
  check (area_text is null or length(area_text) <= 200);

alter table public.profiles
  drop constraint if exists profiles_road_text_length_check;
alter table public.profiles
  add constraint profiles_road_text_length_check
  check (road_text is null or length(road_text) <= 240);

alter table public.profiles
  drop constraint if exists profiles_house_details_length_check;
alter table public.profiles
  add constraint profiles_house_details_length_check
  check (house_details is null or length(house_details) <= 300);

alter table public.profiles
  drop constraint if exists profiles_holding_no_length_check;
alter table public.profiles
  add constraint profiles_holding_no_length_check
  check (holding_no is null or length(holding_no) <= 80);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_district_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_district_id_fkey
      foreign key (district_id) references public.fenix_brain_locations(id) on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_upazila_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_upazila_id_fkey
      foreign key (upazila_id) references public.fenix_brain_locations(id) on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_locality_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_locality_id_fkey
      foreign key (locality_id) references public.fenix_brain_locations(id) on delete set null;
  end if;
end $$;

update public.profiles
set district_id = (
  select id from public.fenix_brain_locations
  where level='district' and lower(name_en)='feni'
  order by id
  limit 1
)
where district_id is null;

create index if not exists profiles_district_id_idx on public.profiles(district_id);
create index if not exists profiles_upazila_id_idx on public.profiles(upazila_id);
create index if not exists profiles_locality_id_idx on public.profiles(locality_id);

alter table public.profile_settings
  add column if not exists onboarding_step text not null default 'welcome',
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_dismissed boolean not null default false,
  add column if not exists interests text[] not null default '{}';

alter table public.profile_settings
  drop constraint if exists profile_settings_onboarding_step_check;
alter table public.profile_settings
  add constraint profile_settings_onboarding_step_check
  check (onboarding_step in ('welcome','basics','photo','location','contacts','interests','done'));

create table if not exists public.profile_contacts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  whatsapp text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,
  phone_public boolean not null default false,
  whatsapp_public boolean not null default false,
  facebook_public boolean not null default false,
  instagram_public boolean not null default false,
  linkedin_public boolean not null default false,
  youtube_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profile_contacts enable row level security;

drop policy if exists profile_contacts_own_select on public.profile_contacts;
create policy profile_contacts_own_select
on public.profile_contacts
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists profile_contacts_own_insert on public.profile_contacts;
create policy profile_contacts_own_insert
on public.profile_contacts
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists profile_contacts_own_update on public.profile_contacts;
create policy profile_contacts_own_update
on public.profile_contacts
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on public.profile_contacts from public, anon;
grant select, insert, update on public.profile_contacts to authenticated;

create or replace function public.is_fenix_username_available(
  p_username text,
  p_exclude_user_id uuid default auth.uid()
)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $function$
declare
  candidate text := lower(trim(coalesce(p_username, '')));
begin
  if candidate !~ '^[a-z0-9_]{3,32}$' then
    return false;
  end if;

  return not exists (
    select 1
    from public.profiles p
    where lower(p.username) = candidate
      and p.id is distinct from p_exclude_user_id
  );
end;
$function$;

revoke all on function public.is_fenix_username_available(text, uuid) from public, anon;
grant execute on function public.is_fenix_username_available(text, uuid) to authenticated;

insert into public.profile_contacts(user_id)
select p.id
from public.profiles p
on conflict (user_id) do nothing;

do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'avatars'
  ) then
    insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
    values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp']);
  else
    update storage.buckets
    set public = true,
        file_size_limit = 2097152,
        allowed_mime_types = array['image/jpeg','image/png','image/webp']
    where id = 'avatars';
  end if;
end $$;

drop policy if exists fenix_avatar_insert on storage.objects;
create policy fenix_avatar_insert
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists fenix_avatar_update on storage.objects;
create policy fenix_avatar_update
on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists fenix_avatar_delete on storage.objects;
create policy fenix_avatar_delete
on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create or replace view public.fenix_public_profiles as
select
  p.id,
  p.full_name,
  p.username,
  p.bio,
  p.avatar_url,
  p.cover_url,
  p.location_text,
  p.website_url,
  p.created_at,
  case
    when p.location_public_level = 'locality' then coalesce(locality.name_bn, upazila.name_bn, district.name_bn, p.location_text)
    when p.location_public_level = 'upazila' then coalesce(upazila.name_bn, district.name_bn, p.location_text)
    else coalesce(district.name_bn, p.location_text)
  end as public_location,
  case when c.facebook_public then c.facebook_url end as facebook_url,
  case when c.instagram_public then c.instagram_url end as instagram_url,
  case when c.linkedin_public then c.linkedin_url end as linkedin_url,
  case when c.youtube_public then c.youtube_url end as youtube_url,
  case when c.whatsapp_public then c.whatsapp end as whatsapp,
  case when c.phone_public then p.phone end as phone
from public.profiles p
left join public.profile_settings ps on ps.user_id = p.id
left join public.fenix_user_moderation m on m.user_id = p.id
left join public.fenix_brain_locations district on district.id = p.district_id
left join public.fenix_brain_locations upazila on upazila.id = p.upazila_id
left join public.fenix_brain_locations locality on locality.id = p.locality_id
left join public.profile_contacts c on c.user_id = p.id
where coalesce(ps.profile_visibility,'public') = 'public'
  and coalesce(m.status,'active') = 'active';

revoke all on public.fenix_public_profiles from public, authenticated;
grant select on public.fenix_public_profiles to anon, authenticated;

commit;
