-- FeniX Jobs & Work master workflow
create table if not exists public.fenix_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  title text not null check (length(trim(title)) between 4 and 160),
  description text not null check (length(trim(description)) between 20 and 12000),
  employment_type text not null default 'full_time'
    check (employment_type in ('full_time','part_time','contract','internship','freelance','temporary')),
  workplace_type text not null default 'onsite'
    check (workplace_type in ('onsite','hybrid','remote')),
  district text not null default 'Feni',
  upazila text,
  location_text text,
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  currency text not null default 'BDT',
  application_deadline date,
  status text not null default 'pending_review'
    check (status in ('draft','pending_review','published','closed','rejected')),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','reviewed','verified')),
  verification_note text,
  external_apply_url text,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fenix_jobs_salary_check
    check (
      (salary_min is null or salary_min >= 0)
      and (salary_max is null or salary_max >= 0)
      and (salary_min is null or salary_max is null or salary_max >= salary_min)
    ),
  constraint fenix_jobs_deadline_check
    check (application_deadline is null or application_deadline >= created_at::date)
);

create index if not exists fenix_jobs_status_published_idx
  on public.fenix_jobs(status, published_at desc);
create index if not exists fenix_jobs_owner_idx
  on public.fenix_jobs(owner_id, created_at desc);
create index if not exists fenix_jobs_business_idx
  on public.fenix_jobs(business_id, created_at desc);
create index if not exists fenix_jobs_location_idx
  on public.fenix_jobs(district, upazila, employment_type, workplace_type);

create table if not exists public.fenix_job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.fenix_jobs(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  cover_note text check (cover_note is null or length(trim(cover_note)) <= 4000),
  status text not null default 'submitted'
    check (status in ('submitted','reviewing','shortlisted','rejected','hired','withdrawn')),
  employer_note text check (employer_note is null or length(trim(employer_note)) <= 4000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (job_id, applicant_id)
);

create index if not exists fenix_job_applications_job_idx
  on public.fenix_job_applications(job_id, created_at desc);
create index if not exists fenix_job_applications_applicant_idx
  on public.fenix_job_applications(applicant_id, created_at desc);

create or replace function public.fenix_jobs_set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists fenix_jobs_set_updated_at on public.fenix_jobs;
create trigger fenix_jobs_set_updated_at
before update on public.fenix_jobs
for each row execute function public.fenix_jobs_set_updated_at();

drop trigger if exists fenix_job_applications_set_updated_at on public.fenix_job_applications;
create trigger fenix_job_applications_set_updated_at
before update on public.fenix_job_applications
for each row execute function public.fenix_jobs_set_updated_at();

create or replace function public.fenix_job_guard_updates()
returns trigger
language plpgsql
set search_path = pg_catalog, public, auth
as $$
begin
  if not public.is_fenix_admin() then
    if new.owner_id is distinct from old.owner_id then
      raise exception 'Job owner cannot be changed';
    end if;
    if new.business_id is distinct from old.business_id then
      raise exception 'Job business cannot be changed';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists fenix_job_guard_updates on public.fenix_jobs;
create trigger fenix_job_guard_updates
before update on public.fenix_jobs
for each row execute function public.fenix_job_guard_updates();

create or replace function public.fenix_job_application_guard_updates()
returns trigger
language plpgsql
set search_path = pg_catalog, public, auth
as $$
begin
  if new.job_id is distinct from old.job_id
     or new.applicant_id is distinct from old.applicant_id then
    raise exception 'Application ownership cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists fenix_job_application_guard_updates on public.fenix_job_applications;
create trigger fenix_job_application_guard_updates
before update on public.fenix_job_applications
for each row execute function public.fenix_job_application_guard_updates();

alter table public.fenix_jobs enable row level security;
alter table public.fenix_job_applications enable row level security;

drop policy if exists fenix_jobs_public_select on public.fenix_jobs;
create policy fenix_jobs_public_select
on public.fenix_jobs for select
to anon, authenticated
using (
  status = 'published'
  or owner_id = (select auth.uid())
  or public.is_fenix_admin()
);

drop policy if exists fenix_jobs_owner_insert on public.fenix_jobs;
create policy fenix_jobs_owner_insert
on public.fenix_jobs for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and private.is_fenix_user_active((select auth.uid()))
  and (
    business_id is null
    or exists (
      select 1 from public.businesses b
      where b.id = business_id
        and b.owner_id = (select auth.uid())
    )
  )
);

drop policy if exists fenix_jobs_owner_update on public.fenix_jobs;
create policy fenix_jobs_owner_update
on public.fenix_jobs for update
to authenticated
using (owner_id = (select auth.uid()) or public.is_fenix_admin())
with check (owner_id = (select auth.uid()) or public.is_fenix_admin());

drop policy if exists fenix_job_applications_participant_select on public.fenix_job_applications;
create policy fenix_job_applications_participant_select
on public.fenix_job_applications for select
to authenticated
using (
  applicant_id = (select auth.uid())
  or exists (
    select 1 from public.fenix_jobs j
    where j.id = job_id
      and (j.owner_id = (select auth.uid()) or public.is_fenix_admin())
  )
);

drop policy if exists fenix_job_applications_candidate_insert on public.fenix_job_applications;
create policy fenix_job_applications_candidate_insert
on public.fenix_job_applications for insert
to authenticated
with check (
  applicant_id = (select auth.uid())
  and exists (
    select 1 from public.fenix_jobs j
    where j.id = job_id
      and j.status = 'published'
      and j.owner_id <> (select auth.uid())
      and (j.application_deadline is null or j.application_deadline >= current_date)
  )
);

drop policy if exists fenix_job_applications_participant_update on public.fenix_job_applications;
create policy fenix_job_applications_participant_update
on public.fenix_job_applications for update
to authenticated
using (
  applicant_id = (select auth.uid())
  or exists (
    select 1 from public.fenix_jobs j
    where j.id = job_id
      and (j.owner_id = (select auth.uid()) or public.is_fenix_admin())
  )
)
with check (
  applicant_id = (select auth.uid())
  or exists (
    select 1 from public.fenix_jobs j
    where j.id = job_id
      and (j.owner_id = (select auth.uid()) or public.is_fenix_admin())
  )
);

grant select on public.fenix_jobs to anon, authenticated;
grant insert, update on public.fenix_jobs to authenticated;
grant select, insert, update on public.fenix_job_applications to authenticated;
