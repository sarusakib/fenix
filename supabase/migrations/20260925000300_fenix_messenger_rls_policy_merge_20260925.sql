-- Merge Messenger UPDATE policies into a single participant policy.
drop policy if exists fenix_dm_recipient_read on public.fenix_direct_messages;
drop policy if exists fenix_dm_sender_update on public.fenix_direct_messages;

drop policy if exists fenix_dm_participant_update on public.fenix_direct_messages;
create policy fenix_dm_participant_update
  on public.fenix_direct_messages for update to authenticated
  using (
    (select auth.uid()) = sender_id
    or (select auth.uid()) = recipient_id
  )
  with check (
    (select auth.uid()) = sender_id
    or (select auth.uid()) = recipient_id
  );
