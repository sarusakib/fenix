begin;

alter table public.fenix_content_votes
  drop constraint if exists fenix_content_votes_content_type_check;
alter table public.fenix_content_votes
  add constraint fenix_content_votes_content_type_check
  check (content_type in ('question','answer','post'));

alter table public.fenix_content_comments
  drop constraint if exists fenix_content_comments_content_type_check;
alter table public.fenix_content_comments
  add constraint fenix_content_comments_content_type_check
  check (content_type in ('question','answer','post','news'));

create index if not exists fenix_votes_post_content_idx
  on public.fenix_content_votes(content_id, created_at desc)
  where content_type='post';

create index if not exists fenix_comments_post_content_idx
  on public.fenix_content_comments(content_id, created_at asc)
  where content_type='post' and deleted_at is null;

commit;
