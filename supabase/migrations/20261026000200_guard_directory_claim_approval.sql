-- Prevent the trust queue from approving a claim for a business owned by
-- a different user. A failed approval rolls back the status update and leaves
-- the claim pending for an authorized reviewer to resolve.

begin;

create or replace function public.sync_approved_business_claim()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'approved' and (old.status is distinct from new.status) then
    update public.businesses
      set owner_id = new.claimant_id,
          updated_at = timezone('utc', now())
    where id = new.business_id
      and (owner_id is null or owner_id = new.claimant_id);

    if not found then
      raise exception 'Ownership claim cannot be approved because the business is missing or owned by another account.'
        using errcode = '23514';
    end if;

    -- Ensure the directory profile exists, and preserve a higher reviewer-set
    -- verification level rather than downgrading it to owner_claimed.
    insert into public.business_directory_profiles (
      business_id,
      owner_claimed,
      verification_level,
      updated_at
    )
    values (
      new.business_id,
      true,
      'owner_claimed',
      timezone('utc', now())
    )
    on conflict (business_id) do update
      set owner_claimed = true,
          verification_level = case
            when public.business_directory_profiles.verification_level = 'fenix_verified'
              then public.business_directory_profiles.verification_level
            when public.business_directory_profiles.verification_level in ('business_reviewed', 'identity_reviewed')
              then public.business_directory_profiles.verification_level
            else 'owner_claimed'
          end,
          updated_at = timezone('utc', now());
  end if;

  return new;
end;
$$;

revoke execute on function public.sync_approved_business_claim() from public, anon, authenticated;

commit;
