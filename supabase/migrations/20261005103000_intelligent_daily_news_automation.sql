begin;

alter table public.news_posts
  drop constraint if exists news_posts_automation_status_check;
alter table public.news_posts
  add constraint news_posts_automation_status_check
  check (automation_status in ('manual','auto_official','auto_curated','review_queue'));

alter table public.news_posts
  add column if not exists story_fingerprint text,
  add column if not exists ads_eligible boolean not null default true;

create unique index if not exists news_posts_story_fingerprint_uidx
  on public.news_posts(story_fingerprint)
  where story_fingerprint is not null;

create index if not exists news_posts_auto_published_idx
  on public.news_posts(automation_status, published_at desc)
  where status='published';

-- Automatic news is public but intentionally excluded from monetization.
-- This protects AdSense inventory from unreviewed automated publisher content.
update public.news_posts
set ads_eligible=false
where automation_status <> 'manual';

-- Only established tier-1/tier-2 sources are eligible for hands-off automation.
update public.fenix_brain_source_refresh r
set auto_publish=true,
    updated_at=now()
from public.fenix_brain_sources s
where r.source_id=s.id
  and s.url in (
    'https://zpfeni.gov.bd/all_notice',
    'https://feni.judiciary.gov.bd/bn/notice-more',
    'https://www.ntvbd.com/all-news/bangladesh/chittagong/feni',
    'https://www.prothomalo.com/topic/ফেনী',
    'https://www.ajkerpatrika.com/topic/ফেনী'
  )
  and s.trust_tier <= 2;

commit;