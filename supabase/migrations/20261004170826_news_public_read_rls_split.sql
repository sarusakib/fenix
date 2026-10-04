begin;

drop policy if exists news_public_or_admin_read on public.news_posts;

create policy news_public_read
  on public.news_posts
  for select
  to anon, authenticated
  using (status = 'published');

create policy news_admin_read
  on public.news_posts
  for select
  to authenticated
  using ((select is_fenix_admin()));

commit;
