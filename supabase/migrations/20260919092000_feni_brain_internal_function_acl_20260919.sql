-- Feni Brain: the legacy internal source-claim function is no longer API-callable.
-- The refresh Edge Function uses *_v2 instead.
revoke all
  on function public.claim_due_feni_brain_sources(integer)
  from public, anon, authenticated;
