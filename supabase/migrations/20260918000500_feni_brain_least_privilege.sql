-- Feni Brain least-privilege hardening
-- Public users need read-only access to published knowledge.
-- Administrative/update tables are not client-writable.

begin;

revoke all on table
  public.fenix_brain_sources,
  public.fenix_brain_locations,
  public.fenix_brain_location_aliases,
  public.fenix_brain_facts,
  public.fenix_brain_documents,
  public.fenix_brain_chunks,
  public.fenix_brain_intents,
  public.fenix_brain_query_terms,
  public.fenix_brain_source_refresh,
  public.fenix_brain_update_runs,
  public.fenix_brain_update_candidates
from anon, authenticated;

grant select on table
  public.fenix_brain_sources,
  public.fenix_brain_locations,
  public.fenix_brain_location_aliases,
  public.fenix_brain_facts,
  public.fenix_brain_documents,
  public.fenix_brain_chunks,
  public.fenix_brain_intents,
  public.fenix_brain_query_terms
to anon, authenticated;

grant select on table public.fenix_brain_source_refresh to authenticated;
grant select on table public.fenix_brain_update_runs to authenticated;
grant select, update on table public.fenix_brain_update_candidates to authenticated;

commit;
