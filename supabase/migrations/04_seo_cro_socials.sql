-- SEO
create type seo_page_type as enum ('homepage','product','collection','blog','landing','other');

create table seo_pages (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  url text not null,
  type seo_page_type default 'other',
  title text,
  meta_description text,
  word_count int,
  last_audited_at timestamptz,
  created_at timestamptz default now()
);
create unique index on seo_pages (brand_id, url);

create table seo_keywords (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  keyword text not null,
  intent text,
  search_volume int,
  current_rank int,
  target_rank int,
  tracked_since timestamptz default now(),
  is_active boolean default true
);
create unique index on seo_keywords (brand_id, keyword);

create table seo_rankings_daily (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid not null references seo_keywords(id) on delete cascade,
  date date not null,
  rank int,
  url text
);
create unique index on seo_rankings_daily (keyword_id, date);

create table seo_audits (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  run_at timestamptz default now(),
  overall_score int,
  technical_score int,
  content_score int,
  onpage_score int,
  schema_score int,
  cwv_score int,
  image_score int,
  ai_readiness_score int,
  gsc_data jsonb,
  recommendations jsonb
);
create index on seo_audits (brand_id, run_at desc);

create table backlinks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  source_url text not null,
  target_url text not null,
  anchor text,
  domain_rating int,
  is_followed boolean default true,
  first_seen date,
  last_seen date,
  status text default 'live'
);
create index on backlinks (brand_id, last_seen desc);

-- CRO
create type cro_page_type as enum ('lp','pdp','cart','checkout','popup','quiz','lead_gen');
create type ab_test_status as enum ('draft','running','paused','completed','cancelled');

create table cro_pages (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  url text not null,
  type cro_page_type default 'lp',
  baseline_cvr numeric(6,4),
  traffic_source text,
  created_at timestamptz default now()
);
create unique index on cro_pages (brand_id, url);

create table cro_audits (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references cro_pages(id) on delete cascade,
  run_at timestamptz default now(),
  message_match int,
  speed int,
  mobile int,
  trust int,
  form int,
  overall_score int,
  lcp_ms int,
  inp_ms int,
  cls numeric(5,3),
  quick_wins jsonb,
  notes text
);
create index on cro_audits (page_id, run_at desc);

create table ab_tests (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  page_id uuid references cro_pages(id) on delete set null,
  name text not null,
  hypothesis text,
  variant_a text,
  variant_b text,
  metric text,
  mde_pct numeric(5,2),
  sample_size_required int,
  status ab_test_status default 'draft',
  started_at timestamptz,
  ended_at timestamptz,
  winner text,
  uplift_pct numeric(6,2),
  notes text
);
create index on ab_tests (brand_id, status);

create table funnel_snapshots (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  date date not null,
  ad_impressions int default 0,
  lp_visits int default 0,
  add_to_cart int default 0,
  checkout_started int default 0,
  purchases int default 0,
  revenue numeric(10,2) default 0
);
create unique index on funnel_snapshots (brand_id, date);

-- SOCIALS
create type social_platform as enum ('youtube','instagram','tiktok','twitter','bluesky','facebook','pinterest','other');
create type content_status as enum ('idea','draft','scheduled','posted','archived');

create table social_accounts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  platform social_platform not null,
  handle text not null,
  display_name text,
  followers int default 0,
  following int default 0,
  niche text,
  is_theme_page boolean default false,
  link_in_bio text,
  created_at timestamptz default now(),
  last_synced_at timestamptz
);
create unique index on social_accounts (brand_id, platform, handle);

create table social_posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references social_accounts(id) on delete cascade,
  external_id text,
  type text,
  caption text,
  media_url text,
  posted_at timestamptz,
  views int default 0,
  likes int default 0,
  comments int default 0,
  shares int default 0,
  saves int default 0,
  reach int default 0,
  last_synced_at timestamptz
);
create unique index on social_posts (account_id, external_id) where external_id is not null;
create index on social_posts (account_id, posted_at desc);

create table content_calendar (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  account_id uuid references social_accounts(id) on delete set null,
  title text not null,
  format text,
  platform social_platform,
  hook text,
  script_md text,
  assets jsonb,
  planned_for timestamptz,
  status content_status default 'idea',
  created_at timestamptz default now()
);
create index on content_calendar (brand_id, planned_for);

create table reverse_eng_targets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  platform social_platform not null,
  handle text not null,
  followers int,
  niche text,
  content_patterns jsonb,
  last_scraped_at timestamptz,
  notes text
);
create unique index on reverse_eng_targets (brand_id, platform, handle);

-- RLS
alter table seo_pages enable row level security;
alter table seo_keywords enable row level security;
alter table seo_rankings_daily enable row level security;
alter table seo_audits enable row level security;
alter table backlinks enable row level security;
alter table cro_pages enable row level security;
alter table cro_audits enable row level security;
alter table ab_tests enable row level security;
alter table funnel_snapshots enable row level security;
alter table social_accounts enable row level security;
alter table social_posts enable row level security;
alter table content_calendar enable row level security;
alter table reverse_eng_targets enable row level security;
create policy "authenticated full access" on seo_pages for all to authenticated using (true) with check (true);
create policy "authenticated full access" on seo_keywords for all to authenticated using (true) with check (true);
create policy "authenticated full access" on seo_rankings_daily for all to authenticated using (true) with check (true);
create policy "authenticated full access" on seo_audits for all to authenticated using (true) with check (true);
create policy "authenticated full access" on backlinks for all to authenticated using (true) with check (true);
create policy "authenticated full access" on cro_pages for all to authenticated using (true) with check (true);
create policy "authenticated full access" on cro_audits for all to authenticated using (true) with check (true);
create policy "authenticated full access" on ab_tests for all to authenticated using (true) with check (true);
create policy "authenticated full access" on funnel_snapshots for all to authenticated using (true) with check (true);
create policy "authenticated full access" on social_accounts for all to authenticated using (true) with check (true);
create policy "authenticated full access" on social_posts for all to authenticated using (true) with check (true);
create policy "authenticated full access" on content_calendar for all to authenticated using (true) with check (true);
create policy "authenticated full access" on reverse_eng_targets for all to authenticated using (true) with check (true);
