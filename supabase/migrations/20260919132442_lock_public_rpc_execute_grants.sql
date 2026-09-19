begin;

revoke all on function public.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.create_commerce_return_request(uuid,text,text) from public, anon, authenticated;
revoke all on function public.create_product_review(uuid,integer,text,text) from public, anon, authenticated;
revoke all on function public.get_public_vendor_shop(text) from public, anon, authenticated;
revoke all on function public.is_fenix_admin() from public, anon, authenticated;
revoke all on function public.seller_reply_to_product_review(uuid,text) from public, anon, authenticated;
revoke all on function public.set_commerce_return_status(uuid,text,text,numeric) from public, anon, authenticated;
revoke all on function public.set_product_primary_image(uuid) from public, anon, authenticated;
revoke all on function public.set_vendor_order_status(uuid,text) from public, anon, authenticated;
revoke all on function public.update_vendor_product(uuid,text,text,text,text,text,text,numeric,numeric,uuid,boolean) from public, anon, authenticated;
revoke all on function public.update_vendor_profile(text,text,text,text,text,text,text) from public, anon, authenticated;

grant execute on function public.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) to anon, authenticated, service_role;
grant execute on function public.create_commerce_return_request(uuid,text,text) to authenticated, service_role;
grant execute on function public.create_product_review(uuid,integer,text,text) to authenticated, service_role;
grant execute on function public.get_public_vendor_shop(text) to anon, authenticated, service_role;
grant execute on function public.is_fenix_admin() to authenticated, service_role;
grant execute on function public.seller_reply_to_product_review(uuid,text) to authenticated, service_role;
grant execute on function public.set_commerce_return_status(uuid,text,text,numeric) to authenticated, service_role;
grant execute on function public.set_product_primary_image(uuid) to authenticated, service_role;
grant execute on function public.set_vendor_order_status(uuid,text) to authenticated, service_role;
grant execute on function public.update_vendor_product(uuid,text,text,text,text,text,text,numeric,numeric,uuid,boolean) to authenticated, service_role;
grant execute on function public.update_vendor_profile(text,text,text,text,text,text,text) to authenticated, service_role;

commit;