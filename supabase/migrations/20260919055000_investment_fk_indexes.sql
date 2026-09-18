-- FeniX Investment — foreign-key covering indexes
create index if not exists investment_audit_logs_actor_id_idx on public.investment_audit_logs (actor_id);
create index if not exists investment_documents_owner_id_idx on public.investment_documents (owner_id);
create index if not exists investment_documents_reviewed_by_idx on public.investment_documents (reviewed_by);
create index if not exists investment_opportunities_business_id_idx on public.investment_opportunities (business_id);
create index if not exists investment_opportunities_verified_by_idx on public.investment_opportunities (verified_by);
create index if not exists investment_profiles_verified_by_idx on public.investment_profiles (verified_by);
create index if not exists investment_reports_opportunity_id_idx on public.investment_reports (opportunity_id);
create index if not exists investment_reports_reporter_id_idx on public.investment_reports (reporter_id);
create index if not exists investment_reports_resolved_by_idx on public.investment_reports (resolved_by);
create index if not exists investment_updates_author_id_idx on public.investment_updates (author_id);
