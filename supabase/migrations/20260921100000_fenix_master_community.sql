-- FeniX Master Community Layer: profiles, text feed, direct messages and moderation.
-- Public-safe profile/feed projections expose only intentionally public fields.
begin;

alter table public.profiles
  add column if not exists username text,
  add column if not exists bio text,
  add column if not exists avatar_url text,
  add column if not exists cover_url text,
  add column if not exists location_text text,
  add column if not exists website_url text;

update public.profiles
set username = 'user_' || replace(substr(id::text,1,8),'-','')
where username is null or length(trim(username)) = 0;

create unique index if not exists profiles_username_uidx
  on public.profiles(lower(username))
  where username is not null;

alter table public.profiles
  drop constraint if exists profiles_username_check;

alter table public.profiles
  add constraint profiles_username_check
  check (username is null or username ~ '^[a-z0-9_]{3,32}$');

alter table public.profiles
  drop constraint if exists profiles_bio_length_check;
alter table public.profiles
  add constraint profiles_bio_length_check
  check (bio is null or length(bio) <= 1000);

create table if not exists public.profile_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  locale text not null default 'bn' check (locale in ('bn','en')),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  profile_visibility text not null default 'public' check (profile_visibility in ('public','private')),
  message_permissions text not null default 'everyone' check (message_permissions in ('everyone','authenticated','nobody')),
  feed_visibility text not null default 'public' check (feed_visibility in ('public','authenticated')),
  reduced_motion boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fenix_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 5000),
  visibility text not null default 'public' check (visibility in ('public','authenticated')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index if not exists fenix_posts_feed_idx
  on public.fenix_posts(created_at desc)
  where deleted_at is null and visibility = 'public';
create index if not exists fenix_posts_author_idx
  on public.fenix_posts(author_id, created_at desc);

create table if not exists public.fenix_direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz,
  deleted_for_sender_at timestamptz,
  deleted_for_recipient_at timestamptz,
  constraint fenix_direct_messages_not_self check (sender_id <> recipient_id)
);

create index if not exists fenix_dm_inbox_idx
  on public.fenix_direct_messages(recipient_id, created_at desc);
create index if not exists fenix_dm_sent_idx
  on public.fenix_direct_messages(sender_id, created_at desc);

create table if not exists public.fenix_user_moderation (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','suspended','banned')),
  reason text,
  banned_until timestamptz,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default timezone('utc', now())
);

create index if not exists fenix_user_moderation_status_idx
  on public.fenix_user_moderation(status, banned_until);

create table if not exists public.fenix_content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('user','post','business','message')),
  content_id uuid not null,
  reason text not null check (length(trim(reason)) between 2 and 120),
  details text,
  status text not null default 'pending' check (status in ('pending','reviewing','resolved','dismissed')),
  admin_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists fenix_content_reports_queue_idx
  on public.fenix_content_reports(status, created_at desc);
create index if not exists fenix_content_reports_content_idx
  on public.fenix_content_reports(content_type, content_id);

create or replace function public.is_fenix_user_active(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select not exists (
    select 1 from public.fenix_user_moderation m
    where m.user_id = p_user_id
      and (
        m.status = 'banned'
        or (m.status = 'suspended' and (m.banned_until is null or m.banned_until > now()))
      )
  )
$$;

revoke all on function public.is_fenix_user_active(uuid) from public, anon;
grant execute on function public.is_fenix_user_active(uuid) to authenticated;

create or replace function public.ensure_fenix_profile_settings()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profile_settings(user_id)
  values(new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.ensure_fenix_profile_settings() from public, anon, authenticated;

drop trigger if exists profiles_ensure_settings on public.profiles;
create trigger profiles_ensure_settings
after insert on public.profiles
for each row
execute function public.ensure_fenix_profile_settings();

insert into public.profile_settings(user_id)
select p.id
from public.profiles p
on conflict (user_id) do nothing;

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
  p.created_at
from public.profiles p
left join public.profile_settings ps on ps.user_id = p.id
left join public.fenix_user_moderation m on m.user_id = p.id
where coalesce(ps.profile_visibility,'public') = 'public'
  and coalesce(m.status,'active') = 'active';

create or replace view public.fenix_public_feed as
select
  f.id,
  f.body,
  f.created_at,
  f.updated_at,
  p.id as author_id,
  p.full_name as author_name,
  p.username as author_username,
  p.avatar_url as author_avatar_url
from public.fenix_posts f
join public.profiles p on p.id=f.author_id
left join public.profile_settings ps on ps.user_id=p.id
left join public.fenix_user_moderation m on m.user_id=p.id
where f.deleted_at is null
  and f.visibility='public'
  and coalesce(ps.feed_visibility,'public')='public'
  and coalesce(m.status,'active')='active';

revoke all on public.fenix_public_profiles from public, authenticated;
grant select on public.fenix_public_profiles to anon, authenticated;
revoke all on public.fenix_public_feed from public, authenticated;
grant select on public.fenix_public_feed to anon, authenticated;

alter table public.profile_settings enable row level security;
alter table public.fenix_posts enable row level security;
alter table public.fenix_direct_messages enable row level security;
alter table public.fenix_user_moderation enable row level security;
alter table public.fenix_content_reports enable row level security;

drop policy if exists profile_settings_own_select on public.profile_settings;
create policy profile_settings_own_select on public.profile_settings
for select to authenticated using ((select auth.uid())=user_id);

drop policy if exists profile_settings_own_update on public.profile_settings;
create policy profile_settings_own_update on public.profile_settings
for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

drop policy if exists profile_settings_own_insert on public.profile_settings;
create policy profile_settings_own_insert on public.profile_settings
for insert to authenticated with check ((select auth.uid())=user_id);

drop policy if exists fenix_posts_public_select on public.fenix_posts;
create policy fenix_posts_public_select on public.fenix_posts
for select to anon, authenticated
using (
  deleted_at is null
  and visibility='public'
  and public.is_fenix_user_active(author_id)
);

drop policy if exists fenix_posts_own_insert on public.fenix_posts;
create policy fenix_posts_own_insert on public.fenix_posts
for insert to authenticated
with check (
  (select auth.uid())=author_id
  and public.is_fenix_user_active((select auth.uid()))
);

drop policy if exists fenix_posts_own_update on public.fenix_posts;
create policy fenix_posts_own_update on public.fenix_posts
for update to authenticated
using ((select auth.uid())=author_id)
with check ((select auth.uid())=author_id);

drop policy if exists fenix_posts_own_delete on public.fenix_posts;
create policy fenix_posts_own_delete on public.fenix_posts
for update to authenticated
using ((select auth.uid())=author_id)
with check ((select auth.uid())=author_id);

drop policy if exists fenix_dm_participant_select on public.fenix_direct_messages;
create policy fenix_dm_participant_select on public.fenix_direct_messages
for select to authenticated
using ((select auth.uid()) in (sender_id,recipient_id));

drop policy if exists fenix_dm_participant_insert on public.fenix_direct_messages;
create policy fenix_dm_participant_insert on public.fenix_direct_messages
for insert to authenticated
with check (
  (select auth.uid())=sender_id
  and public.is_fenix_user_active((select auth.uid()))
  and public.is_fenix_user_active(recipient_id)
);

drop policy if exists fenix_dm_recipient_read on public.fenix_direct_messages;
create policy fenix_dm_recipient_read on public.fenix_direct_messages
for update to authenticated
using ((select auth.uid())=recipient_id)
with check ((select auth.uid())=recipient_id);

drop policy if exists fenix_user_moderation_admin on public.fenix_user_moderation;
create policy fenix_user_moderation_admin on public.fenix_user_moderation
for all to authenticated
using (public.is_fenix_admin())
with check (public.is_fenix_admin());

drop policy if exists fenix_reports_own_insert on public.fenix_content_reports;
create policy fenix_reports_own_insert on public.fenix_content_reports
for insert to authenticated
with check ((select auth.uid())=reporter_id and public.is_fenix_user_active((select auth.uid())));

drop policy if exists fenix_reports_own_select on public.fenix_content_reports;
create policy fenix_reports_own_select on public.fenix_content_reports
for select to authenticated
using ((select auth.uid())=reporter_id or public.is_fenix_admin());

drop policy if exists fenix_reports_admin_update on public.fenix_content_reports;
create policy fenix_reports_admin_update on public.fenix_content_reports
for update to authenticated
using (public.is_fenix_admin())
with check (public.is_fenix_admin());

revoke all on public.profile_settings from public, anon;
revoke all on public.fenix_posts from public;
revoke all on public.fenix_direct_messages from public, anon;
revoke all on public.fenix_user_moderation from public, anon;
revoke all on public.fenix_content_reports from public, anon;
grant select on public.fenix_posts to anon, authenticated;
grant insert, update on public.fenix_posts to authenticated;
grant select, insert, update on public.fenix_direct_messages to authenticated;
grant select, insert, update on public.profile_settings to authenticated;
grant select, insert on public.fenix_content_reports to authenticated;
grant select, insert, update, delete on public.fenix_user_moderation to authenticated;

commit;