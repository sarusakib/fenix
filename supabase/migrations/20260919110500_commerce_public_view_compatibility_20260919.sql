-- Commerce public projection: retain the view's intentionally public projection.
-- Underlying vendor_profiles is private; public access is limited to this view's
-- explicitly selected fields and approved rows.
begin;
alter view public.commerce_public_products set (security_invoker = false);
commit;