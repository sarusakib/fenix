-- FeniX Investment — narrow mutation permissions
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.prevent_investment_profile_verification_tampering()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if public.is_fenix_admin() then return new; end if;
  if new.user_id <> old.user_id
     or new.verification_status is distinct from old.verification_status
     or new.verification_note is distinct from old.verification_note
     or new.verified_at is distinct from old.verified_at
     or new.verified_by is distinct from old.verified_by then
    raise exception 'Investor verification fields can only be changed by an administrator.';
  end if;
  return new;
end $$;

drop trigger if exists investment_profile_verification_guard on public.investment_profiles;
create trigger investment_profile_verification_guard
before update on public.investment_profiles for each row
execute function private.prevent_investment_profile_verification_tampering();

create or replace function private.prevent_investment_document_review_tampering()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if public.is_fenix_admin() then return new; end if;
  if new.id <> old.id
     or new.owner_id <> old.owner_id
     or new.opportunity_id <> old.opportunity_id
     or new.storage_bucket <> old.storage_bucket
     or new.storage_path <> old.storage_path
     or new.status is distinct from old.status
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.review_note is distinct from old.review_note then
    raise exception 'Document review fields are protected.';
  end if;
  return new;
end $$;

drop trigger if exists investment_document_review_guard on public.investment_documents;
create trigger investment_document_review_guard
before update on public.investment_documents for each row
execute function private.prevent_investment_document_review_tampering();

create or replace function private.prevent_investment_interest_tampering()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_uid uuid := (select auth.uid()); v_is_admin boolean := public.is_fenix_admin(); v_is_owner boolean;
begin
  select exists(select 1 from public.investment_opportunities o where o.id=old.opportunity_id and o.owner_id=v_uid) into v_is_owner;
  if v_is_admin then return new; end if;
  if not v_is_owner then raise exception 'Only the opportunity owner can update investment interest.'; end if;
  if new.id <> old.id
     or new.opportunity_id <> old.opportunity_id
     or new.investor_id <> old.investor_id
     or new.offered_amount is distinct from old.offered_amount
     or new.created_at <> old.created_at
     or new.status not in ('interested','shortlisted','meeting','due_diligence','terms','agreed','declined','withdrawn') then
    raise exception 'Protected investment interest fields cannot be changed.';
  end if;
  return new;
end $$;

drop trigger if exists investment_interest_guard on public.investment_interests;
create trigger investment_interest_guard
before update on public.investment_interests for each row
execute function private.prevent_investment_interest_tampering();

drop policy if exists "investment_reports_admin_update" on public.investment_reports;
create policy "investment_reports_admin_update"
on public.investment_reports for update to authenticated
using (public.is_fenix_admin()) with check (public.is_fenix_admin());

revoke update on table public.investment_messages from authenticated;

create or replace function public.mark_investment_message_read(p_message_id uuid)
returns boolean language plpgsql security invoker set search_path = pg_catalog, public as $$
begin
  update public.investment_messages
  set read_at=coalesce(read_at, timezone('utc', now()))
  where id=p_message_id and recipient_id=(select auth.uid());
  return found;
end $$;
revoke execute on function public.mark_investment_message_read(uuid) from public, anon;
grant execute on function public.mark_investment_message_read(uuid) to authenticated;

revoke update on table public.investment_interests from authenticated;

create or replace function public.owner_update_investment_interest(
  p_interest_id uuid,p_status text,p_owner_note text default null)
returns boolean language plpgsql security invoker set search_path = pg_catalog, public as $$
begin
  if p_status not in ('interested','shortlisted','meeting','due_diligence','terms','agreed','declined','withdrawn') then
    raise exception 'Invalid interest status.';
  end if;
  update public.investment_interests i
  set status=p_status, owner_note=coalesce(p_owner_note,i.owner_note), updated_at=timezone('utc',now())
  where i.id=p_interest_id
    and exists(select 1 from public.investment_opportunities o where o.id=i.opportunity_id and o.owner_id=(select auth.uid()));
  return found;
end $$;
revoke execute on function public.owner_update_investment_interest(uuid,text,text) from public, anon;
grant execute on function public.owner_update_investment_interest(uuid,text,text) to authenticated;
