begin;

drop index if exists public.news_posts_source_item_key_uidx;

alter table public.news_posts
  drop constraint if exists news_posts_source_item_key_key;

alter table public.news_posts
  add constraint news_posts_source_item_key_key unique (source_item_key);

update public.fenix_brain_source_refresh
set next_refresh_at=now(), enabled=true, last_error=null, updated_at=now()
where parser_key in ('notice_html','news_html');

commit;