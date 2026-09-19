-- FeniX Master Foundation: safe defaults, policy consolidation and FK performance.
begin;

alter table public.profiles
  alter column role set default 'user';

drop policy if exists "Authenticated can read active Feni Brain intents" on public.fenix_brain_intents;
drop policy if exists "Public can read active Feni Brain intents" on public.fenix_brain_intents;
create policy "Public can read active Feni Brain intents"
  on public.fenix_brain_intents for select to anon, authenticated
  using (is_active = true);

drop policy if exists "Authenticated can read Feni Brain query terms" on public.fenix_brain_query_terms;
drop policy if exists "Public can read Feni Brain query terms" on public.fenix_brain_query_terms;
create policy "Public can read Feni Brain query terms"
  on public.fenix_brain_query_terms for select to anon, authenticated
  using (true);

create index if not exists business_start_activity_actor_id_idx on public.business_start_activity (actor_id);
create index if not exists business_start_documents_owner_id_idx on public.business_start_documents (owner_id);
create index if not exists business_start_documents_reviewed_by_idx on public.business_start_documents (reviewed_by);
create index if not exists business_start_projects_business_id_idx on public.business_start_projects (business_id);
create index if not exists investment_messages_sender_id_idx on public.investment_messages (sender_id);

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from public, anon, authenticated;

commit;
