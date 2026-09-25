begin;

alter table public.news_posts
  add column if not exists source_item_key text,
  add column if not exists source_published_at timestamptz,
  add column if not exists discovered_at timestamptz not null default timezone('utc', now()),
  add column if not exists automation_status text not null default 'manual';

alter table public.news_posts
  drop constraint if exists news_posts_automation_status_check;

alter table public.news_posts
  add constraint news_posts_automation_status_check
  check (automation_status in ('manual','auto_official','review_queue'));

create unique index if not exists news_posts_source_item_key_uidx
  on public.news_posts(source_item_key)
  where source_item_key is not null;

create index if not exists news_posts_source_published_idx
  on public.news_posts(source_published_at desc)
  where source_item_key is not null;

create index if not exists news_posts_automation_idx
  on public.news_posts(automation_status, status, discovered_at desc);

do $$
begin
  if not exists (select 1 from public.fenix_brain_sources where url='https://zpfeni.gov.bd/all_notice') then
    insert into public.fenix_brain_sources(source_type,publisher,title,url,language_code,trust_tier,metadata)
    values('government_official','Feni District Council','Feni District Council — All Notices','https://zpfeni.gov.bd/all_notice','bn',1,'{"news_ingest":true,"parser":"notice_html"}'::jsonb);
  end if;

  if not exists (select 1 from public.fenix_brain_sources where url='https://feni.judiciary.gov.bd/bn/notice-more') then
    insert into public.fenix_brain_sources(source_type,publisher,title,url,language_code,trust_tier,metadata)
    values('official_document','Chief Judicial Magistrate Court, Feni','Feni Judiciary — Notices','https://feni.judiciary.gov.bd/bn/notice-more','bn',1,'{"news_ingest":true,"parser":"notice_html"}'::jsonb);
  end if;

  if not exists (select 1 from public.fenix_brain_sources where url='https://www.ntvbd.com/all-news/bangladesh/chittagong/feni') then
    insert into public.fenix_brain_sources(source_type,publisher,title,url,language_code,trust_tier,metadata)
    values('public_web','NTV Online','NTV Feni News','https://www.ntvbd.com/all-news/bangladesh/chittagong/feni','bn',2,'{"news_ingest":true,"parser":"news_html","review_required":true}'::jsonb);
  end if;

  if not exists (select 1 from public.fenix_brain_sources where url='https://www.prothomalo.com/topic/ফেনী') then
    insert into public.fenix_brain_sources(source_type,publisher,title,url,language_code,trust_tier,metadata)
    values('public_web','Prothom Alo','Prothom Alo — Feni','https://www.prothomalo.com/topic/ফেনী','bn',2,'{"news_ingest":true,"parser":"news_html","review_required":true}'::jsonb);
  end if;

  if not exists (select 1 from public.fenix_brain_sources where url='https://www.ajkerpatrika.com/topic/ফেনী') then
    insert into public.fenix_brain_sources(source_type,publisher,title,url,language_code,trust_tier,metadata)
    values('public_web','Ajker Patrika','Ajker Patrika — Feni','https://www.ajkerpatrika.com/topic/ফেনী','bn',2,'{"news_ingest":true,"parser":"news_html","review_required":true}'::jsonb);
  end if;

  if not exists (select 1 from public.fenix_brain_sources where url='https://fenirshomoy.com/') then
    insert into public.fenix_brain_sources(source_type,publisher,title,url,language_code,trust_tier,metadata)
    values('public_web','Dainik Feni Shomoy','Dainik Feni Shomoy — Latest','https://fenirshomoy.com/','bn',2,'{"news_ingest":true,"parser":"news_html","review_required":true}'::jsonb);
  end if;

  if not exists (select 1 from public.fenix_brain_sources where url='https://feninewsbd.com/') then
    insert into public.fenix_brain_sources(source_type,publisher,title,url,language_code,trust_tier,metadata)
    values('public_web','Feni News','Feni News — Latest','https://feninewsbd.com/','bn',3,'{"news_ingest":true,"parser":"news_html","review_required":true}'::jsonb);
  end if;
end $$;

insert into public.fenix_brain_source_refresh(source_id,refresh_interval_hours,parser_key,auto_publish,max_bytes)
select id, 6, 'notice_html', true, 1500000
from public.fenix_brain_sources
where url in ('https://zpfeni.gov.bd/all_notice','https://feni.judiciary.gov.bd/bn/notice-more')
on conflict (source_id) do update
set refresh_interval_hours=excluded.refresh_interval_hours,
    parser_key=excluded.parser_key,
    auto_publish=excluded.auto_publish,
    enabled=true,
    next_refresh_at=least(public.fenix_brain_source_refresh.next_refresh_at, now()),
    updated_at=now();

insert into public.fenix_brain_source_refresh(source_id,refresh_interval_hours,parser_key,auto_publish,max_bytes)
select id, 6, 'news_html', false, 2500000
from public.fenix_brain_sources
where url in (
  'https://www.ntvbd.com/all-news/bangladesh/chittagong/feni',
  'https://www.prothomalo.com/topic/ফেনী',
  'https://www.ajkerpatrika.com/topic/ফেনী',
  'https://fenirshomoy.com/',
  'https://feninewsbd.com/'
)
on conflict (source_id) do update
set refresh_interval_hours=excluded.refresh_interval_hours,
    parser_key=excluded.parser_key,
    auto_publish=false,
    enabled=true,
    next_refresh_at=least(public.fenix_brain_source_refresh.next_refresh_at, now()),
    max_bytes=excluded.max_bytes,
    updated_at=now();

commit;