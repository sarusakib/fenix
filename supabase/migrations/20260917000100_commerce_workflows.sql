begin;

create or replace function public.set_vendor_product_inventory(
  p_product_id uuid,
  p_quantity integer,
  p_low_stock_threshold integer default 5
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_quantity < 0 or p_quantity > 100000000 then raise exception 'Invalid inventory quantity'; end if;
  if p_low_stock_threshold < 0 or p_low_stock_threshold > 100000000 then raise exception 'Invalid low stock threshold'; end if;

  if not exists (
    select 1 from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where p.id = p_product_id and v.user_id = v_user_id and v.status = 'approved'
  ) then
    raise exception 'Product not found or seller is not approved';
  end if;

  insert into public.inventory (product_id, quantity, reserved_quantity, low_stock_threshold)
  values (p_product_id, greatest(p_quantity, 0), 0, p_low_stock_threshold)
  on conflict (product_id) do update
    set quantity = greatest(excluded.quantity, public.inventory.reserved_quantity),
        low_stock_threshold = excluded.low_stock_threshold,
        updated_at = timezone('utc', now());
  return true;
end;
$function$;

revoke all on function public.set_vendor_product_inventory(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.set_vendor_product_inventory(uuid, integer, integer) to authenticated;

create or replace function public.publish_vendor_product(p_product_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if not exists (
    select 1
    from public.products p
    join public.vendor_profiles v on v.id = p.vendor_id
    where p.id = p_product_id
      and v.user_id = v_user_id
      and v.status = 'approved'
      and nullif(trim(coalesce(p.name_bn, '')), '') is not null
      and nullif(trim(coalesce(p.name_en, '')), '') is not null
      and p.price >= 0
  ) then raise exception 'Product cannot be published'; end if;

  update public.products
  set status = 'published', is_active = true, updated_at = timezone('utc', now())
  where id = p_product_id;
  return true;
end;
$function$;

revoke all on function public.publish_vendor_product(uuid) from public, anon, authenticated;
grant execute on function public.publish_vendor_product(uuid) to authenticated;

create or replace function public.archive_vendor_product(p_product_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  update public.products p
  set status = 'archived', is_active = false, updated_at = timezone('utc', now())
  from public.vendor_profiles v
  where p.id = p_product_id and v.id = p.vendor_id and v.user_id = v_user_id;
  if not found then raise exception 'Product not found'; end if;
  return true;
end;
$function$;

revoke all on function public.archive_vendor_product(uuid) from public, anon, authenticated;
grant execute on function public.archive_vendor_product(uuid) to authenticated;

commit;
