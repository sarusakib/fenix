begin;

alter table public.fenix_blood_donors
  add column if not exists gender text,
  add column if not exists emergency_available boolean not null default false;

alter table public.fenix_blood_donors
  drop constraint if exists fenix_blood_donors_gender_check;

alter table public.fenix_blood_donors
  add constraint fenix_blood_donors_gender_check
  check (gender is null or gender in ('male','female','other','prefer_not_to_say'));

create or replace function private.enforce_fenix_blood_donor_verification()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  profile_row public.profiles%rowtype;
begin
  select * into profile_row from public.profiles where id = new.user_id;

  -- Automatic verification is derived from a complete donor form.
  -- Never trust a client-provided is_public=true flag by itself.
  new.is_public :=
    coalesce(length(trim(profile_row.full_name)) >= 2, false)
    and coalesce(length(trim(profile_row.phone)) >= 7, false)
    and profile_row.date_of_birth is not null
    and new.gender is not null
    and new.blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')
    and new.upazila_id is not null
    and length(trim(coalesce(new.area_text,''))) >= 2;

  return new;
end;
$$;

revoke all on function private.enforce_fenix_blood_donor_verification() from public, anon, authenticated;

drop trigger if exists fenix_blood_donor_auto_verify on public.fenix_blood_donors;
create trigger fenix_blood_donor_auto_verify
before insert or update on public.fenix_blood_donors
for each row
execute function private.enforce_fenix_blood_donor_verification();

create or replace view public.fenix_public_blood_donors as
select
  p.username,p.full_name,p.avatar_url,d.blood_group,d.area_text,
  l.name_bn as upazila_bn,l.name_en as upazila_en,d.availability,d.last_donation_date,d.preferred_contact,
  d.user_id,d.gender,d.emergency_available,
  null::text as public_phone,
  null::text as public_whatsapp
from public.fenix_blood_donors d
join public.profiles p on p.id=d.user_id
left join public.fenix_brain_locations l on l.id=d.upazila_id
where d.is_public=true
  and d.availability='available'
  and p.is_public=true
  and private.is_fenix_user_active(p.id);

alter view public.fenix_public_blood_donors set (security_invoker=true);

grant select (id, username, full_name, avatar_url) on public.profiles to anon;

drop policy if exists profiles_public_identity_select_anon on public.profiles;
create policy profiles_public_identity_select_anon
on public.profiles
for select
to anon
using (is_public = true);

revoke select on public.fenix_blood_donors from anon;
grant select (
  user_id,
  blood_group,
  upazila_id,
  area_text,
  availability,
  last_donation_date,
  preferred_contact,
  is_public,
  gender,
  emergency_available
) on public.fenix_blood_donors to anon;

revoke all on public.fenix_public_blood_donors from public,authenticated;
grant select on public.fenix_public_blood_donors to anon,authenticated;

commit;
