-- FeniX Investment — secure party messaging and performance fields
alter table public.investment_updates
  add column if not exists profit_actual numeric(14,2) null check (profit_actual is null or profit_actual >= 0),
  add column if not exists return_actual_pct numeric(7,3) null check (return_actual_pct is null or (return_actual_pct >= -100 and return_actual_pct <= 1000));

create table if not exists public.investment_messages (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.investment_opportunities(id) on delete cascade,
  deal_id uuid null references public.investment_deals(id) on delete set null,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz null,
  check (sender_id <> recipient_id)
);

create index if not exists investment_messages_opportunity_idx
  on public.investment_messages (opportunity_id, created_at desc);
create index if not exists investment_messages_deal_idx
  on public.investment_messages (deal_id, created_at desc);
create index if not exists investment_messages_recipient_idx
  on public.investment_messages (recipient_id, read_at, created_at desc);

alter table public.investment_messages enable row level security;

drop policy if exists "investment_messages_parties_read" on public.investment_messages;
create policy "investment_messages_parties_read"
  on public.investment_messages for select to authenticated
  using (
    sender_id = (select auth.uid())
    or recipient_id = (select auth.uid())
    or public.is_fenix_admin()
  );

drop policy if exists "investment_messages_parties_insert" on public.investment_messages;
create policy "investment_messages_parties_insert"
  on public.investment_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and (
      exists (
        select 1
        from public.investment_opportunities o
        join public.investment_interests i on i.opportunity_id = o.id
        where o.id = investment_messages.opportunity_id
          and o.owner_id = (select auth.uid())
          and i.investor_id = investment_messages.recipient_id
          and i.status not in ('declined','withdrawn')
      )
      or exists (
        select 1
        from public.investment_opportunities o
        join public.investment_interests i on i.opportunity_id = o.id
        where o.id = investment_messages.opportunity_id
          and i.investor_id = (select auth.uid())
          and o.owner_id = investment_messages.recipient_id
          and i.status not in ('declined','withdrawn')
      )
    )
  );

drop policy if exists "investment_messages_recipient_read_update" on public.investment_messages;
create policy "investment_messages_recipient_read_update"
  on public.investment_messages for update to authenticated
  using (recipient_id = (select auth.uid()) or public.is_fenix_admin())
  with check (recipient_id = (select auth.uid()) or public.is_fenix_admin());

grant select, insert, update on table public.investment_messages to authenticated;

drop trigger if exists investment_audit_messages on public.investment_messages;
create trigger investment_audit_messages
after insert on public.investment_messages
for each row execute function private.log_investment_audit();
