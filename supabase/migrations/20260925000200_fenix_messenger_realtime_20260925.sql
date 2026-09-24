-- FeniX Messenger realtime publication
do $$
begin
  if exists (select 1 from pg_publication where pubname='supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public' and tablename='fenix_direct_messages'
    ) then
      alter publication supabase_realtime add table public.fenix_direct_messages;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public' and tablename='fenix_message_reactions'
    ) then
      alter publication supabase_realtime add table public.fenix_message_reactions;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public' and tablename='fenix_message_pins'
    ) then
      alter publication supabase_realtime add table public.fenix_message_pins;
    end if;
  end if;
end
$$;
