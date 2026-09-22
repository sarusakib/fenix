-- Restore security-invoker behavior after replacing public projection views.
begin;

alter view public.fenix_public_profiles set (security_invoker = true);
alter view public.fenix_public_blood_requests set (security_invoker = true);
alter view public.fenix_public_blood_donors set (security_invoker = true);
alter view public.fenix_public_ambulance_providers set (security_invoker = true);
alter view public.fenix_brain_pulse_terms set (security_invoker = true);
alter view public.fenix_brain_pulse_intents set (security_invoker = true);

commit;
