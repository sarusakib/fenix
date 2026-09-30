create or replace view public.fenix_public_profiles_v2 as
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

revoke all on public.fenix_public_profiles_v2 from public, authenticated;
grant select on public.fenix_public_profiles_v2 to anon, authenticated;