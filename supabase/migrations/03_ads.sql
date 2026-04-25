-- ADS category
create type creative_status as enum ('testing','scaling','paused','killed','winner');
create type creative_type as enum ('image','video','carousel','collection','dynamic');
create type campaign_phase as enum ('testing','scaling','retargeting','brand','other');
create type kill_scale_action as enum ('kill','scale_up','scale_down','refresh','pause','resume','duplicate');

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  platform ad_platform not null,
  external_id text,
  name text not null,
  objective text,
  phase campaign_phase default 'testing',
  status text default 'active',
  daily_budget numeric(10,2),
  currency text default 'ILS',
  started_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);
create unique index on campaigns (brand_id, platform, external_id) where external_id is not null;
create index on campaigns (brand_id, status);

create table ad_sets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  external_id text,
  name text not null,
  status text default 'active',
  daily_budget numeric(10,2),
  targeting jsonb,
  created_at timestamptz default now()
);
create unique index on ad_sets (campaign_id, external_id) where external_id is not null;

create table creatives (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  type creative_type default 'image',
  concept text,
  hook text,
  copy_body text,
  asset_url text,
  thumbnail_url text,
  format_tag text,
  copy_formula text,
  status creative_status default 'testing',
  fatigue_score numeric(4,2),
  created_at timestamptz default now(),
  launched_at timestamptz,
  killed_at timestamptz,
  notes text
);
create index on creatives (brand_id, status);

create table ads (
  id uuid primary key default gen_random_uuid(),
  ad_set_id uuid not null references ad_sets(id) on delete cascade,
  creative_id uuid references creatives(id) on delete set null,
  external_id text,
  post_id text,
  name text not null,
  status text default 'active',
  created_at timestamptz default now()
);
create unique index on ads (ad_set_id, external_id) where external_id is not null;

create table ad_insights_daily (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references ads(id) on delete cascade,
  date date not null,
  spend numeric(10,2) default 0,
  impressions int default 0,
  clicks int default 0,
  conversions int default 0,
  revenue numeric(10,2) default 0,
  ctr numeric(6,4),
  cpa numeric(10,2),
  roas numeric(6,2),
  frequency numeric(6,2),
  cpm numeric(10,2)
);
create unique index on ad_insights_daily (ad_id, date);
create index on ad_insights_daily (date desc);

create table kill_scale_log (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  action kill_scale_action not null,
  reason text,
  triggered_by text default 'manual',
  metrics_snapshot jsonb,
  at timestamptz default now()
);
create index on kill_scale_log (brand_id, at desc);

-- RLS
alter table campaigns enable row level security;
alter table ad_sets enable row level security;
alter table creatives enable row level security;
alter table ads enable row level security;
alter table ad_insights_daily enable row level security;
alter table kill_scale_log enable row level security;
create policy "authenticated full access" on campaigns for all to authenticated using (true) with check (true);
create policy "authenticated full access" on ad_sets for all to authenticated using (true) with check (true);
create policy "authenticated full access" on creatives for all to authenticated using (true) with check (true);
create policy "authenticated full access" on ads for all to authenticated using (true) with check (true);
create policy "authenticated full access" on ad_insights_daily for all to authenticated using (true) with check (true);
create policy "authenticated full access" on kill_scale_log for all to authenticated using (true) with check (true);
