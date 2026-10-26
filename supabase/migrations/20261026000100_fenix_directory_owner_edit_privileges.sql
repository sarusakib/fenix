-- Keep FeniX business-directory trust decisions reviewer-controlled.
-- Row-level ownership policies remain in place; these grants also limit which
-- columns an authenticated owner can insert or update through the public Data API.

begin;

-- A listing owner may edit public copy and the slug, but must not be able to
-- self-assign verification badges, publication state, or approved ownership.
drop policy if exists "Owners can manage directory profiles" on public.business_directory_profiles;
drop policy if exists "Directory profiles owner delete" on public.business_directory_profiles;

revoke insert, update, delete on table public.business_directory_profiles from authenticated;
revoke insert (
  business_id, slug, tagline_bn, tagline_en, about_bn, about_en, business_type,
  listing_status, owner_claimed, verification_level, phone_verified,
  location_verified, last_verified_at, created_at, updated_at
) on table public.business_directory_profiles from authenticated;
revoke update (
  business_id, slug, tagline_bn, tagline_en, about_bn, about_en, business_type,
  listing_status, owner_claimed, verification_level, phone_verified,
  location_verified, last_verified_at, created_at, updated_at
) on table public.business_directory_profiles from authenticated;

grant insert (
  business_id, slug, tagline_bn, tagline_en, about_bn, about_en, business_type
) on table public.business_directory_profiles to authenticated;
grant update (
  slug, tagline_bn, tagline_en, about_bn, about_en, business_type
) on table public.business_directory_profiles to authenticated;

-- Owners can edit location details and choose whether to publish them.
-- location_source, timestamps, and the verification badges are not owner inputs.
revoke insert, update on table public.business_directory_locations from authenticated;
revoke insert (
  business_id, district, upazila, area, market, address, postal_code,
  latitude, longitude, map_label, location_source, is_public, created_at, updated_at
) on table public.business_directory_locations from authenticated;
revoke update (
  business_id, district, upazila, area, market, address, postal_code,
  latitude, longitude, map_label, location_source, is_public, created_at, updated_at
) on table public.business_directory_locations from authenticated;

grant insert (
  business_id, district, upazila, area, market, address, postal_code,
  latitude, longitude, map_label, is_public
) on table public.business_directory_locations to authenticated;
grant update (
  district, upazila, area, market, address, postal_code,
  latitude, longitude, map_label, is_public
) on table public.business_directory_locations to authenticated;

-- Contact privacy flags remain owner-controlled, while the existing trigger and
-- CHECK constraints ensure a private field is cleared from the public record.
revoke insert, update on table public.business_directory_contacts from authenticated;
revoke insert (
  business_id, phone, whatsapp, website_url, facebook_url,
  is_phone_public, is_whatsapp_public, is_website_public, created_at, updated_at
) on table public.business_directory_contacts from authenticated;
revoke update (
  business_id, phone, whatsapp, website_url, facebook_url,
  is_phone_public, is_whatsapp_public, is_website_public, created_at, updated_at
) on table public.business_directory_contacts from authenticated;

grant insert (
  business_id, phone, whatsapp, website_url, facebook_url,
  is_phone_public, is_whatsapp_public, is_website_public
) on table public.business_directory_contacts to authenticated;
grant update (
  phone, whatsapp, website_url, facebook_url,
  is_phone_public, is_whatsapp_public, is_website_public
) on table public.business_directory_contacts to authenticated;

-- Aliases can be added and removed by the owner, but are not transferable through
-- an UPDATE statement. RLS continues to restrict INSERT/DELETE to owned businesses.
revoke update on table public.business_directory_aliases from authenticated;
revoke update (id, business_id, alias, language_code, created_at)
  on table public.business_directory_aliases from authenticated;

commit;
