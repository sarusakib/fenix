-- Move trigger-only SECURITY DEFINER functions out of the exposed public schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

do $$
begin
  if to_regprocedure('public.finalize_investment_deal_after_confirmation()') is not null then
    alter function public.finalize_investment_deal_after_confirmation() set schema private;
  end if;
  if to_regprocedure('public.guard_investment_deal_mutation()') is not null then
    alter function public.guard_investment_deal_mutation() set schema private;
  end if;
  if to_regprocedure('public.log_investment_audit()') is not null then
    alter function public.log_investment_audit() set schema private;
  end if;
  if to_regprocedure('public.prevent_investment_owner_tampering()') is not null then
    alter function public.prevent_investment_owner_tampering() set schema private;
  end if;
  if to_regprocedure('public.sync_investment_raised_amount()') is not null then
    alter function public.sync_investment_raised_amount() set schema private;
  end if;
  if to_regprocedure('public.prevent_investment_overfunding()') is not null then
    alter function public.prevent_investment_overfunding() set schema private;
  end if;
end
$$;

revoke all on function private.finalize_investment_deal_after_confirmation() from public, anon, authenticated;
revoke all on function private.guard_investment_deal_mutation() from public, anon, authenticated;
revoke all on function private.log_investment_audit() from public, anon, authenticated;
revoke all on function private.prevent_investment_owner_tampering() from public, anon, authenticated;
revoke all on function private.sync_investment_raised_amount() from public, anon, authenticated;
revoke all on function private.prevent_investment_overfunding() from public, anon, authenticated;
