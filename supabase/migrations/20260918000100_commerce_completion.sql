-- ============================================================
-- FeniX Commerce Completion v1
-- Migration: 20260918000100
--
-- Free-first completion layer:
--   - secure product image storage + metadata
--   - seller profile/settings + public storefront slug
--   - public commerce product view
--   - seller-scoped order status workflow
--   - delivery rules + authoritative fee calculation
--   - customer reviews + seller replies + admin moderation
--   - item-level return/refund records
--   - admin vendor/delivery/review/return controls
--
-- No paid gateway or service is introduced.
-- Existing Commerce data is preserved.
-- ============================================================

begin;

-- ============================================================
-- 1. ADMIN HELPER
-- ============================================================

create or replace function public.is_fenix_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role::text = 'admin'
  );
$function$;

revoke all on function public.is_fenix_admin() from public, anon;
grant execute on function public.is_fenix_admin() to authenticated;

-- ============================================================
-- 2. SELLER SHOP SLUG
-- ============================================================

alter table public.vendor_profiles
  add column if not exists shop_slug text;

update public.vendor_profiles
set shop_slug =
  left(
    coalesce(
      nullif(
        trim(
          both '-' from
          regexp_replace(
            lower(coalesce(display_name, '')),
            '[^a-z0-9]+',
            '-',
            'g'
          )
        ),
        ''
      ),
      'shop'
    )
    || '-' || substr(id::text, 1, 8),
    80
  )
where shop_slug is null or nullif(trim(shop_slug), '') is null;

create unique index if not exists vendor_profiles_shop_slug_unique_idx
on public.vendor_profiles(shop_slug)
where shop_slug is not null;

alter table public.vendor_profiles
  drop constraint if exists vendor_profiles_shop_slug_check;

alter table public.vendor_profiles
  add constraint vendor_profiles_shop_slug_check
  check (
    shop_slug is null
    or (
      length(trim(shop_slug)) between 3 and 80
      and shop_slug = lower(shop_slug)
      and shop_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    )
  );

-- Seller may read own profile as before; safe public data is exposed via
-- the dedicated RPC/view below instead of opening phone/status columns.
drop policy if exists "Vendors can update own vendor profile"
on public.vendor_profiles;

-- Sensitive columns must not be writable directly by browser clients.
-- Profile updates go through update_vendor_profile().

-- ============================================================
-- 3. SECURE SELLER PROFILE UPDATE
-- ============================================================

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
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_vendor_id uuid;
  v_slug text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if nullif(trim(coalesce(p_display_name, '')), '') is null then
    raise exception 'Display name is required';
  end if;

  if length(trim(p_display_name)) > 200 then
    raise exception 'Display name is too long';
  end if;

  v_slug := lower(trim(coalesce(p_shop_slug, '')));

  if length(v_slug) < 3
     or length(v_slug) > 80
     or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Invalid shop slug';
  end if;

  select id
  into v_vendor_id
  from public.vendor_profiles
  where user_id = auth.uid();

  if v_vendor_id is null then
    raise exception 'Seller profile not found';
  end if;

  update public.vendor_profiles
  set
    display_name = trim(p_display_name),
    display_name_bn = nullif(trim(coalesce(p_display_name_bn, '')), ''),
    display_name_en = nullif(trim(coalesce(p_display_name_en, '')), ''),
    description_bn = left(nullif(trim(coalesce(p_description_bn, '')), ''), 4000),
    description_en = left(nullif(trim(coalesce(p_description_en, '')), ''), 4000),
    phone = left(nullif(trim(coalesce(p_phone, '')), ''), 40),
    shop_slug = v_slug,
    updated_at = timezone('utc', now())
  where id = v_vendor_id;

  return true;
end;
$function$;

revoke all on function public.update_vendor_profile(text,text,text,text,text,text,text)
from public, anon;
grant execute on function public.update_vendor_profile(text,text,text,text,text,text,text)
to authenticated;

-- ============================================================
-- 4. SECURE SELLER PRODUCT EDIT
-- ============================================================

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
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_owner boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select exists (
    select 1
    from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where p.id = p_product_id
      and v.user_id = auth.uid()
      and v.status = 'approved'
  ) into v_owner;

  if not v_owner then
    raise exception 'Product access denied';
  end if;

  if nullif(trim(coalesce(p_name_bn, '')), '') is null
     or nullif(trim(coalesce(p_name_en, '')), '') is null then
    raise exception 'Both product names are required';
  end if;

  if p_price is null or p_price < 0 then
    raise exception 'Invalid price';
  end if;

  if p_compare_at_price is not null
     and p_compare_at_price < p_price then
    raise exception 'Invalid compare-at price';
  end if;

  if lower(trim(coalesce(p_slug, ''))) !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Invalid product slug';
  end if;

  update public.products
  set
    name_bn = left(trim(p_name_bn), 200),
    name_en = left(trim(p_name_en), 200),
    slug = lower(left(trim(p_slug), 160)),
    description_bn = left(nullif(trim(coalesce(p_description_bn, '')), ''), 4000),
    description_en = left(nullif(trim(coalesce(p_description_en, '')), ''), 4000),
    sku = left(nullif(trim(coalesce(p_sku, '')), ''), 100),
    price = round(p_price, 2),
    compare_at_price = case
      when p_compare_at_price is null then null
      else round(p_compare_at_price, 2)
    end,
    category_id = p_category_id,
    allow_guest_purchase = coalesce(p_allow_guest_purchase, true),
    updated_at = timezone('utc', now())
  where id = p_product_id;

  return true;
end;
$function$;

revoke all on function public.update_vendor_product(uuid,text,text,text,text,text,text,numeric,numeric,uuid,boolean)
from public, anon;
grant execute on function public.update_vendor_product(uuid,text,text,text,text,text,text,numeric,numeric,uuid,boolean)
to authenticated;

-- ============================================================
-- 5. PRODUCT IMAGE STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[];

-- Storage object names must follow:
--   <vendor_uuid>/<product_uuid>/<random-file>.<ext>
-- This binds every upload/update/delete to the approved seller/product.

drop policy if exists "Approved vendors can upload product images"
on storage.objects;

create policy "Approved vendors can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] is not null
  and (storage.foldername(name))[2] is not null
  and (metadata ->> 'mimetype') in ('image/jpeg', 'image/png', 'image/webp')
  and exists (
    select 1
    from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where v.id::text = (storage.foldername(name))[1]
      and p.id::text = (storage.foldername(name))[2]
      and v.user_id = auth.uid()
      and v.status = 'approved'
  )
);

drop policy if exists "Approved vendors can update product images"
on storage.objects;

create policy "Approved vendors can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where v.id::text = (storage.foldername(name))[1]
      and p.id::text = (storage.foldername(name))[2]
      and v.user_id = auth.uid()
      and v.status = 'approved'
  )
)
with check (
  bucket_id = 'product-images'
  and (metadata ->> 'mimetype') in ('image/jpeg', 'image/png', 'image/webp')
  and exists (
    select 1
    from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where v.id::text = (storage.foldername(name))[1]
      and p.id::text = (storage.foldername(name))[2]
      and v.user_id = auth.uid()
      and v.status = 'approved'
  )
);

drop policy if exists "Approved vendors can delete product images"
on storage.objects;

create policy "Approved vendors can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where v.id::text = (storage.foldername(name))[1]
      and p.id::text = (storage.foldername(name))[2]
      and v.user_id = auth.uid()
      and v.status = 'approved'
  )
);

-- ============================================================
-- 6. PRODUCT IMAGE ROW POLICIES + PRIMARY IMAGE RPC
-- ============================================================

drop policy if exists "Vendors can view own product image rows"
on public.product_images;
create policy "Vendors can view own product image rows"
on public.product_images
for select
to authenticated
using (
  exists (
    select 1
    from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where p.id = product_images.product_id
      and v.user_id = auth.uid()
  )
);

drop policy if exists "Vendors can insert own product image rows"
on public.product_images;
create policy "Vendors can insert own product image rows"
on public.product_images
for insert
to authenticated
with check (
  storage_bucket = 'product-images'
  and exists (
    select 1
    from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where p.id = product_images.product_id
      and v.id::text = (split_part(product_images.storage_path, '/', 1))
      and v.user_id = auth.uid()
      and v.status = 'approved'
  )
);

drop policy if exists "Vendors can update own product image rows"
on public.product_images;
create policy "Vendors can update own product image rows"
on public.product_images
for update
to authenticated
using (
  exists (
    select 1 from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where p.id = product_images.product_id
      and v.user_id = auth.uid()
  )
)
with check (
  storage_bucket = 'product-images'
  and exists (
    select 1 from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where p.id = product_images.product_id
      and v.user_id = auth.uid()
  )
);

drop policy if exists "Vendors can delete own product image rows"
on public.product_images;
create policy "Vendors can delete own product image rows"
on public.product_images
for delete
to authenticated
using (
  exists (
    select 1 from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where p.id = product_images.product_id
      and v.user_id = auth.uid()
  )
);

create or replace function public.set_product_primary_image(
  p_image_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_product_id uuid;
  v_owner boolean;
begin
  select pi.product_id,
         exists (
           select 1
           from public.products p
           join public.vendor_profiles v on v.id = p.vendor_id
           where p.id = pi.product_id
             and v.user_id = auth.uid()
             and v.status = 'approved'
         )
  into v_product_id, v_owner
  from public.product_images pi
  where pi.id = p_image_id;

  if v_product_id is null or not v_owner then
    raise exception 'Image access denied';
  end if;

  update public.product_images
  set is_primary = false
  where product_id = v_product_id;

  update public.product_images
  set is_primary = true
  where id = p_image_id;

  return true;
end;
$function$;

revoke all on function public.set_product_primary_image(uuid)
from public, anon;
grant execute on function public.set_product_primary_image(uuid)
to authenticated;

-- ============================================================
-- 7. PUBLIC COMMERCE PRODUCT VIEW
-- ============================================================

create or replace view public.commerce_public_products as
select
  p.id,
  p.vendor_id,
  p.category_id,
  p.name_bn,
  p.name_en,
  p.slug,
  p.description_bn,
  p.description_en,
  p.sku,
  p.price,
  p.compare_at_price,
  p.currency,
  p.allow_guest_purchase,
  p.is_featured,
  p.created_at,
  v.display_name as vendor_display_name,
  v.display_name_bn as vendor_display_name_bn,
  v.display_name_en as vendor_display_name_en,
  v.is_verified as vendor_is_verified,
  v.shop_slug,
  pi.id as image_id,
  pi.storage_bucket as image_bucket,
  pi.storage_path as image_path,
  pi.alt_text_bn as image_alt_bn,
  pi.alt_text_en as image_alt_en
from public.products p
join public.vendor_profiles v on v.id = p.vendor_id
left join lateral (
  select x.id, x.storage_bucket, x.storage_path, x.alt_text_bn, x.alt_text_en
  from public.product_images x
  where x.product_id = p.id
  order by x.is_primary desc, x.sort_order asc, x.created_at asc
  limit 1
) pi on true
where p.status = 'published'
  and p.is_active = true
  and v.status = 'approved';

grant select on public.commerce_public_products to anon, authenticated;

-- Public vendor/shop lookup without exposing private phone/status fields.
create or replace function public.get_public_vendor_shop(
  p_slug text
)
returns table (
  id uuid,
  shop_slug text,
  display_name text,
  display_name_bn text,
  display_name_en text,
  description_bn text,
  description_en text,
  is_verified boolean,
  business_id uuid
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  select
    v.id,
    v.shop_slug,
    v.display_name,
    v.display_name_bn,
    v.display_name_en,
    v.description_bn,
    v.description_en,
    v.is_verified,
    v.business_id
  from public.vendor_profiles v
  where v.shop_slug = lower(trim(p_slug))
    and v.status = 'approved'
  limit 1;
$function$;

grant execute on function public.get_public_vendor_shop(text) to anon, authenticated;

-- ============================================================
-- 8. DELIVERY RULES
-- ============================================================

create table if not exists public.commerce_delivery_rules (
  id uuid primary key default gen_random_uuid(),
  district text,
  upazila text,
  fee numeric(12,2) not null default 0,
  free_shipping_minimum numeric(12,2),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint commerce_delivery_rules_fee_check check (fee >= 0),
  constraint commerce_delivery_rules_minimum_check check (
    free_shipping_minimum is null or free_shipping_minimum >= 0
  ),
  constraint commerce_delivery_rules_sort_check check (sort_order >= 0)
);

create unique index if not exists commerce_delivery_rules_scope_unique_idx
on public.commerce_delivery_rules(
  lower(coalesce(district, '')),
  lower(coalesce(upazila, ''))
);

create index if not exists commerce_delivery_rules_active_idx
on public.commerce_delivery_rules(is_active, sort_order);

drop policy if exists "Public can view active delivery rules"
on public.commerce_delivery_rules;
create policy "Public can view active delivery rules"
on public.commerce_delivery_rules
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can view all delivery rules"
on public.commerce_delivery_rules;
create policy "Admins can view all delivery rules"
on public.commerce_delivery_rules
for select
to authenticated
using (public.is_fenix_admin());

create or replace function public.calculate_commerce_delivery_fee(
  p_district text,
  p_upazila text,
  p_subtotal numeric
)
returns numeric
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  with normalized as (
    select
      lower(nullif(trim(coalesce(p_district, '')), '')) as district,
      lower(nullif(trim(coalesce(p_upazila, '')), '')) as upazila,
      greatest(coalesce(p_subtotal, 0), 0) as subtotal
  ),
  matched as (
    select
      r.fee,
      r.free_shipping_minimum,
      case
        when r.upazila is not null and r.district is not null then 1
        when r.district is not null then 2
        else 3
      end as priority
    from public.commerce_delivery_rules r
    cross join normalized n
    where r.is_active = true
      and (
        (r.district is not null and r.upazila is not null
          and r.district = n.district and r.upazila = n.upazila)
        or
        (r.district is not null and r.upazila is null
          and r.district = n.district)
        or
        (r.district is null and r.upazila is null)
      )
    order by priority, r.sort_order, r.created_at
    limit 1
  )
  select case
    when matched.free_shipping_minimum is not null
      and normalized.subtotal >= matched.free_shipping_minimum
      then 0::numeric
    else coalesce(matched.fee, 0)::numeric
  end
  from normalized
  left join matched on true;
$function$;

grant execute on function public.calculate_commerce_delivery_fee(text,text,numeric)
to anon, authenticated;

create or replace function public.apply_commerce_delivery_fee()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
declare
  v_fee numeric(12,2);
begin
  v_fee := public.calculate_commerce_delivery_fee(
    new.shipping_district,
    new.shipping_upazila,
    new.subtotal
  );

  new.delivery_fee := coalesce(v_fee, 0);
  new.total_amount := greatest(
    coalesce(new.subtotal, 0) - coalesce(new.discount_amount, 0),
    0
  ) + new.delivery_fee;

  return new;
end;
$function$;

drop trigger if exists orders_apply_delivery_fee
on public.orders;
create trigger orders_apply_delivery_fee
before insert or update of subtotal, discount_amount, shipping_district, shipping_upazila
on public.orders
for each row
execute function public.apply_commerce_delivery_fee();

-- Safe default: no charge until an admin configures a specific rule.
insert into public.commerce_delivery_rules (district, upazila, fee, is_active, sort_order)
values (null, null, 0, true, 9999)
on conflict do nothing;

-- ============================================================
-- 9. SELLER-SCOPED ORDER STATUS
-- ============================================================

create table if not exists public.commerce_order_vendor_status (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  vendor_id uuid not null references public.vendor_profiles(id) on delete cascade,
  status text not null default 'pending',
  inventory_finalized boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint commerce_order_vendor_status_status_check check (
    status in ('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled')
  ),
  unique (order_id, vendor_id)
);

create index if not exists commerce_order_vendor_status_vendor_idx
on public.commerce_order_vendor_status(vendor_id, created_at desc);

create index if not exists commerce_order_vendor_status_order_idx
on public.commerce_order_vendor_status(order_id);

create or replace function public.ensure_commerce_order_vendor_status()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  if new.vendor_id is not null then
    insert into public.commerce_order_vendor_status (order_id, vendor_id, status)
    values (new.order_id, new.vendor_id, 'pending')
    on conflict (order_id, vendor_id) do nothing;
  end if;
  return new;
end;
$function$;

revoke all on function public.ensure_commerce_order_vendor_status()
from public, anon, authenticated;

drop trigger if exists order_items_ensure_vendor_status
on public.order_items;
create trigger order_items_ensure_vendor_status
after insert on public.order_items
for each row
execute function public.ensure_commerce_order_vendor_status();

alter table public.commerce_order_vendor_status enable row level security;

drop policy if exists "Customers can view own vendor order statuses"
on public.commerce_order_vendor_status;
create policy "Customers can view own vendor order statuses"
on public.commerce_order_vendor_status
for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = commerce_order_vendor_status.order_id
      and o.customer_id = auth.uid()
  )
);

drop policy if exists "Vendors can view own vendor order statuses"
on public.commerce_order_vendor_status;
create policy "Vendors can view own vendor order statuses"
on public.commerce_order_vendor_status
for select to authenticated
using (
  exists (
    select 1 from public.vendor_profiles v
    where v.id = commerce_order_vendor_status.vendor_id
      and v.user_id = auth.uid()
  )
);

drop policy if exists "Admins can view all vendor order statuses"
on public.commerce_order_vendor_status;
create policy "Admins can view all vendor order statuses"
on public.commerce_order_vendor_status
for select to authenticated
using (public.is_fenix_admin());

create or replace function public.set_vendor_order_status(
  p_order_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_vendor_id uuid;
  v_order_status text;
  v_current_status text;
  v_inventory_finalized boolean;
  v_vendor_count integer;
  v_pending_count integer;
  v_confirmed_count integer;
  v_processing_count integer;
  v_ready_count integer;
  v_shipped_count integer;
  v_delivered_count integer;
  v_cancelled_count integer;
  v_aggregate_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_status not in ('confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Invalid seller status';
  end if;

  select id
  into v_vendor_id
  from public.vendor_profiles
  where user_id = auth.uid()
    and status = 'approved';

  if v_vendor_id is null then
    raise exception 'Approved seller required';
  end if;

  if not exists (
    select 1
    from public.order_items oi
    where oi.order_id = p_order_id
      and oi.vendor_id = v_vendor_id
  ) then
    raise exception 'Order access denied';
  end if;

  select status
  into v_order_status
  from public.orders
  where id = p_order_id
  for update;

  if v_order_status is null then
    raise exception 'Order not found';
  end if;

  insert into public.commerce_order_vendor_status (order_id, vendor_id, status)
  values (p_order_id, v_vendor_id, 'pending')
  on conflict (order_id, vendor_id) do nothing;

  select status, inventory_finalized
  into v_current_status, v_inventory_finalized
  from public.commerce_order_vendor_status
  where order_id = p_order_id
    and vendor_id = v_vendor_id
  for update;

  if v_current_status in ('delivered', 'cancelled') then
    if v_current_status <> p_status then
      raise exception 'Completed seller status cannot be changed';
    end if;
  end if;

  if v_current_status = 'pending' and p_status not in ('confirmed', 'processing', 'cancelled') then
    raise exception 'Invalid status transition';
  elsif v_current_status = 'confirmed' and p_status not in ('processing', 'cancelled') then
    raise exception 'Invalid status transition';
  elsif v_current_status = 'processing' and p_status not in ('ready', 'cancelled') then
    raise exception 'Invalid status transition';
  elsif v_current_status = 'ready' and p_status not in ('shipped', 'cancelled') then
    raise exception 'Invalid status transition';
  elsif v_current_status = 'shipped' and p_status not in ('delivered') then
    raise exception 'Invalid status transition';
  end if;

  if p_status = 'cancelled' and not v_inventory_finalized then
    update public.inventory i
    set
      reserved_quantity = greatest(i.reserved_quantity - x.qty, 0),
      updated_at = timezone('utc', now())
    from (
      select product_id, sum(quantity)::integer as qty
      from public.order_items
      where order_id = p_order_id
        and vendor_id = v_vendor_id
        and product_id is not null
      group by product_id
    ) x
    where i.product_id = x.product_id;

    v_inventory_finalized := true;
  elsif p_status = 'delivered' and not v_inventory_finalized then
    update public.inventory i
    set
      quantity = greatest(i.quantity - x.qty, 0),
      reserved_quantity = greatest(i.reserved_quantity - x.qty, 0),
      updated_at = timezone('utc', now())
    from (
      select product_id, sum(quantity)::integer as qty
      from public.order_items
      where order_id = p_order_id
        and vendor_id = v_vendor_id
        and product_id is not null
      group by product_id
    ) x
    where i.product_id = x.product_id;

    v_inventory_finalized := true;
  end if;

  update public.commerce_order_vendor_status
  set
    status = p_status,
    inventory_finalized = v_inventory_finalized,
    updated_at = timezone('utc', now())
  where order_id = p_order_id
    and vendor_id = v_vendor_id;

  select
    count(*)::integer,
    count(*) filter (where status = 'pending')::integer,
    count(*) filter (where status = 'confirmed')::integer,
    count(*) filter (where status = 'processing')::integer,
    count(*) filter (where status = 'ready')::integer,
    count(*) filter (where status = 'shipped')::integer,
    count(*) filter (where status = 'delivered')::integer,
    count(*) filter (where status = 'cancelled')::integer
  into
    v_vendor_count,
    v_pending_count,
    v_confirmed_count,
    v_processing_count,
    v_ready_count,
    v_shipped_count,
    v_delivered_count,
    v_cancelled_count
  from public.commerce_order_vendor_status
  where order_id = p_order_id;

  if v_vendor_count > 0 and v_delivered_count = v_vendor_count then
    v_aggregate_status := 'delivered';
  elsif v_vendor_count > 0 and v_delivered_count + v_shipped_count = v_vendor_count then
    v_aggregate_status := 'shipped';
  elsif v_vendor_count > 0 and v_delivered_count + v_shipped_count + v_ready_count = v_vendor_count then
    v_aggregate_status := 'ready';
  elsif v_vendor_count > 0 and v_delivered_count + v_shipped_count + v_ready_count + v_processing_count = v_vendor_count then
    v_aggregate_status := 'processing';
  elsif v_vendor_count > 0 and v_delivered_count + v_shipped_count + v_ready_count + v_processing_count + v_confirmed_count = v_vendor_count then
    v_aggregate_status := 'confirmed';
  elsif v_vendor_count > 0 and v_cancelled_count = v_vendor_count then
    v_aggregate_status := 'cancelled';
  else
    v_aggregate_status := 'pending';
  end if;

  update public.orders
  set status = v_aggregate_status,
      updated_at = timezone('utc', now())
  where id = p_order_id;

  return true;
end;
$function$;

grant execute on function public.set_vendor_order_status(uuid,text)
to authenticated;
revoke all on function public.set_vendor_order_status(uuid,text) from public, anon;

-- ============================================================
-- 10. CUSTOMER REVIEWS
-- ============================================================

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null,
  title text,
  body text,
  status text not null default 'pending',
  seller_response text,
  seller_responded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint product_reviews_rating_check check (rating between 1 and 5),
  constraint product_reviews_status_check check (status in ('pending', 'published', 'rejected')),
  constraint product_reviews_body_check check (length(coalesce(body, '')) <= 4000)
);

create unique index if not exists product_reviews_customer_product_unique_idx
on public.product_reviews(customer_id, product_id);

create index if not exists product_reviews_product_status_idx
on public.product_reviews(product_id, status, created_at desc);

alter table public.product_reviews enable row level security;

drop policy if exists "Public can view published product reviews"
on public.product_reviews;
create policy "Public can view published product reviews"
on public.product_reviews
for select to anon, authenticated
using (status = 'published');

drop policy if exists "Customers can view own product reviews"
on public.product_reviews;
create policy "Customers can view own product reviews"
on public.product_reviews
for select to authenticated
using (customer_id = auth.uid());

drop policy if exists "Sellers can view reviews for own products"
on public.product_reviews;
create policy "Sellers can view reviews for own products"
on public.product_reviews
for select to authenticated
using (
  exists (
    select 1
    from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where p.id = product_reviews.product_id
      and v.user_id = auth.uid()
  )
);

drop policy if exists "Admins can view all product reviews"
on public.product_reviews;
create policy "Admins can view all product reviews"
on public.product_reviews
for select to authenticated
using (public.is_fenix_admin());

create or replace function public.create_product_review(
  p_product_id uuid,
  p_rating integer,
  p_title text default null,
  p_body text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_order_id uuid;
  v_review_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  select o.id
  into v_order_id
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  where o.customer_id = auth.uid()
    and o.status = 'delivered'
    and oi.product_id = p_product_id
  order by o.created_at desc
  limit 1;

  if v_order_id is null then
    raise exception 'Verified delivered purchase required';
  end if;

  if exists (
    select 1 from public.product_reviews r
    where r.customer_id = auth.uid()
      and r.product_id = p_product_id
  ) then
    raise exception 'Review already exists';
  end if;

  insert into public.product_reviews (
    product_id,
    order_id,
    customer_id,
    rating,
    title,
    body
  )
  values (
    p_product_id,
    v_order_id,
    auth.uid(),
    p_rating,
    left(nullif(trim(coalesce(p_title, '')), ''), 160),
    left(nullif(trim(coalesce(p_body, '')), ''), 4000)
  )
  returning id into v_review_id;

  return v_review_id;
end;
$function$;

grant execute on function public.create_product_review(uuid,integer,text,text)
to authenticated;
revoke all on function public.create_product_review(uuid,integer,text,text) from public, anon;

create or replace function public.seller_reply_to_product_review(
  p_review_id uuid,
  p_response text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if nullif(trim(coalesce(p_response, '')), '') is null then
    raise exception 'Response is required';
  end if;

  if not exists (
    select 1
    from public.product_reviews r
    join public.products p on p.id = r.product_id
    join public.vendor_profiles v on v.id = p.vendor_id
    where r.id = p_review_id
      and v.user_id = auth.uid()
      and v.status = 'approved'
  ) then
    raise exception 'Review access denied';
  end if;

  update public.product_reviews
  set
    seller_response = left(trim(p_response), 2000),
    seller_responded_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  where id = p_review_id;

  return true;
end;
$function$;

grant execute on function public.seller_reply_to_product_review(uuid,text) to authenticated;
revoke all on function public.seller_reply_to_product_review(uuid,text) from public, anon;

-- ============================================================
-- 11. ITEM-LEVEL RETURN / REFUND RECORDS
-- ============================================================

create table if not exists public.commerce_return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'requested',
  resolution_note text,
  refund_amount numeric(12,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint commerce_return_status_check check (
    status in ('requested', 'approved', 'rejected', 'received', 'refunded', 'cancelled')
  ),
  constraint commerce_return_reason_check check (length(trim(reason)) between 2 and 200),
  constraint commerce_return_refund_check check (refund_amount is null or refund_amount >= 0)
);

create unique index if not exists commerce_return_active_item_unique_idx
on public.commerce_return_requests(order_item_id)
where status in ('requested', 'approved', 'received');

create index if not exists commerce_return_customer_idx
on public.commerce_return_requests(customer_id, created_at desc);

create index if not exists commerce_return_order_idx
on public.commerce_return_requests(order_id, created_at desc);

alter table public.commerce_return_requests enable row level security;

drop policy if exists "Customers can view own returns"
on public.commerce_return_requests;
create policy "Customers can view own returns"
on public.commerce_return_requests
for select to authenticated
using (customer_id = auth.uid());

drop policy if exists "Sellers can view own returns"
on public.commerce_return_requests;
create policy "Sellers can view own returns"
on public.commerce_return_requests
for select to authenticated
using (
  exists (
    select 1
    from public.order_items oi
    join public.vendor_profiles v on v.id = oi.vendor_id
    where oi.id = commerce_return_requests.order_item_id
      and v.user_id = auth.uid()
  )
);

drop policy if exists "Admins can view all returns"
on public.commerce_return_requests;
create policy "Admins can view all returns"
on public.commerce_return_requests
for select to authenticated
using (public.is_fenix_admin());

create or replace function public.create_commerce_return_request(
  p_order_item_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_order_id uuid;
  v_product_id uuid;
  v_request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'Return reason is required';
  end if;

  select oi.order_id, oi.product_id
  into v_order_id, v_product_id
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.id = p_order_item_id
    and o.customer_id = auth.uid()
    and o.status = 'delivered';

  if v_order_id is null then
    raise exception 'Delivered purchase required';
  end if;

  insert into public.commerce_return_requests (
    order_id,
    order_item_id,
    customer_id,
    reason,
    details
  )
  values (
    v_order_id,
    p_order_item_id,
    auth.uid(),
    left(trim(p_reason), 200),
    left(nullif(trim(coalesce(p_details, '')), ''), 4000)
  )
  returning id into v_request_id;

  return v_request_id;
end;
$function$;

grant execute on function public.create_commerce_return_request(uuid,text,text) to authenticated;
revoke all on function public.create_commerce_return_request(uuid,text,text) from public, anon;

create or replace function public.set_commerce_return_status(
  p_request_id uuid,
  p_status text,
  p_resolution_note text default null,
  p_refund_amount numeric default null
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_current text;
  v_owner boolean;
  v_admin boolean;
  v_order_item_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  v_admin := public.is_fenix_admin();

  select r.status,
         r.order_item_id,
         (
           exists (
             select 1
             from public.order_items oi
             join public.vendor_profiles v on v.id = oi.vendor_id
             where oi.id = r.order_item_id
               and v.user_id = auth.uid()
           )
         )
  into v_current, v_order_item_id, v_owner
  from public.commerce_return_requests r
  where r.id = p_request_id
  for update;

  if v_current is null then
    raise exception 'Return request not found';
  end if;

  if not v_admin and not v_owner then
    raise exception 'Return access denied';
  end if;

  if p_status not in ('approved', 'rejected', 'received', 'refunded', 'cancelled') then
    raise exception 'Invalid return status';
  end if;

  if v_current = 'requested' and p_status not in ('approved', 'rejected', 'cancelled') then
    raise exception 'Invalid return transition';
  elsif v_current = 'approved' and p_status not in ('received', 'rejected', 'cancelled') then
    raise exception 'Invalid return transition';
  elsif v_current = 'received' and p_status <> 'refunded' then
    raise exception 'Invalid return transition';
  elsif v_current in ('rejected', 'refunded', 'cancelled') then
    raise exception 'Closed return request';
  end if;

  update public.commerce_return_requests
  set
    status = p_status,
    resolution_note = left(nullif(trim(coalesce(p_resolution_note, '')), ''), 2000),
    refund_amount = case
      when p_status = 'refunded' then greatest(coalesce(p_refund_amount, 0), 0)
      else refund_amount
    end,
    updated_at = timezone('utc', now())
  where id = p_request_id;

  return true;
end;
$function$;

grant execute on function public.set_commerce_return_status(uuid,text,text,numeric) to authenticated;
revoke all on function public.set_commerce_return_status(uuid,text,text,numeric) from public, anon;

-- ============================================================
-- 12. ADMIN CONTROLS
-- ============================================================

create or replace function public.admin_set_vendor_status(
  p_vendor_id uuid,
  p_status text,
  p_is_verified boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  if not public.is_fenix_admin() then
    raise exception 'Admin access required';
  end if;

  if p_status not in ('pending', 'approved', 'rejected', 'suspended') then
    raise exception 'Invalid vendor status';
  end if;

  update public.vendor_profiles
  set
    status = p_status,
    is_verified = case when p_status = 'approved' then coalesce(p_is_verified, false) else false end,
    updated_at = timezone('utc', now())
  where id = p_vendor_id;

  if not found then
    raise exception 'Vendor not found';
  end if;

  return true;
end;
$function$;

grant execute on function public.admin_set_vendor_status(uuid,text,boolean) to authenticated;
revoke all on function public.admin_set_vendor_status(uuid,text,boolean) from public, anon;

create or replace function public.admin_upsert_delivery_rule(
  p_rule_id uuid default null,
  p_district text default null,
  p_upazila text default null,
  p_fee numeric default 0,
  p_free_shipping_minimum numeric default null,
  p_is_active boolean default true,
  p_sort_order integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_rule_id uuid;
  v_district text;
  v_upazila text;
begin
  if not public.is_fenix_admin() then
    raise exception 'Admin access required';
  end if;

  if p_fee is null or p_fee < 0 then
    raise exception 'Invalid delivery fee';
  end if;

  if p_free_shipping_minimum is not null and p_free_shipping_minimum < 0 then
    raise exception 'Invalid free-shipping minimum';
  end if;

  v_district := lower(nullif(trim(coalesce(p_district, '')), ''));
  v_upazila := lower(nullif(trim(coalesce(p_upazila, '')), ''));

  if p_rule_id is null then
    insert into public.commerce_delivery_rules (
      district, upazila, fee, free_shipping_minimum, is_active, sort_order
    )
    values (
      v_district, v_upazila, round(p_fee,2),
      case when p_free_shipping_minimum is null then null else round(p_free_shipping_minimum,2) end,
      coalesce(p_is_active,true), greatest(coalesce(p_sort_order,0),0)
    )
    returning id into v_rule_id;
  else
    update public.commerce_delivery_rules
    set
      district = v_district,
      upazila = v_upazila,
      fee = round(p_fee,2),
      free_shipping_minimum = case when p_free_shipping_minimum is null then null else round(p_free_shipping_minimum,2) end,
      is_active = coalesce(p_is_active,true),
      sort_order = greatest(coalesce(p_sort_order,0),0),
      updated_at = timezone('utc', now())
    where id = p_rule_id
    returning id into v_rule_id;

    if v_rule_id is null then
      raise exception 'Delivery rule not found';
    end if;
  end if;

  return v_rule_id;
end;
$function$;

grant execute on function public.admin_upsert_delivery_rule(uuid,text,text,numeric,numeric,boolean,integer) to authenticated;
revoke all on function public.admin_upsert_delivery_rule(uuid,text,text,numeric,numeric,boolean,integer) from public, anon;

create or replace function public.admin_delete_delivery_rule(p_rule_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  if not public.is_fenix_admin() then
    raise exception 'Admin access required';
  end if;

  if p_rule_id is null then
    raise exception 'Rule id is required';
  end if;

  delete from public.commerce_delivery_rules
  where id = p_rule_id
    and not (district is null and upazila is null);

  return true;
end;
$function$;

grant execute on function public.admin_delete_delivery_rule(uuid) to authenticated;
revoke all on function public.admin_delete_delivery_rule(uuid) from public, anon;

create or replace function public.admin_set_review_status(
  p_review_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  if not public.is_fenix_admin() then
    raise exception 'Admin access required';
  end if;

  if p_status not in ('pending', 'published', 'rejected') then
    raise exception 'Invalid review status';
  end if;

  update public.product_reviews
  set status = p_status,
      updated_at = timezone('utc', now())
  where id = p_review_id;

  if not found then
    raise exception 'Review not found';
  end if;

  return true;
end;
$function$;

grant execute on function public.admin_set_review_status(uuid,text) to authenticated;
revoke all on function public.admin_set_review_status(uuid,text) from public, anon;

-- Admin can set payment state for COD/manual operational records.
create or replace function public.admin_set_order_payment_status(
  p_order_id uuid,
  p_payment_status text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  if not public.is_fenix_admin() then
    raise exception 'Admin access required';
  end if;

  if p_payment_status not in ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'partially_refunded') then
    raise exception 'Invalid payment status';
  end if;

  update public.orders
  set payment_status = p_payment_status,
      updated_at = timezone('utc', now())
  where id = p_order_id;

  if not found then
    raise exception 'Order not found';
  end if;

  return true;
end;
$function$;

grant execute on function public.admin_set_order_payment_status(uuid,text) to authenticated;
revoke all on function public.admin_set_order_payment_status(uuid,text) from public, anon;

-- ============================================================
-- 13. ADMIN RLS
-- ============================================================

drop policy if exists "Admins can view all vendor profiles"
on public.vendor_profiles;
create policy "Admins can view all vendor profiles"
on public.vendor_profiles
for select to authenticated
using (public.is_fenix_admin());

-- Admin may see all product/order records through existing table RLS without
-- opening those tables to ordinary users.
drop policy if exists "Admins can view all products"
on public.products;
create policy "Admins can view all products"
on public.products
for select to authenticated
using (public.is_fenix_admin());

drop policy if exists "Admins can view all product image rows"
on public.product_images;
create policy "Admins can view all product image rows"
on public.product_images
for select to authenticated
using (public.is_fenix_admin());

drop policy if exists "Admins can view all orders"
on public.orders;
create policy "Admins can view all orders"
on public.orders
for select to authenticated
using (public.is_fenix_admin());

drop policy if exists "Admins can view all order items"
on public.order_items;
create policy "Admins can view all order items"
on public.order_items
for select to authenticated
using (public.is_fenix_admin());

commit;
