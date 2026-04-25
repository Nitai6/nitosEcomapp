-- ECOM BUILDER (store-build projects)
create type build_stage as enum ('discovery','branding','product_research','store_build','content','marketing_setup','launch','handoff','archived');
create type build_task_status as enum ('todo','doing','blocked','done','skipped');

create table builds (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  project_name text not null,
  client_name text,
  niche text,
  platform text default 'shopify',
  stage build_stage default 'discovery',
  started_at timestamptz default now(),
  target_launch date,
  actual_launch date,
  budget_ils numeric(10,2),
  spent_ils numeric(10,2) default 0,
  agent_session_id text,
  notes text
);
create index on builds (brand_id, stage);

create table build_tasks (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references builds(id) on delete cascade,
  stage build_stage not null,
  title text not null,
  description text,
  status build_task_status default 'todo',
  assigned_to text,
  due_at date,
  completed_at timestamptz,
  order_index int default 0,
  notes text
);
create index on build_tasks (build_id, status);

create table build_assets (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references builds(id) on delete cascade,
  type text not null,
  name text,
  url text,
  content text,
  metadata jsonb,
  created_at timestamptz default now()
);
create index on build_assets (build_id);

-- SETTINGS expansion
create table niches (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  name text not null,
  description text,
  target_audience jsonb,
  tone_of_voice text,
  created_at timestamptz default now()
);
create unique index on niches (brand_id, name);

create table benchmarks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  niche_id uuid references niches(id) on delete set null,
  metric text not null,
  baseline numeric(12,4),
  target numeric(12,4),
  unit text,
  context text,
  is_global boolean default false,
  created_at timestamptz default now()
);
create index on benchmarks (brand_id, metric);

create table alert_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  brand_id uuid references brands(id) on delete cascade,
  category alert_category not null,
  channel text default 'dashboard',
  min_severity alert_severity default 'warn',
  threshold_json jsonb,
  is_active boolean default true
);
create index on alert_preferences (user_id, brand_id);

create table user_brand_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,
  role user_role default 'owner',
  created_at timestamptz default now(),
  unique (user_id, brand_id)
);
create index on user_brand_access (user_id);
create index on user_brand_access (brand_id);

-- RLS
alter table builds enable row level security;
alter table build_tasks enable row level security;
alter table build_assets enable row level security;
alter table niches enable row level security;
alter table benchmarks enable row level security;
alter table alert_preferences enable row level security;
alter table user_brand_access enable row level security;
create policy "authenticated full access" on builds for all to authenticated using (true) with check (true);
create policy "authenticated full access" on build_tasks for all to authenticated using (true) with check (true);
create policy "authenticated full access" on build_assets for all to authenticated using (true) with check (true);
create policy "authenticated full access" on niches for all to authenticated using (true) with check (true);
create policy "authenticated full access" on benchmarks for all to authenticated using (true) with check (true);
create policy "authenticated full access" on alert_preferences for all to authenticated using (true) with check (true);
create policy "authenticated full access" on user_brand_access for all to authenticated using (true) with check (true);
