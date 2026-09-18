-- FeniX Investment — final mutation/state integrity hardening
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Never let a normal owner create an already-published or verified opportunity.
drop policy if exists "investment_opportunities_owner_insert" on public.investment_opportunities;
create policy "investment_opportunities_owner_insert"
on public.investment_opportunities
for insert to authenticated
with check (
  (
    (select auth.uid()) = owner_id
    and status = 'draft'
    and verification_status = 'unverified'
    and raised_amount = 0
  )
  or public.is_fenix_admin()
);

-- A linked business must belong to the opportunity owner.
create or replace function private.prevent_investment_opportunity_business_tampering()
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

  if new.owner_id <> v_uid then
    raise exception 'Opportunity owner cannot be changed.';
  end if;

  if new.business_id is not null
     and not exists (
       select 1
       from public.businesses b
       where b.id = new.business_id
         and b.owner_id = v_uid
     ) then
    raise exception 'The linked business must belong to the opportunity owner.';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'draft'
       or new.verification_status <> 'unverified'
       or new.raised_amount <> 0 then
      raise exception 'New opportunities must start as draft and unverified.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists investment_opportunity_business_guard on public.investment_opportunities;
create trigger investment_opportunity_business_guard
before insert or update on public.investment_opportunities
for each row execute function private.prevent_investment_opportunity_business_tampering();

revoke all on function private.prevent_investment_opportunity_business_tampering() from public, anon, authenticated;

-- One non-cancelled deal per investor/opportunity keeps the deal timeline unambiguous.
create unique index if not exists investment_deals_active_pair_idx
  on public.investment_deals (opportunity_id, investor_id)
  where status <> 'cancelled';

-- Owner may only create a deal against an active interest and within remaining target.
drop policy if exists "investment_deals_owner_insert" on public.investment_deals;
create policy "investment_deals_owner_insert"
on public.investment_deals
for insert to authenticated
with check (
  exists (
    select 1
    from public.investment_opportunities o
    where o.id = investment_deals.opportunity_id
      and o.owner_id = (select auth.uid())
      and o.status = 'approved'
  )
  and exists (
    select 1
    from public.investment_interests i
    where i.opportunity_id = investment_deals.opportunity_id
      and i.investor_id = investment_deals.investor_id
      and i.status in ('terms','agreed')
  )
  and investment_deals.agreed_amount > 0
  and investment_deals.agreed_amount <= (
    select o.target_amount - o.raised_amount
    from public.investment_opportunities o
    where o.id = investment_deals.opportunity_id
  )
);

-- Once the investor has confirmed funding, owner-side terms are frozen.
create or replace function private.guard_investment_deal_mutation()
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
      raise exception 'Investor confirmation is controlled by the investor.';
    end if;

    if old.status = 'funding_pending'
       and old.investor_confirmed_at is not null
       and (
         new.agreed_amount is distinct from old.agreed_amount
         or new.ownership_percentage is distinct from old.ownership_percentage
         or new.structure is distinct from old.structure
         or new.terms_note is distinct from old.terms_note
       ) then
      raise exception 'Deal terms are frozen after investor funding confirmation.';
    end if;
  else
    raise exception 'Only the deal parties or an administrator can change a deal.';
  end if;

  return new;
end;
$$;

drop trigger if exists investment_deal_mutation_guard on public.investment_deals;
create trigger investment_deal_mutation_guard
before update on public.investment_deals
for each row execute function private.guard_investment_deal_mutation();

revoke all on function private.guard_investment_deal_mutation() from public, anon, authenticated;

-- Keep owner-side deal movement in the intended lifecycle and within available funding.
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
  v_opportunity_id uuid;
  v_old_status text;
  v_target numeric(14,2);
  v_raised numeric(14,2);
  v_amount numeric(14,2);
begin
  select o.owner_id, d.opportunity_id, d.status, o.target_amount, o.raised_amount
    into v_owner_id, v_opportunity_id, v_old_status, v_target, v_raised
  from public.investment_deals d
  join public.investment_opportunities o on o.id = d.opportunity_id
  where d.id = p_deal_id;

  if v_owner_id is null or v_owner_id <> (select auth.uid()) then
    raise exception 'Only the opportunity owner can update deal terms.';
  end if;

  if p_status not in ('proposed','agreed','funding_pending','cancelled') then
    raise exception 'Invalid owner deal status.';
  end if;

  if v_old_status = 'proposed' and p_status not in ('proposed','agreed','cancelled') then
    raise exception 'Deal must move from proposed to agreed or cancelled.';
  end if;

  if v_old_status = 'agreed' and p_status not in ('agreed','funding_pending','cancelled') then
    raise exception 'Deal must move from agreed to funding pending or cancelled.';
  end if;

  if v_old_status = 'funding_pending' and p_status not in ('funding_pending','cancelled') then
    raise exception 'A funding-pending deal can only remain pending or be cancelled.';
  end if;

  if v_old_status in ('funded','active','completed','cancelled') and p_status <> v_old_status then
    raise exception 'This deal can no longer be changed.';
  end if;

  v_amount := coalesce(p_agreed_amount, (
    select agreed_amount from public.investment_deals where id = p_deal_id
  ));

  if v_amount is null or v_amount <= 0 then
    raise exception 'Deal amount must be greater than zero.';
  end if;

  if v_amount > (v_target - v_raised) then
    raise exception 'Deal amount exceeds the remaining opportunity target.';
  end if;

  update public.investment_deals
  set status = p_status,
      agreed_amount = v_amount,
      ownership_percentage = coalesce(p_ownership_percentage, ownership_percentage),
      terms_note = coalesce(p_terms_note, terms_note),
      updated_at = timezone('utc', now())
  where id = p_deal_id;

  return found;
end;
$$;

grant execute on function public.owner_progress_investment_deal(uuid,text,numeric,numeric,text) to authenticated;
revoke execute on function public.owner_progress_investment_deal(uuid,text,numeric,numeric,text) from anon;

-- Actual funding confirmation requires a verified investor profile.
create or replace function public.investor_confirm_investment_deal(p_deal_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_status text;
  v_verified boolean;
begin
  select verification_status = 'verified'
    into v_verified
  from public.investment_profiles
  where user_id = (select auth.uid());

  if coalesce(v_verified, false) = false then
    raise exception 'Investor verification is required before funding confirmation.';
  end if;

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

revoke execute on function public.investor_confirm_investment_deal(uuid) from public, anon;
grant execute on function public.investor_confirm_investment_deal(uuid) to authenticated;
