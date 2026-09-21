begin;
alter view public.fenix_public_profiles set (security_invoker=true);
alter view public.fenix_public_feed set (security_invoker=true);
commit;