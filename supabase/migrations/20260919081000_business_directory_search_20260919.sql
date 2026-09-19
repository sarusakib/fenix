update public.business_directory_contacts
set phone = case when is_phone_public then phone else null end,
    whatsapp = case when is_whatsapp_public then whatsapp else null end,
    website_url = case when is_website_public then website_url else null end,
    facebook_url = case when is_website_public then facebook_url else null end;

alter table public.business_directory_contacts
  add constraint business_directory_contacts_phone_public_check
  check (is_phone_public or phone is null);
alter table public.business_directory_contacts
  add constraint business_directory_contacts_whatsapp_public_check
  check (is_whatsapp_public or whatsapp is null);
alter table public.business_directory_contacts
  add constraint business_directory_contacts_website_public_check
  check (is_website_public or (website_url is null and facebook_url is null));

create or replace function public.business_directory_contacts_public_safety()
returns trigger language plpgsql security invoker
set search_path = public, pg_temp
as $$
begin
  if not new.is_phone_public then new.phone := null; end if;
  if not new.is_whatsapp_public then new.whatsapp := null; end if;
  if not new.is_website_public then
    new.website_url := null;
    new.facebook_url := null;
  end if;
  return new;
end;
$$;
drop trigger if exists business_directory_contacts_public_safety on public.business_directory_contacts;
create trigger business_directory_contacts_public_safety before insert or update on public.business_directory_contacts
for each row execute function public.business_directory_contacts_public_safety();
revoke all on function public.business_directory_contacts_public_safety() from public, anon, authenticated;

create or replace function public.list_directory_categories()
returns table (category text, business_count bigint)
language sql security invoker set search_path = public, pg_temp
as $$
  select nullif(trim(b.category), ''), count(*)::bigint
  from public.businesses b
  left join public.business_directory_profiles dp on dp.business_id = b.id
  where nullif(trim(b.category), '') is not null
    and coalesce(dp.listing_status, 'published') = 'published'
  group by nullif(trim(b.category), '')
  order by count(*) desc, category asc
  limit 60;
$$;

create or replace function public.list_directory_upazilas()
returns table (upazila text, business_count bigint)
language sql security invoker set search_path = public, pg_temp
as $$
  select nullif(trim(dl.upazila), ''), count(*)::bigint
  from public.business_directory_locations dl
  join public.business_directory_profiles dp on dp.business_id = dl.business_id
  where dl.is_public = true and dp.listing_status = 'published'
    and nullif(trim(dl.upazila), '') is not null
  group by nullif(trim(dl.upazila), '')
  order by upazila asc
  limit 30;
$$;

grant execute on function public.list_directory_categories() to anon, authenticated;
grant execute on function public.list_directory_upazilas() to anon, authenticated;
