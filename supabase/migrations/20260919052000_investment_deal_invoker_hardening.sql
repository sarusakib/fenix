-- FeniX Investment — keep callable deal RPCs SECURITY INVOKER.
-- Row/column-sensitive mutation rules are enforced by RLS + trigger.

create or replace function public.guard_investment_deal_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if public.is_fenix_admin() then
    return new;
  end if;

  if new.id <> old.id
     or new.opportunity_id <> old.opportunity_id
     or new.investor_id <> old.investor_id then
    raise exception 'Deal identity fields cannot be changed.';
  end if;

  if v_uid = old.investor_id then
    if old.status <> 'funding_pending' then
      raise exception 'Investor confirmation is only available while funding is pending.';
    end if;

    if new.agreed_amount is distinct from old.agreed_amount
       or new.ownership_percentage is distinct from old.ownership_percentage
       or new.structure is distinct from old.structure
       or new.status is distinct from old.status
       or new.terms_note is distinct from old.terms_note
       or new.owner_confirmed_at is distinct from old.owner_confirmed_at
       or new.funded_at is distinct from old.funded_at
       or new.started_at is distinct from old.started_at
       or new.completed_at is distinct from old.completed_at then
      raise exception 'Investor can only change their funding confirmation.';
    end if;
  elsif exists (
    select 1 from public.investment_opportunities o
    where o.id = old.opportunity_id
      and o.owner_id = v_uid
  ) then
    if old.status in ('funded','active','completed','cancelled')
       and new.status is distinct from old.status then
      raise exception 'This deal is no longer editable.';
    end if;

    if new.investor_confirmed_at is distinct from old.investor_confirmed_at then
      raise exception 'Only the investor can set investor confirmation.';
    end if;

    if new.status not in ('proposed','agreed','funding_pending','cancelled') then
      raise exception 'Invalid owner deal status.';
    end if;
  else
    raise exception 'Only a deal participant can update this deal.';
  end if;

  return new;
end;
$$;

drop trigger if exists investment_deal_mutation_guard on public.investment_deals;
create trigger investment_deal_mutation_guard
before update on public.investment_deals
for each row execute function public.guard_investment_deal_mutation();

create or replace function public.finalize_investment_deal_after_confirmation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'funding_pending'
     and new.investor_confirmed_at is not null
     and new.owner_confirmed_at is not null then
    update public.investment_deals
    set status = 'funded',
        funded_at = coalesce(funded_at, timezone('utc', now())),
        started_at = coalesce(started_at, timezone('utc', now())),
        updated_at = timezone('utc', now())
    where id = new.id
      and status = 'funding_pending';
  end if;
  return new;
end;
$$;

drop trigger if exists investment_deal_confirmation_finalize on public.investment_deals;
create trigger investment_deal_confirmation_finalize
after update of investor_confirmed_at, owner_confirmed_at on public.investment_deals
for each row execute function public.finalize_investment_deal_after_confirmation();

drop policy if exists "investment_deals_parties_update" on public.investment_deals;
create policy "investment_deals_parties_update"
  on public.investment_deals for update to authenticated
  using (
    investor_id = (select auth.uid())
    or exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_deals.opportunity_id
        and o.owner_id = (select auth.uid())
    )
    or public.is_fenix_admin()
  )
  with check (
    investor_id = (select auth.uid())
    or exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_deals.opportunity_id
        and o.owner_id = (select auth.uid())
    )
    or public.is_fenix_admin()
  );

grant update on table public.investment_deals to authenticated;

create or replace function public.owner_progress_investment_deal(
  p_deal_id uuid,
  p_status text,
  p_agreed_amount numeric default null,
  p_ownership_percentage numeric default null,
  p_terms_note text default null
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_owner_id uuid;
  v_old_status text;
begin
  select o.owner_id, d.status
    into v_owner_id, v_old_status
  from public.investment_deals d
  join public.investment_opportunities o on o.id = d.opportunity_id
  where d.id = p_deal_id;

  if v_owner_id is null or v_owner_id <> (select auth.uid()) then
    raise exception 'Only the opportunity owner can update deal terms.';
  end if;

  if p_status not in ('proposed','agreed','funding_pending','cancelled') then
    raise exception 'Invalid owner deal status.';
  end if;

  if v_old_status in ('funded','active','completed','cancelled') and p_status <> v_old_status then
    raise exception 'This deal can no longer be changed.';
  end if;

  update public.investment_deals
  set status = p_status,
      agreed_amount = coalesce(p_agreed_amount, agreed_amount),
      ownership_percentage = coalesce(p_ownership_percentage, ownership_percentage),
      terms_note = coalesce(p_terms_note, terms_note),
      updated_at = timezone('utc', now())
  where id = p_deal_id;

  return found;
end;
$$;

create or replace function public.investor_confirm_investment_deal(p_deal_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_status text;
begin
  select status into v_status
  from public.investment_deals
  where id = p_deal_id
    and investor_id = (select auth.uid());

  if v_status is null then
    raise exception 'Investment deal not found.';
  end if;
  if v_status <> 'funding_pending' then
    raise exception 'Deal must be funding-pending before confirmation.';
  end if;

  update public.investment_deals
  set investor_confirmed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = p_deal_id
    and investor_id = (select auth.uid());

  return found;
end;
$$;

create or replace function public.owner_confirm_investment_deal(p_deal_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_status text;
begin
  select d.status into v_status
  from public.investment_deals d
  join public.investment_opportunities o on o.id = d.opportunity_id
  where d.id = p_deal_id
    and o.owner_id = (select auth.uid());

  if v_status is null then
    raise exception 'Investment deal not found.';
  end if;
  if v_status <> 'funding_pending' then
    raise exception 'Deal must be funding-pending before confirmation.';
  end if;

  update public.investment_deals
  set owner_confirmed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = p_deal_id;

  return found;
end;
$$;

revoke execute on function public.owner_progress_investment_deal(uuid,text,numeric,numeric,text) from anon;
revoke execute on function public.investor_confirm_investment_deal(uuid) from anon;
revoke execute on function public.owner_confirm_investment_deal(uuid) from anon;
grant execute on function public.owner_progress_investment_deal(uuid,text,numeric,numeric,text) to authenticated;
grant execute on function public.investor_confirm_investment_deal(uuid) to authenticated;
grant execute on function public.owner_confirm_investment_deal(uuid) to authenticated;
