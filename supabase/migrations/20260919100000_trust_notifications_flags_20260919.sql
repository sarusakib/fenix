-- FeniX Trust, identity, notifications and feature-flag foundation.
-- Public reviews are moderation-gated. Claims/reports are private to participants/admins.
-- Notifications are private. Feature flags expose only enabled flags to public roles.

create schema if not exists private;

create table if not exists public.business_claim_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  note text not null default '',
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','withdrawn')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists business_claim_requests_pending_uidx
  on public.business_claim_requests (business_id, claimant_id)
  where status = 'pending';
create index if not exists business_claim_requests_claimant_idx
  on public.business_claim_requests (claimant_id, created_at desc);
create index if not exists business_claim_requests_business_idx
  on public.business_claim_requests (business_id, created_at desc);

create table if not exists public.business_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  status text not null default 'pending'
    check (status in ('pending','published','rejected','hidden')),
  admin_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (business_id, author_id)
);

create index if not exists business_reviews_business_status_idx
  on public.business_reviews (business_id, status, created_at desc);
create index if not exists business_reviews_author_idx
  on public.business_reviews (author_id, created_at desc);

create table if not exists public.business_reports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text not null,
  status text not null default 'pending'
    check (status in ('pending','reviewing','resolved','dismissed')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists business_reports_status_idx
  on public.business_reports (status, created_at desc);
create index if not exists business_reports_business_idx
  on public.business_reports (business_id, created_at desc);
create index if not exists business_reports_reporter_idx
  on public.business_reports (reporter_id, created_at desc);

create table if not exists public.fenix_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'system',
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists fenix_notifications_user_read_idx
  on public.fenix_notifications (user_id, read_at, created_at desc);

create table if not exists public.fenix_feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.fenix_feature_flags (key, enabled, description)
values
  ('directory_reviews', true, 'Business directory review foundation'),
  ('directory_claims', true, 'Business ownership claim workflow'),
  ('opportunity_radar', true, 'Observed-signal opportunity radar'),
  ('notifications', true, 'Account notifications surface'),
  ('qr_business_identity', true, 'QR identity route foundation')
on conflict (key) do nothing;

alter table public.business_claim_requests enable row level security;
alter table public.business_reviews enable row level security;
alter table public.business_reports enable row level security;
alter table public.fenix_notifications enable row level security;
alter table public.fenix_feature_flags enable row level security;

drop policy if exists business_claim_requests_select_own on public.business_claim_requests;
drop policy if exists business_claim_requests_insert_own on public.business_claim_requests;
drop policy if exists business_claim_requests_admin_update on public.business_claim_requests;

create policy business_claim_requests_select_own
  on public.business_claim_requests
  for select to authenticated
  using ((select auth.uid()) = claimant_id or public.is_fenix_admin());

create policy business_claim_requests_insert_own
  on public.business_claim_requests
  for insert to authenticated
  with check ((select auth.uid()) = claimant_id);

create policy business_claim_requests_admin_update
  on public.business_claim_requests
  for update to authenticated
  using (public.is_fenix_admin())
  with check (public.is_fenix_admin());

drop policy if exists business_reviews_public_read on public.business_reviews;
drop policy if exists business_reviews_own_insert on public.business_reviews;
drop policy if exists business_reviews_own_update_pending on public.business_reviews;
drop policy if exists business_reviews_admin_update on public.business_reviews;

create policy business_reviews_public_read
  on public.business_reviews
  for select to anon, authenticated
  using (status = 'published' or (select auth.uid()) = author_id or public.is_fenix_admin());

create policy business_reviews_own_insert
  on public.business_reviews
  for insert to authenticated
  with check ((select auth.uid()) = author_id and status = 'pending');

create policy business_reviews_own_update_pending
  on public.business_reviews
  for update to authenticated
  using ((select auth.uid()) = author_id and status = 'pending')
  with check ((select auth.uid()) = author_id and status = 'pending');

create policy business_reviews_admin_update
  on public.business_reviews
  for update to authenticated
  using (public.is_fenix_admin())
  with check (public.is_fenix_admin());

drop policy if exists business_reports_own_read on public.business_reports;
drop policy if exists business_reports_own_insert on public.business_reports;
drop policy if exists business_reports_admin_update on public.business_reports;

create policy business_reports_own_read
  on public.business_reports
  for select to authenticated
  using ((select auth.uid()) = reporter_id or public.is_fenix_admin());

create policy business_reports_own_insert
  on public.business_reports
  for insert to authenticated
  with check ((select auth.uid()) = reporter_id);

create policy business_reports_admin_update
  on public.business_reports
  for update to authenticated
  using (public.is_fenix_admin())
  with check (public.is_fenix_admin());

drop policy if exists fenix_notifications_own_read on public.fenix_notifications;
drop policy if exists fenix_notifications_own_update on public.fenix_notifications;

create policy fenix_notifications_own_read
  on public.fenix_notifications
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy fenix_notifications_own_update
  on public.fenix_notifications
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists fenix_feature_flags_public_read on public.fenix_feature_flags;
drop policy if exists fenix_feature_flags_admin_write on public.fenix_feature_flags;

create policy fenix_feature_flags_public_read
  on public.fenix_feature_flags
  for select to anon, authenticated
  using (enabled or public.is_fenix_admin());

create policy fenix_feature_flags_admin_write
  on public.fenix_feature_flags
  for all to authenticated
  using (public.is_fenix_admin())
  with check (public.is_fenix_admin());

revoke all on public.business_claim_requests from public, anon, authenticated;
grant select, insert, update on public.business_claim_requests to authenticated;

revoke all on public.business_reviews from public, anon, authenticated;
grant select, insert, update on public.business_reviews to anon, authenticated;

revoke all on public.business_reports from public, anon, authenticated;
grant select, insert, update on public.business_reports to authenticated;

revoke all on public.fenix_notifications from public, anon, authenticated;
grant select, update on public.fenix_notifications to authenticated;

revoke all on public.fenix_feature_flags from public, anon, authenticated;
grant select, insert, update, delete on public.fenix_feature_flags to authenticated;
grant select on public.fenix_feature_flags to anon;

create or replace function public.touch_trust_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke execute on function public.touch_trust_updated_at() from public, anon, authenticated;

drop trigger if exists business_claim_requests_touch on public.business_claim_requests;
create trigger business_claim_requests_touch
before update on public.business_claim_requests
for each row execute function public.touch_trust_updated_at();

drop trigger if exists business_reviews_touch on public.business_reviews;
create trigger business_reviews_touch
before update on public.business_reviews
for each row execute function public.touch_trust_updated_at();

drop trigger if exists business_reports_touch on public.business_reports;
create trigger business_reports_touch
before update on public.business_reports
for each row execute function public.touch_trust_updated_at();

drop trigger if exists fenix_feature_flags_touch on public.fenix_feature_flags;
create trigger fenix_feature_flags_touch
before update on public.fenix_feature_flags
for each row execute function public.touch_trust_updated_at();
