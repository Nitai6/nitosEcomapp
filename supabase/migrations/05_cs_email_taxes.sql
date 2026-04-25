-- CUSTOMER SERVICE
create type cs_channel as enum ('email','ig_dm','fb_dm','whatsapp','chat','sms','other');
create type ticket_status as enum ('open','waiting_customer','waiting_internal','resolved','closed');
create type ticket_priority as enum ('low','normal','high','urgent');

create table cs_tickets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  channel cs_channel not null,
  external_id text,
  customer_email text,
  customer_name text,
  customer_handle text,
  subject text,
  status ticket_status default 'open',
  priority ticket_priority default 'normal',
  assigned_to uuid references app_users(id) on delete set null,
  tags text[],
  first_response_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on cs_tickets (brand_id, status, created_at desc);

create table cs_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references cs_tickets(id) on delete cascade,
  from_role text not null,
  body text not null,
  attachments jsonb,
  sent_at timestamptz default now(),
  read boolean default false
);
create index on cs_messages (ticket_id, sent_at);

create table cs_faq (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  question text not null,
  answer text not null,
  tags text[],
  times_used int default 0,
  last_used_at timestamptz,
  created_at timestamptz default now()
);
create index on cs_faq (brand_id);

-- EMAILS & SMS
create type msg_provider as enum ('klaviyo','mailchimp','convertkit','beehiiv','gmail','mailjet','postscript','attentive','manychat','other');
create type msg_channel as enum ('email','sms','dm');
create type send_status as enum ('scheduled','sending','sent','failed','paused');

create table email_flows (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  provider msg_provider default 'klaviyo',
  external_id text,
  name text not null,
  channel msg_channel default 'email',
  trigger text,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index on email_flows (brand_id, is_active);

create table email_campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  provider msg_provider default 'klaviyo',
  external_id text,
  name text not null,
  channel msg_channel default 'email',
  subject text,
  segment text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  status send_status default 'scheduled',
  created_at timestamptz default now()
);
create index on email_campaigns (brand_id, sent_at desc);

create table email_sends (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  flow_id uuid references email_flows(id) on delete set null,
  campaign_id uuid references email_campaigns(id) on delete set null,
  recipient_email text,
  recipient_phone text,
  sent_at timestamptz default now(),
  opened boolean default false,
  clicked boolean default false,
  converted boolean default false,
  unsubscribed boolean default false,
  bounced boolean default false,
  revenue numeric(10,2) default 0
);
create index on email_sends (brand_id, sent_at desc);
create index on email_sends (campaign_id);
create index on email_sends (flow_id);

create table segments (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  provider msg_provider,
  external_id text,
  name text not null,
  definition jsonb,
  size int default 0,
  updated_at timestamptz default now()
);
create index on segments (brand_id);

-- TAXES (Israel)
create type il_tax_entity as enum ('osek_patur','osek_murshe','chevra_baam');
create type il_vat_frequency as enum ('monthly','bimonthly');
create type il_doc_type as enum ('invoice','receipt','invoice_receipt','credit_note','proforma');
create type il_report_status as enum ('draft','submitted','approved','amended');

create table tax_entities (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade unique,
  entity_type il_tax_entity default 'osek_murshe',
  legal_name text,
  vat_number text,
  company_id text,
  fiscal_year_start int default 1,
  vat_frequency il_vat_frequency default 'bimonthly',
  bituach_leumi_file_no text,
  created_at timestamptz default now()
);

create table invoices_issued (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  doc_type il_doc_type default 'invoice_receipt',
  invoice_number text not null,
  cheshbonit_digitalit_id text,
  issued_at date not null,
  customer_name text,
  customer_country text,
  subtotal numeric(10,2) not null,
  vat_rate numeric(4,2) default 18.00,
  vat_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  currency text default 'ILS',
  is_export boolean default false,
  notes text,
  created_at timestamptz default now()
);
create index on invoices_issued (brand_id, issued_at desc);
create unique index on invoices_issued (brand_id, invoice_number);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  vendor_name text not null,
  vendor_country text,
  category text,
  subtotal numeric(10,2) not null,
  vat_rate numeric(4,2),
  vat_amount numeric(10,2) default 0,
  total numeric(10,2) not null,
  currency text default 'ILS',
  is_foreign_reverse_charge boolean default false,
  invoice_ref text,
  incurred_at date not null,
  notes text,
  created_at timestamptz default now()
);
create index on expenses (brand_id, incurred_at desc);

create table vat_reports (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  sales_vat numeric(10,2) default 0,
  input_vat numeric(10,2) default 0,
  reverse_charge_vat numeric(10,2) default 0,
  net_vat_due numeric(10,2),
  submitted_at timestamptz,
  status il_report_status default 'draft',
  notes text
);
create unique index on vat_reports (brand_id, period_start, period_end);

create table bituach_leumi_payments (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_income numeric(10,2),
  amount_due numeric(10,2),
  paid_at date,
  notes text
);
create unique index on bituach_leumi_payments (brand_id, period_start);

-- RLS
alter table cs_tickets enable row level security;
alter table cs_messages enable row level security;
alter table cs_faq enable row level security;
alter table email_flows enable row level security;
alter table email_campaigns enable row level security;
alter table email_sends enable row level security;
alter table segments enable row level security;
alter table tax_entities enable row level security;
alter table invoices_issued enable row level security;
alter table expenses enable row level security;
alter table vat_reports enable row level security;
alter table bituach_leumi_payments enable row level security;
create policy "authenticated full access" on cs_tickets for all to authenticated using (true) with check (true);
create policy "authenticated full access" on cs_messages for all to authenticated using (true) with check (true);
create policy "authenticated full access" on cs_faq for all to authenticated using (true) with check (true);
create policy "authenticated full access" on email_flows for all to authenticated using (true) with check (true);
create policy "authenticated full access" on email_campaigns for all to authenticated using (true) with check (true);
create policy "authenticated full access" on email_sends for all to authenticated using (true) with check (true);
create policy "authenticated full access" on segments for all to authenticated using (true) with check (true);
create policy "authenticated full access" on tax_entities for all to authenticated using (true) with check (true);
create policy "authenticated full access" on invoices_issued for all to authenticated using (true) with check (true);
create policy "authenticated full access" on expenses for all to authenticated using (true) with check (true);
create policy "authenticated full access" on vat_reports for all to authenticated using (true) with check (true);
create policy "authenticated full access" on bituach_leumi_payments for all to authenticated using (true) with check (true);
