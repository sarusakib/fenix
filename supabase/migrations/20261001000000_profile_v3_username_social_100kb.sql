-- Profile v3: Instagram-style username rules, social links and strict 150KB profile media.
-- Idempotent source-of-truth migration for the live profile system.

begin;

alter table public.profiles
  add column if not exists whatsapp_url text,
  add column if not exists facebook_url text,
  add column if not exists instagram_url text;

alter table public.profiles
  drop constraint if exists profiles_username_check;

alter table public.profiles
  add constraint profiles_username_check
  check (
    username is null
    or (
      username ~ '^[a-z0-9._]{3,30}$'
      and username !~ '^\\.'
      and username !~ '\\.$'
      and username !~ '\\.\\.'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_social_url_check;

alter table public.profiles
  add constraint profiles_social_url_check
  check (
    (whatsapp_url is null or whatsapp_url ~ '^https?://') and
    (facebook_url is null or facebook_url ~ '^https?://') and
    (instagram_url is null or instagram_url ~ '^https?://')
  );

create or replace function public.is_fenix_username_available(
  p_username text,
  p_exclude_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
set search_path = pg_catalog, public
as $function$
  select case
    when lower(trim(coalesce(p_username,''))) !~ '^[a-z0-9._]{3,30}$' then false
    when lower(trim(p_username)) like '.%' then false
    when lower(trim(p_username)) like '%.' then false
    when position('..' in lower(trim(p_username))) > 0 then false
    else not exists (
      select 1
      from public.profiles p
      where lower(p.username) = lower(trim(p_username))
        and p.id is distinct from p_exclude_user_id
    )
  end;
$function$;

update storage.buckets
set file_size_limit = 153600,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[]
where id = 'avatars';

drop view if exists public.fenix_public_profiles;

create view public.fenix_public_profiles
with (security_invoker = true)
as
select
  p.id,
  p.full_name,
  p.username,
  p.bio,
  p.avatar_url,
  p.cover_url,
  p.location_text,
  p.website_url,
  p.whatsapp_url,
  p.facebook_url,
  p.instagram_url,
  p.created_at
from public.profiles p
left join public.profile_settings ps on ps.user_id = p.id
left join public.fenix_user_moderation m on m.user_id = p.id
where coalesce(ps.profile_visibility,'public') = 'public'
  and coalesce(m.status,'active') = 'active';

revoke all on public.fenix_public_profiles from public, authenticated;
grant select on public.fenix_public_profiles to anon, authenticated;

commit;
