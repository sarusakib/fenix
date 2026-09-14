
-- ============================================================
-- FeniX Commerce Foundation v1.1
-- Secure Multi-Vendor Commerce Database Foundation
-- Date: 2026-09-15
--
-- Existing tables used:
--   public.profiles
--   public.businesses
--
-- IMPORTANT:
--   This migration does not delete existing FeniX data.
-- ============================================================

begin;

-- ============================================================
-- 1. PRODUCT CATEGORIES
-- ============================================================

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),

  name_bn text,
  name_en text,

  slug text not null unique,

  description_bn text,
  description_en text,

  parent_id uuid null
    references public.product_categories(id)
    on delete set null,

  image_url text,

  is_active boolean not null default true,

  sort_order integer not null default 0,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint product_categories_name_check
    check (
      nullif(trim(coalesce(name_bn, '')), '') is not null
      or
      nullif(trim(coalesce(name_en, '')), '') is not null
    ),

  constraint product_categories_slug_check
    check (
      slug = lower(slug)
      and length(trim(slug)) between 1 and 120
    )
);

create index if not exists product_categories_parent_id_idx
on public.product_categories(parent_id);

create index if not exists product_categories_active_idx
on public.product_categories(is_active, sort_order);


-- ============================================================
-- 2. VENDOR PROFILES
-- ============================================================

create table if not exists public.vendor_profiles (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique
    references public.profiles(id)
    on delete cascade,

  business_id uuid null
    references public.businesses(id)
    on delete set null,

  display_name text not null,

  display_name_bn text,
  display_name_en text,

  description_bn text,
  description_en text,

  phone text,

  status text not null default 'pending',

  is_verified boolean not null default false,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint vendor_profiles_status_check
    check (
      status in (
        'pending',
        'approved',
        'suspended',
        'rejected'
      )
    ),

  constraint vendor_profiles_display_name_check
    check (
      length(trim(display_name)) between 1 and 200
    )
);

create index if not exists vendor_profiles_business_id_idx
on public.vendor_profiles(business_id);

create index if not exists vendor_profiles_status_idx
on public.vendor_profiles(status);

create index if not exists vendor_profiles_verified_idx
on public.vendor_profiles(is_verified);


-- ============================================================
-- 3. PRODUCTS
-- ============================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),

  vendor_id uuid not null
    references public.vendor_profiles(id)
    on delete restrict,

  business_id uuid null
    references public.businesses(id)
    on delete set null,

  category_id uuid null
    references public.product_categories(id)
    on delete set null,

  name_bn text,
  name_en text,

  slug text not null unique,

  description_bn text,
  description_en text,

  sku text,

  price numeric(12,2) not null,

  compare_at_price numeric(12,2),

  currency text not null default 'BDT',

  status text not null default 'draft',

  is_active boolean not null default false,

  is_featured boolean not null default false,

  allow_guest_purchase boolean not null default true,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint products_name_check
    check (
      nullif(trim(coalesce(name_bn, '')), '') is not null
      or
      nullif(trim(coalesce(name_en, '')), '') is not null
    ),

  constraint products_price_check
    check (price >= 0),

  constraint products_compare_price_check
    check (
      compare_at_price is null
      or compare_at_price >= price
    ),

  constraint products_currency_check
    check (currency = 'BDT'),

  constraint products_status_check
    check (
      status in (
        'draft',
        'pending',
        'published',
        'paused',
        'archived'
      )
    ),

  constraint products_slug_check
    check (
      slug = lower(slug)
      and length(trim(slug)) between 1 and 160
    ),

  constraint products_sku_check
    check (
      sku is null
      or length(trim(sku)) between 1 and 100
    )
);

create unique index if not exists products_vendor_sku_unique_idx
on public.products(vendor_id, sku)
where sku is not null;

create index if not exists products_vendor_id_idx
on public.products(vendor_id);

create index if not exists products_business_id_idx
on public.products(business_id);

create index if not exists products_category_id_idx
on public.products(category_id);

create index if not exists products_status_idx
on public.products(status);

create index if not exists products_public_listing_idx
on public.products(is_active, status, created_at desc);


-- ============================================================
-- 4. PRODUCT IMAGES
-- ============================================================

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  storage_bucket text not null default 'product-images',

  storage_path text not null,

  alt_text_bn text,
  alt_text_en text,

  sort_order integer not null default 0,

  is_primary boolean not null default false,

  created_at timestamptz not null default timezone('utc', now()),

  constraint product_images_bucket_check
    check (length(trim(storage_bucket)) between 1 and 100),

  constraint product_images_path_check
    check (length(trim(storage_path)) between 1 and 1000),

  constraint product_images_sort_check
    check (sort_order >= 0)
);

create index if not exists product_images_product_id_idx
on public.product_images(product_id, sort_order);

create unique index if not exists product_images_one_primary_idx
on public.product_images(product_id)
where is_primary = true;


-- ============================================================
-- 5. INVENTORY
-- ============================================================

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null unique
    references public.products(id)
    on delete cascade,

  quantity integer not null default 0,

  reserved_quantity integer not null default 0,

  low_stock_threshold integer not null default 5,

  updated_at timestamptz not null default timezone('utc', now()),

  constraint inventory_quantity_check
    check (quantity >= 0),

  constraint inventory_reserved_check
    check (
      reserved_quantity >= 0
      and reserved_quantity <= quantity
    ),

  constraint inventory_threshold_check
    check (low_stock_threshold >= 0)
);

create index if not exists inventory_product_id_idx
on public.inventory(product_id);


-- ============================================================
-- 6. ORDERS
-- ============================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),

  order_number text not null unique
    default 'TEMP',

  customer_id uuid null
    references public.profiles(id)
    on delete set null,

  guest_name text,
  guest_phone text,
  guest_email text,

  status text not null default 'pending',

  payment_status text not null default 'unpaid',

  payment_method text not null default 'cash_on_delivery',

  currency text not null default 'BDT',

  subtotal numeric(12,2) not null default 0,

  delivery_fee numeric(12,2) not null default 0,

  discount_amount numeric(12,2) not null default 0,

  total_amount numeric(12,2) not null default 0,

  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null,

  shipping_area text,
  shipping_upazila text,
  shipping_district text,

  customer_note text,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint orders_status_check
    check (
      status in (
        'pending',
        'confirmed',
        'processing',
        'ready',
        'shipped',
        'delivered',
        'cancelled',
        'returned'
      )
    ),

  constraint orders_payment_status_check
    check (
      payment_status in (
        'unpaid',
        'pending',
        'paid',
        'failed',
        'refunded',
        'partially_refunded'
      )
    ),

  constraint orders_payment_method_check
    check (
      payment_method in (
        'cash_on_delivery',
        'online',
        'manual'
      )
    ),

  constraint orders_currency_check
    check (currency = 'BDT'),

  constraint orders_amount_check
    check (
      subtotal >= 0
      and delivery_fee >= 0
      and discount_amount >= 0
      and total_amount >= 0
    ),

  constraint orders_customer_identity_check
    check (
      customer_id is not null
      or (
        nullif(trim(guest_name), '') is not null
        and nullif(trim(guest_phone), '') is not null
      )
    )
);

create index if not exists orders_customer_id_idx
on public.orders(customer_id);

create index if not exists orders_status_idx
on public.orders(status, created_at desc);

create index if not exists orders_created_at_idx
on public.orders(created_at desc);


-- ============================================================
-- 7. ORDER ITEMS
-- ============================================================

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null
    references public.orders(id)
    on delete cascade,

  product_id uuid null
    references public.products(id)
    on delete set null,

  vendor_id uuid null
    references public.vendor_profiles(id)
    on delete set null,

  product_name text not null,

  product_sku text,

  quantity integer not null,

  unit_price numeric(12,2) not null,

  discount_amount numeric(12,2) not null default 0,

  line_total numeric(12,2) not null,

  created_at timestamptz not null default timezone('utc', now()),

  constraint order_items_quantity_check
    check (quantity > 0),

  constraint order_items_price_check
    check (
      unit_price >= 0
      and discount_amount >= 0
      and line_total >= 0
    )
);

create index if not exists order_items_order_id_idx
on public.order_items(order_id);

create index if not exists order_items_product_id_idx
on public.order_items(product_id);

create index if not exists order_items_vendor_id_idx
on public.order_items(vendor_id);


-- ============================================================
-- 8. ORDER NUMBER SEQUENCE
-- ============================================================

create sequence if not exists public.commerce_order_number_seq;


create or replace function public.generate_commerce_order_number()
returns text
language plpgsql
volatile
set search_path = pg_catalog, public
as $function$
declare
  next_number bigint;
begin
  next_number := nextval('public.commerce_order_number_seq');

  return 'FNX-' ||
         to_char(current_date, 'YYYYMMDD') ||
         '-' ||
         lpad(next_number::text, 6, '0');
end;
$function$;


alter table public.orders
alter column order_number
set default public.generate_commerce_order_number();


-- ============================================================
-- 9. TIMESTAMP FUNCTION
-- ============================================================

create or replace function public.set_commerce_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $function$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$function$;


-- ============================================================
-- 10. TIMESTAMP TRIGGERS
-- ============================================================

drop trigger if exists product_categories_set_updated_at
on public.product_categories;

create trigger product_categories_set_updated_at
before update on public.product_categories
for each row
execute function public.set_commerce_updated_at();


drop trigger if exists vendor_profiles_set_updated_at
on public.vendor_profiles;

create trigger vendor_profiles_set_updated_at
before update on public.vendor_profiles
for each row
execute function public.set_commerce_updated_at();


drop trigger if exists products_set_updated_at
on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_commerce_updated_at();


drop trigger if exists inventory_set_updated_at
on public.inventory;

create trigger inventory_set_updated_at
before update on public.inventory
for each row
execute function public.set_commerce_updated_at();


drop trigger if exists orders_set_updated_at
on public.orders;

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_commerce_updated_at();


-- ============================================================
-- 11. ENABLE RLS
-- ============================================================

alter table public.product_categories enable row level security;
alter table public.vendor_profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;


-- ============================================================
-- 12. CATEGORY READ
-- ============================================================

drop policy if exists "Public can view active product categories"
on public.product_categories;

create policy "Public can view active product categories"
on public.product_categories
for select
to anon, authenticated
using (is_active = true);


-- ============================================================
-- 13. PRODUCT PUBLIC READ
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
);


-- ============================================================
-- 14. VENDOR PROFILE
-- ============================================================

drop policy if exists "Users can view own vendor profile"
on public.vendor_profiles;

create policy "Users can view own vendor profile"
on public.vendor_profiles
for select
to authenticated
using (
  user_id = auth.uid()
);


drop policy if exists "Users can create own vendor application"
on public.vendor_profiles;

create policy "Users can create own vendor application"
on public.vendor_profiles
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending'
  and is_verified = false
);


-- ============================================================
-- 15. VENDOR PRODUCT READ
-- ============================================================

drop policy if exists "Vendors can view own products"
on public.products;

create policy "Vendors can view own products"
on public.products
for select
to authenticated
using (
  exists (
    select 1
    from public.vendor_profiles v
    where v.id = products.vendor_id
      and v.user_id = auth.uid()
  )
);


-- ============================================================
-- 16. VENDOR PRODUCT INSERT
-- ============================================================

drop policy if exists "Approved vendors can create draft products"
on public.products;

create policy "Approved vendors can create draft products"
on public.products
for insert
to authenticated
with check (
  status = 'draft'
  and is_active = false
  and exists (
    select 1
    from public.vendor_profiles v
    where v.id = products.vendor_id
      and v.user_id = auth.uid()
      and v.status = 'approved'
  )
);


-- ============================================================
-- 17. VENDOR PRODUCT UPDATE
-- ============================================================

drop policy if exists "Vendors can update own products"
on public.products;

create policy "Vendors can update own products"
on public.products
for update
to authenticated
using (
  exists (
    select 1
    from public.vendor_profiles v
    where v.id = products.vendor_id
      and v.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.vendor_profiles v
    where v.id = products.vendor_id
      and v.user_id = auth.uid()
  )
  and (
    status in ('draft', 'pending', 'paused')
    or (
      status = 'published'
      and is_active = true
      and exists (
        select 1
        from public.vendor_profiles v2
        where v2.id = products.vendor_id
          and v2.user_id = auth.uid()
          and v2.status = 'approved'
      )
    )
  )
);


-- ============================================================
-- 18. VENDOR PRODUCT DELETE
-- ============================================================

drop policy if exists "Vendors can delete own products"
on public.products;

create policy "Vendors can delete own products"
on public.products
for delete
to authenticated
using (
  exists (
    select 1
    from public.vendor_profiles v
    where v.id = products.vendor_id
      and v.user_id = auth.uid()
  )
);


-- ============================================================
-- 19. PRODUCT IMAGE PUBLIC READ
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
    where p.id = product_images.product_id
      and p.is_active = true
      and p.status = 'published'
  )
);


-- ============================================================
-- 20. PRODUCT IMAGE OWNER MANAGEMENT
-- ============================================================

drop policy if exists "Vendors can manage own product images"
on public.product_images;

create policy "Vendors can manage own product images"
on public.product_images
for all
to authenticated
using (
  exists (
    select 1
    from public.products p
    join public.vendor_profiles v
      on v.id = p.vendor_id
    where p.id = product_images.product_id
      and v.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products p
    join public.vendor_profiles v
      on v.id = p.vendor_id
    where p.id = product_images.product_id
      and v.user_id = auth.uid()
  )
);


-- ============================================================
-- 21. INVENTORY READ
-- ============================================================

drop policy if exists "Vendors can view own inventory"
on public.inventory;

create policy "Vendors can view own inventory"
on public.inventory
for select
to authenticated
using (
  exists (
    select 1
    from public.products p
    join public.vendor_profiles v
      on v.id = p.vendor_id
    where p.id = inventory.product_id
      and v.user_id = auth.uid()
  )
);


-- ============================================================
-- 22. INVENTORY WRITE
--
-- Direct authenticated INSERT/UPDATE/DELETE is intentionally
-- blocked. Inventory mutations will use controlled RPCs.
-- ============================================================


-- ============================================================
-- 23. ORDER READ
-- ============================================================

drop policy if exists "Customers can view own orders"
on public.orders;

create policy "Customers can view own orders"
on public.orders
for select
to authenticated
using (
  customer_id = auth.uid()
);


-- ============================================================
-- 24. ORDER ITEM READ
-- ============================================================

drop policy if exists "Customers can view own order items"
on public.order_items;

create policy "Customers can view own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.customer_id = auth.uid()
  )
);


-- ============================================================
-- 25. NO DIRECT ORDER INSERT
-- ============================================================
--
-- Customer and guest checkout will use RPC only.
-- No anon/authenticated INSERT policy is created.
--


-- ============================================================
-- 26. SECURE ORDER CREATION RPC
--
-- p_items example:
--
-- [
--   {"product_id":"UUID","quantity":2},
--   {"product_id":"UUID","quantity":1}
-- ]
--
-- The client DOES NOT send:
--   price
--   subtotal
--   total
--   vendor_id
--   product_name
--   payment_status
--   order_status
--
-- Database calculates those values.
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

begin

  v_user_id := auth.uid();

  -- ----------------------------------------------------------
  -- Basic validation
  -- ----------------------------------------------------------

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  if jsonb_array_length(p_items) > 50 then
    raise exception 'Too many cart items';
  end if;

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


  -- ----------------------------------------------------------
  -- Authenticated customer validation
  -- ----------------------------------------------------------

  if v_user_id is not null then

    if p_customer_id is not null
       and p_customer_id <> v_user_id then
      raise exception 'Invalid customer';
    end if;

    p_customer_id := v_user_id;

  else

    -- Guest checkout requires guest identity.
    if nullif(trim(p_guest_name), '') is null
       or nullif(trim(p_guest_phone), '') is null then
      raise exception 'Guest identity is required';
    end if;

    p_customer_id := null;

  end if;


  -- ----------------------------------------------------------
  -- Create order first.
  -- Amounts remain zero until validated items are processed.
  -- ----------------------------------------------------------

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
  returning id, order_number
  into v_order_id, v_order_number;


  -- ----------------------------------------------------------
  -- Process every cart item
  -- ----------------------------------------------------------

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop

    begin
      v_product_id :=
        (v_item ->> 'product_id')::uuid;

      v_quantity :=
        (v_item ->> 'quantity')::integer;

    exception
      when others then
        raise exception 'Invalid cart item';
    end;


    if v_quantity is null
       or v_quantity < 1
       or v_quantity > 1000 then
      raise exception 'Invalid product quantity';
    end if;


    -- --------------------------------------------------------
    -- Lock product row.
    -- --------------------------------------------------------

    select *
    into v_product
    from public.products
    where id = v_product_id
      and is_active = true
      and status = 'published'
      and allow_guest_purchase = true
    for update;


    if not found then
      raise exception 'Product unavailable';
    end if;


    -- --------------------------------------------------------
    -- Lock inventory row.
    -- --------------------------------------------------------

    select *
    into v_inventory
    from public.inventory
    where product_id = v_product_id
    for update;


    if not found then
      raise exception 'Product inventory unavailable';
    end if;


    if (
      v_inventory.quantity
      - v_inventory.reserved_quantity
    ) < v_quantity then
      raise exception 'Insufficient stock';
    end if;


    -- --------------------------------------------------------
    -- Calculate using DB price.
    -- --------------------------------------------------------

    v_line_total :=
      round(v_product.price * v_quantity, 2);

    v_subtotal :=
      v_subtotal + v_line_total;


    -- --------------------------------------------------------
    -- Snapshot product information.
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
    -- Reserve inventory.
    -- --------------------------------------------------------

    update public.inventory
    set reserved_quantity =
      reserved_quantity + v_quantity
    where id = v_inventory.id;

  end loop;


  -- ----------------------------------------------------------
  -- Delivery fee
  --
  -- Phase 1:
  -- zero by default.
  -- Delivery engine will be added later.
  -- ----------------------------------------------------------

  v_total := v_subtotal;


  update public.orders
  set
    subtotal = v_subtotal,
    delivery_fee = 0,
    discount_amount = 0,
    total_amount = v_total
  where id = v_order_id;


  return query
  select
    v_order_id,
    v_order_number,
    v_total;

end;
$function$;


-- ============================================================
-- 27. ORDER RPC PRIVILEGES
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
-- 28. FUNCTION PRIVILEGES
-- ============================================================

revoke execute
on function public.set_commerce_updated_at()
from public, anon, authenticated;

revoke execute
on function public.generate_commerce_order_number()
from public, anon;

grant execute
on function public.generate_commerce_order_number()
to authenticated, service_role;


commit;
