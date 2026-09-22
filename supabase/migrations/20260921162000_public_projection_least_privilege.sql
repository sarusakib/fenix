-- Make FeniX public projection paths both functional for anonymous users and least-privilege.
begin;

-- Safe public profile columns only. Private role/phone/exact-address fields are never granted.
grant select (
  id, full_name, username, bio, avatar_url, cover_url, location_text,
  website_url, district_id, upazila_id, locality_id, location_public_level,
  created_at, is_public, feed_public
) on public.profiles to anon, authenticated;

-- Public-facing contact values are generated from the user's own visibility flags.
alter table public.profile_contacts
  add column if not exists public_whatsapp text generated always as (case when whatsapp_public then whatsapp end) stored,
  add column if not exists public_facebook_url text generated always as (case when facebook_public then facebook_url end) stored,
  add column if not exists public_instagram_url text generated always as (case when instagram_public then instagram_url end) stored,
  add column if not exists public_linkedin_url text generated always as (case when linkedin_public then linkedin_url end) stored,
  add column if not exists public_youtube_url text generated always as (case when youtube_public then youtube_url end) stored;

grant select (
  user_id, public_whatsapp, public_facebook_url, public_instagram_url,
  public_linkedin_url, public_youtube_url
) on public.profile_contacts to anon, authenticated;

drop policy if exists profile_contacts_public_select on public.profile_contacts;
create policy profile_contacts_public_select
on public.profile_contacts for select to anon, authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_contacts.user_id
      and p.is_public = true
      and p.id = profile_contacts.user_id
  )
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
  c.public_facebook_url as facebook_url,
  c.public_instagram_url as instagram_url,
  c.public_linkedin_url as linkedin_url,
  c.public_youtube_url as youtube_url,
  c.public_whatsapp as whatsapp,
  null::text as phone
from public.profiles p
left join public.profile_settings ps on ps.user_id = p.id
left join public.fenix_user_moderation m on m.user_id = p.id
left join public.fenix_brain_locations district on district.id = p.district_id
left join public.fenix_brain_locations upazila on upazila.id = p.upazila_id
left join public.fenix_brain_locations locality on locality.id = p.locality_id
left join public.profile_contacts c on c.user_id = p.id
where p.is_public = true
  and coalesce(ps.profile_visibility, 'public') = 'public'
  and coalesce(m.status, 'active') = 'active';

alter view public.fenix_public_profiles set (security_invoker = true);
revoke all on public.fenix_public_profiles from public, authenticated;
grant select on public.fenix_public_profiles to anon, authenticated;

-- Public blood requests: only non-sensitive, open-request columns are selectable.
grant select (
  id, blood_group, units, hospital_name, hospital_area,
  upazila_id, area_text, needed_at, urgency, status, created_at
) on public.fenix_blood_requests to anon, authenticated;

drop policy if exists fenix_blood_requests_public_select on public.fenix_blood_requests;
create policy fenix_blood_requests_public_select
on public.fenix_blood_requests for select to anon, authenticated
using (status = 'open' or (select auth.uid()) = requester_id or public.is_fenix_admin());

alter view public.fenix_public_blood_requests set (security_invoker = true);

-- Public ambulance provider fields only.
grant select (
  id, display_name, phone, whatsapp, base_area, service_area,
  ambulance_type, ac_available, oxygen_available, available_24_7, is_verified, status
) on public.fenix_ambulance_providers to anon, authenticated;

drop policy if exists fenix_ambulance_providers_public_select on public.fenix_ambulance_providers;
create policy fenix_ambulance_providers_public_select
on public.fenix_ambulance_providers for select to anon, authenticated
using (status = 'active');

alter view public.fenix_public_ambulance_providers set (security_invoker = true);

-- Public Pulse snapshots: aggregated only.
create table if not exists public.fenix_brain_pulse_terms_public (
  term text primary key,
  searches_7d integer not null default 0,
  searches_30d integer not null default 0,
  unique_queries_7d integer not null default 0
);

create table if not exists public.fenix_brain_pulse_intents_public (
  intent_key text primary key,
  searches_7d integer not null default 0,
  searches_30d integer not null default 0
);

alter table public.fenix_brain_pulse_terms_public enable row level security;
alter table public.fenix_brain_pulse_intents_public enable row level security;

drop policy if exists fenix_brain_pulse_terms_public_select on public.fenix_brain_pulse_terms_public;
create policy fenix_brain_pulse_terms_public_select
on public.fenix_brain_pulse_terms_public for select to anon, authenticated
using (true);

drop policy if exists fenix_brain_pulse_intents_public_select on public.fenix_brain_pulse_intents_public;
create policy fenix_brain_pulse_intents_public_select
on public.fenix_brain_pulse_intents_public for select to anon, authenticated
using (true);

revoke all on public.fenix_brain_pulse_terms_public from public;
revoke all on public.fenix_brain_pulse_intents_public from public;
grant select on public.fenix_brain_pulse_terms_public to anon, authenticated;
grant select on public.fenix_brain_pulse_intents_public to anon, authenticated;

create or replace function public.refresh_feni_brain_pulse_public()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  delete from public.fenix_brain_pulse_terms_public;
  insert into public.fenix_brain_pulse_terms_public(term,searches_7d,searches_30d,unique_queries_7d)
  select
    term,
    count(*) filter (where created_at >= now() - interval '7 days')::integer,
    count(*) filter (where created_at >= now() - interval '30 days')::integer,
    count(distinct query_hash) filter (where created_at >= now() - interval '7 days')::integer
  from public.fenix_brain_query_events
  where created_at >= now() - interval '30 days'
  group by term;

  delete from public.fenix_brain_pulse_intents_public;
  insert into public.fenix_brain_pulse_intents_public(intent_key,searches_7d,searches_30d)
  select
    intent_key,
    count(*) filter (where created_at >= now() - interval '7 days')::integer,
    count(*) filter (where created_at >= now() - interval '30 days')::integer
  from public.fenix_brain_query_events
  where created_at >= now() - interval '30 days'
  group by intent_key;

  return new;
end;
$function$;

revoke all on function public.refresh_feni_brain_pulse_public() from public, anon, authenticated;

drop trigger if exists fenix_brain_query_events_refresh_pulse on public.fenix_brain_query_events;
create trigger fenix_brain_query_events_refresh_pulse
after insert on public.fenix_brain_query_events
for each row
execute function public.refresh_feni_brain_pulse_public();

delete from public.fenix_brain_pulse_terms_public;
insert into public.fenix_brain_pulse_terms_public(term,searches_7d,searches_30d,unique_queries_7d)
select
  term,
  count(*) filter (where created_at >= now() - interval '7 days')::integer,
  count(*) filter (where created_at >= now() - interval '30 days')::integer,
  count(distinct query_hash) filter (where created_at >= now() - interval '7 days')::integer
from public.fenix_brain_query_events
where created_at >= now() - interval '30 days'
group by term;

delete from public.fenix_brain_pulse_intents_public;
insert into public.fenix_brain_pulse_intents_public(intent_key,searches_7d,searches_30d)
select
  intent_key,
  count(*) filter (where created_at >= now() - interval '7 days')::integer,
  count(*) filter (where created_at >= now() - interval '30 days')::integer
from public.fenix_brain_query_events
where created_at >= now() - interval '30 days'
group by intent_key;

commit;
