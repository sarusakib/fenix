begin;

drop policy if exists "fenix_post_media_own_insert" on public.fenix_post_media;

create policy "fenix_post_media_own_insert"
on public.fenix_post_media
for insert to authenticated
with check (
  author_id = (select auth.uid())
  and exists (
    select 1 from public.fenix_posts f
    where f.id = fenix_post_media.post_id
      and f.author_id = (select auth.uid())
  )
  and storage_bucket = 'fenix-post-media'
  and mime_type = any (array['image/jpeg','image/webp'])
  and byte_size > 0
  and byte_size <= 409600
);

commit;
