-- Keep aggregate social stats behind a private SECURITY DEFINER helper.
-- Expose only the read-only count view through PostgREST.

create or replace function private.fenix_public_profile_stats_json(p_profile_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  select case
    when exists (select 1 from public.fenix_public_profiles where id = p_profile_id)
    then jsonb_build_object(
      'posts', (select count(*) from public.fenix_posts where author_id = p_profile_id and deleted_at is null and visibility = 'public'),
      'followers', (select count(*) from public.fenix_profile_follows where following_id = p_profile_id),
      'following', (select count(*) from public.fenix_profile_follows where follower_id = p_profile_id)
    )
    else null
  end
$function$;

revoke all on function private.fenix_public_profile_stats_json(uuid) from public, anon, authenticated;

drop view if exists public.fenix_public_profile_stats;

create view public.fenix_public_profile_stats as
select
  p.id,
  coalesce((stats.payload->>'posts')::bigint, 0) as posts,
  coalesce((stats.payload->>'followers')::bigint, 0) as followers,
  coalesce((stats.payload->>'following')::bigint, 0) as following
from public.fenix_public_profiles p
cross join lateral (select private.fenix_public_profile_stats_json(p.id) as payload) stats;

alter view public.fenix_public_profile_stats set (security_invoker = true);

revoke all on public.fenix_public_profile_stats from public, anon, authenticated;
grant select on public.fenix_public_profile_stats to anon, authenticated;

drop function if exists public.fenix_public_profile_stats(uuid);
