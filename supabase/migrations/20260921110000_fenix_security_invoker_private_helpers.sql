begin;

create schema if not exists private;

alter table public.profiles
  add column if not exists is_public boolean not null default true,
  add column if not exists feed_public boolean not null default true;

update public.profiles p
set
  is_public = coalesce((select ps.profile_visibility='public' from public.profile_settings ps where ps.user_id=p.id), true),
  feed_public = coalesce((select ps.feed_visibility='public' from public.profile_settings ps where ps.user_id=p.id), true);

create or replace function private.is_fenix_user_active(p_user_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public as $$
  select not exists (
    select 1 from public.fenix_user_moderation m
    where m.user_id=p_user_id
      and (m.status='banned' or (m.status='suspended' and (m.banned_until is null or m.banned_until>now())))
  )
$$;

create or replace function private.fenix_can_receive_message(p_user_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public as $$
  select coalesce((select ps.message_permissions <> 'nobody' from public.profile_settings ps where ps.user_id=p_user_id), true)
    and private.is_fenix_user_active(p_user_id)
$$;

revoke all on function private.is_fenix_user_active(uuid) from public;
revoke all on function private.fenix_can_receive_message(uuid) from public;
grant execute on function private.is_fenix_user_active(uuid) to anon, authenticated;
grant execute on function private.fenix_can_receive_message(uuid) to authenticated;

create or replace function private.sync_fenix_profile_settings()
returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  update public.profiles
  set is_public=new.profile_visibility='public', feed_public=new.feed_visibility='public'
  where id=new.user_id;
  return new;
end;
$$;

revoke all on function private.sync_fenix_profile_settings() from public,anon,authenticated;
drop trigger if exists profile_settings_sync_public_flags on public.profile_settings;
create trigger profile_settings_sync_public_flags
after insert or update of profile_visibility,feed_visibility on public.profile_settings
for each row execute function private.sync_fenix_profile_settings();

drop policy if exists profiles_public_select on public.profiles;
create policy profiles_public_select on public.profiles
for select to anon,authenticated
using (is_public and private.is_fenix_user_active(id));

revoke select on public.profiles from anon;
grant select (id,full_name,username,bio,avatar_url,cover_url,location_text,website_url,created_at) on public.profiles to anon;

alter view public.fenix_public_profiles set (security_invoker=true);
alter view public.fenix_public_feed set (security_invoker=true);

create or replace view public.fenix_public_profiles as
select p.id,p.full_name,p.username,p.bio,p.avatar_url,p.cover_url,p.location_text,p.website_url,p.created_at
from public.profiles p
where p.is_public and private.is_fenix_user_active(p.id);

create or replace view public.fenix_public_feed as
select f.id,f.body,f.created_at,f.updated_at,p.id as author_id,p.full_name as author_name,p.username as author_username,p.avatar_url as author_avatar_url
from public.fenix_posts f
join public.profiles p on p.id=f.author_id
where f.deleted_at is null and f.visibility='public' and p.feed_public and private.is_fenix_user_active(p.id);

revoke all on public.fenix_public_profiles from public,authenticated;
grant select on public.fenix_public_profiles to anon,authenticated;
revoke all on public.fenix_public_feed from public,authenticated;
grant select on public.fenix_public_feed to anon,authenticated;

drop policy if exists fenix_posts_public_select on public.fenix_posts;
create policy fenix_posts_public_select on public.fenix_posts
for select to anon,authenticated
using (deleted_at is null and visibility='public' and private.is_fenix_user_active(author_id));

drop policy if exists fenix_posts_own_insert on public.fenix_posts;
create policy fenix_posts_own_insert on public.fenix_posts
for insert to authenticated
with check ((select auth.uid())=author_id and private.is_fenix_user_active((select auth.uid())));

drop policy if exists fenix_reports_own_insert on public.fenix_content_reports;
create policy fenix_reports_own_insert on public.fenix_content_reports
for insert to authenticated
with check ((select auth.uid())=reporter_id and private.is_fenix_user_active((select auth.uid())));

drop policy if exists fenix_dm_participant_insert on public.fenix_direct_messages;
create policy fenix_dm_participant_insert on public.fenix_direct_messages
for insert to authenticated
with check ((select auth.uid())=sender_id and private.is_fenix_user_active((select auth.uid())) and private.fenix_can_receive_message(recipient_id));

drop function if exists public.is_fenix_user_active(uuid);
revoke all on public.profile_settings from anon;

commit;