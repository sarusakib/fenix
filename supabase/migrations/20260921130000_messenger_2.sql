-- FeniX Messenger 2.0 foundation: media, reply, edit and reactions.
begin;

alter table public.fenix_direct_messages
  add column if not exists reply_to_id uuid,
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text,
  add column if not exists attachment_size integer,
  add column if not exists edited_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname='fenix_direct_messages_reply_to_id_fkey') then
    alter table public.fenix_direct_messages
      add constraint fenix_direct_messages_reply_to_id_fkey
      foreign key (reply_to_id) references public.fenix_direct_messages(id) on delete set null;
  end if;
end $$;

alter table public.fenix_direct_messages
  drop constraint if exists fenix_direct_messages_attachment_size_check;
alter table public.fenix_direct_messages
  add constraint fenix_direct_messages_attachment_size_check
  check (attachment_size is null or (attachment_size > 0 and attachment_size <= 10485760));

create index if not exists fenix_direct_messages_conversation_created_idx
  on public.fenix_direct_messages (sender_id, recipient_id, created_at desc);

create index if not exists fenix_direct_messages_reply_idx
  on public.fenix_direct_messages (reply_to_id)
  where reply_to_id is not null;

create table if not exists public.fenix_message_reactions (
  message_id uuid not null references public.fenix_direct_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (reaction in ('like','love','haha','wow','sad','angry')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (message_id, user_id)
);

create index if not exists fenix_message_reactions_message_idx
  on public.fenix_message_reactions(message_id, reaction);

alter table public.fenix_message_reactions enable row level security;

drop policy if exists fenix_message_reactions_participant_select on public.fenix_message_reactions;
create policy fenix_message_reactions_participant_select
on public.fenix_message_reactions for select to authenticated
using (
  exists (
    select 1 from public.fenix_direct_messages m
    where m.id=message_id
      and (m.sender_id=(select auth.uid()) or m.recipient_id=(select auth.uid()))
  )
);

drop policy if exists fenix_message_reactions_own_insert on public.fenix_message_reactions;
create policy fenix_message_reactions_own_insert
on public.fenix_message_reactions for insert to authenticated
with check (
  (select auth.uid())=user_id
  and exists (
    select 1 from public.fenix_direct_messages m
    where m.id=message_id
      and (m.sender_id=(select auth.uid()) or m.recipient_id=(select auth.uid()))
  )
);

drop policy if exists fenix_message_reactions_own_update on public.fenix_message_reactions;
create policy fenix_message_reactions_own_update
on public.fenix_message_reactions for update to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);

drop policy if exists fenix_message_reactions_own_delete on public.fenix_message_reactions;
create policy fenix_message_reactions_own_delete
on public.fenix_message_reactions for delete to authenticated
using ((select auth.uid())=user_id);

revoke all on public.fenix_message_reactions from public, anon;
grant select, insert, update, delete on public.fenix_message_reactions to authenticated;

do $$
begin
  if not exists (select 1 from storage.buckets where id='chat-media') then
    insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
    values (
      'chat-media','chat-media',false,10485760,
      array['image/jpeg','image/png','image/webp','image/gif','audio/mpeg','audio/ogg','audio/webm','video/mp4','video/webm','application/pdf']
    );
  else
    update storage.buckets
    set public=false,
        file_size_limit=10485760,
        allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif','audio/mpeg','audio/ogg','audio/webm','video/mp4','video/webm','application/pdf']
    where id='chat-media';
  end if;
end $$;

drop policy if exists fenix_chat_media_insert on storage.objects;
create policy fenix_chat_media_insert
on storage.objects for insert to authenticated
with check (
  bucket_id='chat-media'
  and (storage.foldername(name))[1]=(select auth.uid()::text)
);

drop policy if exists fenix_chat_media_select on storage.objects;
create policy fenix_chat_media_select
on storage.objects for select to authenticated
using (
  bucket_id='chat-media'
  and (
    (storage.foldername(name))[1]=(select auth.uid()::text)
    or exists (
      select 1
      from public.fenix_direct_messages m
      where m.attachment_path=name
        and (m.sender_id=(select auth.uid()) or m.recipient_id=(select auth.uid()))
    )
  )
);

drop policy if exists fenix_chat_media_update on storage.objects;
create policy fenix_chat_media_update
on storage.objects for update to authenticated
using (bucket_id='chat-media' and (storage.foldername(name))[1]=(select auth.uid()::text))
with check (bucket_id='chat-media' and (storage.foldername(name))[1]=(select auth.uid()::text));

drop policy if exists fenix_chat_media_delete on storage.objects;
create policy fenix_chat_media_delete
on storage.objects for delete to authenticated
using (bucket_id='chat-media' and (storage.foldername(name))[1]=(select auth.uid()::text));

commit;
