-- FeniX Feed 2.0: Quora-style Q&A + follows + votes + comments + bookmarks.
-- News remains owned by FeniX and is surfaced from news_posts without duplicating rows.
begin;

create table if not exists public.fenix_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_bn text not null,
  name_en text not null,
  description_bn text,
  description_en text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fenix_questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid references public.fenix_topics(id) on delete set null,
  title text not null check (length(trim(title)) between 8 and 240),
  body text not null check (length(trim(body)) between 1 and 12000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.fenix_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.fenix_questions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 20000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.fenix_content_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('question','answer')),
  content_id uuid not null,
  value smallint not null default 1 check (value in (1,-1)),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, content_type, content_id)
);

create table if not exists public.fenix_topic_follows (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.fenix_topics(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, topic_id)
);

create table if not exists public.fenix_content_bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('question','answer','news')),
  content_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, content_type, content_id)
);

create table if not exists public.fenix_content_comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('question','answer','news')),
  content_id uuid not null,
  body text not null check (length(trim(body)) between 1 and 3000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index if not exists fenix_questions_feed_idx on public.fenix_questions(created_at desc) where deleted_at is null;
create index if not exists fenix_questions_topic_idx on public.fenix_questions(topic_id, created_at desc) where deleted_at is null;
create index if not exists fenix_questions_author_idx on public.fenix_questions(author_id, created_at desc);
create index if not exists fenix_answers_question_idx on public.fenix_answers(question_id, created_at asc) where deleted_at is null;
create index if not exists fenix_answers_author_idx on public.fenix_answers(author_id, created_at desc);
create index if not exists fenix_votes_content_idx on public.fenix_content_votes(content_type, content_id);
create index if not exists fenix_follows_topic_idx on public.fenix_topic_follows(topic_id);
create index if not exists fenix_bookmarks_user_idx on public.fenix_content_bookmarks(user_id, created_at desc);
create index if not exists fenix_comments_content_idx on public.fenix_content_comments(content_type, content_id, created_at asc) where deleted_at is null;

insert into public.fenix_topics(slug,name_bn,name_en,description_bn,description_en)
values
 ('business','ব্যবসা','Business','ব্যবসা শুরু, পরিচালনা ও বৃদ্ধি নিয়ে প্রশ্ন।','Questions about starting, running and growing a business.'),
 ('jobs','চাকরি ও ক্যারিয়ার','Jobs & Careers','চাকরি, দক্ষতা ও ক্যারিয়ার নিয়ে প্রশ্ন।','Questions about jobs, skills and careers.'),
 ('feni','ফেনী','Feni','ফেনী এলাকার স্থানীয় তথ্য ও অভিজ্ঞতা।','Local knowledge and experiences from Feni.'),
 ('education','শিক্ষা','Education','শিক্ষা, শেখা ও প্রশিক্ষণ।','Learning, education and training.'),
 ('investment','বিনিয়োগ','Investment','বিনিয়োগ, ঝুঁকি ও ব্যবসায়িক সুযোগ।','Investment, risk and business opportunities.'),
 ('technology','প্রযুক্তি','Technology','প্রযুক্তি ও ডিজিটাল কাজ।','Technology and digital work.')
on conflict (slug) do nothing;

create or replace function private.fenix_touch_updated_at()
returns trigger language plpgsql security invoker set search_path=pg_catalog,public as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists fenix_questions_touch on public.fenix_questions;
create trigger fenix_questions_touch before update on public.fenix_questions for each row execute function private.fenix_touch_updated_at();
drop trigger if exists fenix_answers_touch on public.fenix_answers;
create trigger fenix_answers_touch before update on public.fenix_answers for each row execute function private.fenix_touch_updated_at();
drop trigger if exists fenix_comments_touch on public.fenix_content_comments;
create trigger fenix_comments_touch before update on public.fenix_content_comments for each row execute function private.fenix_touch_updated_at();

alter table public.fenix_topics enable row level security;
alter table public.fenix_questions enable row level security;
alter table public.fenix_answers enable row level security;
alter table public.fenix_content_votes enable row level security;
alter table public.fenix_topic_follows enable row level security;
alter table public.fenix_content_bookmarks enable row level security;
alter table public.fenix_content_comments enable row level security;

drop policy if exists fenix_topics_public_select on public.fenix_topics;
create policy fenix_topics_public_select on public.fenix_topics for select to anon,authenticated using (true);

drop policy if exists fenix_questions_public_select on public.fenix_questions;
create policy fenix_questions_public_select on public.fenix_questions for select to anon,authenticated
using (deleted_at is null and private.is_fenix_user_active(author_id));

drop policy if exists fenix_questions_own_insert on public.fenix_questions;
create policy fenix_questions_own_insert on public.fenix_questions for insert to authenticated
with check ((select auth.uid())=author_id and private.is_fenix_user_active((select auth.uid())));

drop policy if exists fenix_questions_own_update on public.fenix_questions;
create policy fenix_questions_own_update on public.fenix_questions for update to authenticated
using ((select auth.uid())=author_id) with check ((select auth.uid())=author_id);

drop policy if exists fenix_questions_own_delete on public.fenix_questions;
create policy fenix_questions_own_delete on public.fenix_questions for update to authenticated
using ((select auth.uid())=author_id) with check ((select auth.uid())=author_id);

drop policy if exists fenix_answers_public_select on public.fenix_answers;
create policy fenix_answers_public_select on public.fenix_answers for select to anon,authenticated
using (deleted_at is null and private.is_fenix_user_active(author_id));

drop policy if exists fenix_answers_own_insert on public.fenix_answers;
create policy fenix_answers_own_insert on public.fenix_answers for insert to authenticated
with check ((select auth.uid())=author_id and private.is_fenix_user_active((select auth.uid())));

drop policy if exists fenix_answers_own_update on public.fenix_answers;
create policy fenix_answers_own_update on public.fenix_answers for update to authenticated
using ((select auth.uid())=author_id) with check ((select auth.uid())=author_id);

drop policy if exists fenix_answers_own_delete on public.fenix_answers;
create policy fenix_answers_own_delete on public.fenix_answers for update to authenticated
using ((select auth.uid())=author_id) with check ((select auth.uid())=author_id);

drop policy if exists fenix_votes_public_select on public.fenix_content_votes;
create policy fenix_votes_public_select on public.fenix_content_votes for select to anon,authenticated using (true);
drop policy if exists fenix_votes_own_insert on public.fenix_content_votes;
create policy fenix_votes_own_insert on public.fenix_content_votes for insert to authenticated
with check ((select auth.uid())=user_id and private.is_fenix_user_active((select auth.uid())));
drop policy if exists fenix_votes_own_update on public.fenix_content_votes;
create policy fenix_votes_own_update on public.fenix_content_votes for update to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists fenix_votes_own_delete on public.fenix_content_votes;
create policy fenix_votes_own_delete on public.fenix_content_votes for delete to authenticated
using ((select auth.uid())=user_id);

drop policy if exists fenix_topic_follows_public_select on public.fenix_topic_follows;
create policy fenix_topic_follows_public_select on public.fenix_topic_follows for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists fenix_topic_follows_own_insert on public.fenix_topic_follows;
create policy fenix_topic_follows_own_insert on public.fenix_topic_follows for insert to authenticated
with check ((select auth.uid())=user_id);
drop policy if exists fenix_topic_follows_own_delete on public.fenix_topic_follows;
create policy fenix_topic_follows_own_delete on public.fenix_topic_follows for delete to authenticated
using ((select auth.uid())=user_id);

drop policy if exists fenix_bookmarks_own_select on public.fenix_content_bookmarks;
create policy fenix_bookmarks_own_select on public.fenix_content_bookmarks for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists fenix_bookmarks_own_insert on public.fenix_content_bookmarks;
create policy fenix_bookmarks_own_insert on public.fenix_content_bookmarks for insert to authenticated
with check ((select auth.uid())=user_id);
drop policy if exists fenix_bookmarks_own_delete on public.fenix_content_bookmarks;
create policy fenix_bookmarks_own_delete on public.fenix_content_bookmarks for delete to authenticated
using ((select auth.uid())=user_id);

drop policy if exists fenix_comments_public_select on public.fenix_content_comments;
create policy fenix_comments_public_select on public.fenix_content_comments for select to anon,authenticated
using (deleted_at is null and private.is_fenix_user_active(author_id));
drop policy if exists fenix_comments_own_insert on public.fenix_content_comments;
create policy fenix_comments_own_insert on public.fenix_content_comments for insert to authenticated
with check ((select auth.uid())=author_id and private.is_fenix_user_active((select auth.uid())));
drop policy if exists fenix_comments_own_update on public.fenix_content_comments;
create policy fenix_comments_own_update on public.fenix_content_comments for update to authenticated
using ((select auth.uid())=author_id) with check ((select auth.uid())=author_id);
drop policy if exists fenix_comments_own_delete on public.fenix_content_comments;
create policy fenix_comments_own_delete on public.fenix_content_comments for update to authenticated
using ((select auth.uid())=author_id) with check ((select auth.uid())=author_id);

revoke all on public.fenix_topics from public,anon,authenticated;
grant select on public.fenix_topics to anon,authenticated;
revoke all on public.fenix_questions from public,anon,authenticated;
grant select on public.fenix_questions to anon,authenticated;
grant insert,update on public.fenix_questions to authenticated;
revoke all on public.fenix_answers from public,anon,authenticated;
grant select on public.fenix_answers to anon,authenticated;
grant insert,update on public.fenix_answers to authenticated;
revoke all on public.fenix_content_votes from public,anon,authenticated;
grant select on public.fenix_content_votes to anon,authenticated;
grant insert,update,delete on public.fenix_content_votes to authenticated;
revoke all on public.fenix_topic_follows from public,anon,authenticated;
grant select,insert,delete on public.fenix_topic_follows to authenticated;
revoke all on public.fenix_content_bookmarks from public,anon,authenticated;
grant select,insert,delete on public.fenix_content_bookmarks to authenticated;
revoke all on public.fenix_content_comments from public,anon,authenticated;
grant select on public.fenix_content_comments to anon,authenticated;
grant insert,update on public.fenix_content_comments to authenticated;

commit;