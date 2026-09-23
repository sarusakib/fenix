begin;

-- Cover foreign keys used by ownership/public-history queries.
create index if not exists news_posts_author_idx
  on public.news_posts (author_id, created_at desc);

create index if not exists fenix_content_comments_author_idx
  on public.fenix_content_comments (author_id, created_at desc);

-- Replace the broad admin-all policy with one explicit public/admin read
-- policy plus separate admin write policies. This avoids duplicate SELECT
-- policy evaluation for authenticated users.
drop policy if exists news_public_read_published on public.news_posts;
drop policy if exists news_admin_all on public.news_posts;
drop policy if exists news_public_or_admin_read on public.news_posts;
drop policy if exists news_admin_insert on public.news_posts;
drop policy if exists news_admin_update on public.news_posts;
drop policy if exists news_admin_delete on public.news_posts;

create policy news_public_or_admin_read
on public.news_posts
for select
to anon, authenticated
using (
  status = 'published'
  or (select public.is_fenix_admin())
);

create policy news_admin_insert
on public.news_posts
for insert
to authenticated
with check ((select public.is_fenix_admin()));

create policy news_admin_update
on public.news_posts
for update
to authenticated
using ((select public.is_fenix_admin()))
with check ((select public.is_fenix_admin()));

create policy news_admin_delete
on public.news_posts
for delete
to authenticated
using ((select public.is_fenix_admin()));

-- The previous "own_delete" rules were FOR UPDATE policies, creating
-- duplicate permissive UPDATE paths. The current grants/API use soft-delete
-- through UPDATE, so the single own_update rule is sufficient.
drop policy if exists fenix_questions_own_delete on public.fenix_questions;
drop policy if exists fenix_answers_own_delete on public.fenix_answers;
drop policy if exists fenix_comments_own_delete on public.fenix_content_comments;

commit;