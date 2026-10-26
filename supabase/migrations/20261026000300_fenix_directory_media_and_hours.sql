begin;

-- Business logos and cover images use the same optimized JPEG/WebP pipeline as
-- other FeniX media. Bucket is public-read only; writes/deletes remain owner-only.
alter table public.business_directory_profiles
  add column if not exists logo_path text,
  add column if not exists cover_path text;

create or replace function public.validate_business_directory_profile_media_path()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  business_owner_id uuid;
begin
  if new.logo_path is null and new.cover_path is null then
    return new;
  end if;

  select b.owner_id
    into business_owner_id
    from public.businesses b
   where b.id = new.business_id;

  if business_owner_id is null then
    raise exception 'Only an owned business can attach directory media.'
      using errcode = '23514';
  end if;

  if new.logo_path is not null
     and new.logo_path !~ (
       '^' || business_owner_id::text || '/' || new.business_id::text ||
       '/logo-[0-9a-f-]{36}\.(webp|jpg)$'
     ) then
    raise exception 'Business logo path does not match the business owner and business.'
      using errcode = '23514';
  end if;

  if new.cover_path is not null
     and new.cover_path !~ (
       '^' || business_owner_id::text || '/' || new.business_id::text ||
       '/cover-[0-9a-f-]{36}\.(webp|jpg)$'
     ) then
    raise exception 'Business cover path does not match the business owner and business.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_business_directory_profile_media_path() from public, anon, authenticated;
drop trigger if exists business_directory_profiles_validate_media on public.business_directory_profiles;
create trigger business_directory_profiles_validate_media
before insert or update of logo_path, cover_path, business_id
on public.business_directory_profiles
for each row execute function public.validate_business_directory_profile_media_path();

-- Preserve the existing narrow column grants on trust fields.
grant insert (logo_path, cover_path) on public.business_directory_profiles to authenticated;
grant update (logo_path, cover_path) on public.business_directory_profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-directory-media',
  'business-directory-media',
  true,
  409600,
  array['image/jpeg','image/webp']::text[]
)
on conflict (id) do update
set public = true,
    file_size_limit = 409600,
    allowed_mime_types = array['image/jpeg','image/webp']::text[];

drop policy if exists business_directory_media_owner_insert on storage.objects;
create policy business_directory_media_owner_insert
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'business-directory-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (metadata ->> 'mimetype') = any (array['image/jpeg','image/webp'])
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(name))[2]
      and b.owner_id = (select auth.uid())
  )
  and (storage.filename(name) ~ '^logo-[0-9a-f-]{36}\.(webp|jpg)$'
       or storage.filename(name) ~ '^cover-[0-9a-f-]{36}\.(webp|jpg)$')
);

drop policy if exists business_directory_media_owner_delete on storage.objects;
create policy business_directory_media_owner_delete
on storage.objects
for delete to authenticated
using (
  bucket_id = 'business-directory-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(name))[2]
      and b.owner_id = (select auth.uid())
  )
);

-- Hours are optional. A blank opening/closing pair means "not provided";
-- is_closed=true requires both times to be null.
create table if not exists public.business_directory_hours (
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opens_at time without time zone,
  closes_at time without time zone,
  is_closed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (business_id, day_of_week),
  constraint business_directory_hours_consistent_check check (
    (is_closed and opens_at is null and closes_at is null)
    or
    (not is_closed and (
      (opens_at is null and closes_at is null)
      or (opens_at is not null and closes_at is not null)
    ))
  )
);

alter table public.business_directory_hours enable row level security;
revoke all on public.business_directory_hours from public, anon, authenticated;
grant select on public.business_directory_hours to anon, authenticated;
grant insert (business_id, day_of_week, opens_at, closes_at, is_closed)
  on public.business_directory_hours to authenticated;
grant update (business_id, day_of_week, opens_at, closes_at, is_closed)
  on public.business_directory_hours to authenticated;
grant delete on public.business_directory_hours to authenticated;

drop policy if exists business_directory_hours_public_or_owner_select on public.business_directory_hours;
create policy business_directory_hours_public_or_owner_select
on public.business_directory_hours
for select to anon, authenticated
using (
  exists (
    select 1
    from public.business_directory_profiles p
    where p.business_id = business_directory_hours.business_id
      and p.listing_status = 'published'
  )
  or exists (
    select 1
    from public.businesses b
    where b.id = business_directory_hours.business_id
      and b.owner_id = (select auth.uid())
  )
);

drop policy if exists business_directory_hours_owner_insert on public.business_directory_hours;
create policy business_directory_hours_owner_insert
on public.business_directory_hours
for insert to authenticated
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = business_directory_hours.business_id
      and b.owner_id = (select auth.uid())
  )
);

drop policy if exists business_directory_hours_owner_update on public.business_directory_hours;
create policy business_directory_hours_owner_update
on public.business_directory_hours
for update to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.id = business_directory_hours.business_id
      and b.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = business_directory_hours.business_id
      and b.owner_id = (select auth.uid())
  )
);

drop policy if exists business_directory_hours_owner_delete on public.business_directory_hours;
create policy business_directory_hours_owner_delete
on public.business_directory_hours
for delete to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.id = business_directory_hours.business_id
      and b.owner_id = (select auth.uid())
  )
);

create or replace function public.touch_business_directory_hours_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;
revoke all on function public.touch_business_directory_hours_updated_at() from public, anon, authenticated;
drop trigger if exists business_directory_hours_touch on public.business_directory_hours;
create trigger business_directory_hours_touch
before update on public.business_directory_hours
for each row execute function public.touch_business_directory_hours_updated_at();

commit;
