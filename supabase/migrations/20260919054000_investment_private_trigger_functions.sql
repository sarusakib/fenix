-- Move trigger-only SECURITY DEFINER functions out of the exposed public schema.
-- Their triggers keep working because PostgreSQL preserves function identity on SET SCHEMA.
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

alter function public.finalize_investment_deal_after_confirmation() set schema private;
alter function public.guard_investment_deal_mutation() set schema private;
alter function public.log_investment_audit() set schema private;
alter function public.prevent_investment_owner_tampering() set schema private;
alter function public.sync_investment_raised_amount() set schema private;
alter function public.prevent_investment_overfunding() set schema private;

revoke all on function private.finalize_investment_deal_after_confirmation() from public, anon, authenticated;
revoke all on function private.guard_investment_deal_mutation() from public, anon, authenticated;
revoke all on function private.log_investment_audit() from public, anon, authenticated;
revoke all on function private.prevent_investment_owner_tampering() from public, anon, authenticated;
revoke all on function private.sync_investment_raised_amount() from public, anon, authenticated;
revoke all on function private.prevent_investment_overfunding() from public, anon, authenticated;
