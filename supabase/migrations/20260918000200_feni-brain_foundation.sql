-- Feni Brain foundation
-- Structured local knowledge + source-backed RAG metadata.
-- No authentication or commerce tables are modified by this migration.

begin;

create table if not exists public.fenix_brain_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  publisher text not null,
  title text not null,
  url text,
  published_at timestamptz,
  effective_from timestamptz,
  effective_until timestamptz,
  language_code text not null default 'bn',
  trust_tier smallint not null default 2,
  status text not null default 'active',
  content_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fenix_brain_sources_type_check check (
    source_type in (
      'government_official',
      'official_document',
      'verified_business',
      'public_web',
      'community',
      'social',
      'internal'
    )
  ),
  constraint fenix_brain_sources_trust_check check (trust_tier between 1 and 4),
  constraint fenix_brain_sources_status_check check (
    status in ('active', 'needs_review', 'archived')
  ),
  constraint fenix_brain_sources_title_check check (
    length(trim(title)) between 2 and 300
  )
);

create index if not exists fenix_brain_sources_status_idx
  on public.fenix_brain_sources(status, trust_tier);

create table if not exists public.fenix_brain_locations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.fenix_brain_locations(id) on delete restrict,
  level text not null,
  name_bn text not null,
  name_en text,
  slug text not null unique,
  official_code text,
  source_id uuid references public.fenix_brain_sources(id) on delete set null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fenix_brain_locations_level_check check (
    level in (
      'district',
      'upazila',
      'municipality',
      'union',
      'ward',
      'village',
      'mouza',
      'market',
      'area',
      'landmark'
    )
  ),
  constraint fenix_brain_locations_name_check check (
    length(trim(name_bn)) between 1 and 200
  )
);

create index if not exists fenix_brain_locations_parent_idx
  on public.fenix_brain_locations(parent_id);

create index if not exists fenix_brain_locations_level_idx
  on public.fenix_brain_locations(level, is_active);

create table if not exists public.fenix_brain_location_aliases (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.fenix_brain_locations(id) on delete cascade,
  alias text not null,
  language_code text not null default 'bn',
  alias_type text not null default 'alternate',
  normalized_alias text generated always as (
    lower(trim(alias))
  ) stored,
  created_at timestamptz not null default timezone('utc', now()),
  constraint fenix_brain_location_alias_type_check check (
    alias_type in ('alternate', 'banglish', 'old_name', 'local_name', 'spelling')
  ),
  constraint fenix_brain_location_alias_check check (
    length(trim(alias)) between 1 and 200
  )
);

create unique index if not exists fenix_brain_location_alias_unique_idx
  on public.fenix_brain_location_aliases(location_id, normalized_alias);

create index if not exists fenix_brain_location_alias_search_idx
  on public.fenix_brain_location_aliases(normalized_alias);

create table if not exists public.fenix_brain_facts (
  id uuid primary key default gen_random_uuid(),
  subject_location_id uuid references public.fenix_brain_locations(id) on delete cascade,
  subject_key text not null,
  value_text text,
  value_number numeric,
  value_unit text,
  source_id uuid not null references public.fenix_brain_sources(id) on delete restrict,
  valid_from timestamptz,
  valid_until timestamptz,
  confidence numeric(5,4) not null default 1.0000,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fenix_brain_facts_subject_check check (
    subject_location_id is not null
  ),
  constraint fenix_brain_facts_value_check check (
    value_text is not null or value_number is not null
  ),
  constraint fenix_brain_facts_confidence_check check (
    confidence between 0 and 1
  ),
  constraint fenix_brain_facts_status_check check (
    status in ('active', 'needs_review', 'archived')
  )
);

create index if not exists fenix_brain_facts_subject_idx
  on public.fenix_brain_facts(subject_location_id, subject_key, status);

create table if not exists public.fenix_brain_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.fenix_brain_sources(id) on delete restrict,
  title text not null,
  document_type text not null default 'knowledge',
  language_code text not null default 'bn',
  content text not null,
  summary text,
  status text not null default 'active',
  effective_from timestamptz,
  effective_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fenix_brain_documents_type_check check (
    document_type in (
      'knowledge',
      'faq',
      'procedure',
      'notice',
      'directory',
      'policy',
      'guide',
      'history'
    )
  ),
  constraint fenix_brain_documents_status_check check (
    status in ('active', 'needs_review', 'archived')
  ),
  constraint fenix_brain_documents_content_check check (
    length(trim(content)) >= 10
  )
);

create index if not exists fenix_brain_documents_source_idx
  on public.fenix_brain_documents(source_id, status);

create table if not exists public.fenix_brain_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.fenix_brain_documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(384),
  embedding_model text,
  source_locator text,
  token_count integer,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fenix_brain_chunks_index_check check (chunk_index >= 0),
  constraint fenix_brain_chunks_status_check check (
    status in ('active', 'needs_review', 'archived')
  ),
  constraint fenix_brain_chunks_content_check check (
    length(trim(content)) >= 10
  ),
  constraint fenix_brain_chunks_unique_idx unique(document_id, chunk_index)
);

create index if not exists fenix_brain_chunks_document_idx
  on public.fenix_brain_chunks(document_id, status);

create index if not exists fenix_brain_chunks_embedding_hnsw_idx
  on public.fenix_brain_chunks
  using hnsw (embedding vector_cosine_ops);

alter table public.fenix_brain_sources enable row level security;
alter table public.fenix_brain_locations enable row level security;
alter table public.fenix_brain_location_aliases enable row level security;
alter table public.fenix_brain_facts enable row level security;
alter table public.fenix_brain_documents enable row level security;
alter table public.fenix_brain_chunks enable row level security;

drop policy if exists "Public can read active Feni Brain sources"
  on public.fenix_brain_sources;
create policy "Public can read active Feni Brain sources"
on public.fenix_brain_sources
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "Public can read active Feni Brain locations"
  on public.fenix_brain_locations;
create policy "Public can read active Feni Brain locations"
on public.fenix_brain_locations
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read Feni Brain location aliases"
  on public.fenix_brain_location_aliases;
create policy "Public can read Feni Brain location aliases"
on public.fenix_brain_location_aliases
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.fenix_brain_locations l
    where l.id = fenix_brain_location_aliases.location_id
      and l.is_active = true
  )
);

drop policy if exists "Public can read active Feni Brain facts"
  on public.fenix_brain_facts;
create policy "Public can read active Feni Brain facts"
on public.fenix_brain_facts
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "Public can read active Feni Brain documents"
  on public.fenix_brain_documents;
create policy "Public can read active Feni Brain documents"
on public.fenix_brain_documents
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "Public can read active Feni Brain chunks"
  on public.fenix_brain_chunks;
create policy "Public can read active Feni Brain chunks"
on public.fenix_brain_chunks
for select
to anon, authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.fenix_brain_documents d
    where d.id = fenix_brain_chunks.document_id
      and d.status = 'active'
  )
);

-- Official sources currently used for the administrative seed below.
with seed_sources(source_type, publisher, title, url, published_at, language_code, trust_tier) as (
  values
    (
      'government_official',
      'Feni District Administration',
      'Feni District — At a Glance',
      'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44',
      '2026-05-09 19:51:00+00'::timestamptz,
      'bn',
      1
    ),
    (
      'government_official',
      'Bangladesh National Portal',
      'Bangladesh Administrative Upazila Directory',
      'https://bangladesh.gov.bd/views/upazila-list/উপজেলা-সমূহ/',
      null,
      'bn',
      1
    ),
    (
      'government_official',
      'Feni Sadar Upazila',
      'Feni Sadar — Union List',
      'https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f',
      '2024-09-01 09:49:00+00'::timestamptz,
      'bn',
      1
    ),
    (
      'government_official',
      'Chhagalnaiya Upazila',
      'Chhagalnaiya — Union List',
      'https://chhagalnaiya.feni.gov.bd/pages/static-pages/6990ef2f35ce18e1c072c137',
      '2013-08-20 17:18:00+00'::timestamptz,
      'bn',
      1
    ),
    (
      'government_official',
      'Daganbhuiyan Upazila',
      'Daganbhuiyan — Union List',
      'https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706',
      '2021-01-04 23:19:00+00'::timestamptz,
      'bn',
      1
    ),
    (
      'government_official',
      'Fulgazi Upazila',
      'Fulgazi — Union List',
      'https://fulgazi.feni.gov.bd/pages/static-pages/699149d8516a96d4de4180ed',
      '2021-08-22 19:37:00+00'::timestamptz,
      'bn',
      1
    ),
    (
      'government_official',
      'Parshuram Upazila',
      'Parshuram — Union List',
      'https://parshuram.feni.gov.bd/pages/static-pages/699149d4516a96d4de417efd',
      '2021-07-27 05:38:00+00'::timestamptz,
      'bn',
      1
    ),
    (
      'government_official',
      'Sonagazi Upazila',
      'Sonagazi — Municipality and Union List',
      'https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850',
      '2016-02-23 11:05:00+00'::timestamptz,
      'bn',
      1
    )
)
insert into public.fenix_brain_sources (
  source_type, publisher, title, url, published_at, language_code, trust_tier
)
select s.source_type, s.publisher, s.title, s.url, s.published_at, s.language_code, s.trust_tier
from seed_sources s
where not exists (
  select 1
  from public.fenix_brain_sources x
  where x.url = s.url
);

with district_source as (
  select id
  from public.fenix_brain_sources
  where url = 'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44'
  limit 1
)
insert into public.fenix_brain_locations (
  parent_id, level, name_bn, name_en, slug, source_id
)
select null, 'district', 'ফেনী', 'Feni', 'feni', district_source.id
from district_source
where not exists (
  select 1 from public.fenix_brain_locations where slug = 'feni'
);

with district as (
  select id
  from public.fenix_brain_locations
  where slug = 'feni'
),
src as (
  select id
  from public.fenix_brain_sources
  where url = 'https://bangladesh.gov.bd/views/upazila-list/উপজেলা-সমূহ/'
  limit 1
)
insert into public.fenix_brain_locations (
  parent_id, level, name_bn, name_en, slug, source_id
)
select
  district.id,
  x.level,
  x.name_bn,
  x.name_en,
  x.slug,
  src.id
from district
cross join src
cross join (
  values
    ('upazila','ফেনী সদর','Feni Sadar','feni-sadar'),
    ('upazila','ছাগলনাইয়া','Chhagalnaiya','chhagalnaiya'),
    ('upazila','দাগনভূঞা','Daganbhuiyan','daganbhuiyan'),
    ('upazila','ফুলগাজী','Fulgazi','fulgazi'),
    ('upazila','পরশুরাম','Parshuram','parshuram'),
    ('upazila','সোনাগাজী','Sonagazi','sonagazi')
) as x(level, name_bn, name_en, slug)
where not exists (
  select 1 from public.fenix_brain_locations l where l.slug = x.slug
);

with upazila_map as (
  select slug, id
  from public.fenix_brain_locations
  where level = 'upazila'
),
src as (
  select
    url,
    id
  from public.fenix_brain_sources
)
insert into public.fenix_brain_locations (
  parent_id, level, name_bn, name_en, slug, source_id
)
select
  u.id,
  x.level,
  x.name_bn,
  x.name_en,
  x.slug,
  s.id
from (
  values
    ('feni-sadar','municipality','ফেনী পৌরসভা','Feni Paurashava','feni-paurashava','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('chhagalnaiya','municipality','ছাগলনাইয়া পৌরসভা','Chhagalnaiya Paurashava','chhagalnaiya-paurashava','https://chhagalnaiya.feni.gov.bd/pages/static-pages/6990ef2f35ce18e1c072c137'),
    ('daganbhuiyan','municipality','দাগনভূঞা পৌরসভা','Daganbhuiyan Paurashava','daganbhuiyan-paurashava','https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706'),
    ('parshuram','municipality','পরশুরাম পৌরসভা','Parshuram Paurashava','parshuram-paurashava','https://parshuram.feni.gov.bd/pages/static-pages/699149d4516a96d4de417efd'),
    ('sonagazi','municipality','সোনাগাজী পৌরসভা','Sonagazi Paurashava','sonagazi-paurashava','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850'),

    ('feni-sadar','union','শর্শদি ইউনিয়ন','Sarishadi Union','sarishadi','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','ধর্মপুর ইউনিয়ন','Dharampur Union','dharampur','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','কাজিরবগ ইউনিয়ন','Kazirbag Union','kazirbag','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','পাঁচগাচিয়া ইউনিয়ন','Panchgachia Union','panchgachia','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','ধলিয়া ইউনিয়ন','Dhalia Union','dhalia','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','বালিগাঁও ইউনিয়ন','Baligaon Union','baligaon','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','ছনুয়া ইউনিয়ন','Chhonuya Union','chhonuya','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','লেমুয়া ইউনিয়ন','Lemua Union','lemua','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','ফাজিলপুর ইউনিয়ন','Fazilpur Union','fazilpur','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','ফরহাদনগর ইউনিয়ন','Farhadnagar Union','farhadnagar','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','কালিদহ ইউনিয়ন','Kalidaha Union','kalidah','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),
    ('feni-sadar','union','মোটবী ইউনিয়ন','Motobi Union','motobi','https://sadar.feni.gov.bd/pages/static-pages/6990ef4535ce18e1c072cb1f'),

    ('chhagalnaiya','union','মহামায়া ইউনিয়ন','Mahamaya Union','mahamaya','https://chhagalnaiya.feni.gov.bd/pages/static-pages/6990ef2f35ce18e1c072c137'),
    ('chhagalnaiya','union','পাঠাননগর ইউনিয়ন','Pathannagar Union','pathannagar','https://chhagalnaiya.feni.gov.bd/pages/static-pages/6990ef2f35ce18e1c072c137'),
    ('chhagalnaiya','union','রাধানগর ইউনিয়ন','Radhanagar Union','radhanagar','https://chhagalnaiya.feni.gov.bd/pages/static-pages/6990ef2f35ce18e1c072c137'),
    ('chhagalnaiya','union','শুভপুর ইউনিয়ন','Shuvapur Union','shuvapur','https://chhagalnaiya.feni.gov.bd/pages/static-pages/6990ef2f35ce18e1c072c137'),
    ('chhagalnaiya','union','ঘোপাল ইউনিয়ন','Ghopal Union','ghopal','https://chhagalnaiya.feni.gov.bd/pages/static-pages/6990ef2f35ce18e1c072c137'),

    ('daganbhuiyan','union','সিন্দুরপুর ইউনিয়ন','Sindurpur Union','sindurpur','https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706'),
    ('daganbhuiyan','union','রাজাপুর ইউনিয়ন','Rajapur Union','rajapur','https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706'),
    ('daganbhuiyan','union','পূর্বচন্দ্রপুর ইউনিয়ন','Purbachandrapur Union','purbachandrapur','https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706'),
    ('daganbhuiyan','union','রামনগর ইউনিয়ন','Ramnagar Union','ramnagar','https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706'),
    ('daganbhuiyan','union','ইয়াকুবপুর ইউনিয়ন','Yakubpur Union','yakubpur','https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706'),
    ('daganbhuiyan','union','দাগনভূঞা ইউনিয়ন','Daganbhuiyan Union','daganbhuiyan-union','https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706'),
    ('daganbhuiyan','union','মাতুভূঞা ইউনিয়ন','Matuabhuiyan Union','matuabhuiyan','https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706'),
    ('daganbhuiyan','union','জায়লষ্কর ইউনিয়ন','Jaylaskar Union','jaylaskar','https://daganbhuiyan.feni.gov.bd/pages/static-pages/699149c2516a96d4de417706'),

    ('fulgazi','union','ফুলগাজী ইউনিয়ন','Fulgazi Union','fulgazi-union','https://fulgazi.feni.gov.bd/pages/static-pages/699149d8516a96d4de4180ed'),
    ('fulgazi','union','মুন্সীরহাট ইউনিয়ন','Munshirhat Union','munshirhat','https://fulgazi.feni.gov.bd/pages/static-pages/699149d8516a96d4de4180ed'),
    ('fulgazi','union','দরবারপুর ইউনিয়ন','Darbarpur Union','darbarpur','https://fulgazi.feni.gov.bd/pages/static-pages/699149d8516a96d4de4180ed'),
    ('fulgazi','union','আনন্দপুর ইউনিয়ন','Anandapur Union','anandapur','https://fulgazi.feni.gov.bd/pages/static-pages/699149d8516a96d4de4180ed'),
    ('fulgazi','union','আমজাদ হাট ইউনিয়ন','Amzad Hat Union','amzad-hat','https://fulgazi.feni.gov.bd/pages/static-pages/699149d8516a96d4de4180ed'),
    ('fulgazi','union','জি এম হাট ইউনিয়ন','GM Hat Union','gm-hat','https://fulgazi.feni.gov.bd/pages/static-pages/699149d8516a96d4de4180ed'),

    ('parshuram','union','মির্জানগর ইউনিয়ন','Mirzanagar Union','mirzanagar','https://parshuram.feni.gov.bd/pages/static-pages/699149d4516a96d4de417efd'),
    ('parshuram','union','চিথলিয়া ইউনিয়ন','Chithlia Union','chithlia','https://parshuram.feni.gov.bd/pages/static-pages/699149d4516a96d4de417efd'),
    ('parshuram','union','বক্সমাহমুদ ইউনিয়ন','Boxmahmmud Union','boxmahmmud','https://parshuram.feni.gov.bd/pages/static-pages/699149d4516a96d4de417efd'),

    ('sonagazi','union','চর মজলিশপুর ইউনিয়ন','Char Mojlishpur Union','char-mojlishpur','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850'),
    ('sonagazi','union','বগাদানা ইউনিয়ন','Bogadana Union','bogadana','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850'),
    ('sonagazi','union','মংগলকান্দি ইউনিয়ন','Mongolkandi Union','mongolkandi','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850'),
    ('sonagazi','union','মতিগঞ্জ ইউনিয়ন','Motiganj Union','motiganj','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850'),
    ('sonagazi','union','চর দরবেশ ইউনিয়ন','Char Darbesh Union','char-darbesh','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850'),
    ('sonagazi','union','চর চান্দিয়া ইউনিয়ন','Char Chandia Union','char-chandia','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850'),
    ('sonagazi','union','সোনাগাজী ইউনিয়ন','Sonagazi Union','sonagazi-union','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850'),
    ('sonagazi','union','আমিরাবাদ ইউনিয়ন','Amirabad Union','amirabad','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850'),
    ('sonagazi','union','নবাবপুর ইউনিয়ন','Nawabpur Union','nawabpur','https://sonagazi.feni.gov.bd/pages/static-pages/6990ef3f35ce18e1c072c850')
) as x(parent_slug, level, name_bn, name_en, slug, source_url)
join upazila_map u on u.slug = x.parent_slug
left join src s on s.url = x.source_url
where not exists (
  select 1 from public.fenix_brain_locations l where l.slug = x.slug
);

with locations as (
  select id, slug
  from public.fenix_brain_locations
)
insert into public.fenix_brain_location_aliases (location_id, alias, language_code, alias_type)
select l.id, a.alias, a.language_code, a.alias_type
from locations l
join (
  values
    ('feni','ফেনী','bn','spelling'),
    ('feni','Feni','en','alternate'),
    ('feni','Feni district','en','alternate'),
    ('feni-sadar','ফেনী সদর','bn','spelling'),
    ('feni-sadar','Feni Sadar','en','alternate'),
    ('chhagalnaiya','ছাগলনাইয়া','bn','spelling'),
    ('chhagalnaiya','ছাগলনাইয়া','bn','spelling'),
    ('chhagalnaiya','Chhagalnaiya','en','alternate'),
    ('chhagalnaiya','Chagalnaiya','en','spelling'),
    ('daganbhuiyan','দাগনভূঞা','bn','spelling'),
    ('daganbhuiyan','দাগনভুইয়া','bn','spelling'),
    ('daganbhuiyan','Daganbhuiyan','en','alternate'),
    ('fulgazi','ফুলগাজী','bn','spelling'),
    ('fulgazi','ফুলগাজি','bn','spelling'),
    ('fulgazi','Fulgazi','en','alternate'),
    ('parshuram','পরশুরাম','bn','alternate'),
    ('parshuram','Parshuram','en','alternate'),
    ('sonagazi','সোনাগাজী','bn','spelling'),
    ('sonagazi','সোনাগাজি','bn','spelling'),
    ('sonagazi','Sonagazi','en','alternate')
) as a(location_slug, alias, language_code, alias_type)
on a.location_slug = l.slug
where not exists (
  select 1
  from public.fenix_brain_location_aliases x
  where x.location_id = l.id
    and x.normalized_alias = lower(trim(a.alias))
);

with district as (
  select id
  from public.fenix_brain_locations
  where slug = 'feni'
),
source as (
  select id
  from public.fenix_brain_sources
  where url = 'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44'
  limit 1
)
insert into public.fenix_brain_facts (
  subject_location_id,
  subject_key,
  value_number,
  value_unit,
  source_id
)
select district.id, x.subject_key, x.value_number, x.value_unit, source.id
from district
cross join source
join (
  values
    ('area', 928.34::numeric, 'square_km'),
    ('upazila_count', 6::numeric, 'count'),
    ('municipality_count', 5::numeric, 'count'),
    ('union_count', 43::numeric, 'count'),
    ('village_count', 564::numeric, 'count'),
    ('mouza_count', 540::numeric, 'count'),
    ('union_land_office_count', 27::numeric, 'count'),
    ('market_count', 123::numeric, 'count')
) as x(subject_key, value_number, value_unit)
where not exists (
  select 1
  from public.fenix_brain_facts f
  where f.subject_location_id = district.id
    and f.subject_key = x.subject_key
    and f.source_id = source.id
);

with source as (
  select id
  from public.fenix_brain_sources
  where url = 'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44'
  limit 1
)
insert into public.fenix_brain_documents (
  source_id,
  title,
  document_type,
  language_code,
  content,
  summary,
  metadata
)
select
  source.id,
  'ফেনী জেলা — প্রশাসনিক কাঠামো ও এক নজরে',
  'knowledge',
  'bn',
  'ফেনী জেলা চট্টগ্রাম বিভাগের একটি জেলা। জেলার আয়তন ৯২৮.৩৪ বর্গ কিলোমিটার। প্রশাসনিক কাঠামোতে ৬টি উপজেলা, ৫টি পৌরসভা এবং ৪৩টি ইউনিয়ন রয়েছে। জেলায় ৫৬৪টি গ্রাম, ৫৪০টি মৌজা, ২৭টি ইউনিয়ন ভূমি অফিস এবং ১২৩টি হাট-বাজারের তথ্য জেলা প্রশাসনের এক নজরে পাতায় উল্লেখ আছে।',
  'ফেনী জেলার সরকারি প্রশাসনিক কাঠামোর সংক্ষিপ্ত তথ্য।',
  '{"scope":"district","topic":"administration","source_verified":true}'::jsonb
from source
where not exists (
  select 1
  from public.fenix_brain_documents d
  where d.title = 'ফেনী জেলা — প্রশাসনিক কাঠামো ও এক নজরে'
);

commit;
