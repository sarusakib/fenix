begin;

-- Product images accept larger source files client-side, then the browser optimizer
-- reduces them before upload. Storage keeps the same <=200KB final invariant.
update storage.buckets
set file_size_limit = 204800,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[]
where id = 'product-images';

commit;
