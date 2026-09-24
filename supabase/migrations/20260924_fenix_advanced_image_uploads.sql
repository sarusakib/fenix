begin;

-- Enforce the new ceiling for profile avatar/cover uploads without changing existing readable objects.
update storage.buckets
set file_size_limit = 204800,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[]
where id = 'avatars';

-- Public feed media: public read by URL, user-owned writes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fenix-post-media', 'fenix-post-media', true, 204800, array['image/jpeg','image/webp']::text[])
on conflict (id) do update
set public = true,
    file_size_limit = 204800,
    allowed_mime_types = array['image/jpeg','image/webp']::text[];

drop policy if exists fenix_post_media_insert on storage.objects;
create policy fenix_post_media_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'fenix-post-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (metadata ->> 'mimetype') in ('image/jpeg','image/webp')
);

drop policy if exists fenix_post_media_delete on storage.objects;
create policy fenix_post_media_delete
on storage.objects for delete to authenticated
using (bucket_id = 'fenix-post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create table if not exists public.fenix_post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.fenix_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  storage_bucket text not null default 'fenix-post-media' check (storage_bucket = 'fenix-post-media'),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg','image/webp')),
  byte_size integer not null check (byte_size > 0 and byte_size <= 204800),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sort_order smallint not null default 0 check (sort_order between 0 and 3),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists fenix_post_media_post_idx on public.fenix_post_media(post_id, sort_order, created_at);
create index if not exists fenix_post_media_author_idx on public.fenix_post_media(author_id, created_at desc);

alter table public.fenix_post_media enable row level security;

drop policy if exists fenix_post_media_public_select on public.fenix_post_media;
create policy fenix_post_media_public_select on public.fenix_post_media
for select to anon, authenticated
using (
  author_id = (select auth.uid())
  or exists (
    select 1 from public.fenix_posts f
    where f.id = fenix_post_media.post_id
      and f.deleted_at is null
      and f.visibility = 'public'
      and private.is_fenix_user_active(f.author_id)
  )
);

drop policy if exists fenix_post_media_own_insert on public.fenix_post_media;
create policy fenix_post_media_own_insert on public.fenix_post_media
for insert to authenticated
with check (
  author_id = (select auth.uid())
  and exists (select 1 from public.fenix_posts f where f.id = fenix_post_media.post_id and f.author_id = (select auth.uid()))
  and storage_bucket = 'fenix-post-media'
  and mime_type in ('image/jpeg','image/webp')
  and byte_size <= 204800
);

drop policy if exists fenix_post_media_own_delete on public.fenix_post_media;
create policy fenix_post_media_own_delete on public.fenix_post_media
for delete to authenticated using (author_id = (select auth.uid()));

revoke all on public.fenix_post_media from public, anon;
grant select on public.fenix_post_media to anon, authenticated;
grant insert, delete on public.fenix_post_media to authenticated;

-- Text is still capped at 5,000 chars, but a post may now be image-only.
alter table public.fenix_posts drop constraint if exists fenix_posts_body_check;
alter table public.fenix_posts add constraint fenix_posts_body_check check (length(trim(body)) between 0 and 5000);

commit;