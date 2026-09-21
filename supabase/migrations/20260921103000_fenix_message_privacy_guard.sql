begin;
drop policy if exists fenix_dm_participant_insert on public.fenix_direct_messages;
create policy fenix_dm_participant_insert on public.fenix_direct_messages
for insert to authenticated
with check (
  (select auth.uid())=sender_id
  and public.is_fenix_user_active((select auth.uid()))
  and public.is_fenix_user_active(recipient_id)
  and coalesce((select ps.message_permissions from public.profile_settings ps where ps.user_id=recipient_id),'everyone') <> 'nobody'
);
commit;