-- FeniX profile media: allow manual profile/cover uploads up to 200 KB.
-- The application still optimizes images locally before upload.
begin;

update storage.buckets
set file_size_limit = 204800,
    public = true,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[]
where id = 'avatars';

commit;
