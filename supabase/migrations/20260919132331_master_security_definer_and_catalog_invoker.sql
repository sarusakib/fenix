begin;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

alter function public.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) set schema private;
alter function public.create_commerce_return_request(uuid,text,text) set schema private;
alter function public.create_product_review(uuid,integer,text,text) set schema private;
alter function public.seller_reply_to_product_review(uuid,text) set schema private;
alter function public.set_commerce_return_status(uuid,text,text,numeric) set schema private;
alter function public.set_product_primary_image(uuid) set schema private;
alter function public.set_vendor_order_status(uuid,text) set schema private;
alter function public.update_vendor_product(uuid,text,text,text,text,text,text,numeric,numeric,uuid,boolean) set schema private;
alter function public.update_vendor_profile(text,text,text,text,text,text,text) set schema private;

revoke all on function private.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) from public;
revoke all on function private.create_commerce_return_request(uuid,text,text) from public;
revoke all on function private.create_product_review(uuid,integer,text,text) from public;
revoke all on function private.seller_reply_to_product_review(uuid,text) from public;
revoke all on function private.set_commerce_return_status(uuid,text,text,numeric) from public;
revoke all on function private.set_product_primary_image(uuid) from public;
revoke all on function private.set_vendor_order_status(uuid,text) from public;
revoke all on function private.update_vendor_product(uuid,text,text,text,text,text,text,numeric,numeric,uuid,boolean) from public;
revoke all on function private.update_vendor_profile(text,text,text,text,text,text,text) from public;

grant execute on function private.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) to anon, authenticated, service_role;
grant execute on function private.create_commerce_return_request(uuid,text,text) to authenticated, service_role;
grant execute on function private.create_product_review(uuid,integer,text,text) to authenticated, service_role;
grant execute on function private.seller_reply_to_product_review(uuid,text) to authenticated, service_role;
grant execute on function private.set_commerce_return_status(uuid,text,text,numeric) to authenticated, service_role;
grant execute on function private.set_product_primary_image(uuid) to authenticated, service_role;
grant execute on function private.set_vendor_order_status(uuid,text) to authenticated, service_role;
grant execute on function private.update_vendor_product(uuid,text,text,text,text,text,text,numeric,numeric,uuid,boolean) to authenticated, service_role;
grant execute on function private.update_vendor_profile(text,text,text,text,text,text,text) to authenticated, service_role;

create or replace function public.create_commerce_order(
  p_items jsonb,
  p_customer_id uuid default null,
  p_guest_name text default null,
  p_guest_phone text default null,
  p_guest_email text default null,
  p_shipping_name text default null,
  p_shipping_phone text default null,
  p_shipping_address text default null,
  p_shipping_area text default null,
  p_shipping_upazila text default null,
  p_shipping_district text default null,
  p_customer_note text default null
)
returns table(order_id uuid, order_number text, total_amount numeric)
language sql volatile security invoker
set search_path to pg_catalog, public
as $function$
  select * from private.create_commerce_order(
    p_items, p_customer_id, p_guest_name, p_guest_phone, p_guest_email,
    p_shipping_name, p_shipping_phone, p_shipping_address, p_shipping_area,
    p_shipping_upazila, p_shipping_district, p_customer_note
  );
$function$;

create or replace function public.create_commerce_return_request(
  p_order_item_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language sql volatile security invoker
set search_path to pg_catalog, public
as $function$
  select private.create_commerce_return_request(p_order_item_id, p_reason, p_details);
$function$;

create or replace function public.create_product_review(
  p_product_id uuid,
  p_rating integer,
  p_title text default null,
  p_body text default null
)
returns uuid
language sql volatile security invoker
set search_path to pg_catalog, public
as $function$
  select private.create_product_review(p_product_id, p_rating, p_title, p_body);
$function$;

create or replace function public.seller_reply_to_product_review(
  p_review_id uuid,
  p_response text
)
returns boolean
language sql volatile security invoker
set search_path to pg_catalog, public
as $function$
  select private.seller_reply_to_product_review(p_review_id, p_response);
$function$;

create or replace function public.set_commerce_return_status(
  p_request_id uuid,
  p_status text,
  p_resolution_note text default null,
  p_refund_amount numeric default null
)
returns boolean
language sql volatile security invoker
set search_path to pg_catalog, public
as $function$
  select private.set_commerce_return_status(
    p_request_id, p_status, p_resolution_note, p_refund_amount
  );
$function$;

create or replace function public.set_product_primary_image(p_image_id uuid)
returns boolean
language sql volatile security invoker
set search_path to pg_catalog, public
as $function$
  select private.set_product_primary_image(p_image_id);
$function$;

create or replace function public.set_vendor_order_status(
  p_order_id uuid,
  p_status text
)
returns boolean
language sql volatile security invoker
set search_path to pg_catalog, public
as $function$
  select private.set_vendor_order_status(p_order_id, p_status);
$function$;

create or replace function public.update_vendor_product(
  p_product_id uuid,
  p_name_bn text,
  p_name_en text,
  p_slug text,
  p_description_bn text default null,
  p_description_en text default null,
  p_sku text default null,
  p_price numeric default 0,
  p_compare_at_price numeric default null,
  p_category_id uuid default null,
  p_allow_guest_purchase boolean default true
)
returns boolean
language sql volatile security invoker
set search_path to pg_catalog, public
as $function$
  select private.update_vendor_product(
    p_product_id, p_name_bn, p_name_en, p_slug,
    p_description_bn, p_description_en, p_sku, p_price,
    p_compare_at_price, p_category_id, p_allow_guest_purchase
  );
$function$;

create or replace function public.update_vendor_profile(
  p_display_name text,
  p_display_name_bn text default null,
  p_display_name_en text default null,
  p_description_bn text default null,
  p_description_en text default null,
  p_phone text default null,
  p_shop_slug text default null
)
returns boolean
language sql volatile security invoker
set search_path to pg_catalog, public
as $function$
  select private.update_vendor_profile(
    p_display_name, p_display_name_bn, p_display_name_en,
    p_description_bn, p_description_en, p_phone, p_shop_slug
  );
$function$;

create or replace function public.is_fenix_admin()
returns boolean
language sql stable security invoker
set search_path to pg_catalog, public
as $function$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role::text = 'admin'
  );
$function$;

create or replace function public.get_public_vendor_shop(p_slug text)
returns table(
  id uuid, shop_slug text, display_name text, display_name_bn text,
  display_name_en text, description_bn text, description_en text,
  is_verified boolean, business_id uuid
)
language sql stable security invoker
set search_path to pg_catalog, public
as $function$
  select v.id, v.shop_slug, v.display_name, v.display_name_bn,
         v.display_name_en, v.description_bn, v.description_en,
         v.is_verified, v.business_id
  from public.vendor_profiles v
  where v.shop_slug = lower(trim(p_slug))
    and v.status = 'approved'
  limit 1;
$function$;

grant select(
  id, shop_slug, display_name, display_name_bn, display_name_en,
  description_bn, description_en, is_verified, business_id, status
) on table public.vendor_profiles to anon, authenticated;

drop policy if exists "Public can view approved vendor public profile" on public.vendor_profiles;
create policy "Public can view approved vendor public profile"
on public.vendor_profiles
for select
to anon, authenticated
using (status = 'approved');

alter view public.commerce_public_products set (security_invoker = true);

commit;