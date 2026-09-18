-- FeniX function execution hardening.
-- Intentionally keeps public Commerce RPCs that are required for guest/public flows.
-- No indexes are deleted.

BEGIN;

ALTER FUNCTION public.calculate_commerce_delivery_fee(text, text, numeric) SECURITY INVOKER;

REVOKE EXECUTE ON FUNCTION public.admin_delete_delivery_rule(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_set_order_payment_status(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_set_review_status(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_set_vendor_status(uuid, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_upsert_delivery_rule(uuid, text, text, numeric, numeric, boolean, integer) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.ensure_commerce_order_vendor_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_product_inventory() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fenix_brain_internal_refresh_secret() FROM PUBLIC, anon, authenticated;

COMMIT;
