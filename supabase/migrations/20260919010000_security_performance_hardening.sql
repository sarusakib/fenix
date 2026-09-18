-- FeniX database security/performance hardening.
-- Keeps guest checkout/public-read RPCs available because Commerce intentionally
-- supports guest checkout and public vendor/delivery lookups.

DO $$
DECLARE r record; u text; c text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies WHERE schemaname='public'
      AND (coalesce(qual,'') ~* 'auth\.[a-z_]+\s*\(' OR coalesce(with_check,'') ~* 'auth\.[a-z_]+\s*\(')
  LOOP
    u:=r.qual; c:=r.with_check;
    IF u IS NOT NULL THEN u:=regexp_replace(u,'auth\.([a-z_]+)\s*\(\s*\)','(select auth.\1())','gi'); END IF;
    IF c IS NOT NULL THEN c:=regexp_replace(c,'auth\.([a-z_]+)\s*\(\s*\)','(select auth.\1())','gi'); END IF;
    IF u IS NOT NULL AND c IS NOT NULL THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s) WITH CHECK (%s)',r.policyname,r.schemaname,r.tablename,u,c);
    ELSIF u IS NOT NULL THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s)',r.policyname,r.schemaname,r.tablename,u);
    ELSE
      EXECUTE format('ALTER POLICY %I ON %I.%I WITH CHECK (%s)',r.policyname,r.schemaname,r.tablename,c);
    END IF;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS product_reviews_order_id_idx ON public.product_reviews(order_id);

ALTER POLICY "Public can view active delivery rules" ON public.commerce_delivery_rules TO anon;
DROP POLICY IF EXISTS "Admins can view all delivery rules" ON public.commerce_delivery_rules;
DROP POLICY IF EXISTS "Authenticated can view delivery rules" ON public.commerce_delivery_rules;
CREATE POLICY "Authenticated can view delivery rules" ON public.commerce_delivery_rules FOR SELECT TO authenticated USING (is_active=true OR is_fenix_admin());

DROP POLICY IF EXISTS "Admins can view all vendor order statuses" ON public.commerce_order_vendor_status;
DROP POLICY IF EXISTS "Customers can view own vendor order statuses" ON public.commerce_order_vendor_status;
DROP POLICY IF EXISTS "Vendors can view own vendor order statuses" ON public.commerce_order_vendor_status;
DROP POLICY IF EXISTS "Authenticated can view own or admin vendor order statuses" ON public.commerce_order_vendor_status;
CREATE POLICY "Authenticated can view own or admin vendor order statuses" ON public.commerce_order_vendor_status FOR SELECT TO authenticated USING (
 is_fenix_admin() OR
 EXISTS (SELECT 1 FROM public.orders o WHERE o.id=commerce_order_vendor_status.order_id AND o.customer_id=(select auth.uid())) OR
 EXISTS (SELECT 1 FROM public.vendor_profiles v WHERE v.id=commerce_order_vendor_status.vendor_id AND v.user_id=(select auth.uid()))
);

DROP POLICY IF EXISTS "Admins can view all returns" ON public.commerce_return_requests;
DROP POLICY IF EXISTS "Customers can view own returns" ON public.commerce_return_requests;
DROP POLICY IF EXISTS "Sellers can view own returns" ON public.commerce_return_requests;
DROP POLICY IF EXISTS "Authenticated can view own or admin returns" ON public.commerce_return_requests;
CREATE POLICY "Authenticated can view own or admin returns" ON public.commerce_return_requests FOR SELECT TO authenticated USING (
 is_fenix_admin() OR customer_id=(select auth.uid()) OR
 EXISTS (SELECT 1 FROM public.order_items oi JOIN public.vendor_profiles v ON v.id=oi.vendor_id WHERE oi.id=commerce_return_requests.order_item_id AND v.user_id=(select auth.uid()))
);

ALTER POLICY "Public can read active Feni Brain intents" ON public.fenix_brain_intents TO anon;
DROP POLICY IF EXISTS "Admins can manage Feni Brain intents" ON public.fenix_brain_intents;
DROP POLICY IF EXISTS "Authenticated can read active Feni Brain intents" ON public.fenix_brain_intents;
DROP POLICY IF EXISTS "Admins can insert Feni Brain intents" ON public.fenix_brain_intents;
DROP POLICY IF EXISTS "Admins can update Feni Brain intents" ON public.fenix_brain_intents;
DROP POLICY IF EXISTS "Admins can delete Feni Brain intents" ON public.fenix_brain_intents;
CREATE POLICY "Authenticated can read active Feni Brain intents" ON public.fenix_brain_intents FOR SELECT TO authenticated USING (is_active=true);
CREATE POLICY "Admins can insert Feni Brain intents" ON public.fenix_brain_intents FOR INSERT TO authenticated WITH CHECK (is_fenix_admin());
CREATE POLICY "Admins can update Feni Brain intents" ON public.fenix_brain_intents FOR UPDATE TO authenticated USING (is_fenix_admin()) WITH CHECK (is_fenix_admin());
CREATE POLICY "Admins can delete Feni Brain intents" ON public.fenix_brain_intents FOR DELETE TO authenticated USING (is_fenix_admin());

ALTER POLICY "Public can read Feni Brain query terms" ON public.fenix_brain_query_terms TO anon;
DROP POLICY IF EXISTS "Admins can manage Feni Brain query terms" ON public.fenix_brain_query_terms;
DROP POLICY IF EXISTS "Authenticated can read Feni Brain query terms" ON public.fenix_brain_query_terms;
DROP POLICY IF EXISTS "Admins can insert Feni Brain query terms" ON public.fenix_brain_query_terms;
DROP POLICY IF EXISTS "Admins can update Feni Brain query terms" ON public.fenix_brain_query_terms;
DROP POLICY IF EXISTS "Admins can delete Feni Brain query terms" ON public.fenix_brain_query_terms;
CREATE POLICY "Authenticated can read Feni Brain query terms" ON public.fenix_brain_query_terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert Feni Brain query terms" ON public.fenix_brain_query_terms FOR INSERT TO authenticated WITH CHECK (is_fenix_admin());
CREATE POLICY "Admins can update Feni Brain query terms" ON public.fenix_brain_query_terms FOR UPDATE TO authenticated USING (is_fenix_admin()) WITH CHECK (is_fenix_admin());
CREATE POLICY "Admins can delete Feni Brain query terms" ON public.fenix_brain_query_terms FOR DELETE TO authenticated USING (is_fenix_admin());

DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Customers can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated can view own or admin order items" ON public.order_items;
CREATE POLICY "Authenticated can view own or admin order items" ON public.order_items FOR SELECT TO authenticated USING (
 is_fenix_admin() OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_items.order_id AND o.customer_id=(select auth.uid()))
);

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated can view own or vendor or admin orders" ON public.orders;
CREATE POLICY "Authenticated can view own or vendor or admin orders" ON public.orders FOR SELECT TO authenticated USING (
 is_fenix_admin() OR customer_id=(select auth.uid()) OR
 EXISTS (SELECT 1 FROM public.order_items oi JOIN public.vendor_profiles vp ON vp.id=oi.vendor_id WHERE oi.order_id=orders.id AND vp.user_id=(select auth.uid()))
);

DROP POLICY IF EXISTS "Vendors can manage own product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can view all product image rows" ON public.product_images;
DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
DROP POLICY IF EXISTS "Vendors can view own product image rows" ON public.product_images;
DROP POLICY IF EXISTS "Authenticated can view product images" ON public.product_images;
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT TO anon USING (
 EXISTS (SELECT 1 FROM public.products p JOIN public.vendor_profiles vp ON vp.id=p.vendor_id WHERE p.id=product_images.product_id AND p.is_active=true AND p.status='published' AND vp.status='approved')
);
CREATE POLICY "Authenticated can view product images" ON public.product_images FOR SELECT TO authenticated USING (
 is_fenix_admin() OR
 EXISTS (SELECT 1 FROM public.products p JOIN public.vendor_profiles vp ON vp.id=p.vendor_id WHERE p.id=product_images.product_id AND p.is_active=true AND p.status='published' AND vp.status='approved') OR
 EXISTS (SELECT 1 FROM public.products p JOIN public.vendor_profiles v ON v.id=p.vendor_id WHERE p.id=product_images.product_id AND v.user_id=(select auth.uid()))
);

DROP POLICY IF EXISTS "Admins can view all product reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Customers can view own product reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Public can view published product reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Sellers can view reviews for own products" ON public.product_reviews;
DROP POLICY IF EXISTS "Authenticated can view own or published or admin reviews" ON public.product_reviews;
CREATE POLICY "Public can view published product reviews" ON public.product_reviews FOR SELECT TO anon USING (status='published');
CREATE POLICY "Authenticated can view own or published or admin reviews" ON public.product_reviews FOR SELECT TO authenticated USING (
 is_fenix_admin() OR status='published' OR customer_id=(select auth.uid()) OR
 EXISTS (SELECT 1 FROM public.products p JOIN public.vendor_profiles v ON v.id=p.vendor_id WHERE p.id=product_reviews.product_id AND v.user_id=(select auth.uid()))
);

DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
DROP POLICY IF EXISTS "Vendors can view own products" ON public.products;
DROP POLICY IF EXISTS "Authenticated can view own or published or admin products" ON public.products;
CREATE POLICY "Public can view published products" ON public.products FOR SELECT TO anon USING (
 is_active=true AND status='published' AND EXISTS (SELECT 1 FROM public.vendor_profiles vp WHERE vp.id=products.vendor_id AND vp.status='approved')
);
CREATE POLICY "Authenticated can view own or published or admin products" ON public.products FOR SELECT TO authenticated USING (
 is_fenix_admin() OR
 (is_active=true AND status='published' AND EXISTS (SELECT 1 FROM public.vendor_profiles vp WHERE vp.id=products.vendor_id AND vp.status='approved')) OR
 EXISTS (SELECT 1 FROM public.vendor_profiles v WHERE v.id=products.vendor_id AND v.user_id=(select auth.uid()))
);

DROP POLICY IF EXISTS "Admins can view all vendor profiles" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Users can view own vendor profile" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Authenticated can view own or admin vendor profile" ON public.vendor_profiles;
CREATE POLICY "Authenticated can view own or admin vendor profile" ON public.vendor_profiles FOR SELECT TO authenticated USING (is_fenix_admin() OR user_id=(select auth.uid()));

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_commerce_delivery_fee(text,text,numeric) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_vendor_shop(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_commerce_delivery_fee(text,text,numeric) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_vendor_shop(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_commerce_order(jsonb,uuid,text,text,text,text,text,text,text,text,text,text) TO anon, authenticated, service_role;
