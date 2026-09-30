-- Public social profile aggregate stats.
-- Only counts for publicly visible profiles are exposed; raw follow rows remain RLS protected.

create or replace function public.fenix_public_profile_stats(p_profile_id uuid)
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

revoke all on function public.fenix_public_profile_stats(uuid) from public, anon, authenticated;
grant execute on function public.fenix_public_profile_stats(uuid) to anon, authenticated;
