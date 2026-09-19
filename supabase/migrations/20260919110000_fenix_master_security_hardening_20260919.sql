-- FeniX Master security hardening: least-privilege public access and safe public commerce view.
begin;

-- Profiles contain authorization role and private phone data.
-- They are not a public directory; users/admins only need authenticated access.
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can view own profile." on public.profiles;
create policy "Users can view own profile."
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id or public.is_fenix_admin());

revoke select on table public.profiles from anon;

-- Anonymous users must not have direct review mutation privileges.
-- RLS already requires an authenticated reviewer, but the database grant should
-- reflect that authorization boundary as well.
revoke insert, update on table public.business_reviews from anon;

-- The public commerce view is read-only from the API surface.
revoke insert, update, delete, references, trigger on public.commerce_public_products from anon, authenticated;
grant select on public.commerce_public_products to anon, authenticated;

-- Make the view honor underlying table RLS instead of relying on owner bypass.
alter view public.commerce_public_products set (security_invoker = true);

commit;
