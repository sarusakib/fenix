-- Hide exact profile location data from public profile surfaces.
-- Public profile location is derived only from approved hierarchy levels.

create or replace view public.fenix_public_profiles as
select
  p.id,
  p.full_name,
  p.username,
  p.bio,
  p.avatar_url,
  p.cover_url,
  case p.location_public_level
    when 'locality' then coalesce(
      nullif(concat_ws(' · ',
        concat_ws(' / ', d.name_bn, d.name_en),
        concat_ws(' / ', u.name_bn, u.name_en),
        concat_ws(' / ', l.name_bn, l.name_en)
      ), ''),
      nullif(concat_ws(' · ', concat_ws(' / ', d.name_bn, d.name_en), concat_ws(' / ', u.name_bn, u.name_en)), ''),
      coalesce(concat_ws(' / ', d.name_bn, d.name_en), 'ফেনী / Feni')
    )
    when 'upazila' then coalesce(
      nullif(concat_ws(' · ', concat_ws(' / ', d.name_bn, d.name_en), concat_ws(' / ', u.name_bn, u.name_en)), ''),
      coalesce(concat_ws(' / ', d.name_bn, d.name_en), 'ফেনী / Feni')
    )
    else coalesce(concat_ws(' / ', d.name_bn, d.name_en), 'ফেনী / Feni')
  end as location_text,
  p.website_url,
  p.whatsapp_url,
  p.facebook_url,
  p.instagram_url,
  p.created_at
from public.profiles p
left join public.profile_settings ps on ps.user_id = p.id
left join public.fenix_user_moderation m on m.user_id = p.id
left join public.fenix_brain_locations d on d.id = p.district_id and d.level = 'district' and d.is_active
left join public.fenix_brain_locations u on u.id = p.upazila_id and u.level = 'upazila' and u.is_active
left join public.fenix_brain_locations l on l.id = p.locality_id and l.level in ('union','ward','municipality') and l.is_active
where coalesce(ps.profile_visibility, 'public') = 'public'
  and coalesce(m.status, 'active') = 'active';
