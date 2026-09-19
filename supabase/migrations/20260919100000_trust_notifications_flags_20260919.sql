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


create or replace function public.sync_approved_business_claim()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $
begin
  if new.status = 'approved' and (old.status is distinct from new.status) then
    update public.businesses
      set owner_id = new.claimant_id,
          updated_at = timezone('utc', now())
    where id = new.business_id
      and (owner_id is null or owner_id = new.claimant_id);

    update public.business_directory_profiles
      set owner_claimed = true,
          verification_level = case
            when verification_level = 'fenix_verified' then verification_level
            when verification_level in ('business_reviewed','identity_reviewed') then verification_level
            else 'owner_claimed'
          end,
          updated_at = timezone('utc', now())
    where business_id = new.business_id;
  end if;
  return new;
end;
$$;

revoke execute on function public.sync_approved_business_claim() from public, anon, authenticated;

drop trigger if exists business_claim_requests_sync_approved on public.business_claim_requests;
create trigger business_claim_requests_sync_approved
after update of status on public.business_claim_requests
for each row execute function public.sync_approved_business_claim();


create or replace function private.notify_trust_status_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  recipient_id uuid;
  title_text text;
  body_text text;
  link_text text;
begin
  if new.status = old.status then return new; end if;

  if tg_table_name = 'business_claim_requests' then
    recipient_id := new.claimant_id;
    title_text := case new.status when 'approved' then 'Business claim approved' when 'rejected' then 'Business claim needs attention' else 'Business claim updated' end;
    body_text := case new.status when 'approved' then 'Your business ownership claim was approved by a FeniX reviewer.' when 'rejected' then 'Your business ownership claim was rejected or needs changes.' else 'Your business ownership claim status changed to ' || new.status || '.' end;
    link_text := '/directory/manage';
  elsif tg_table_name = 'business_reviews' then
    recipient_id := new.author_id;
    title_text := case new.status when 'published' then 'Business review published' when 'rejected' then 'Business review not published' else 'Business review updated' end;
    body_text := case new.status when 'published' then 'Your business review is now visible on the FeniX business profile.' when 'rejected' then 'Your business review was not published.' else 'Your business review status changed to ' || new.status || '.' end;
    link_text := '/directory/' || new.business_id::text;
  elsif tg_table_name = 'business_reports' then
    recipient_id := new.reporter_id;
    title_text := case new.status when 'resolved' then 'Trust report reviewed' when 'dismissed' then 'Trust report reviewed' else 'Trust report updated' end;
    body_text := 'Your business listing report status changed to ' || new.status || '.';
    link_text := '/directory/' || new.business_id::text;
  else
    return new;
  end if;

  insert into public.fenix_notifications (user_id, kind, title, body, href)
  values (recipient_id, 'trust', title_text, body_text, link_text);
  return new;
end;
$$;

revoke all on function private.notify_trust_status_change() from public, anon, authenticated;

drop trigger if exists business_claim_requests_notify_status on public.business_claim_requests;
create trigger business_claim_requests_notify_status
after update of status on public.business_claim_requests
for each row execute function private.notify_trust_status_change();

drop trigger if exists business_reviews_notify_status on public.business_reviews;
create trigger business_reviews_notify_status
after update of status on public.business_reviews
for each row execute function private.notify_trust_status_change();

drop trigger if exists business_reports_notify_status on public.business_reports;
create trigger business_reports_notify_status
after update of status on public.business_reports
for each row execute function private.notify_trust_status_change();


create or replace function private.guard_business_claim_approval()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_owner uuid;
begin
  if new.status = 'approved' and old.status is distinct from new.status then
    select owner_id into current_owner from public.businesses where id = new.business_id;
    if current_owner is not null and current_owner <> new.claimant_id then
      raise exception 'BUSINESS_ALREADY_OWNED';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.guard_business_claim_approval() from public, anon, authenticated;

drop trigger if exists business_claim_requests_guard_approval on public.business_claim_requests;
create trigger business_claim_requests_guard_approval
before update of status on public.business_claim_requests
for each row execute function private.guard_business_claim_approval();


create index if not exists business_claim_requests_reviewed_by_idx on public.business_claim_requests (reviewed_by, reviewed_at desc);
create index if not exists business_reviews_reviewed_by_idx on public.business_reviews (reviewed_by, reviewed_at desc);
create index if not exists business_reports_reviewer_idx on public.business_reports (reviewer_id, resolved_at desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'business_claim_requests_note_len_check') then
    alter table public.business_claim_requests add constraint business_claim_requests_note_len_check check (length(note) <= 2000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'business_reviews_title_len_check') then
    alter table public.business_reviews add constraint business_reviews_title_len_check check (title is null or length(title) <= 160);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'business_reviews_body_len_check') then
    alter table public.business_reviews add constraint business_reviews_body_len_check check (length(body) between 10 and 2500);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'business_reports_reason_len_check') then
    alter table public.business_reports add constraint business_reports_reason_len_check check (length(reason) between 2 and 80);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'business_reports_details_len_check') then
    alter table public.business_reports add constraint business_reports_details_len_check check (length(details) between 10 and 3000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fenix_notifications_kind_len_check') then
    alter table public.fenix_notifications add constraint fenix_notifications_kind_len_check check (length(kind) between 1 and 40);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fenix_notifications_title_len_check') then
    alter table public.fenix_notifications add constraint fenix_notifications_title_len_check check (length(title) between 1 and 200);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fenix_notifications_body_len_check') then
    alter table public.fenix_notifications add constraint fenix_notifications_body_len_check check (length(body) between 1 and 1000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fenix_notifications_href_len_check') then
    alter table public.fenix_notifications add constraint fenix_notifications_href_len_check check (href is null or length(href) <= 500);
  end if;
end
$$;


drop policy if exists business_reviews_own_update_pending on public.business_reviews;
drop policy if exists business_reviews_admin_update on public.business_reviews;

create policy business_reviews_update
  on public.business_reviews
  for update to authenticated
  using (
    public.is_fenix_admin()
    or ((select auth.uid()) = author_id and status = 'pending')
  )
  with check (
    public.is_fenix_admin()
    or ((select auth.uid()) = author_id and status = 'pending')
  );

drop policy if exists fenix_feature_flags_admin_write on public.fenix_feature_flags;

create policy fenix_feature_flags_admin_insert
  on public.fenix_feature_flags
  for insert to authenticated
  with check (public.is_fenix_admin());

create policy fenix_feature_flags_admin_update
  on public.fenix_feature_flags
  for update to authenticated
  using (public.is_fenix_admin())
  with check (public.is_fenix_admin());

create policy fenix_feature_flags_admin_delete
  on public.fenix_feature_flags
  for delete to authenticated
  using (public.is_fenix_admin());


create or replace function public.save_business_embedding(p_business_id uuid, p_embedding extensions.vector)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public, extensions
as $$
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  update public.businesses
  set feni_brain_embedding = p_embedding,
      updated_at = timezone('utc', now())
  where id = p_business_id
    and owner_id = (select auth.uid());

  return found;
end;
$$;

revoke execute on function public.save_business_embedding(uuid, extensions.vector) from public, anon, authenticated;
grant execute on function public.save_business_embedding(uuid, extensions.vector) to authenticated;


create table if not exists public.business_verification_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  verification_type text not null check (verification_type in ('identity','phone','location','business')),
  evidence_note text not null default '',
  status text not null default 'pending' check (status in ('pending','reviewing','approved','rejected','cancelled')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists business_verification_requests_pending_uidx
  on public.business_verification_requests (business_id, requester_id, verification_type)
  where status in ('pending','reviewing');

create index if not exists business_verification_requests_business_idx
  on public.business_verification_requests (business_id, created_at desc);
create index if not exists business_verification_requests_requester_idx
  on public.business_verification_requests (requester_id, created_at desc);
create index if not exists business_verification_requests_reviewer_idx
  on public.business_verification_requests (reviewed_by, reviewed_at desc);

alter table public.business_verification_requests enable row level security;

drop policy if exists business_verification_requests_select on public.business_verification_requests;
drop policy if exists business_verification_requests_insert on public.business_verification_requests;
drop policy if exists business_verification_requests_update on public.business_verification_requests;

create policy business_verification_requests_select
  on public.business_verification_requests
  for select to authenticated
  using ((select auth.uid()) = requester_id or public.is_fenix_admin());

create policy business_verification_requests_insert
  on public.business_verification_requests
  for insert to authenticated
  with check (
    (select auth.uid()) = requester_id
    and exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = (select auth.uid())
    )
    and status = 'pending'
  );

create policy business_verification_requests_update
  on public.business_verification_requests
  for update to authenticated
  using (public.is_fenix_admin())
  with check (public.is_fenix_admin());

revoke all on public.business_verification_requests from public, anon, authenticated;
grant select, insert, update on public.business_verification_requests to authenticated;

create or replace function public.apply_business_verification_decision()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'approved' and old.status is distinct from new.status then
    update public.business_directory_profiles
    set
      owner_claimed = true,
      phone_verified = case when new.verification_type = 'phone' then true else phone_verified end,
      location_verified = case when new.verification_type = 'location' then true else location_verified end,
      verification_level = case
        when new.verification_type = 'identity' then
          case when verification_level = 'fenix_verified' then verification_level else 'identity_reviewed' end
        when new.verification_type = 'business' then 'business_reviewed'
        when verification_level = 'fenix_verified' then verification_level
        else verification_level
      end,
      last_verified_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
    where business_id = new.business_id;
  end if;
  return new;
end;
$$;

revoke all on function public.apply_business_verification_decision() from public, anon, authenticated;

drop trigger if exists business_verification_requests_apply on public.business_verification_requests;
create trigger business_verification_requests_apply
after update of status on public.business_verification_requests
for each row execute function public.apply_business_verification_decision();

create or replace function private.notify_verification_status_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status <> old.status then
    insert into public.fenix_notifications (user_id, kind, title, body, href)
    values (
      new.requester_id,
      'verification',
      case new.status
        when 'approved' then 'Business verification approved'
        when 'rejected' then 'Business verification needs attention'
        else 'Business verification updated'
      end,
      case new.status
        when 'approved' then 'Your business verification request was approved by a FeniX reviewer.'
        when 'rejected' then 'Your business verification request was rejected or needs changes.'
        else 'Your business verification request status changed to ' || new.status || '.'
      end,
      '/directory/manage'
    );
  end if;
  return new;
end;
$$;

revoke all on function private.notify_verification_status_change() from public, anon, authenticated;

drop trigger if exists business_verification_requests_notify on public.business_verification_requests;
create trigger business_verification_requests_notify
after update of status on public.business_verification_requests
for each row execute function private.notify_verification_status_change();

drop trigger if exists business_verification_requests_touch on public.business_verification_requests;
create trigger business_verification_requests_touch
before update on public.business_verification_requests
for each row execute function public.touch_trust_updated_at();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'business_verification_requests_evidence_len_check') then
    alter table public.business_verification_requests
      add constraint business_verification_requests_evidence_len_check check (length(evidence_note) <= 3000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'business_verification_requests_review_note_len_check') then
    alter table public.business_verification_requests
      add constraint business_verification_requests_review_note_len_check check (review_note is null or length(review_note) <= 2000);
  end if;
end $$;
