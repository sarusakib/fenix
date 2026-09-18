-- FeniX Start — Business Launch Journey data model.
-- This module stores user-owned planning data only.
-- It does not certify a business, hold funds, or guarantee business outcomes.

create schema if not exists private;

create table if not exists public.business_start_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid null references public.businesses(id) on delete set null,
  title text not null default 'Untitled Business Plan' check (length(trim(title)) between 3 and 180),
  business_type text null check (business_type is null or length(trim(business_type)) between 2 and 80),
  status text not null default 'planning'
    check (status in ('draft','planning','validation','ready','launched','archived')),
  current_step text not null default 'idea'
    check (current_step in ('idea','validate','planner','location','legal','finance','suppliers','checklist','launch')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz null
);

create index if not exists business_start_projects_user_idx
  on public.business_start_projects (user_id, updated_at desc);

create table if not exists public.business_start_preferences (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.business_start_projects(id) on delete cascade,
  business_summary text null check (business_summary is null or length(trim(business_summary)) <= 3000),
  category text null check (category is null or length(trim(category)) <= 120),
  budget_min numeric(14,2) not null default 0 check (budget_min >= 0),
  budget_max numeric(14,2) not null default 0 check (budget_max >= budget_min),
  experience_level text not null default 'beginner'
    check (experience_level in ('beginner','some_experience','experienced')),
  risk_preference text not null default 'medium'
    check (risk_preference in ('low','medium','high')),
  goal text not null default 'full_time'
    check (goal in ('part_time','full_time','family','growth')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.business_start_plans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.business_start_projects(id) on delete cascade,
  customer_profile text null check (customer_profile is null or length(trim(customer_profile)) <= 2500),
  value_proposition text null check (value_proposition is null or length(trim(value_proposition)) <= 2500),
  products_services text null check (products_services is null or length(trim(products_services)) <= 5000),
  operations text null check (operations is null or length(trim(operations)) <= 5000),
  marketing text null check (marketing is null or length(trim(marketing)) <= 4000),
  risks text null check (risks is null or length(trim(risks)) <= 4000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.business_start_validation (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.business_start_projects(id) on delete cascade,
  demand_status text not null default 'not_started' check (demand_status in ('not_started','evidence_found','needs_research')),
  competition_status text not null default 'not_started' check (competition_status in ('not_started','evidence_found','needs_research')),
  location_status text not null default 'not_started' check (location_status in ('not_started','evidence_found','needs_research')),
  supplier_status text not null default 'not_started' check (supplier_status in ('not_started','evidence_found','needs_research')),
  legal_status text not null default 'not_started' check (legal_status in ('not_started','evidence_found','needs_research')),
  evidence_notes text null check (evidence_notes is null or length(trim(evidence_notes)) <= 6000),
  risks text null check (risks is null or length(trim(risks)) <= 5000),
  data_confidence text not null default 'low' check (data_confidence in ('low','medium','high')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.business_start_finance (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.business_start_projects(id) on delete cascade,
  rent numeric(14,2) not null default 0 check (rent >= 0),
  interior numeric(14,2) not null default 0 check (interior >= 0),
  equipment numeric(14,2) not null default 0 check (equipment >= 0),
  license_cost numeric(14,2) not null default 0 check (license_cost >= 0),
  inventory_cost numeric(14,2) not null default 0 check (inventory_cost >= 0),
  marketing_cost numeric(14,2) not null default 0 check (marketing_cost >= 0),
  staff_cost numeric(14,2) not null default 0 check (staff_cost >= 0),
  utility_cost numeric(14,2) not null default 0 check (utility_cost >= 0),
  transport_cost numeric(14,2) not null default 0 check (transport_cost >= 0),
  other_cost numeric(14,2) not null default 0 check (other_cost >= 0),
  working_capital numeric(14,2) not null default 0 check (working_capital >= 0),
  emergency_buffer numeric(14,2) not null default 0 check (emergency_buffer >= 0),
  monthly_fixed_cost numeric(14,2) not null default 0 check (monthly_fixed_cost >= 0),
  estimated_monthly_sales numeric(14,2) not null default 0 check (estimated_monthly_sales >= 0),
  gross_margin_pct numeric(6,2) not null default 0 check (gross_margin_pct >= 0 and gross_margin_pct <= 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.business_start_locations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.business_start_projects(id) on delete cascade,
  district text not null default 'Feni' check (length(trim(district)) between 2 and 120),
  upazila text null check (upazila is null or length(trim(upazila)) <= 120),
  area text null check (area is null or length(trim(area)) <= 180),
  market_name text null check (market_name is null or length(trim(market_name)) <= 180),
  selection_reason text null check (selection_reason is null or length(trim(selection_reason)) <= 2500),
  data_confidence text not null default 'low' check (data_confidence in ('low','medium','high')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.business_start_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.business_start_projects(id) on delete cascade,
  task_key text not null check (length(trim(task_key)) between 2 and 80),
  stage text not null check (stage in ('idea','validation','planning','location','legal','finance','suppliers','setup','launch')),
  title_bn text not null check (length(trim(title_bn)) between 2 and 240),
  title_en text not null check (length(trim(title_en)) between 2 and 240),
  description_bn text null check (description_bn is null or length(trim(description_bn)) <= 800),
  description_en text null check (description_en is null or length(trim(description_en)) <= 800),
  status text not null default 'pending' check (status in ('pending','completed','skipped')),
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  sort_order integer not null default 0,
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(project_id, task_key)
);

create index if not exists business_start_tasks_project_idx
  on public.business_start_tasks (project_id, stage, sort_order);

create table if not exists public.business_start_legal_items (
  id uuid primary key default gen_random_uuid(),
  task_key text not null unique check (length(trim(task_key)) between 2 and 100),
  title_bn text not null check (length(trim(title_bn)) between 2 and 240),
  title_en text not null check (length(trim(title_en)) between 2 and 240),
  guidance_bn text null check (guidance_bn is null or length(trim(guidance_bn)) <= 1200),
  guidance_en text null check (guidance_en is null or length(trim(guidance_en)) <= 1200),
  applicability text not null default 'all',
  official_url text null check (official_url is null or length(trim(official_url)) <= 1000),
  source_name text null check (source_name is null or length(trim(source_name)) <= 200),
  last_verified_at timestamptz null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.business_start_legal_progress (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.business_start_projects(id) on delete cascade,
  legal_item_id uuid not null references public.business_start_legal_items(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','completed','not_applicable')),
  notes text null check (notes is null or length(trim(notes)) <= 2000),
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(project_id, legal_item_id)
);

create table if not exists public.business_start_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.business_start_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('business_plan','license','tax','quotation','supplier','financial','identity','location','other')),
  title text not null check (length(trim(title)) between 2 and 160),
  storage_bucket text not null default 'business-start-documents',
  storage_path text not null check (length(trim(storage_path)) between 8 and 500),
  visibility text not null default 'private' check (visibility in ('private','shared_with_investors')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_note text null check (review_note is null or length(trim(review_note)) <= 1000),
  reviewed_by uuid null references auth.users(id) on delete set null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists business_start_documents_project_idx
  on public.business_start_documents (project_id, created_at desc);

create table if not exists public.business_start_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.business_start_projects(id) on delete cascade,
  actor_id uuid null references auth.users(id) on delete set null,
  action text not null check (length(trim(action)) between 2 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists business_start_activity_project_idx
  on public.business_start_activity (project_id, created_at desc);

insert into public.business_start_legal_items
  (task_key, title_bn, title_en, guidance_bn, guidance_en, applicability, sort_order)
values
  ('legal_structure', 'ব্যবসার কাঠামো ঠিক করুন', 'Confirm business structure', 'আপনার ব্যবসার জন্য কোন কাঠামো প্রযোজ্য তা নির্ধারণ করে প্রযোজ্য সরকারি/আইনি উৎসে যাচাই করুন।', 'Determine which legal structure applies to your business and verify it against the relevant official/legal source.', 'all', 10),
  ('trade_or_local_license', 'স্থানীয় লাইসেন্স/অনুমতির প্রযোজ্যতা যাচাই করুন', 'Check local licensing requirements', 'আপনার ব্যবসার ধরন ও অবস্থানের জন্য কোন স্থানীয় লাইসেন্স বা অনুমতি প্রযোজ্য তা সংশ্লিষ্ট কর্তৃপক্ষের কাছ থেকে যাচাই করুন।', 'Verify any local license or permission applicable to your business type and location with the relevant authority.', 'all', 20),
  ('tax_registration', 'কর সংক্রান্ত নিবন্ধনের প্রযোজ্যতা যাচাই করুন', 'Check tax registration requirements', 'আপনার ব্যবসার ক্ষেত্রে কোন কর নিবন্ধন/দায়বদ্ধতা প্রযোজ্য তা অফিসিয়াল উৎসে যাচাই করুন।', 'Verify which tax registrations or obligations apply to your business using official sources.', 'all', 30),
  ('sector_permits', 'খাতভিত্তিক অনুমতি যাচাই করুন', 'Check sector-specific permits', 'খাদ্য, স্বাস্থ্য, উৎপাদন, পরিবহন বা অন্য কোনো বিশেষ খাতে অতিরিক্ত অনুমতি প্রয়োজন কি না তা যাচাই করুন।', 'Check whether your sector requires any additional permits or approvals.', 'sector', 40),
  ('safety_requirements', 'নিরাপত্তা ও সেফটি প্রয়োজনীয়তা যাচাই করুন', 'Check safety requirements', 'আপনার ব্যবসার স্থান ও কার্যক্রম অনুযায়ী প্রযোজ্য নিরাপত্তা নির্দেশনা/অনুমতি অফিসিয়াল উৎসে যাচাই করুন।', 'Verify applicable safety guidance or approvals for your premises and activities from official sources.', 'all', 50)
on conflict (task_key) do nothing;

create or replace function private.initialize_business_start_project()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.business_start_tasks
    (project_id, task_key, stage, title_bn, title_en, priority, sort_order)
  values
    (new.id, 'idea_name', 'idea', 'ব্যবসার নাম/ধারণা লিখুন', 'Name your business idea', 'high', 10),
    (new.id, 'idea_summary', 'idea', 'ব্যবসার সংক্ষিপ্ত বর্ণনা লিখুন', 'Describe the business', 'high', 20),
    (new.id, 'validation_demand', 'validation', 'গ্রাহকের চাহিদার প্রমাণ সংগ্রহ করুন', 'Collect demand evidence', 'high', 30),
    (new.id, 'validation_competition', 'validation', 'প্রতিযোগিতা যাচাই করুন', 'Review competition', 'normal', 40),
    (new.id, 'planning_customer', 'planning', 'টার্গেট গ্রাহক ঠিক করুন', 'Define your target customer', 'normal', 50),
    (new.id, 'planning_operations', 'planning', 'অপারেশন পরিকল্পনা করুন', 'Plan operations', 'normal', 60),
    (new.id, 'location_choice', 'location', 'প্রাথমিক লোকেশন নির্বাচন করুন', 'Choose a primary location', 'high', 70),
    (new.id, 'legal_review', 'legal', 'আইনি/লাইসেন্স প্রয়োজনীয়তা যাচাই করুন', 'Review legal requirements', 'high', 80),
    (new.id, 'finance_budget', 'finance', 'শুরু করার বাজেট তৈরি করুন', 'Build the startup budget', 'high', 90),
    (new.id, 'finance_buffer', 'finance', 'ওয়ার্কিং ক্যাপিটাল ও জরুরি buffer রাখুন', 'Plan working capital and buffer', 'high', 100),
    (new.id, 'supplier_plan', 'suppliers', 'প্রয়োজনীয় supplier খুঁজুন', 'Find key suppliers', 'normal', 110),
    (new.id, 'launch_profile', 'setup', 'Business profile তৈরির তথ্য প্রস্তুত করুন', 'Prepare your business profile', 'normal', 120),
    (new.id, 'launch_legal', 'launch', 'Launch-এর আগে checklist review করুন', 'Review the launch checklist', 'high', 130)
  on conflict (project_id, task_key) do nothing;

  insert into public.business_start_activity(project_id, actor_id, action, metadata)
  values (new.id, new.user_id, 'project_created', jsonb_build_object('title', new.title));

  return new;
end;
$$;

drop trigger if exists business_start_project_initialize on public.business_start_projects;
create trigger business_start_project_initialize
after insert on public.business_start_projects
for each row execute function private.initialize_business_start_project();

create or replace function private.log_business_start_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.business_start_activity(project_id, actor_id, action, metadata)
  values (
    coalesce(new.project_id, old.project_id),
    (select auth.uid()),
    lower(tg_op || '_' || tg_table_name),
    jsonb_build_object('row_id', coalesce(new.id, old.id))
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists business_start_tasks_activity on public.business_start_tasks;
create trigger business_start_tasks_activity
after update on public.business_start_tasks
for each row execute function private.log_business_start_activity();

alter table public.business_start_projects enable row level security;
alter table public.business_start_preferences enable row level security;
alter table public.business_start_plans enable row level security;
alter table public.business_start_validation enable row level security;
alter table public.business_start_finance enable row level security;
alter table public.business_start_locations enable row level security;
alter table public.business_start_tasks enable row level security;
alter table public.business_start_legal_items enable row level security;
alter table public.business_start_legal_progress enable row level security;
alter table public.business_start_documents enable row level security;
alter table public.business_start_activity enable row level security;

drop policy if exists "business_start_projects_select" on public.business_start_projects;
create policy "business_start_projects_select" on public.business_start_projects for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "business_start_projects_insert" on public.business_start_projects;
create policy "business_start_projects_insert" on public.business_start_projects for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "business_start_projects_update" on public.business_start_projects;
create policy "business_start_projects_update" on public.business_start_projects for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "business_start_projects_delete" on public.business_start_projects;
create policy "business_start_projects_delete" on public.business_start_projects for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "business_start_child_select" on public.business_start_preferences;
create policy "business_start_child_select" on public.business_start_preferences for select to authenticated
using (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())));

drop policy if exists "business_start_child_insert" on public.business_start_preferences;
create policy "business_start_child_insert" on public.business_start_preferences for insert to authenticated
with check (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())));

drop policy if exists "business_start_child_update" on public.business_start_preferences;
create policy "business_start_child_update" on public.business_start_preferences for update to authenticated
using (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())))
with check (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())));

drop policy if exists "business_start_child_delete" on public.business_start_preferences;
create policy "business_start_child_delete" on public.business_start_preferences for delete to authenticated
using (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())));

do $policy$
declare
  tbl text;
begin
  foreach tbl in array array[
    'business_start_plans',
    'business_start_validation',
    'business_start_finance',
    'business_start_locations',
    'business_start_tasks',
    'business_start_legal_progress',
    'business_start_documents'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'business_start_child_select', tbl);
    execute format('create policy %I on public.%I for select to authenticated using (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())))', 'business_start_child_select', tbl);
    execute format('drop policy if exists %I on public.%I', 'business_start_child_insert', tbl);
    execute format('create policy %I on public.%I for insert to authenticated with check (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())))', 'business_start_child_insert', tbl);
    execute format('drop policy if exists %I on public.%I', 'business_start_child_update', tbl);
    execute format('create policy %I on public.%I for update to authenticated using (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid()))) with check (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())))', 'business_start_child_update', tbl);
    execute format('drop policy if exists %I on public.%I', 'business_start_child_delete', tbl);
    execute format('create policy %I on public.%I for delete to authenticated using (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())))', 'business_start_child_delete', tbl);
  end loop;
end;
$policy$;

drop policy if exists "business_start_legal_catalog_read" on public.business_start_legal_items;
create policy "business_start_legal_catalog_read" on public.business_start_legal_items for select to authenticated
using (is_active = true);

drop policy if exists "business_start_activity_select" on public.business_start_activity;
create policy "business_start_activity_select" on public.business_start_activity for select to authenticated
using (exists (select 1 from public.business_start_projects p where p.id = project_id and p.user_id = (select auth.uid())));

revoke all on table
  public.business_start_projects,
  public.business_start_preferences,
  public.business_start_plans,
  public.business_start_validation,
  public.business_start_finance,
  public.business_start_locations,
  public.business_start_tasks,
  public.business_start_legal_items,
  public.business_start_legal_progress,
  public.business_start_documents,
  public.business_start_activity
from anon;

grant select, insert, update, delete on table public.business_start_projects to authenticated;
grant select, insert, update, delete on table public.business_start_preferences to authenticated;
grant select, insert, update, delete on table public.business_start_plans to authenticated;
grant select, insert, update, delete on table public.business_start_validation to authenticated;
grant select, insert, update, delete on table public.business_start_finance to authenticated;
grant select, insert, update, delete on table public.business_start_locations to authenticated;
grant select, update on table public.business_start_tasks to authenticated;
grant select on table public.business_start_legal_items to authenticated;
grant select, insert, update, delete on table public.business_start_legal_progress to authenticated;
grant select, insert, update, delete on table public.business_start_documents to authenticated;
grant select on table public.business_start_activity to authenticated;

revoke all on function private.initialize_business_start_project() from public, anon, authenticated;
revoke all on function private.log_business_start_activity() from public, anon, authenticated;
