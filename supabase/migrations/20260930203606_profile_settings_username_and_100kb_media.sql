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
      username ~ '^[a-z][a-z0-9._]{2,31}$'
      and username !~ '[._]{2}'
    )
  );

create or replace function private.fenix_username_available(p_username text, p_exclude_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    (select auth.uid()) is not null
    and (select auth.uid()) = p_exclude_user_id
    and lower(trim(coalesce(p_username, ''))) ~ '^[a-z][a-z0-9._]{2,31}$'
    and lower(trim(coalesce(p_username, ''))) !~ '[._]{2}'
    and lower(trim(coalesce(p_username, ''))) not in (
      'admin','administrator','api','app','auth','blog','business','businesses',
      'contact','directory','feed','fenix','help','home','invest','jobs','login',
      'messages','news','network','profile','search','settings','signup','start',
      'support','user','users','verify'
    )
    and not exists (
      select 1
      from public.profiles p
      where lower(p.username) = lower(trim(p_username))
        and p.id is distinct from p_exclude_user_id
    );
$$;

revoke all on function private.fenix_username_available(text, uuid) from public, anon, authenticated;

create or replace function public.is_fenix_username_available(
  p_username text,
  p_exclude_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public, private
as $$
  select private.fenix_username_available(p_username, p_exclude_user_id);
$$;

revoke all on function public.is_fenix_username_available(text, uuid) from public, anon;
grant execute on function public.is_fenix_username_available(text, uuid) to authenticated;

update storage.buckets
set file_size_limit = 102400,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[]
where id = 'avatars';

commit;