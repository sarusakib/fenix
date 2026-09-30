begin;

-- Raise the final stored-image ceiling to 400 KB without touching existing objects.
update storage.buckets
set file_size_limit = 409600
where id in ('avatars','product-images','fenix-post-media');

-- Keep source/optimized metadata for quality diagnostics and duplicate detection.
alter table public.fenix_post_media
  add column if not exists source_byte_size integer,
  add column if not exists source_digest text,
  add column if not exists optimization_version text not null default 'fenix-image-v2';

alter table public.product_images
  add column if not exists byte_size integer,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists source_byte_size integer,
  add column if not exists source_digest text,
  add column if not exists optimization_version text not null default 'fenix-image-v2';

alter table public.fenix_post_media
  drop constraint if exists fenix_post_media_byte_size_check;

alter table public.fenix_post_media
  add constraint fenix_post_media_byte_size_check
  check (byte_size > 0 and byte_size <= 409600);

alter table public.product_images
  add constraint product_images_byte_size_check
  check (byte_size is null or (byte_size > 0 and byte_size <= 409600));

alter table public.product_images
  add constraint product_images_source_byte_size_check
  check (source_byte_size is null or source_byte_size > 0);

alter table public.fenix_post_media
  add constraint fenix_post_media_source_byte_size_check
  check (source_byte_size is null or source_byte_size > 0);

alter table public.product_images
  add constraint product_images_source_digest_check
  check (source_digest is null or source_digest ~ '^[0-9a-f]{64}$');

alter table public.fenix_post_media
  add constraint fenix_post_media_source_digest_check
  check (source_digest is null or source_digest ~ '^[0-9a-f]{64}$');

create index if not exists fenix_post_media_author_digest_idx
  on public.fenix_post_media(author_id, source_digest)
  where source_digest is not null;

create index if not exists product_images_product_digest_idx
  on public.product_images(product_id, source_digest)
  where source_digest is not null;

commit;
