create table if not exists public.business_directory_profiles (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  slug text unique,
  tagline_bn text,
  tagline_en text,
  about_bn text,
  about_en text,
  business_type text,
  listing_status text not null default 'published'
    check (listing_status in ('published','unlisted','suspended')),
  owner_claimed boolean not null default false,
  verification_level text not null default 'unverified'
    check (verification_level in ('unverified','owner_claimed','identity_reviewed','business_reviewed','fenix_verified')),
  phone_verified boolean not null default false,
  location_verified boolean not null default false,
  last_verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_directory_profiles_slug_check check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.business_directory_locations (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  district text not null default 'Feni',
  upazila text,
  area text,
  market text,
  address text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  map_label text,
  location_source text,
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_directory_locations_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint business_directory_locations_longitude_check check (longitude is null or longitude between -180 and 180)
);

create table if not exists public.business_directory_contacts (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  phone text,
  whatsapp text,
  website_url text,
  facebook_url text,
  is_phone_public boolean not null default false,
  is_whatsapp_public boolean not null default false,
  is_website_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.business_directory_aliases (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  alias text not null check (length(trim(alias)) between 2 and 120),
  language_code text not null default 'en'
    check (language_code in ('bn','en','banglish','local')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (business_id, alias)
);

create index if not exists business_directory_profiles_status_idx on public.business_directory_profiles(listing_status);
create index if not exists business_directory_profiles_verification_idx on public.business_directory_profiles(verification_level);
create index if not exists business_directory_locations_upazila_idx on public.business_directory_locations(upazila);
create index if not exists business_directory_locations_market_idx on public.business_directory_locations(market);
create index if not exists business_directory_aliases_business_idx on public.business_directory_aliases(business_id);
create index if not exists businesses_category_idx on public.businesses(category);
create index if not exists businesses_updated_at_idx on public.businesses(updated_at desc);

create or replace function public.business_directory_touch_updated_at()
returns trigger language plpgsql security invoker
set search_path = public, pg_temp
as $$
begin new.updated_at := timezone('utc', now()); return new; end;
$$;

drop trigger if exists business_directory_profiles_touch_updated_at on public.business_directory_profiles;
create trigger business_directory_profiles_touch_updated_at before update on public.business_directory_profiles
for each row execute function public.business_directory_touch_updated_at();

drop trigger if exists business_directory_locations_touch_updated_at on public.business_directory_locations;
create trigger business_directory_locations_touch_updated_at before update on public.business_directory_locations
for each row execute function public.business_directory_touch_updated_at();

drop trigger if exists business_directory_contacts_touch_updated_at on public.business_directory_contacts;
create trigger business_directory_contacts_touch_updated_at before update on public.business_directory_contacts
for each row execute function public.business_directory_touch_updated_at();

create or replace function public.business_directory_seed_profile()
returns trigger language plpgsql security invoker
set search_path = public, pg_temp
as $$
begin
  insert into public.business_directory_profiles(business_id) values (new.id)
  on conflict (business_id) do nothing;
  return new;
end;
$$;

drop trigger if exists businesses_seed_directory_profile on public.businesses;
create trigger businesses_seed_directory_profile after insert on public.businesses
for each row execute function public.business_directory_seed_profile();

insert into public.business_directory_profiles (business_id, slug)
select b.id, 'feni-fashion-house'
from public.businesses b
where b.name = 'Feni Fashion House'
  and not exists (select 1 from public.business_directory_profiles p where p.business_id = b.id);

revoke all on function public.business_directory_touch_updated_at() from public, anon, authenticated;
revoke all on function public.business_directory_seed_profile() from public, anon, authenticated;