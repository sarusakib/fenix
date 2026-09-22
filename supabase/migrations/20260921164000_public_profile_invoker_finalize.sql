-- Finalize least-privilege public profile and public Pulse reads.
begin;

create or replace view public.fenix_public_profiles as
select
  p.id,
  p.full_name,
  p.username,
  p.bio,
  p.avatar_url,
  p.cover_url,
  p.location_text,
  p.website_url,
  p.created_at,
  case
    when p.location_public_level = 'locality' then coalesce(locality.name_bn, upazila.name_bn, district.name_bn, p.location_text)
    when p.location_public_level = 'upazila' then coalesce(upazila.name_bn, district.name_bn, p.location_text)
    else coalesce(district.name_bn, p.location_text)
  end as public_location,
  c.public_facebook_url as facebook_url,
  c.public_instagram_url as instagram_url,
  c.public_linkedin_url as linkedin_url,
  c.public_youtube_url as youtube_url,
  c.public_whatsapp as whatsapp,
  null::text as phone
from public.profiles p
left join public.fenix_brain_locations district on district.id = p.district_id
left join public.fenix_brain_locations upazila on upazila.id = p.upazila_id
left join public.fenix_brain_locations locality on locality.id = p.locality_id
left join public.profile_contacts c on c.user_id = p.id
where p.is_public = true
  and private.is_fenix_user_active(p.id);

alter view public.fenix_public_profiles set (security_invoker = true);
revoke all on public.fenix_public_profiles from public, authenticated;
grant select on public.fenix_public_profiles to anon, authenticated;

commit;
