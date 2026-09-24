-- FeniX Messenger master upgrade
alter table public.fenix_direct_messages
  add column if not exists message_type text not null default 'text',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.fenix_direct_messages
  drop constraint if exists fenix_direct_messages_message_type_check;
alter table public.fenix_direct_messages
  add constraint fenix_direct_messages_message_type_check
  check (message_type in ('text','image','video','file','audio','location','gif'));

alter table public.fenix_direct_messages
  drop constraint if exists fenix_direct_messages_attachment_size_check;
alter table public.fenix_direct_messages
  add constraint fenix_direct_messages_attachment_size_check
  check (attachment_size is null or (attachment_size >= 0 and attachment_size <= 10485760));

create table if not exists public.fenix_message_pins (
  message_id uuid not null references public.fenix_direct_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (message_id, user_id)
);

create index if not exists fenix_message_pins_user_created_idx
  on public.fenix_message_pins(user_id, created_at desc);

alter table public.fenix_message_pins enable row level security;

drop policy if exists fenix_message_pins_participant_select on public.fenix_message_pins;
create policy fenix_message_pins_participant_select
  on public.fenix_message_pins for select to authenticated
  using (
    exists (
      select 1 from public.fenix_direct_messages m
      where m.id = message_id
        and (m.sender_id = (select auth.uid()) or m.recipient_id = (select auth.uid()))
    )
  );

drop policy if exists fenix_message_pins_own_insert on public.fenix_message_pins;
create policy fenix_message_pins_own_insert
  on public.fenix_message_pins for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.fenix_direct_messages m
      where m.id = message_id
        and (m.sender_id = (select auth.uid()) or m.recipient_id = (select auth.uid()))
    )
  );

drop policy if exists fenix_message_pins_own_delete on public.fenix_message_pins;
create policy fenix_message_pins_own_delete
  on public.fenix_message_pins for delete to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.fenix_dm_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists fenix_dm_blocks_blocked_idx
  on public.fenix_dm_blocks(blocked_id, created_at desc);

alter table public.fenix_dm_blocks enable row level security;

drop policy if exists fenix_dm_blocks_own_select on public.fenix_dm_blocks;
create policy fenix_dm_blocks_own_select
  on public.fenix_dm_blocks for select to authenticated
  using (blocker_id = (select auth.uid()));

drop policy if exists fenix_dm_blocks_own_insert on public.fenix_dm_blocks;
create policy fenix_dm_blocks_own_insert
  on public.fenix_dm_blocks for insert to authenticated
  with check (
    blocker_id = (select auth.uid())
    and blocker_id <> blocked_id
    and private.is_fenix_user_active((select auth.uid()))
  );

drop policy if exists fenix_dm_blocks_own_delete on public.fenix_dm_blocks;
create policy fenix_dm_blocks_own_delete
  on public.fenix_dm_blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

drop policy if exists fenix_dm_sender_update on public.fenix_direct_messages;
create policy fenix_dm_sender_update
  on public.fenix_direct_messages for update to authenticated
  using ((select auth.uid()) = sender_id)
  with check ((select auth.uid()) = sender_id);

create or replace function private.fenix_protect_direct_message_update()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public, auth, private
as $$
declare
  actor uuid := auth.uid();
begin
  if actor = old.sender_id then
    if new.sender_id is distinct from old.sender_id
       or new.recipient_id is distinct from old.recipient_id
       or new.created_at is distinct from old.created_at
       or new.read_at is distinct from old.read_at
       or new.reply_to_id is distinct from old.reply_to_id
       or new.attachment_path is distinct from old.attachment_path
       or new.attachment_name is distinct from old.attachment_name
       or new.attachment_type is distinct from old.attachment_type
       or new.attachment_size is distinct from old.attachment_size
       or new.message_type is distinct from old.message_type
       or new.metadata is distinct from old.metadata then
      if new.deleted_for_sender_at is distinct from old.deleted_for_sender_at
         and new.body is not distinct from old.body
         and new.edited_at is not distinct from old.edited_at
      then
        return new;
      end if;
      raise exception 'Only message content, edit state, and sender deletion state may be changed by the sender';
    end if;
    return new;
  end if;

  if actor = old.recipient_id then
    if new.sender_id is distinct from old.sender_id
       or new.recipient_id is distinct from old.recipient_id
       or new.created_at is distinct from old.created_at
       or new.body is distinct from old.body
       or new.reply_to_id is distinct from old.reply_to_id
       or new.attachment_path is distinct from old.attachment_path
       or new.attachment_name is distinct from old.attachment_name
       or new.attachment_type is distinct from old.attachment_type
       or new.attachment_size is distinct from old.attachment_size
       or new.edited_at is distinct from old.edited_at
       or new.deleted_for_sender_at is distinct from old.deleted_for_sender_at
       or new.message_type is distinct from old.message_type
       or new.metadata is distinct from old.metadata then
      raise exception 'Only read and recipient deletion state may be changed by the recipient';
    end if;
    return new;
  end if;

  raise exception 'Not a message participant';
end;
$$;

drop trigger if exists fenix_protect_direct_message_update on public.fenix_direct_messages;
create trigger fenix_protect_direct_message_update
before update on public.fenix_direct_messages
for each row execute function private.fenix_protect_direct_message_update();

create or replace function private.fenix_can_receive_message(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  select coalesce(
    (
      select ps.message_permissions <> 'nobody'
      from public.profile_settings ps
      where ps.user_id = p_user_id
    ),
    true
  )
  and private.is_fenix_user_active(p_user_id)
  and not exists (
    select 1
    from public.fenix_dm_blocks b
    where b.blocker_id = p_user_id
      and b.blocked_id = auth.uid()
  );
$function$;

grant select, insert, delete on public.fenix_message_pins to authenticated;
grant select, insert, delete on public.fenix_dm_blocks to authenticated;
