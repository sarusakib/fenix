-- FeniX social notification emitters.
-- Only private triggers call these helpers; preference keys are enforced before
-- notification rows are inserted.

create or replace function private.fenix_emit_activity_notification(
  p_recipient_id uuid,
  p_actor_id uuid,
  p_preference_key text,
  p_kind text,
  p_title text,
  p_body text,
  p_href text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  enabled boolean;
begin
  if p_recipient_id is null or p_actor_id is null or p_recipient_id = p_actor_id then
    return;
  end if;

  select case
    when ps.notification_preferences ? p_preference_key
      then coalesce(nullif(lower(ps.notification_preferences->>p_preference_key), ''), 'true') <> 'false'
    else true
  end
  into enabled
  from public.profile_settings ps
  where ps.user_id = p_recipient_id;

  if coalesce(enabled, true) = false then
    return;
  end if;

  insert into public.fenix_notifications (user_id, kind, title, body, href)
  values (p_recipient_id, p_kind, left(p_title, 200), left(p_body, 1000), left(p_href, 500));
end;
$$;

revoke all on function private.fenix_emit_activity_notification(uuid,uuid,text,text,text,text,text) from public, anon, authenticated;

create or replace function private.notify_fenix_social_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  recipient_id uuid;
  actor_id uuid;
  actor_name text;
  actor_username text;
  target_path text;
  title_text text;
  body_text text;
  pref_key text;
begin
  if tg_table_name = 'fenix_profile_follows' then
    recipient_id := new.following_id;
    actor_id := new.follower_id;
    target_path := '/profile';
    select coalesce(nullif(full_name, ''), nullif(username, ''), 'FeniX user')
      into actor_name from public.profiles where id = actor_id;
    title_text := 'New follower';
    body_text := coalesce(actor_name, 'A FeniX user') || ' started following you.';
    pref_key := 'social';
  elsif tg_table_name = 'fenix_direct_messages' then
    recipient_id := new.recipient_id;
    actor_id := new.sender_id;
    target_path := '/messages';
    select coalesce(nullif(full_name, ''), nullif(username, ''), 'FeniX user')
      into actor_name from public.profiles where id = actor_id;
    title_text := 'New message';
    body_text := coalesce(actor_name, 'A FeniX user') || ' sent you a message.';
    pref_key := 'messages';
  elsif tg_table_name = 'fenix_content_comments' then
    actor_id := new.author_id;
    if new.content_type = 'post' then
      select author_id into recipient_id from public.fenix_posts where id = new.content_id and deleted_at is null;
      target_path := '/feed/post/' || new.content_id::text;
      title_text := 'New comment';
      body_text := 'Someone commented on your post.';
    elsif new.content_type = 'question' then
      select author_id into recipient_id from public.fenix_questions where id = new.content_id;
      target_path := '/feed/question/' || new.content_id::text;
      title_text := 'New comment';
      body_text := 'Someone commented on your question.';
    elsif new.content_type = 'news' then
      select author_id into recipient_id from public.news_posts where id = new.content_id;
      target_path := '/news';
      title_text := 'New comment';
      body_text := 'Someone commented on your published story.';
    end if;
    pref_key := 'social';
  elsif tg_table_name = 'fenix_content_votes' then
    actor_id := new.user_id;
    if new.content_type = 'post' then
      select author_id into recipient_id from public.fenix_posts where id = new.content_id and deleted_at is null;
      target_path := '/feed/post/' || new.content_id::text;
      title_text := 'Post liked';
      body_text := 'Someone liked your post.';
    elsif new.content_type = 'question' then
      select author_id into recipient_id from public.fenix_questions where id = new.content_id;
      target_path := '/feed/question/' || new.content_id::text;
      title_text := 'Question liked';
      body_text := 'Someone marked your question as helpful.';
    elsif new.content_type = 'news' then
      select author_id into recipient_id from public.news_posts where id = new.content_id;
      target_path := '/news';
      title_text := 'Story liked';
      body_text := 'Someone liked your published story.';
    end if;
    pref_key := 'social';
  else
    return new;
  end if;

  perform private.fenix_emit_activity_notification(
    recipient_id, actor_id, pref_key, pref_key, title_text, body_text,
    coalesce(target_path, '/feed')
  );
  return new;
end;
$$;

revoke all on function private.notify_fenix_social_activity() from public, anon, authenticated;

drop trigger if exists fenix_profile_follows_notify on public.fenix_profile_follows;
create trigger fenix_profile_follows_notify after insert on public.fenix_profile_follows
for each row execute function private.notify_fenix_social_activity();

drop trigger if exists fenix_direct_messages_notify on public.fenix_direct_messages;
create trigger fenix_direct_messages_notify after insert on public.fenix_direct_messages
for each row execute function private.notify_fenix_social_activity();

drop trigger if exists fenix_content_comments_notify on public.fenix_content_comments;
create trigger fenix_content_comments_notify after insert on public.fenix_content_comments
for each row execute function private.notify_fenix_social_activity();

drop trigger if exists fenix_content_votes_notify on public.fenix_content_votes;
create trigger fenix_content_votes_notify after insert on public.fenix_content_votes
for each row execute function private.notify_fenix_social_activity();
