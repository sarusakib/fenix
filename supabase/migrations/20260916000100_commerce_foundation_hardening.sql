-- ============================================================
-- FeniX Commerce Foundation Hardening v1
-- Migration: 20260916000100
--
-- Based on:
--   20260915000100_commerce_foundation.sql
--
-- Purpose:
--   1. Automatically create inventory for every product.
--   2. Backfill inventory for existing products.
--   3. Fix guest vs authenticated purchase rules.
--   4. Reject duplicate products in one checkout request.
--   5. Require approved vendors for public products/images.
--   6. Add seller-side order visibility.
--
-- IMPORTANT:
--   This migration does not delete existing Commerce data.
--   The original Commerce Foundation migration remains unchanged.
-- ============================================================

begin;


-- ============================================================
-- 1. AUTOMATIC INVENTORY CREATION
-- ============================================================
--
-- The original products table does not automatically create
-- an inventory row.
--
-- This trigger guarantees:
--
--   products row
--        ↓
--   inventory row
--
-- Inventory starts at zero and must later be changed through
-- controlled inventory operations.
-- ============================================================

create or replace function public.ensure_product_inventory()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin

  insert into public.inventory (
    product_id,
    quantity,
    reserved_quantity,
    low_stock_threshold
  )
  values (
    new.id,
    0,
    0,
    5
  )
  on conflict (product_id)
  do nothing;

  return new;
end;
$function$;


revoke all
on function public.ensure_product_inventory()
from public, anon, authenticated;


drop trigger if exists products_ensure_inventory
on public.products;


create trigger products_ensure_inventory
after insert on public.products
for each row
execute function public.ensure_product_inventory();


-- ============================================================
-- 2. BACKFILL EXISTING PRODUCTS
-- ============================================================
--
-- Products created before this hardening migration may not have
-- an inventory row.
--
-- Create missing rows without changing existing inventory.
-- ============================================================

insert into public.inventory (
  product_id,
  quantity,
  reserved_quantity,
  low_stock_threshold
)
select
  p.id,
  0,
  0,
  5
from public.products p
left join public.inventory i
  on i.product_id = p.id
where i.product_id is null
on conflict (product_id)
do nothing;


-- ============================================================
-- 3. PUBLIC PRODUCT TRUST HARDENING
-- ============================================================
--
-- A product should not remain publicly visible when its vendor
-- is not approved.
-- ============================================================

drop policy if exists "Public can view published products"
on public.products;


create policy "Public can view published products"
on public.products
for select
to anon, authenticated
using (
  is_active = true
  and status = 'published'
  and exists (
    select 1
    from public.vendor_profiles v
    where v.id = products.vendor_id
      and v.status = 'approved'
  )
);


-- ============================================================
-- 4. PUBLIC PRODUCT IMAGE TRUST HARDENING
-- ============================================================

drop policy if exists "Public can view product images"
on public.product_images;


create policy "Public can view product images"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    join public.vendor_profiles v
      on v.id = p.vendor_id
    where p.id = product_images.product_id
      and p.is_active = true
      and p.status = 'published'
      and v.status = 'approved'
  )
);


-- ============================================================
-- 5. SELLER ORDER VISIBILITY
-- ============================================================
--
-- A vendor may see an order only when at least one order item
-- belongs to that vendor.
--
-- This does NOT expose another vendor's products through the
-- seller's own product relationship.
-- ============================================================

drop policy if exists "Vendors can view own orders"
on public.orders;


create policy "Vendors can view own orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.order_items oi
    join public.vendor_profiles v
      on v.id = oi.vendor_id
    where oi.order_id = orders.id
      and v.user_id = auth.uid()
  )
);


-- ============================================================
-- 6. SELLER ORDER ITEM VISIBILITY
-- ============================================================

drop policy if exists "Vendors can view own order items"
on public.order_items;


create policy "Vendors can view own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.vendor_profiles v
    where v.id = order_items.vendor_id
      and v.user_id = auth.uid()
  )
);


-- ============================================================
-- 7. REBUILD ORDER CREATION RPC
-- ============================================================
--
-- Changes from original:
--
-- Guest:
--   allow_guest_purchase MUST be true.
--
-- Authenticated:
--   allow_guest_purchase does NOT block the purchase.
--
-- Also:
--   duplicate product IDs are rejected.
--
-- Database remains authoritative for:
--   product
--   vendor
--   price
--   stock
--   subtotal
--   total
-- ============================================================

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
returns table (
  order_id uuid,
  order_number text,
  total_amount numeric
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$

declare

  v_order_id uuid;
  v_order_number text;

  v_subtotal numeric(12,2) := 0;
  v_total numeric(12,2) := 0;

  v_item jsonb;

  v_product_id uuid;
  v_quantity integer;

  v_product public.products%rowtype;
  v_inventory public.inventory%rowtype;

  v_line_total numeric(12,2);

  v_user_id uuid;

  v_seen_product_ids uuid[] := '{}'::uuid[];

begin

  v_user_id := auth.uid();


  -- ==========================================================
  -- CART VALIDATION
  -- ==========================================================

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then

    raise exception 'Cart is empty';

  end if;


  if jsonb_array_length(p_items) > 50 then

    raise exception 'Too many cart items';

  end if;


  -- ==========================================================
  -- SHIPPING VALIDATION
  -- ==========================================================

  if p_shipping_name is null
     or length(trim(p_shipping_name)) < 2 then

    raise exception 'Shipping name is required';

  end if;


  if p_shipping_phone is null
     or length(trim(p_shipping_phone)) < 7 then

    raise exception 'Shipping phone is required';

  end if;


  if p_shipping_address is null
     or length(trim(p_shipping_address)) < 5 then

    raise exception 'Shipping address is required';

  end if;


  -- ==========================================================
  -- CUSTOMER / GUEST VALIDATION
  -- ==========================================================

  if v_user_id is not null then

    if p_customer_id is not null
       and p_customer_id <> v_user_id then

      raise exception 'Invalid customer';

    end if;

    p_customer_id := v_user_id;

  else

    if nullif(trim(p_guest_name), '') is null
       or nullif(trim(p_guest_phone), '') is null then

      raise exception 'Guest identity is required';

    end if;

    p_customer_id := null;

  end if;


  -- ==========================================================
  -- CREATE ORDER
  -- ==========================================================

  insert into public.orders (
    customer_id,

    guest_name,
    guest_phone,
    guest_email,

    shipping_name,
    shipping_phone,
    shipping_address,

    shipping_area,
    shipping_upazila,
    shipping_district,

    customer_note
  )
  values (
    p_customer_id,

    nullif(trim(p_guest_name), ''),
    nullif(trim(p_guest_phone), ''),
    nullif(trim(p_guest_email), ''),

    trim(p_shipping_name),
    trim(p_shipping_phone),
    trim(p_shipping_address),

    nullif(trim(p_shipping_area), ''),
    nullif(trim(p_shipping_upazila), ''),
    nullif(trim(p_shipping_district), ''),

    nullif(trim(p_customer_note), '')
  )
  returning
    id,
    order_number
  into
    v_order_id,
    v_order_number;


  -- ==========================================================
  -- PROCESS CART
  -- ==========================================================

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop

    -- --------------------------------------------------------
    -- Parse item
    -- --------------------------------------------------------

    begin

      v_product_id :=
        (v_item ->> 'product_id')::uuid;

      v_quantity :=
        (v_item ->> 'quantity')::integer;

    exception
      when others then

        raise exception 'Invalid cart item';

    end;


    if v_product_id is null then

      raise exception 'Product ID is required';

    end if;


    if v_quantity is null
       or v_quantity < 1
       or v_quantity > 1000 then

      raise exception 'Invalid product quantity';

    end if;


    -- --------------------------------------------------------
    -- Duplicate product protection
    -- --------------------------------------------------------

    if v_product_id = any(v_seen_product_ids) then

      raise exception
        'Duplicate product in cart';

    end if;


    v_seen_product_ids :=
      array_append(
        v_seen_product_ids,
        v_product_id
      );


    -- --------------------------------------------------------
    -- Lock product
    --
    -- Guest:
    --   allow_guest_purchase must be true.
    --
    -- Authenticated:
    --   allow_guest_purchase is irrelevant.
    -- --------------------------------------------------------

    select *
    into v_product
    from public.products
    where id = v_product_id
      and is_active = true
      and status = 'published'
      and exists (
        select 1
        from public.vendor_profiles v
        where v.id = products.vendor_id
          and v.status = 'approved'
      )
      and (
        v_user_id is not null
        or allow_guest_purchase = true
      )
    for update;


    if not found then

      raise exception 'Product unavailable';

    end if;


    -- --------------------------------------------------------
    -- Lock inventory
    -- --------------------------------------------------------

    select *
    into v_inventory
    from public.inventory
    where product_id = v_product_id
    for update;


    if not found then

      raise exception 'Product inventory unavailable';

    end if;


    -- --------------------------------------------------------
    -- Stock validation
    -- --------------------------------------------------------

    if (
      v_inventory.quantity
      - v_inventory.reserved_quantity
    ) < v_quantity then

      raise exception 'Insufficient stock';

    end if;


    -- --------------------------------------------------------
    -- Calculate using database price
    -- --------------------------------------------------------

    v_line_total :=
      round(
        v_product.price * v_quantity,
        2
      );


    v_subtotal :=
      v_subtotal + v_line_total;


    -- --------------------------------------------------------
    -- Snapshot product
    -- --------------------------------------------------------

    insert into public.order_items (
      order_id,
      product_id,
      vendor_id,

      product_name,
      product_sku,

      quantity,
      unit_price,

      discount_amount,
      line_total
    )
    values (
      v_order_id,
      v_product.id,
      v_product.vendor_id,

      coalesce(
        nullif(v_product.name_bn, ''),
        v_product.name_en
      ),

      v_product.sku,

      v_quantity,
      v_product.price,

      0,
      v_line_total
    );


    -- --------------------------------------------------------
    -- Reserve stock
    -- --------------------------------------------------------

    update public.inventory
    set
      reserved_quantity =
        reserved_quantity + v_quantity,

      updated_at =
        timezone('utc', now())

    where id = v_inventory.id;

  end loop;


  -- ==========================================================
  -- PHASE 1 DELIVERY
  -- ==========================================================

  v_total := v_subtotal;


  -- ==========================================================
  -- FINALIZE ORDER
  -- ==========================================================

  update public.orders
  set
    subtotal = v_subtotal,

    delivery_fee = 0,

    discount_amount = 0,

    total_amount = v_total,

    updated_at =
      timezone('utc', now())

  where id = v_order_id;


  -- ==========================================================
  -- RESULT
  -- ==========================================================

  return query
  select
    v_order_id,
    v_order_number,
    v_total;

end;
$function$;


-- ============================================================
-- 8. ORDER RPC PRIVILEGES
-- ============================================================

revoke all
on function public.create_commerce_order(
  jsonb,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from public;


grant execute
on function public.create_commerce_order(
  jsonb,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
to anon, authenticated;


-- ============================================================
-- 9. HARDEN TRIGGER FUNCTION EXECUTION
-- ============================================================

revoke execute
on function public.ensure_product_inventory()
from public, anon, authenticated;


-- ============================================================
-- 10. HARDEN ORDER NUMBER FUNCTION
-- ============================================================

revoke execute
on function public.generate_commerce_order_number()
from public, anon;


grant execute
on function public.generate_commerce_order_number()
to authenticated, service_role;


commit;
