-- DATA LAYER — invisible plumbing. Feeds profit math into every category.

create type product_source as enum ('shopify','woocommerce','manual','other');
create type order_status as enum ('pending','paid','fulfilled','cancelled','refunded','partially_refunded');
create type ad_platform as enum ('meta','google','tiktok','youtube','linkedin','microsoft','apple','pinterest','twitter','other');

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  source product_source default 'manual',
  external_id text,
  sku text,
  title text not null,
  variant text,
  cogs numeric(10,2),
  price numeric(10,2),
  currency text default 'ILS',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on products (brand_id, is_active);
create unique index on products (brand_id, source, external_id) where external_id is not null;

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  source product_source default 'manual',
  external_id text,
  order_number text,
  customer_email text,
  customer_country text,
  currency text default 'ILS',
  subtotal numeric(10,2),
  shipping numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2),
  processor_fee numeric(10,2) default 0,
  status order_status default 'paid',
  placed_at timestamptz not null,
  created_at timestamptz default now()
);
create index on orders (brand_id, placed_at desc);
create unique index on orders (brand_id, source, external_id) where external_id is not null;

-- Order items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  qty int not null default 1,
  unit_price numeric(10,2),
  unit_cogs numeric(10,2),
  line_total numeric(10,2)
);
create index on order_items (order_id);

-- Refunds
create table refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  amount numeric(10,2) not null,
  reason text,
  refunded_at timestamptz default now()
);
create index on refunds (order_id);

-- Ad spend daily (rollup from platforms, also supports manual entry for platforms without MCP)
create table ad_spend_daily (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  platform ad_platform not null,
  campaign_external_id text,
  date date not null,
  spend numeric(10,2) not null default 0,
  impressions int default 0,
  clicks int default 0,
  conversions int default 0,
  revenue_attributed numeric(10,2) default 0,
  currency text default 'ILS',
  created_at timestamptz default now()
);
create unique index on ad_spend_daily (brand_id, platform, coalesce(campaign_external_id, ''), date);
create index on ad_spend_daily (brand_id, date desc);

-- External costs (shipping outbound, 3PL, custom fees, misc brand-specific operating costs)
create table external_costs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  name text not null,
  category text,
  amount numeric(10,2) not null,
  currency text default 'ILS',
  incurred_at date not null,
  is_recurring boolean default false,
  notes text,
  created_at timestamptz default now()
);
create index on external_costs (brand_id, incurred_at desc);

-- RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table refunds enable row level security;
alter table ad_spend_daily enable row level security;
alter table external_costs enable row level security;

create policy "authenticated full access" on products for all to authenticated using (true) with check (true);
create policy "authenticated full access" on orders for all to authenticated using (true) with check (true);
create policy "authenticated full access" on order_items for all to authenticated using (true) with check (true);
create policy "authenticated full access" on refunds for all to authenticated using (true) with check (true);
create policy "authenticated full access" on ad_spend_daily for all to authenticated using (true) with check (true);
create policy "authenticated full access" on external_costs for all to authenticated using (true) with check (true);
