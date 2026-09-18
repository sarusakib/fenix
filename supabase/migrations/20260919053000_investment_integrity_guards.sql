-- FeniX Investment — final integrity guards

-- Investors cannot express interest in their own opportunity.
drop policy if exists "investment_interests_investor_insert" on public.investment_interests;
create policy "investment_interests_investor_insert"
  on public.investment_interests for insert to authenticated
  with check (
    investor_id = (select auth.uid())
    and exists (
      select 1
      from public.investment_opportunities o
      where o.id = investment_interests.opportunity_id
        and o.owner_id <> (select auth.uid())
        and o.status = 'approved'
        and o.verification_status = 'verified'
        and investment_interests.offered_amount >= o.min_investment
        and investment_interests.offered_amount <= (o.target_amount - o.raised_amount)
    )
  );

-- An approved private document can be read from storage only by its owner,
-- an admin, or an investor who is in a due-diligence/terms/agreed stage.
drop policy if exists "investment_docs_storage_owner_select" on storage.objects;
create policy "investment_docs_storage_owner_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'investment-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_fenix_admin()
    or exists (
      select 1
      from public.investment_documents d
      join public.investment_interests i
        on i.opportunity_id = d.opportunity_id
      where d.storage_bucket = 'investment-documents'
        and d.storage_path = storage.objects.name
        and d.status = 'approved'
        and d.visibility = 'private_shared'
        and i.investor_id = (select auth.uid())
        and i.status in ('due_diligence','terms','agreed')
    )
  )
);

-- Never allow committed/funded deal amounts to push an opportunity past its target.
create or replace function public.prevent_investment_overfunding()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_target numeric(14,2);
  v_existing numeric(14,2);
begin
  if new.status in ('funded','active','completed') then
    select target_amount into v_target
    from public.investment_opportunities
    where id = new.opportunity_id
    for update;

    if v_target is null then
      raise exception 'Investment opportunity not found.';
    end if;

    select coalesce(sum(agreed_amount), 0)
      into v_existing
    from public.investment_deals
    where opportunity_id = new.opportunity_id
      and status in ('funded','active','completed')
      and id <> new.id;

    if v_existing + new.agreed_amount > v_target then
      raise exception 'This funding amount would exceed the opportunity target.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists investment_overfunding_guard on public.investment_deals;
create trigger investment_overfunding_guard
before insert or update of status, agreed_amount on public.investment_deals
for each row execute function public.prevent_investment_overfunding();

revoke execute on function public.prevent_investment_overfunding() from public, anon, authenticated;
