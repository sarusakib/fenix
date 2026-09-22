-- FeniX Due Diligence workspace.
begin;

create table if not exists public.investment_due_diligence_checks (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.investment_opportunities(id) on delete cascade,
  investor_id uuid not null references public.profiles(id) on delete cascade,
  check_key text not null,
  status text not null default 'not_started' check (status in ('not_started','reviewing','satisfied','needs_attention','not_applicable')),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(opportunity_id, investor_id, check_key)
);

create index if not exists investment_due_diligence_checks_owner_idx
  on public.investment_due_diligence_checks(investor_id, opportunity_id, updated_at desc);

alter table public.investment_due_diligence_checks enable row level security;

drop policy if exists investment_due_diligence_checks_own_select on public.investment_due_diligence_checks;
create policy investment_due_diligence_checks_own_select
on public.investment_due_diligence_checks for select to authenticated
using ((select auth.uid()) = investor_id);

drop policy if exists investment_due_diligence_checks_own_insert on public.investment_due_diligence_checks;
create policy investment_due_diligence_checks_own_insert
on public.investment_due_diligence_checks for insert to authenticated
with check ((select auth.uid()) = investor_id);

drop policy if exists investment_due_diligence_checks_own_update on public.investment_due_diligence_checks;
create policy investment_due_diligence_checks_own_update
on public.investment_due_diligence_checks for update to authenticated
using ((select auth.uid()) = investor_id)
with check ((select auth.uid()) = investor_id);

drop policy if exists investment_due_diligence_checks_own_delete on public.investment_due_diligence_checks;
create policy investment_due_diligence_checks_own_delete
on public.investment_due_diligence_checks for delete to authenticated
using ((select auth.uid()) = investor_id);

revoke all on public.investment_due_diligence_checks from public, anon;
grant select, insert, update, delete on public.investment_due_diligence_checks to authenticated;

commit;
