begin;

-- ============================================================
-- 1. Brain intent catalogue
-- ============================================================

create table if not exists public.fenix_brain_intents (
  intent_key text primary key,
  name_bn text not null,
  name_en text not null,
  description text,
  examples jsonb not null default '[]'::jsonb,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fenix_brain_intents_priority_check check (priority >= 0)
);

alter table public.fenix_brain_intents enable row level security;

drop policy if exists "Public can read active Feni Brain intents"
on public.fenix_brain_intents;

create policy "Public can read active Feni Brain intents"
on public.fenix_brain_intents
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can manage Feni Brain intents"
on public.fenix_brain_intents;

create policy "Admins can manage Feni Brain intents"
on public.fenix_brain_intents
for all
to authenticated
using (public.is_fenix_admin())
with check (public.is_fenix_admin());

insert into public.fenix_brain_intents (
  intent_key, name_bn, name_en, description, examples, priority
)
values
  ('general_feni', 'ফেনী সম্পর্কে সাধারণ তথ্য', 'General Feni information',
   'General questions about Feni district and its public knowledge.',
   '["ফেনী সম্পর্কে বলো","Feni সম্পর্কে তথ্য দাও"]'::jsonb, 10),

  ('location_info', 'স্থান/এলাকা তথ্য', 'Location information',
   'Questions about upazila, union, ward, market, area and landmarks.',
   '["ফেনী সদর কোথায়","সোনাগাজীর কোন কোন ইউনিয়ন আছে"]'::jsonb, 20),

  ('business_search', 'ব্যবসা খোঁজা', 'Business search',
   'Find a business, shop, service provider or local supplier.',
   '["ফেনীতে কাপড়ের দোকান কোথায়","ফেনীতে শাড়ি কোথায় পাব"]'::jsonb, 20),

  ('supplier_search', 'সরবরাহকারী খোঁজা', 'Supplier search',
   'Find suppliers, wholesalers or business-to-business sources.',
   '["ফেনীতে কাপড়ের পাইকার কোথায়","supplier লাগবে ফেনীতে"]'::jsonb, 25),

  ('business_start', 'ব্যবসা শুরু করা', 'Starting a business',
   'Guidance for starting a business in Feni.',
   '["ফেনীতে pharmacy দিতে চাই","ফেনীতে ব্যবসা শুরু করতে কী লাগে"]'::jsonb, 30),

  ('investment', 'বিনিয়োগ', 'Investment',
   'Investment opportunities, due diligence and local business context.',
   '["ফেনীতে কোথায় বিনিয়োগ করা যায়","Feni investment opportunity"]'::jsonb, 30),

  ('government_service', 'সরকারি সেবা', 'Government service',
   'Government offices, procedures and citizen services.',
   '["ট্রেড লাইসেন্স কোথায়","ফেনীতে সরকারি সেবা কোথায় পাব"]'::jsonb, 30),

  ('health_service', 'স্বাস্থ্যসেবা', 'Health service',
   'Hospitals, clinics, community health and public-health information.',
   '["ফেনীতে হাসপাতাল কোথায়","ফেনী সদর স্বাস্থ্যসেবা"]'::jsonb, 30),

  ('education', 'শিক্ষা', 'Education',
   'Schools, colleges, madrasas and education information.',
   '["ফেনীতে ভালো কলেজ কোনগুলো","ফেনীর শিক্ষা ব্যবস্থা"]'::jsonb, 35),

  ('tourism', 'দর্শনীয় স্থান', 'Tourism',
   'Historical places and tourism destinations in Feni.',
   '["ফেনীতে কোথায় ঘুরতে যাব","মুহুরী সেচ প্রকল্প কোথায়"]'::jsonb, 35),

  ('agriculture', 'কৃষি', 'Agriculture',
   'Agricultural land, crops, irrigation and local agriculture.',
   '["ফেনীতে কী চাষ হয়","ফেনীর কৃষি সম্পর্কে বলো"]'::jsonb, 40),

  ('emergency', 'জরুরি সেবা', 'Emergency service',
   'Emergency numbers and urgent public services.',
   '["ফেনীতে জরুরি নম্বর","আগুন লাগলে কী করব"]'::jsonb, 5)
on conflict (intent_key) do update
set
  name_bn = excluded.name_bn,
  name_en = excluded.name_en,
  description = excluded.description,
  examples = excluded.examples,
  priority = excluded.priority,
  updated_at = timezone('utc', now());

-- ============================================================
-- 2. Query terms for deterministic first-pass intent detection
-- ============================================================

create table if not exists public.fenix_brain_query_terms (
  id uuid primary key default gen_random_uuid(),
  intent_key text not null references public.fenix_brain_intents(intent_key) on delete cascade,
  term text not null,
  language_code text not null default 'bn',
  weight numeric(5,2) not null default 1.00,
  created_at timestamptz not null default timezone('utc', now()),
  constraint fenix_brain_query_terms_term_check check (
    length(trim(term)) between 1 and 120
  )
);

create unique index if not exists fenix_brain_query_terms_unique_idx
on public.fenix_brain_query_terms(intent_key, lower(trim(term)));

create index if not exists fenix_brain_query_terms_lookup_idx
on public.fenix_brain_query_terms(lower(trim(term)), weight desc);

alter table public.fenix_brain_query_terms enable row level security;

drop policy if exists "Public can read Feni Brain query terms"
on public.fenix_brain_query_terms;

create policy "Public can read Feni Brain query terms"
on public.fenix_brain_query_terms
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage Feni Brain query terms"
on public.fenix_brain_query_terms;

create policy "Admins can manage Feni Brain query terms"
on public.fenix_brain_query_terms
for all
to authenticated
using (public.is_fenix_admin())
with check (public.is_fenix_admin());

insert into public.fenix_brain_query_terms(intent_key, term, language_code, weight)
values
  ('business_start','ব্যবসা শুরু','bn',2),
  ('business_start','ব্যবসা করতে চাই','bn',2),
  ('business_start','দোকান দিতে চাই','bn',2),
  ('business_start','business start','en',2),
  ('investment','বিনিয়োগ','bn',2),
  ('investment','invest','en',2),
  ('investment','investment','en',2),
  ('supplier_search','supplier','en',2),
  ('supplier_search','সরবরাহকারী','bn',2),
  ('supplier_search','পাইকার','bn',2),
  ('supplier_search','wholesale','en',2),
  ('business_search','দোকান','bn',1),
  ('business_search','shop','en',1),
  ('business_search','ব্যবসা','bn',1),
  ('government_service','সরকারি সেবা','bn',2),
  ('government_service','ট্রেড লাইসেন্স','bn',3),
  ('government_service','trade license','en',3),
  ('health_service','হাসপাতাল','bn',2),
  ('health_service','ক্লিনিক','bn',2),
  ('health_service','ডাক্তার','bn',2),
  ('health_service','hospital','en',2),
  ('education','স্কুল','bn',2),
  ('education','কলেজ','bn',2),
  ('education','মাদ্রাসা','bn',2),
  ('education','college','en',2),
  ('tourism','ঘুরতে','bn',2),
  ('tourism','দর্শনীয়','bn',2),
  ('tourism','পর্যটন','bn',2),
  ('tourism','tourist','en',2),
  ('agriculture','কৃষি','bn',2),
  ('agriculture','চাষ','bn',2),
  ('agriculture','ফসল','bn',2),
  ('emergency','জরুরি','bn',3),
  ('emergency','emergency','en',3)
on conflict do nothing;

-- ============================================================
-- 3. Source-backed knowledge and current district snapshot
-- ============================================================

insert into public.fenix_brain_sources (
  source_type, publisher, title, url, published_at, language_code, trust_tier, metadata
)
values (
  'government_official',
  'Feni District Administration',
  'এক নজরে ফেনী — updated 2026-05-09',
  'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44',
  '2026-05-09 19:51:00+00'::timestamptz,
  'bn',
  1,
  '{"freshness":"district_current_snapshot"}'::jsonb
)
on conflict do nothing;

insert into public.fenix_brain_sources (
  source_type, publisher, title, url, published_at, language_code, trust_tier
)
values (
  'government_official',
  'Feni District Administration',
  'ভৌগলিক পরিচিতি',
  'https://feni.gov.bd/pages/static-pages/6990eeff35ce18e1c072ab14',
  '2018-04-17 20:02:00+00'::timestamptz,
  'bn',
  1
), (
  'government_official',
  'Feni District Administration',
  'নদ-নদী',
  'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab3e',
  '2024-11-06 17:58:00+00'::timestamptz,
  'bn',
  1
), (
  'government_official',
  'District Statistics Office, Feni',
  'এক নজরে — জেলা পরিসংখ্যান অফিস',
  'https://bbs.feni.gov.bd/pages/static-pages/6990f85735ce18e1c0731872',
  '2023-09-24 13:55:00+00'::timestamptz,
  'bn',
  1
), (
  'government_official',
  'LGED Feni Sadar',
  'ফেনী সদর উপজেলার পটভূমি',
  'https://lged.sadar.feni.gov.bd/pages/static-pages/6990c49a35ce18e1c0715752',
  '2025-06-01 00:00:00+00'::timestamptz,
  'bn',
  1
), (
  'government_official',
  'Daganbhuiyan Upazila',
  'এক নজরে পৌরসভা',
  'https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de41773a',
  '2014-04-28 16:25:00+00'::timestamptz,
  'bn',
  1
), (
  'government_official',
  'Parshuram Upazila',
  'এক নজরে পরশুরাম',
  'https://parshuram.feni.gov.bd/pages/static-pages/699149d4516a96d4de417efb',
  '2024-03-01 00:00:00+00'::timestamptz,
  'bn',
  1
), (
  'government_official',
  'Sonagazi Upazila',
  'এক নজরে পৌরসভা',
  'https://sonagazi.feni.gov.bd/pages/static-pages/6990ef4035ce18e1c072c8e6',
  '2024-11-26 15:10:00+00'::timestamptz,
  'bn',
  1
);

-- Correct current district snapshot values against the May 2026 official page.
with src as (
  select id from public.fenix_brain_sources
  where url = 'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44'
  order by created_at desc limit 1
),
district as (
  select id from public.fenix_brain_locations where slug = 'feni'
)
update public.fenix_brain_facts f
set
  value_number = case f.subject_key
    when 'village_count' then 577
    when 'mouza_count' then 543
    when 'upazila_count' then 6
    when 'municipality_count' then 5
    when 'union_count' then 43
    when 'union_land_office_count' then 27
    when 'market_count' then 123
    else f.value_number
  end,
  value_unit = case f.subject_key
    when 'village_count' then 'count'
    when 'mouza_count' then 'count'
    when 'upazila_count' then 'count'
    when 'municipality_count' then 'count'
    when 'union_count' then 'count'
    when 'union_land_office_count' then 'count'
    when 'market_count' then 'count'
    else f.value_unit
  end,
  source_id = src.id,
  updated_at = timezone('utc', now())
from src, district
where f.subject_location_id = district.id
  and f.source_id = (
    select id from public.fenix_brain_sources
    where url = 'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44'
    order by created_at asc limit 1
  )
  and f.subject_key in (
    'village_count','mouza_count','upazila_count','municipality_count',
    'union_count','union_land_office_count','market_count'
  );

with src as (
  select id from public.fenix_brain_sources
  where url = 'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44'
  order by created_at desc limit 1
),
district as (
  select id from public.fenix_brain_locations where slug = 'feni'
)
insert into public.fenix_brain_facts (
  subject_location_id, subject_key, value_number, value_unit, source_id, metadata
)
select district.id, x.subject_key, x.value_number, x.value_unit, src.id, x.metadata::jsonb
from district
cross join src
cross join (
  values
    ('population', 1648896::numeric, 'people', '{"census_year":2022}'),
    ('male_population', 780436::numeric, 'people', '{"census_year":2022}'),
    ('female_population', 868416::numeric, 'people', '{"census_year":2022}'),
    ('hijra_population', 44::numeric, 'people', '{"census_year":2022}'),
    ('population_density', 1665::numeric, 'people_per_square_km', '{"census_year":2022}'),
    ('cultivable_land', 74720::numeric, 'hectare', '{}'),
    ('irrigated_land', 35082::numeric, 'hectare', '{}'),
    ('forest_land', 2179.22::numeric, 'hectare', '{}'),
    ('heavy_industry_count', 5::numeric, 'count', '{}'),
    ('medium_industry_count', 7::numeric, 'count', '{}'),
    ('small_industry_count', 826::numeric, 'count', '{}'),
    ('cottage_industry_count', 3419::numeric, 'count', '{}')
) as x(subject_key, value_number, value_unit, metadata)
where not exists (
  select 1 from public.fenix_brain_facts f
  where f.subject_location_id = district.id
    and f.subject_key = x.subject_key
    and f.source_id = src.id
);

-- Ward-level administrative count from the District Statistics Office source.
with src as (
  select id from public.fenix_brain_sources
  where url = 'https://bbs.feni.gov.bd/pages/static-pages/6990f85735ce18e1c0731872'
  limit 1
),
district as (
  select id from public.fenix_brain_locations where slug = 'feni'
)
insert into public.fenix_brain_facts (
  subject_location_id, subject_key, value_number, value_unit, source_id
)
select district.id, 'ward_count', 54, 'count', src.id
from district cross join src
where not exists (
  select 1 from public.fenix_brain_facts f
  where f.subject_location_id = district.id
    and f.subject_key = 'ward_count'
);

-- ============================================================
-- 4. More Feni location nodes: municipal wards
-- ============================================================

with muni as (
  select id, slug
  from public.fenix_brain_locations
  where level = 'municipality'
),
ward_counts(slug, ward_count) as (
  values
    ('feni-paurashava', 18),
    ('chhagalnaiya-paurashava', 9),
    ('daganbhuiyan-paurashava', 9),
    ('parshuram-paurashava', 9),
    ('sonagazi-paurashava', 9)
)
insert into public.fenix_brain_locations (
  parent_id, level, name_bn, name_en, slug, metadata
)
select
  m.id,
  'ward',
  'ওয়ার্ড ' || w.n,
  'Ward ' || w.n,
  m.slug || '-ward-' || w.n,
  '{"granularity":"numbered_ward","name_source":"municipality_official_structure"}'::jsonb
from muni m
join ward_counts wc on wc.slug = m.slug
cross join lateral generate_series(1, wc.ward_count) as w(n)
where not exists (
  select 1
  from public.fenix_brain_locations l
  where l.slug = m.slug || '-ward-' || w.n
);

-- Add the published Sonagazi ward composition where officially documented.
with muni as (
  select id from public.fenix_brain_locations
  where slug = 'sonagazi-paurashava'
)
update public.fenix_brain_locations l
set metadata = l.metadata || x.meta::jsonb
from muni
cross join (
  values
    ('sonagazi-paurashava-ward-1','{"included_areas":["বাখরিয়া","মহেশ্চর (আংশিক)"]}'),
    ('sonagazi-paurashava-ward-2','{"included_areas":["মহেশ্চর","উত্তর চরচান্দিয়া (আংশিক)"]}'),
    ('sonagazi-paurashava-ward-3','{"included_areas":["উত্তর চরচান্দিয়া"]}'),
    ('sonagazi-paurashava-ward-4','{"included_areas":["ছাড়াইতকান্দি","চরগনেশ (আংশিক)"]}'),
    ('sonagazi-paurashava-ward-5','{"included_areas":["চরগনেশ","তুলাতলী (আংশিক)"]}'),
    ('sonagazi-paurashava-ward-6','{"included_areas":["তুলাতলী"]}'),
    ('sonagazi-paurashava-ward-7','{"included_areas":["চরচান্দিয়া","চরগনেশ (আংশিক)"]}'),
    ('sonagazi-paurashava-ward-8','{"included_areas":["চরগনেশ"]}'),
    ('sonagazi-paurashava-ward-9','{"included_areas":["চরগনেশ"]}')
) as x(slug, meta)
where l.slug = x.slug;

-- ============================================================
-- 5. Feni knowledge documents
-- ============================================================

with source_map as (
  select url, id from public.fenix_brain_sources
  where url in (
    'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44',
    'https://feni.gov.bd/pages/static-pages/6990eeff35ce18e1c072ab14',
    'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab3e',
    'https://bbs.feni.gov.bd/pages/static-pages/6990f85735ce18e1c0731872',
    'https://feni.gov.bd/pages/static-pages/6990d1ed35ce18e1c071c692',
    'https://lged.sadar.feni.gov.bd/pages/static-pages/6990c49a35ce18e1c0715752',
    'https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de41773a',
    'https://parshuram.feni.gov.bd/pages/static-pages/699149d4516a96d4de417efb',
    'https://sonagazi.feni.gov.bd/pages/static-pages/6990ef4035ce18e1c072c8e6'
  )
)
insert into public.fenix_brain_documents (
  source_id, title, document_type, language_code, content, summary, metadata
)
select sm.id, x.title, x.document_type, 'bn', x.content, x.summary, x.metadata::jsonb
from (
  values
    (
      'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44',
      'ফেনী জেলার বর্তমান প্রশাসনিক ও ভৌগলিক snapshot',
      'knowledge',
      'ফেনীর আয়তন ৯২৮.৩৪ বর্গ কিলোমিটার। জেলা প্রশাসনের ২০২৬ সালের এক নজর তথ্য অনুযায়ী জেলায় ৬টি উপজেলা, ৫টি পৌরসভা, ৪৩টি ইউনিয়ন, ৫৭৭টি গ্রাম, ৫৪৩টি মৌজা, ২৭টি ইউনিয়ন ভূমি অফিস এবং ১২৩টি হাট-বাজার রয়েছে। ২০২২ সালের জনশুমারি অনুযায়ী মোট জনসংখ্যা ১৬,৪৮,৮৯৬।',
      'ফেনীর প্রশাসনিক কাঠামো ও বর্তমান জেলা-স্তরের মূল পরিসংখ্যান।',
      '{"topics":["administration","demography","geography"],"freshness":"2026-05"}'
    ),
    (
      'https://feni.gov.bd/pages/static-pages/6990eeff35ce18e1c072ab14',
      'ফেনীর ভৌগলিক পরিচিতি',
      'knowledge',
      'ফেনী চট্টগ্রাম বিভাগের অন্তর্ভুক্ত। সরকারি জেলা তথ্য অনুযায়ী ফেনীর আয়তন ৯২৮.৩৪ বর্গ কিলোমিটার। জেলার উত্তরে কুমিল্লা ও ত্রিপুরা, পশ্চিমে নোয়াখালী, পূর্বে ত্রিপুরা ও চট্টগ্রাম এবং দক্ষিণে চট্টগ্রাম ও বঙ্গোপসাগরের মোহনা-সংলগ্ন এলাকা রয়েছে।',
      'ফেনীর ভৌগলিক অবস্থান সম্পর্কে সরকারি তথ্যের সংক্ষিপ্তসার।',
      '{"topics":["geography","boundaries"]}'
    ),
    (
      'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab3e',
      'ফেনীর নদ-নদী',
      'knowledge',
      'ফেনী জেলার নদ-নদীর মধ্যে ফেনী নদী, ছোট ফেনী নদী, মুহুরী নদী এবং সিলোনিয়া নদী/কালিদাস পাহালিয়া নদীর তথ্য সরকারি জেলা বাতায়নে পাওয়া যায়। নদীগুলো জেলার বিভিন্ন উপজেলা ও আশপাশের এলাকার যোগাযোগ, কৃষি, জলাবদ্ধতা ও পরিবেশগত প্রসঙ্গে গুরুত্বপূর্ণ।',
      'ফেনীর নদ-নদী ও তাদের স্থানীয় প্রাসঙ্গিকতার সংক্ষিপ্ত তথ্য।',
      '{"topics":["rivers","environment","agriculture"]}'
    ),
    (
      'https://bbs.feni.gov.bd/pages/static-pages/6990f85735ce18e1c0731872',
      'ফেনীর পরিসংখ্যান ও প্রশাসনিক কাঠামো',
      'knowledge',
      'জেলা পরিসংখ্যান অফিসের প্রকাশিত তথ্য অনুযায়ী ফেনী জেলা ৬টি উপজেলা, ৪৩টি ইউনিয়ন, ৫টি পৌরসভা এবং ৫৪টি ওয়ার্ডসহ প্রশাসনিকভাবে বিস্তৃত। এই source-এ শিক্ষা, জনসংখ্যা, মৌজা-গ্রাম ও ঐতিহাসিক/পুরাতাত্ত্বিক তথ্যের বিভিন্ন snapshot-ও রয়েছে। পুরোনো পরিসংখ্যানকে বর্তমান তথ্যের সঙ্গে ব্যবহার করার সময় Brain source date বিবেচনা করবে।',
      'পুরোনো/প্রাতিষ্ঠানিক পরিসংখ্যানের source-aware ব্যবহার।',
      '{"topics":["statistics","administration"],"historical_snapshot":true}'
    ),
    (
      'https://feni.gov.bd/pages/static-pages/6990d1ed35ce18e1c071c692',
      'ফেনী জেলার প্রশাসনিক পটভূমি',
      'history',
      'ফেনী নামের সঙ্গে ফেনী নদীর ঐতিহাসিক সম্পর্কের উল্লেখ জেলা প্রশাসনের পটভূমি পৃষ্ঠায় আছে। মধ্যযুগের সাহিত্যিক উৎসেও ফেনী নদী ও এই অঞ্চলের উল্লেখ পাওয়া যায়।',
      'ফেনী নাম ও জেলার প্রশাসনিক পটভূমির সংক্ষিপ্ত ইতিহাস।',
      '{"topics":["history","culture"]}'
    ),
    (
      'https://lged.sadar.feni.gov.bd/pages/static-pages/6990c49a35ce18e1c0715752',
      'ফেনী সদর উপজেলার ইউনিয়নভিত্তিক তথ্য',
      'directory',
      'ফেনী সদর উপজেলার সরকারি LGED তথ্যসূত্রে পৌরসভা, ইউনিয়ন, জনসংখ্যা ও শিক্ষার হারসহ ইউনিয়নভিত্তিক বিভিন্ন পরিসংখ্যান প্রকাশিত হয়েছে। উদাহরণ হিসেবে কাজীরবাগ, কালীদহ, ছনুয়া, ধর্মপুর, ধলিয়া, পাঁচগাছিয়া, ফরহাদনগর, ফাজিলপুর, বালিগাঁও, মোটবী, লেমুয়া ও শর্শদী ইউনিয়নের তথ্য পাওয়া যায়।',
      'ফেনী সদর-এর ইউনিয়নভিত্তিক structured data-এর source।',
      '{"topics":["feni-sadar","unions","demography","education"],"historical_snapshot":true}'
    ),
    (
      'https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de41773a',
      'দাগনভূঞা পৌরসভা',
      'directory',
      'দাগনভূঞা পৌরসভা ২০০০ সালে প্রতিষ্ঠিত হওয়ার সরকারি তথ্য পাওয়া যায়। সরকারি পৃষ্ঠায় পৌরসভার আয়তন, ৯টি ওয়ার্ড এবং শিক্ষা প্রতিষ্ঠানের snapshot উল্লেখ আছে। এই সংখ্যাগুলো source date অনুযায়ী historical context হিসেবে ব্যবহার করা উচিত।',
      'দাগনভূঞা পৌরসভার basic source-backed information।',
      '{"topics":["daganbhuiyan","municipality"],"historical_snapshot":true}'
    ),
    (
      'https://parshuram.feni.gov.bd/pages/static-pages/699149d4516a96d4de417efb',
      'পরশুরাম উপজেলার প্রশাসনিক তথ্য',
      'directory',
      'পরশুরাম উপজেলার সরকারি তথ্যে ৩টি ইউনিয়ন—মির্জানগর, চিথলিয়া ও বক্সমাহমুদ—এবং ১টি পৌরসভা ও ৯টি পৌর ওয়ার্ডের তথ্য পাওয়া যায়।',
      'পরশুরাম উপজেলার কাঠামো সম্পর্কে source-backed তথ্য।',
      '{"topics":["parshuram","unions","municipality"]}'
    ),
    (
      'https://sonagazi.feni.gov.bd/pages/static-pages/6990ef4035ce18e1c072c8e6',
      'সোনাগাজী পৌরসভা',
      'directory',
      'সোনাগাজী পৌরসভা ২০০২ সালে প্রতিষ্ঠিত হয় এবং সরকারি পৃষ্ঠায় ৯টি ওয়ার্ডের তথ্য উল্লেখ আছে। সোনাগাজী উপজেলার বিভিন্ন ইউনিয়ন ও পৌর এলাকার তথ্য Brain location hierarchy-এর সঙ্গে যুক্ত করা যাবে।',
      'সোনাগাজী পৌরসভার basic administrative source।',
      '{"topics":["sonagazi","municipality"]}'
    ),
    (
      'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44',
      'ফেনীর শিক্ষা, কৃষি, শিল্প ও সম্ভাবনা',
      'knowledge',
      'ফেনী জেলা প্রশাসনের এক নজর তথ্যসূত্রে শিক্ষা ইতিহাস, রাস্তা, কৃষি জমি, সেচ, বনভূমি, শিল্পের বিভিন্ন শ্রেণি এবং ফেনী গ্যাস ফিল্ডের উল্লেখ রয়েছে। একই source-এ ইপিজেড, বায়ু বিদ্যুৎ, বিদ্যুৎ উৎপাদন, প্রাকৃতিক গ্যাস, শিল্প ও সমুদ্রবন্দর-সম্পর্কিত সম্ভাবনার কথাও উল্লেখ করা হয়েছে। এসবকে Brain factual claim হিসেবে নয়, source-attributed সম্ভাবনা হিসেবে উপস্থাপন করতে হবে।',
      'কৃষি, শিল্প ও সম্ভাবনা-সংক্রান্ত source-backed knowledge; opportunity claims attributionসহ দেখাতে হবে।',
      '{"topics":["agriculture","industry","investment","opportunity"],"attribution_required":true}'
    ),
    (
      'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44',
      'ফেনীর ঐতিহাসিক ও দর্শনীয় স্থান',
      'guide',
      'সরকারি জেলা তথ্যসূত্রে ফেনীর ঐতিহাসিক ও দর্শনীয় স্থানের মধ্যে পাগলা বাবার মাজার, চাঁদগাজী ভূঞাঁ মসজিদ, প্রাচীর সুড়ঙ্গ মঠ, বিলোনিয়া সীমান্ত পোস্ট, বিলোনিয়া পুরাতন রেল স্টেশন, মুহুরী সেচ প্রকল্প এলাকা, কেওড়া বাগান ও চর এলাকা, বিজয় সিংহ দীঘি এবং সালাম নগর এলাকার উল্লেখ আছে।',
      'ফেনীর দর্শনীয় ও ঐতিহাসিক স্থানসমূহের source-backed তালিকা।',
      '{"topics":["tourism","history"]}'
    ),
    (
      'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44',
      'ফেনীর দুর্যোগ ও পরিবেশগত ঝুঁকি',
      'knowledge',
      'জেলা প্রশাসনের এক নজর তথ্যসূত্রে ঘূর্ণিঝড়, জলোচ্ছ্বাস/আকস্মিক বন্যা, পাহাড়ি ঢল, নদীভাঙন, জলাবদ্ধতা, মাছের প্রজাতি হ্রাস, বন উজাড় ও সীমান্ত-সংক্রান্ত সমস্যাকে জেলার সমস্যার তালিকায় উল্লেখ করা হয়েছে। এগুলোকে Brain-এ source-attributed risk information হিসেবে ব্যবহার করা হবে।',
      'ফেনীর পরিবেশ ও দুর্যোগ-সংক্রান্ত source-backed ঝুঁকি তথ্য।',
      '{"topics":["risk","environment","disaster"],"attribution_required":true}'
    )
) as x(source_url, title, document_type, content, summary, metadata)
join source_map sm on sm.url = x.source_url
where not exists (
  select 1 from public.fenix_brain_documents d where d.title = x.title
);

-- ============================================================
-- 6. Initial chunks for keyword retrieval and future embeddings
-- ============================================================

insert into public.fenix_brain_chunks (
  document_id, chunk_index, content, source_locator, token_count
)
select d.id, 0, d.content, d.title, greatest(1, length(d.content) / 4)
from public.fenix_brain_documents d
where d.title in (
  'ফেনী জেলার বর্তমান প্রশাসনিক ও ভৌগলিক snapshot',
  'ফেনীর ভৌগলিক পরিচিতি',
  'ফেনীর নদ-নদী',
  'ফেনীর পরিসংখ্যান ও প্রশাসনিক কাঠামো',
  'ফেনী জেলার প্রশাসনিক পটভূমি',
  'ফেনী সদর উপজেলার ইউনিয়নভিত্তিক তথ্য',
  'দাগনভূঞা পৌরসভা',
  'পরশুরাম উপজেলার প্রশাসনিক তথ্য',
  'সোনাগাজী পৌরসভা',
  'ফেনীর শিক্ষা, কৃষি, শিল্প ও সম্ভাবনা',
  'ফেনীর ঐতিহাসিক ও দর্শনীয় স্থান',
  'ফেনীর দুর্যোগ ও পরিবেশগত ঝুঁকি'
)
and not exists (
  select 1 from public.fenix_brain_chunks c
  where c.document_id = d.id
    and c.chunk_index = 0
);

-- ============================================================
-- 7. Retrieval RPCs
-- ============================================================

create or replace function public.match_feni_brain_chunks(
  query_embedding extensions.vector(384),
  match_threshold double precision default 0.50,
  match_count integer default 8
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity double precision,
  source_id uuid,
  source_title text,
  source_url text,
  trust_tier smallint,
  document_title text
)
language sql
stable
security invoker
set search_path = extensions, pg_catalog, public
as $function$
  select
    c.id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity,
    s.id as source_id,
    s.title as source_title,
    s.url as source_url,
    s.trust_tier,
    d.title as document_title
  from public.fenix_brain_chunks c
  join public.fenix_brain_documents d on d.id = c.document_id
  join public.fenix_brain_sources s on s.id = d.source_id
  where c.status = 'active'
    and d.status = 'active'
    and s.status = 'active'
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= greatest(0, least(match_threshold, 1))
  order by c.embedding <=> query_embedding asc
  limit least(greatest(match_count, 1), 50);
$function$;

grant execute on function public.match_feni_brain_chunks(vector(384),double precision,integer)
to anon, authenticated;

revoke all on function public.match_feni_brain_chunks(vector(384),double precision,integer)
from public;

create or replace function public.keyword_feni_brain_chunks(
  query_text text,
  match_count integer default 8
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity double precision,
  source_id uuid,
  source_title text,
  source_url text,
  trust_tier smallint,
  document_title text
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $function$
  with q as (
    select lower(trim(left(coalesce(query_text, ''), 500))) as term
  )
  select
    c.id,
    c.document_id,
    c.content,
    case
      when lower(c.content) like '%' || q.term || '%' then 1.0
      else 0.0
    end::double precision as similarity,
    s.id,
    s.title,
    s.url,
    s.trust_tier,
    d.title
  from public.fenix_brain_chunks c
  join public.fenix_brain_documents d on d.id = c.document_id
  join public.fenix_brain_sources s on s.id = d.source_id
  cross join q
  where q.term <> ''
    and c.status = 'active'
    and d.status = 'active'
    and s.status = 'active'
    and (
      lower(c.content) like '%' || q.term || '%'
      or lower(d.title) like '%' || q.term || '%'
      or lower(s.title) like '%' || q.term || '%'
    )
  order by similarity desc, s.trust_tier asc, d.updated_at desc
  limit least(greatest(match_count, 1), 50);
$function$;

grant execute on function public.keyword_feni_brain_chunks(text,integer)
to anon, authenticated;

revoke all on function public.keyword_feni_brain_chunks(text,integer)
from public;

create or replace function public.search_feni_brain_locations(
  query_text text,
  match_count integer default 10
)
returns table (
  id uuid,
  level text,
  name_bn text,
  name_en text,
  slug text,
  alias text,
  match_type text
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $function$
  with q as (
    select lower(trim(left(coalesce(query_text, ''), 200))) as term
  )
  select
    l.id,
    l.level,
    l.name_bn,
    l.name_en,
    l.slug,
    coalesce(a.alias, l.name_bn) as alias,
    case
      when lower(l.name_bn) = q.term then 'exact_name'
      when lower(coalesce(l.name_en, '')) = q.term then 'exact_name_en'
      when lower(coalesce(a.alias, '')) = q.term then 'exact_alias'
      else 'partial'
    end as match_type
  from public.fenix_brain_locations l
  cross join q
  left join public.fenix_brain_location_aliases a
    on a.location_id = l.id
    and lower(a.alias) like '%' || q.term || '%'
  where q.term <> ''
    and l.is_active = true
    and (
      lower(l.name_bn) like '%' || q.term || '%'
      or lower(coalesce(l.name_en, '')) like '%' || q.term || '%'
      or exists (
        select 1
        from public.fenix_brain_location_aliases ax
        where ax.location_id = l.id
          and lower(ax.alias) like '%' || q.term || '%'
      )
    )
  order by
    case
      when lower(l.name_bn) = q.term then 0
      when lower(coalesce(l.name_en, '')) = q.term then 1
      when lower(coalesce(a.alias, '')) = q.term then 2
      else 3
    end,
    l.level,
    l.name_bn
  limit least(greatest(match_count, 1), 50);
$function$;

grant execute on function public.search_feni_brain_locations(text,integer)
to anon, authenticated;

revoke all on function public.search_feni_brain_locations(text,integer)
from public;

commit;
