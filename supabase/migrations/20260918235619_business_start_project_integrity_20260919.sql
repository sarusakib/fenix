-- FeniX Start — protect Journey ownership and business linkage.

create or replace function private.guard_business_start_project_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'Business Journey ownership cannot be changed.';
  end if;

  if new.business_id is not null then
    if not exists (
      select 1 from public.businesses b
      where b.id = new.business_id
        and b.owner_id = new.user_id
    ) then
      raise exception 'Linked business must belong to the Journey owner.';
    end if;
  end if;

  if new.status = 'launched' and new.business_id is null then
    raise exception 'A launched Business Journey must be linked to a business profile.';
  end if;

  if old.status = 'launched'
     and new.status is distinct from old.status
     and not public.is_fenix_admin() then
    raise exception 'A launched Business Journey cannot be moved back to an earlier status.';
  end if;

  if old.business_id is not null
     and new.business_id is distinct from old.business_id
     and not public.is_fenix_admin() then
    raise exception 'A published business link cannot be replaced by the owner.';
  end if;

  return new;
end;
$$;

drop trigger if exists business_start_project_mutation_guard on public.business_start_projects;
create trigger business_start_project_mutation_guard
before update on public.business_start_projects
for each row execute function private.guard_business_start_project_mutation();

revoke all on function private.guard_business_start_project_mutation() from public, anon, authenticated;
