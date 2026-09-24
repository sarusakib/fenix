-- FeniX Messenger sender deletion guard
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
      raise exception 'Only message content, edit state, and sender/recipient deletion state may be changed by the sender';
    end if;
    if new.deleted_for_sender_at is distinct from old.deleted_for_sender_at
       or new.deleted_for_recipient_at is distinct from old.deleted_for_recipient_at then
      if new.body is not distinct from old.body
         and new.edited_at is not distinct from old.edited_at then
        return new;
      end if;
      raise exception 'Deletion cannot change message content';
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
