-- FeniX social graph and notification preference hardening.

-- Follow relationships are private to authenticated participants; notification
-- preference is respected by trust/verification emitters.

alter table public.profile_settings
  add column if not exists notification_preferences jsonb not null default '{"push":true,"messages":true,"social":true,"trust":true,"news":true}'::jsonb;

create table if not exists public.fenix_profile_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (follower_id, following_id),
  constraint fenix_profile_follows_no_self check (follower_id <> following_id)
);

create index if not exists fenix_profile_follows_following_idx
  on public.fenix_profile_follows (following_id, created_at desc);

alter table public.fenix_profile_follows enable row level security;

drop policy if exists fenix_profile_follows_select_self on public.fenix_profile_follows;
drop policy if exists fenix_profile_follows_insert_self on public.fenix_profile_follows;
drop policy if exists fenix_profile_follows_delete_self on public.fenix_profile_follows;

create policy fenix_profile_follows_select_self
  on public.fenix_profile_follows
  for select to authenticated
  using ((select auth.uid()) = follower_id or (select auth.uid()) = following_id);

create policy fenix_profile_follows_insert_self
  on public.fenix_profile_follows
  for insert to authenticated
  with check ((select auth.uid()) = follower_id and follower_id <> following_id);

create policy fenix_profile_follows_delete_self
  on public.fenix_profile_follows
  for delete to authenticated
  using ((select auth.uid()) = follower_id);

revoke all on public.fenix_profile_follows from public, anon, authenticated;
grant select, insert, delete on public.fenix_profile_follows to authenticated;

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
  notifications_enabled boolean;
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

  select case when ps.notification_preferences->>'trust' = 'false' then false else true end
    into notifications_enabled
  from public.profile_settings ps
  where ps.user_id = recipient_id;

  if coalesce(notifications_enabled, true) = false then
    return new;
  end if;

  insert into public.fenix_notifications (user_id, kind, title, body, href)
  values (recipient_id, 'trust', title_text, body_text, link_text);
  return new;
end;
$$;

create or replace function private.notify_verification_status_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  notifications_enabled boolean;
begin
  if new.status <> old.status then
    select case when ps.notification_preferences->>'trust' = 'false' then false else true end
      into notifications_enabled
    from public.profile_settings ps
    where ps.user_id = new.requester_id;

    if coalesce(notifications_enabled, true) = false then
      return new;
    end if;

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
