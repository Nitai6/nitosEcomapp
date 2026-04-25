-- ENUMS
create type brand_status as enum ('active','paused','archived');
create type user_role as enum ('owner','admin','operator','viewer');
create type connection_status as enum ('connected','disconnected','error','pending_auth');
create type run_status as enum ('running','success','failed','partial');
create type alert_severity as enum ('info','warn','crit');
create type alert_category as enum ('ads','seo','cro','socials','taxes','cs','email_sms','ecom_builder','products','system');

-- 1. brands
create table brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  domain text,
  niche text,
  country text default 'IL',
  base_currency text default 'ILS',
  status brand_status default 'active',
  owner_notes text,
  created_at timestamptz default now()
);

-- 2. app_users
create table app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role user_role default 'owner',
  created_at timestamptz default now()
);

-- 3. subscriptions (operator-global, manual entry)
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  app_name text not null,
  category text,
  monthly_cost_usd numeric(10,2),
  monthly_cost_ils numeric(10,2),
  billing_day int check (billing_day between 1 and 31),
  is_active boolean default true,
  started_at date,
  ended_at date,
  notes text,
  created_at timestamptz default now()
);

-- 4. connections
create table connections (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  platform text not null,
  account_ref text,
  status connection_status default 'pending_auth',
  vault_secret_id uuid,
  connected_at timestamptz,
  last_checked_at timestamptz,
  notes text,
  unique (brand_id, platform, account_ref)
);
create index on connections (brand_id, platform);

-- 5. routine_runs
create table routine_runs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  routine_name text not null,
  started_at timestamptz default now(),
  finished_at timestamptz,
  status run_status default 'running',
  tokens_used int,
  cost_usd numeric(10,4),
  error_summary text,
  artifacts jsonb
);
create index on routine_runs (brand_id, started_at desc);
create index on routine_runs (routine_name, started_at desc);

-- 6. alerts
create table alerts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  category alert_category not null,
  severity alert_severity default 'warn',
  title text not null,
  message text,
  source_table text,
  source_id uuid,
  acknowledged boolean default false,
  acknowledged_at timestamptz,
  created_at timestamptz default now()
);
create index on alerts (brand_id, acknowledged, created_at desc);

-- RLS
alter table brands enable row level security;
alter table app_users enable row level security;
alter table subscriptions enable row level security;
alter table connections enable row level security;
alter table routine_runs enable row level security;
alter table alerts enable row level security;

create policy "authenticated full access" on brands for all to authenticated using (true) with check (true);
create policy "authenticated full access" on app_users for all to authenticated using (true) with check (true);
create policy "authenticated full access" on subscriptions for all to authenticated using (true) with check (true);
create policy "authenticated full access" on connections for all to authenticated using (true) with check (true);
create policy "authenticated full access" on routine_runs for all to authenticated using (true) with check (true);
create policy "authenticated full access" on alerts for all to authenticated using (true) with check (true);

-- Seed default brand
insert into brands (slug, name, country, base_currency) values ('default','Default Brand','IL','ILS');
