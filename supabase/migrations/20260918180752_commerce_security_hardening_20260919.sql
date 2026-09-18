begin;

revoke all on table public.vendor_profiles from anon;
revoke all on table public.orders from anon;
revoke all on table public.order_items from anon;
revoke all on table public.inventory from anon;
revoke all on table public.commerce_order_vendor_status from anon;
revoke all on table public.commerce_return_requests from anon;

revoke all on table public.products from anon;
grant select on table public.products to anon;

revoke all on table public.product_images from anon;
grant select on table public.product_images to anon;

revoke all on table public.product_reviews from anon;
grant select on table public.product_reviews to anon;

revoke all on table public.commerce_delivery_rules from anon;
grant select on table public.commerce_delivery_rules to anon;

revoke all on function public.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) to anon, authenticated;

revoke all on function public.apply_commerce_delivery_fee() from public, anon;
revoke all on function public.set_commerce_updated_at() from public, anon;
revoke all on function public.ensure_commerce_order_vendor_status() from public, anon;
revoke all on function public.ensure_product_inventory() from public, anon;

commit;