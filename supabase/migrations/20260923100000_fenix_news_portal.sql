begin;

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_bn text not null check (length(trim(title_bn)) between 4 and 240),
  title_en text not null check (length(trim(title_en)) between 4 and 240),
  excerpt_bn text,
  excerpt_en text,
  content_bn text not null check (length(trim(content_bn)) between 20 and 50000),
  content_en text not null check (length(trim(content_en)) between 20 and 50000),
  category text not null check (category in ('local','business','jobs','events','public_notice','fenix')),
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  featured boolean not null default false,
  breaking boolean not null default false,
  source_name text,
  source_url text,
  verification_status text not null default 'editor_reviewed' check (verification_status in ('official_source','editor_reviewed','reported','unverified')),
  image_url text,
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint news_source_url_check check (source_url is null or source_url ~* '^https?://'),
  constraint news_image_url_check check (image_url is null or image_url ~* '^https?://')
);

create index if not exists news_posts_public_idx on public.news_posts (status, published_at desc);
create index if not exists news_posts_category_idx on public.news_posts (category, status, published_at desc);
create index if not exists news_posts_featured_idx on public.news_posts (featured, published_at desc) where status = 'published';
create index if not exists news_posts_breaking_idx on public.news_posts (breaking, published_at desc) where status = 'published';

create or replace function public.news_posts_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = timezone('utc', now());
  if new.status = 'published' and (old.status <> 'published' or new.published_at is null) then
    new.published_at = coalesce(new.published_at, timezone('utc', now()));
  elsif new.status <> 'published' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists news_posts_set_updated_at on public.news_posts;
create trigger news_posts_set_updated_at
before update on public.news_posts
for each row execute function public.news_posts_set_updated_at();

alter table public.news_posts enable row level security;

drop policy if exists news_public_read_published on public.news_posts;
create policy news_public_read_published on public.news_posts
for select to anon, authenticated
using (status = 'published');

drop policy if exists news_admin_all on public.news_posts;
create policy news_admin_all on public.news_posts
for all to authenticated
using (public.is_fenix_admin())
with check (public.is_fenix_admin());

revoke all on table public.news_posts from anon, authenticated;
grant select on table public.news_posts to anon, authenticated;
grant insert, update, delete on table public.news_posts to authenticated;

commit;