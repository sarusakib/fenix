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
) returns table(order_id uuid, order_number text, total_amount numeric)
language plpgsql security definer set search_path = pg_catalog, public as $function$
declare
  v_order_id uuid; v_order_number text; v_subtotal numeric(12,2):=0; v_delivery_fee numeric(12,2):=0; v_total numeric(12,2):=0;
  v_item jsonb; v_product_id uuid; v_quantity integer; v_product public.products%rowtype; v_inventory public.inventory%rowtype;
  v_line_total numeric(12,2); v_user_id uuid; v_seen_product_ids uuid[]:=array[]::uuid[];
begin
  v_user_id:=auth.uid();
  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'Cart is empty'; end if;
  if jsonb_array_length(p_items)>50 then raise exception 'Too many cart items'; end if;
  if p_shipping_name is null or length(trim(p_shipping_name))<2 then raise exception 'Shipping name is required'; end if;
  if p_shipping_phone is null or length(trim(p_shipping_phone))<7 then raise exception 'Shipping phone is required'; end if;
  if p_shipping_address is null or length(trim(p_shipping_address))<5 then raise exception 'Shipping address is required'; end if;
  if v_user_id is not null then
    if p_customer_id is not null and p_customer_id<>v_user_id then raise exception 'Invalid customer'; end if;
    p_customer_id:=v_user_id; p_guest_name:=null; p_guest_phone:=null; p_guest_email:=null;
  else
    if nullif(trim(p_guest_name),'') is null or nullif(trim(p_guest_phone),'') is null then raise exception 'Guest identity is required'; end if;
    p_customer_id:=null;
  end if;
  insert into public.orders(customer_id,guest_name,guest_phone,guest_email,shipping_name,shipping_phone,shipping_address,shipping_area,shipping_upazila,shipping_district,customer_note)
  values(p_customer_id,nullif(trim(p_guest_name),''),nullif(trim(p_guest_phone),''),nullif(trim(p_guest_email),''),trim(p_shipping_name),trim(p_shipping_phone),trim(p_shipping_address),nullif(trim(p_shipping_area),''),nullif(trim(p_shipping_upazila),''),nullif(trim(p_shipping_district),''),nullif(trim(p_customer_note),''))
  returning id,order_number into v_order_id,v_order_number;
  for v_item in select value from jsonb_array_elements(p_items) loop
    begin v_product_id:=(v_item->>'product_id')::uuid; v_quantity:=(v_item->>'quantity')::integer; exception when others then raise exception 'Invalid cart item'; end;
    if v_quantity is null or v_quantity<1 or v_quantity>1000 then raise exception 'Invalid product quantity'; end if;
    if v_product_id=any(v_seen_product_ids) then raise exception 'Duplicate product in cart'; end if;
    v_seen_product_ids:=array_append(v_seen_product_ids,v_product_id);
    select p.* into v_product from public.products p join public.vendor_profiles vp on vp.id=p.vendor_id
      where p.id=v_product_id and p.is_active=true and p.status='published' and vp.status='approved'
      and (v_user_id is not null or p.allow_guest_purchase=true) for update;
    if not found then raise exception 'Product unavailable'; end if;
    select * into v_inventory from public.inventory where product_id=v_product_id for update;
    if not found then raise exception 'Product inventory unavailable'; end if;
    if (v_inventory.quantity-v_inventory.reserved_quantity)<v_quantity then raise exception 'Insufficient stock'; end if;
    v_line_total:=round(v_product.price*v_quantity,2); v_subtotal:=v_subtotal+v_line_total;
    insert into public.order_items(order_id,product_id,vendor_id,product_name,product_sku,quantity,unit_price,discount_amount,line_total)
    values(v_order_id,v_product.id,v_product.vendor_id,coalesce(nullif(v_product.name_bn,''),v_product.name_en),v_product.sku,v_quantity,v_product.price,0,v_line_total);
    update public.inventory set reserved_quantity=reserved_quantity+v_quantity where id=v_inventory.id;
  end loop;
  select public.calculate_commerce_delivery_fee(p_shipping_district,p_shipping_upazila,v_subtotal) into v_delivery_fee;
  v_total:=v_subtotal+coalesce(v_delivery_fee,0);
  update public.orders set subtotal=v_subtotal,delivery_fee=coalesce(v_delivery_fee,0),discount_amount=0,total_amount=v_total where id=v_order_id;
  return query select v_order_id,v_order_number,v_total;
end;$function$;

revoke all on function public.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) to anon, authenticated;