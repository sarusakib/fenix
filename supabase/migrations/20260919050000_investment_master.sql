-- FeniX Investment — A-to-Z marketplace foundation
-- Opportunity discovery, investor profiles, due diligence metadata,
-- investor interest, deal coordination, updates, reports and audit logs.
-- This module does not custody funds or settle securities.

create extension if not exists "pgcrypto";

create table if not exists public.investment_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  investor_type text not null default 'individual'
    check (investor_type in ('individual','business','organization')),
  bio text null check (bio is null or length(trim(bio)) <= 2000),
  min_budget numeric(14,2) not null default 0 check (min_budget >= 0),
  max_budget numeric(14,2) not null default 0 check (max_budget >= min_budget),
  preferred_sectors text[] not null default '{}',
  preferred_upazilas text[] not null default '{}',
  risk_preference text not null default 'medium'
    check (risk_preference in ('low','medium','high','any')),
  horizon_months integer null check (horizon_months is null or (horizon_months >= 1 and horizon_months <= 240)),
  shariah_preference text not null default 'not_specified'
    check (shariah_preference in ('not_specified','preferred','not_required')),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','submitted','verified','needs_review','rejected')),
  verification_note text null check (verification_note is null or length(trim(verification_note)) <= 1000),
  verified_at timestamptz null,
  verified_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.investment_opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  business_id uuid null references public.businesses(id) on delete set null,
  title_bn text not null check (length(trim(title_bn)) between 3 and 180),
  title_en text not null check (length(trim(title_en)) between 3 and 180),
  description_bn text not null check (length(trim(description_bn)) between 30 and 8000),
  description_en text not null check (length(trim(description_en)) between 30 and 8000),
  category text not null check (length(trim(category)) between 2 and 120),
  district text not null default 'Feni' check (length(trim(district)) between 2 and 120),
  upazila text null check (upazila is null or length(trim(upazila)) between 2 and 120),
  location_details text null check (location_details is null or length(trim(location_details)) <= 500),
  target_amount numeric(14,2) not null check (target_amount > 0),
  min_investment numeric(14,2) not null check (min_investment > 0 and min_investment <= target_amount),
  raised_amount numeric(14,2) not null default 0 check (raised_amount >= 0),
  offer_type text not null default 'partnership'
    check (offer_type in ('equity','profit_share','loan','partnership','other')),
  ownership_percentage numeric(6,3) null
    check (ownership_percentage is null or (ownership_percentage >= 0 and ownership_percentage <= 100)),
  expected_return_pct numeric(7,3) null
    check (expected_return_pct is null or (expected_return_pct >= 0 and expected_return_pct <= 1000)),
  expected_term_months integer null
    check (expected_term_months is null or (expected_term_months >= 1 and expected_term_months <= 240)),
  risk_level text not null default 'medium'
    check (risk_level in ('low','medium','high')),
  shariah_preference text not null default 'not_specified'
    check (shariah_preference in ('not_specified','preferred','not_required')),
  risk_disclosure text null check (risk_disclosure is null or length(trim(risk_disclosure)) <= 4000),
  funding_deadline date null,
  status text not null default 'draft'
    check (status in ('draft','pending_review','approved','rejected','fully_funded','closed','cancelled')),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','under_review','verified','needs_changes','rejected')),
  verification_note text null check (verification_note is null or length(trim(verification_note)) <= 2000),
  verified_at timestamptz null,
  verified_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists investment_opportunities_public_idx
  on public.investment_opportunities (status, verification_status, created_at desc);
create index if not exists investment_opportunities_owner_idx
  on public.investment_opportunities (owner_id, created_at desc);
create index if not exists investment_opportunities_category_idx
  on public.investment_opportunities (category, district, upazila);

create table if not exists public.investment_documents (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.investment_opportunities(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null
    check (document_type in ('trade_license','registration','financial','ownership','identity','location','legal','other')),
  title text not null check (length(trim(title)) between 2 and 160),
  storage_bucket text not null default 'investment-documents',
  storage_path text not null check (length(trim(storage_path)) between 8 and 500),
  visibility text not null default 'review_only'
    check (visibility in ('review_only','private_shared')),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  review_note text null check (review_note is null or length(trim(review_note)) <= 1000),
  reviewed_by uuid null references auth.users(id) on delete set null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists investment_documents_opportunity_idx
  on public.investment_documents (opportunity_id, created_at desc);

create table if not exists public.investment_interests (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.investment_opportunities(id) on delete cascade,
  investor_id uuid not null references auth.users(id) on delete cascade,
  offered_amount numeric(14,2) not null check (offered_amount > 0),
  message text null check (message is null or length(trim(message)) <= 2000),
  status text not null default 'interested'
    check (status in ('interested','shortlisted','meeting','due_diligence','terms','agreed','declined','withdrawn')),
  owner_note text null check (owner_note is null or length(trim(owner_note)) <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(opportunity_id, investor_id)
);

create index if not exists investment_interests_opportunity_idx
  on public.investment_interests (opportunity_id, status, created_at desc);
create index if not exists investment_interests_investor_idx
  on public.investment_interests (investor_id, created_at desc);

create table if not exists public.investment_deals (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.investment_opportunities(id) on delete restrict,
  investor_id uuid not null references auth.users(id) on delete restrict,
  agreed_amount numeric(14,2) not null check (agreed_amount > 0),
  ownership_percentage numeric(6,3) null
    check (ownership_percentage is null or (ownership_percentage >= 0 and ownership_percentage <= 100)),
  structure text not null default 'partnership'
    check (structure in ('equity','profit_share','loan','partnership','other')),
  status text not null default 'proposed'
    check (status in ('proposed','agreed','funding_pending','funded','active','completed','cancelled')),
  terms_note text null check (terms_note is null or length(trim(terms_note)) <= 4000),
  investor_confirmed_at timestamptz null,
  owner_confirmed_at timestamptz null,
  funded_at timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists investment_deals_opportunity_idx
  on public.investment_deals (opportunity_id, status, created_at desc);
create index if not exists investment_deals_investor_idx
  on public.investment_deals (investor_id, created_at desc);

create table if not exists public.investment_updates (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.investment_opportunities(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 3 and 180),
  body text not null check (length(trim(body)) between 10 and 6000),
  period_label text null check (period_label is null or length(trim(period_label)) <= 80),
  revenue_actual numeric(14,2) null check (revenue_actual is null or revenue_actual >= 0),
  customers_actual integer null check (customers_actual is null or customers_actual >= 0),
  risk_note text null check (risk_note is null or length(trim(risk_note)) <= 1500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists investment_updates_opportunity_idx
  on public.investment_updates (opportunity_id, created_at desc);

create table if not exists public.investment_reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.investment_opportunities(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null
    check (reason in ('misleading','fraud_suspected','document_issue','harassment','spam','other')),
  details text not null check (length(trim(details)) between 10 and 2500),
  status text not null default 'open'
    check (status in ('open','reviewing','resolved','dismissed')),
  resolution_note text null check (resolution_note is null or length(trim(resolution_note)) <= 2000),
  resolved_by uuid null references auth.users(id) on delete set null,
  resolved_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists investment_reports_status_idx
  on public.investment_reports (status, created_at desc);

create table if not exists public.investment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid null references auth.users(id) on delete set null,
  opportunity_id uuid null references public.investment_opportunities(id) on delete set null,
  entity_type text not null check (length(trim(entity_type)) between 2 and 80),
  entity_id uuid null,
  action text not null check (length(trim(action)) between 2 and 100),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists investment_audit_logs_opp_idx
  on public.investment_audit_logs (opportunity_id, created_at desc);

alter table public.investment_profiles enable row level security;
alter table public.investment_opportunities enable row level security;
alter table public.investment_documents enable row level security;
alter table public.investment_interests enable row level security;
alter table public.investment_deals enable row level security;
alter table public.investment_updates enable row level security;
alter table public.investment_reports enable row level security;
alter table public.investment_audit_logs enable row level security;

drop policy if exists "investment_profiles_self_select" on public.investment_profiles;
create policy "investment_profiles_self_select"
  on public.investment_profiles for select to authenticated
  using ((select auth.uid()) = user_id or public.is_fenix_admin());

drop policy if exists "investment_profiles_self_insert" on public.investment_profiles;
create policy "investment_profiles_self_insert"
  on public.investment_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "investment_profiles_self_update" on public.investment_profiles;
create policy "investment_profiles_self_update"
  on public.investment_profiles for update to authenticated
  using ((select auth.uid()) = user_id or public.is_fenix_admin())
  with check ((select auth.uid()) = user_id or public.is_fenix_admin());

drop policy if exists "investment_opportunities_public_read" on public.investment_opportunities;
create policy "investment_opportunities_public_read"
  on public.investment_opportunities for select to anon, authenticated
  using (
    status in ('approved','fully_funded','closed')
    and verification_status = 'verified'
    or (select auth.uid()) = owner_id
    or public.is_fenix_admin()
  );

drop policy if exists "investment_opportunities_owner_insert" on public.investment_opportunities;
create policy "investment_opportunities_owner_insert"
  on public.investment_opportunities for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "investment_opportunities_owner_update" on public.investment_opportunities;
create policy "investment_opportunities_owner_update"
  on public.investment_opportunities for update to authenticated
  using ((select auth.uid()) = owner_id or public.is_fenix_admin())
  with check ((select auth.uid()) = owner_id or public.is_fenix_admin());

drop policy if exists "investment_documents_parties_read" on public.investment_documents;
create policy "investment_documents_parties_read"
  on public.investment_documents for select to authenticated
  using (
    owner_id = (select auth.uid())
    or public.is_fenix_admin()
    or exists (
      select 1
      from public.investment_interests i
      where i.opportunity_id = investment_documents.opportunity_id
        and i.investor_id = (select auth.uid())
        and i.status in ('due_diligence','terms','agreed')
        and investment_documents.visibility = 'private_shared'
        and investment_documents.status = 'approved'
    )
  );

drop policy if exists "investment_documents_owner_insert" on public.investment_documents;
create policy "investment_documents_owner_insert"
  on public.investment_documents for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_documents.opportunity_id
        and o.owner_id = (select auth.uid())
    )
  );

drop policy if exists "investment_documents_owner_update" on public.investment_documents;
create policy "investment_documents_owner_update"
  on public.investment_documents for update to authenticated
  using (owner_id = (select auth.uid()) or public.is_fenix_admin())
  with check (owner_id = (select auth.uid()) or public.is_fenix_admin());

drop policy if exists "investment_interests_parties_read" on public.investment_interests;
create policy "investment_interests_parties_read"
  on public.investment_interests for select to authenticated
  using (
    investor_id = (select auth.uid())
    or exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_interests.opportunity_id
        and o.owner_id = (select auth.uid())
    )
    or public.is_fenix_admin()
  );

drop policy if exists "investment_interests_investor_insert" on public.investment_interests;
create policy "investment_interests_investor_insert"
  on public.investment_interests for insert to authenticated
  with check (
    investor_id = (select auth.uid())
    and exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_interests.opportunity_id
        and o.status = 'approved'
        and o.verification_status = 'verified'
        and investment_interests.offered_amount >= o.min_investment
        and investment_interests.offered_amount <= (o.target_amount - o.raised_amount)
    )
  );

drop policy if exists "investment_interests_owner_update" on public.investment_interests;
create policy "investment_interests_owner_update"
  on public.investment_interests for update to authenticated
  using (
    exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_interests.opportunity_id
        and o.owner_id = (select auth.uid())
    )
    or public.is_fenix_admin()
  )
  with check (
    exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_interests.opportunity_id
        and o.owner_id = (select auth.uid())
    )
    or public.is_fenix_admin()
  );

drop policy if exists "investment_deals_parties_read" on public.investment_deals;
create policy "investment_deals_parties_read"
  on public.investment_deals for select to authenticated
  using (
    investor_id = (select auth.uid())
    or exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_deals.opportunity_id
        and o.owner_id = (select auth.uid())
    )
    or public.is_fenix_admin()
  );

drop policy if exists "investment_deals_owner_insert" on public.investment_deals;
create policy "investment_deals_owner_insert"
  on public.investment_deals for insert to authenticated
  with check (
    exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_deals.opportunity_id
        and o.owner_id = (select auth.uid())
    )
    and exists (
      select 1 from public.investment_interests i
      where i.opportunity_id = investment_deals.opportunity_id
        and i.investor_id = investment_deals.investor_id
        and i.status in ('terms','agreed')
    )
  );

drop policy if exists "investment_updates_public_read" on public.investment_updates;
create policy "investment_updates_public_read"
  on public.investment_updates for select to anon, authenticated
  using (
    exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_updates.opportunity_id
        and (
          (o.status in ('approved','fully_funded','closed') and o.verification_status = 'verified')
          or o.owner_id = (select auth.uid())
        )
    )
    or public.is_fenix_admin()
    or exists (
      select 1 from public.investment_deals d
      where d.opportunity_id = investment_updates.opportunity_id
        and d.investor_id = (select auth.uid())
    )
  );

drop policy if exists "investment_updates_owner_insert" on public.investment_updates;
create policy "investment_updates_owner_insert"
  on public.investment_updates for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_updates.opportunity_id
        and o.owner_id = (select auth.uid())
        and o.status in ('approved','fully_funded')
    )
  );

drop policy if exists "investment_updates_owner_update" on public.investment_updates;
create policy "investment_updates_owner_update"
  on public.investment_updates for update to authenticated
  using (author_id = (select auth.uid()) or public.is_fenix_admin())
  with check (author_id = (select auth.uid()) or public.is_fenix_admin());

drop policy if exists "investment_reports_submit" on public.investment_reports;
create policy "investment_reports_submit"
  on public.investment_reports for insert to authenticated
  with check ((select auth.uid()) = reporter_id);

drop policy if exists "investment_reports_parties_read" on public.investment_reports;
create policy "investment_reports_parties_read"
  on public.investment_reports for select to authenticated
  using (
    reporter_id = (select auth.uid())
    or exists (
      select 1 from public.investment_opportunities o
      where o.id = investment_reports.opportunity_id
        and o.owner_id = (select auth.uid())
    )
    or public.is_fenix_admin()
  );

drop policy if exists "investment_audit_admin_read" on public.investment_audit_logs;
create policy "investment_audit_admin_read"
  on public.investment_audit_logs for select to authenticated
  using (public.is_fenix_admin());

create or replace function public.submit_investment_opportunity(p_opportunity_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  update public.investment_opportunities
  set status = 'pending_review',
      verification_status = 'under_review',
      updated_at = timezone('utc', now())
  where id = p_opportunity_id
    and owner_id = (select auth.uid())
    and status in ('draft','rejected');

  if not found then
    raise exception 'Investment opportunity cannot be submitted in its current state.';
  end if;

  return true;
end;
$$;

create or replace function public.owner_progress_investment_deal(
  p_deal_id uuid,
  p_status text,
  p_agreed_amount numeric default null,
  p_ownership_percentage numeric default null,
  p_terms_note text default null
)
returns boolean
language plpgsql
security definer
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
  where d.id = p_deal_id
  for update;

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

  return true;
end;
$$;

create or replace function public.investor_confirm_investment_deal(p_deal_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_status text;
  v_owner_confirmed timestamptz;
begin
  select status, owner_confirmed_at into v_status, v_owner_confirmed
  from public.investment_deals
  where id = p_deal_id and investor_id = (select auth.uid())
  for update;

  if not found then
    raise exception 'Investment deal not found.';
  end if;

  if v_status <> 'funding_pending' then
    raise exception 'Deal must be funding-pending before confirmation.';
  end if;

  update public.investment_deals
  set investor_confirmed_at = timezone('utc', now()),
      status = case when v_owner_confirmed is not null then 'funded' else status end,
      funded_at = case when v_owner_confirmed is not null then coalesce(funded_at, timezone('utc', now())) else funded_at end,
      started_at = case when v_owner_confirmed is not null then coalesce(started_at, timezone('utc', now())) else started_at end,
      updated_at = timezone('utc', now())
  where id = p_deal_id;

  return true;
end;
$$;

create or replace function public.owner_confirm_investment_deal(p_deal_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_status text;
  v_investor_confirmed timestamptz;
begin
  select d.status, d.investor_confirmed_at
    into v_status, v_investor_confirmed
  from public.investment_deals d
  join public.investment_opportunities o on o.id = d.opportunity_id
  where d.id = p_deal_id and o.owner_id = (select auth.uid())
  for update;

  if not found then
    raise exception 'Investment deal not found.';
  end if;

  if v_status <> 'funding_pending' then
    raise exception 'Deal must be funding-pending before confirmation.';
  end if;

  update public.investment_deals
  set owner_confirmed_at = timezone('utc', now()),
      status = case when v_investor_confirmed is not null then 'funded' else status end,
      funded_at = case when v_investor_confirmed is not null then coalesce(funded_at, timezone('utc', now())) else funded_at end,
      started_at = case when v_investor_confirmed is not null then coalesce(started_at, timezone('utc', now())) else started_at end,
      updated_at = timezone('utc', now())
  where id = p_deal_id;

  return true;
end;
$$;

create or replace function public.sync_investment_raised_amount()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_opp_id uuid;
  v_raised numeric(14,2);
begin
  v_opp_id := coalesce(new.opportunity_id, old.opportunity_id);

  select coalesce(sum(agreed_amount), 0)
    into v_raised
  from public.investment_deals
  where opportunity_id = v_opp_id
    and status in ('funded','active','completed');

  update public.investment_opportunities
  set raised_amount = v_raised,
      status = case
        when status = 'approved' and v_raised >= target_amount then 'fully_funded'
        when status = 'fully_funded' and v_raised < target_amount then 'approved'
        else status
      end,
      updated_at = timezone('utc', now())
  where id = v_opp_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists investment_sync_raised_amount on public.investment_deals;
create trigger investment_sync_raised_amount
after insert or update of status, agreed_amount or delete on public.investment_deals
for each row execute function public.sync_investment_raised_amount();

create or replace function public.prevent_investment_owner_tampering()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if public.is_fenix_admin() then
    return new;
  end if;

  if new.owner_id <> old.owner_id
     or new.verified_by is distinct from old.verified_by
     or new.verified_at is distinct from old.verified_at
     or new.verification_status in ('verified','needs_changes')
     or new.raised_amount is distinct from old.raised_amount
     or new.verification_note is distinct from old.verification_note then
    raise exception 'Protected investment fields can only be changed by an administrator.';
  end if;

  if old.status in ('pending_review','approved','fully_funded','closed','cancelled')
     and new.status is distinct from old.status then
    raise exception 'This investment opportunity cannot be changed to that status.';
  end if;

  if old.status = 'pending_review' and new.status <> old.status then
    raise exception 'An opportunity under review cannot be changed by the owner.';
  end if;

  return new;
end;
$$;

drop trigger if exists investment_owner_tamper_guard on public.investment_opportunities;
create trigger investment_owner_tamper_guard
before update on public.investment_opportunities
for each row execute function public.prevent_investment_owner_tampering();

create or replace function public.log_investment_audit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_record jsonb;
  v_opp_id uuid;
begin
  v_record := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_opp_id := case
    when tg_table_name = 'investment_opportunities' then (v_record->>'id')::uuid
    when v_record ? 'opportunity_id' then (v_record->>'opportunity_id')::uuid
    else null
  end;

  insert into public.investment_audit_logs (
    actor_id, opportunity_id, entity_type, entity_id, action, details
  ) values (
    (select auth.uid()),
    v_opp_id,
    tg_table_name,
    case when v_record ? 'id' then (v_record->>'id')::uuid else null end,
    lower(tg_op || '_' || tg_table_name),
    jsonb_build_object('record', v_record)
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists investment_audit_opportunities on public.investment_opportunities;
create trigger investment_audit_opportunities
after insert or update or delete on public.investment_opportunities
for each row execute function public.log_investment_audit();

drop trigger if exists investment_audit_interests on public.investment_interests;
create trigger investment_audit_interests
after insert or update or delete on public.investment_interests
for each row execute function public.log_investment_audit();

drop trigger if exists investment_audit_deals on public.investment_deals;
create trigger investment_audit_deals
after insert or update or delete on public.investment_deals
for each row execute function public.log_investment_audit();

drop trigger if exists investment_audit_documents on public.investment_documents;
create trigger investment_audit_documents
after insert or update or delete on public.investment_documents
for each row execute function public.log_investment_audit();

drop trigger if exists investment_audit_updates on public.investment_updates;
create trigger investment_audit_updates
after insert or update or delete on public.investment_updates
for each row execute function public.log_investment_audit();

-- Investor preference based matching. Score describes profile fit, not profit probability.
create or replace function public.match_investment_opportunities(p_limit integer default 12)
returns table (
  opportunity_id uuid,
  title_bn text,
  title_en text,
  category text,
  district text,
  upazila text,
  target_amount numeric,
  min_investment numeric,
  raised_amount numeric,
  risk_level text,
  verification_status text,
  match_score integer,
  match_reasons text[]
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select
    o.id,
    o.title_bn,
    o.title_en,
    o.category,
    o.district,
    o.upazila,
    o.target_amount,
    o.min_investment,
    o.raised_amount,
    o.risk_level,
    o.verification_status,
    least(
      100,
      (case
        when o.category = any(p.preferred_sectors) then 30
        when coalesce(array_length(p.preferred_sectors,1),0) = 0 then 15
        else 0 end)
      + (case
        when o.upazila is not null and o.upazila = any(p.preferred_upazilas) then 20
        when coalesce(array_length(p.preferred_upazilas,1),0) = 0 then 10
        else 0 end)
      + (case
        when p.risk_preference = 'any' then 20
        when p.risk_preference = o.risk_level then 20
        when p.risk_preference = 'medium' and o.risk_level in ('low','high') then 10
        else 0 end)
      + (case
        when p.max_budget >= o.min_investment and p.min_budget <= o.target_amount then 20
        when p.max_budget >= o.min_investment then 10
        else 0 end)
      + (case
        when p.shariah_preference = 'not_specified' then 10
        when p.shariah_preference = o.shariah_preference then 10
        else 0 end)
    )::integer as match_score,
    array_remove(array[
      case when o.category = any(p.preferred_sectors) then 'Sector match' end,
      case when o.upazila is not null and o.upazila = any(p.preferred_upazilas) then 'Location match' end,
      case when p.risk_preference = 'any' or p.risk_preference = o.risk_level then 'Risk fit' end,
      case when p.max_budget >= o.min_investment and p.min_budget <= o.target_amount then 'Budget fit' end,
      case when p.shariah_preference = 'not_specified' or p.shariah_preference = o.shariah_preference then 'Preference fit' end
    ], null)
  from public.investment_opportunities o
  cross join public.investment_profiles p
  where p.user_id = (select auth.uid())
    and o.status in ('approved','fully_funded')
    and o.verification_status = 'verified'
    and o.raised_amount < o.target_amount
  order by match_score desc, o.created_at desc
  limit greatest(1, least(coalesce(p_limit,12),50));
$$;

-- Storage: private investment documents, owner-scoped paths.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'investment-documents',
  'investment-documents',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png']
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "investment_docs_storage_owner_insert" on storage.objects;
create policy "investment_docs_storage_owner_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'investment-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "investment_docs_storage_owner_select" on storage.objects;
create policy "investment_docs_storage_owner_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'investment-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_fenix_admin()
  )
);

drop policy if exists "investment_docs_storage_owner_update" on storage.objects;
create policy "investment_docs_storage_owner_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'investment-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_fenix_admin()
  )
)
with check (
  bucket_id = 'investment-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_fenix_admin()
  )
);

drop policy if exists "investment_docs_storage_owner_delete" on storage.objects;
create policy "investment_docs_storage_owner_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'investment-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_fenix_admin()
  )
);

revoke all on function public.submit_investment_opportunity(uuid) from public, anon;
grant execute on function public.submit_investment_opportunity(uuid) to authenticated;

revoke all on function public.owner_progress_investment_deal(uuid,text,numeric,numeric,text) from public, anon;
grant execute on function public.owner_progress_investment_deal(uuid,text,numeric,numeric,text) to authenticated;

revoke all on function public.investor_confirm_investment_deal(uuid) from public, anon;
grant execute on function public.investor_confirm_investment_deal(uuid) to authenticated;

revoke all on function public.owner_confirm_investment_deal(uuid) from public, anon;
grant execute on function public.owner_confirm_investment_deal(uuid) to authenticated;

revoke all on function public.match_investment_opportunities(integer) from public;
grant execute on function public.match_investment_opportunities(integer) to anon, authenticated;
