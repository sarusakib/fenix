-- FeniX Investment — least-privilege table grants
revoke all on table public.investment_profiles,
  public.investment_opportunities,
  public.investment_documents,
  public.investment_interests,
  public.investment_deals,
  public.investment_updates,
  public.investment_reports,
  public.investment_audit_logs
from anon;

grant select on table public.investment_opportunities, public.investment_updates to anon;

revoke all on table public.investment_profiles,
  public.investment_opportunities,
  public.investment_documents,
  public.investment_interests,
  public.investment_deals,
  public.investment_updates,
  public.investment_reports,
  public.investment_audit_logs
from authenticated;

grant select, insert, update on table public.investment_profiles to authenticated;
grant select, insert, update on table public.investment_opportunities to authenticated;
grant select, insert, update on table public.investment_documents to authenticated;
grant select, insert, update on table public.investment_interests to authenticated;
grant select, insert on table public.investment_deals to authenticated;
grant select, insert, update on table public.investment_updates to authenticated;
grant select, insert, update on table public.investment_reports to authenticated;
grant select on table public.investment_audit_logs to authenticated;
