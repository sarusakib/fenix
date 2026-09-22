-- FeniX privacy hardening: public blood donor view must not expose the internal auth UUID.
begin;

drop view if exists public.fenix_public_blood_donors;

create view public.fenix_public_blood_donors as
select
  p.username,
  p.full_name,
  p.avatar_url,
  d.blood_group,
  d.area_text,
  l.name_bn as upazila_bn,
  l.name_en as upazila_en,
  d.availability,
  d.last_donation_date,
  d.preferred_contact
from public.fenix_blood_donors d
join public.profiles p on p.id = d.user_id
left join public.fenix_brain_locations l on l.id = d.upazila_id
left join public.profile_settings ps on ps.user_id = d.user_id
left join public.fenix_user_moderation m on m.user_id = d.user_id
where d.is_public = true
  and d.availability = 'available'
  and coalesce(ps.profile_visibility, 'public') = 'public'
  and coalesce(m.status, 'active') = 'active';

revoke all on public.fenix_public_blood_donors from public, authenticated;
grant select on public.fenix_public_blood_donors to anon, authenticated;

commit;
