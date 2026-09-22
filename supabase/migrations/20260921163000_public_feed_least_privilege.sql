-- Public feed access should rely on the public-safe profiles RLS policy.
begin;

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
join public.profiles p on p.id = f.author_id
where f.deleted_at is null
  and f.visibility = 'public'
  and p.feed_public
  and p.is_public;

alter view public.fenix_public_feed set (security_invoker = true);
revoke all on public.fenix_public_feed from public, authenticated;
grant select on public.fenix_public_feed to anon, authenticated;

commit;
