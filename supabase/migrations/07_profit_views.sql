-- PROFIT VIEWS — the whole point of the DB.
-- These compute MER, ROAS, contribution margin, and net profit on the fly.

-- Daily revenue per brand
create or replace view v_daily_revenue as
select
  o.brand_id,
  date(o.placed_at) as date,
  count(*) as orders,
  sum(o.total) as gross_revenue,
  coalesce(sum(r.amount), 0) as refunded,
  sum(o.total) - coalesce(sum(r.amount), 0) as net_revenue,
  sum(o.processor_fee) as processor_fees,
  sum(o.shipping) as shipping_charged,
  sum(o.tax) as tax_collected
from orders o
left join refunds r on r.order_id = o.id
where o.status in ('paid','fulfilled','partially_refunded')
group by o.brand_id, date(o.placed_at);

-- Daily COGS per brand
create or replace view v_daily_cogs as
select
  o.brand_id,
  date(o.placed_at) as date,
  sum(oi.qty * coalesce(oi.unit_cogs, 0)) as cogs
from orders o
join order_items oi on oi.order_id = o.id
where o.status in ('paid','fulfilled','partially_refunded')
group by o.brand_id, date(o.placed_at);

-- Daily ad spend per brand (across all platforms)
create or replace view v_daily_ad_spend as
select
  brand_id,
  date,
  sum(spend) as total_ad_spend,
  sum(revenue_attributed) as platform_attributed_revenue,
  sum(impressions) as impressions,
  sum(clicks) as clicks,
  sum(conversions) as conversions
from ad_spend_daily
group by brand_id, date;

-- Daily external costs per brand
create or replace view v_daily_external_costs as
select
  brand_id,
  incurred_at as date,
  sum(amount) as external_costs
from external_costs
group by brand_id, incurred_at;

-- Daily net profit — the star of the show
create or replace view v_daily_profit as
select
  b.id as brand_id,
  d.date,
  coalesce(r.net_revenue, 0) as net_revenue,
  coalesce(c.cogs, 0) as cogs,
  coalesce(a.total_ad_spend, 0) as ad_spend,
  coalesce(r.processor_fees, 0) as processor_fees,
  coalesce(r.shipping_charged, 0) as shipping_charged,
  coalesce(e.external_costs, 0) as external_costs,
  -- Gross profit = revenue - COGS
  (coalesce(r.net_revenue, 0) - coalesce(c.cogs, 0)) as gross_profit,
  -- Contribution margin = gross profit - ad spend - processor fees
  (coalesce(r.net_revenue, 0) - coalesce(c.cogs, 0) - coalesce(a.total_ad_spend, 0) - coalesce(r.processor_fees, 0)) as contribution_margin,
  -- Net profit = contribution margin - external costs (excludes operator-level subscriptions)
  (coalesce(r.net_revenue, 0) - coalesce(c.cogs, 0) - coalesce(a.total_ad_spend, 0) - coalesce(r.processor_fees, 0) - coalesce(e.external_costs, 0)) as net_profit,
  -- MER = revenue / ad spend (NULL-safe)
  case when coalesce(a.total_ad_spend, 0) > 0 then coalesce(r.net_revenue, 0) / a.total_ad_spend else null end as mer,
  -- Gross margin %
  case when coalesce(r.net_revenue, 0) > 0 then ((coalesce(r.net_revenue, 0) - coalesce(c.cogs, 0)) / r.net_revenue * 100) else null end as gross_margin_pct
from brands b
cross join (
  select distinct date from v_daily_revenue
  union select distinct date from v_daily_ad_spend
) d
left join v_daily_revenue r on r.brand_id = b.id and r.date = d.date
left join v_daily_cogs c on c.brand_id = b.id and c.date = d.date
left join v_daily_ad_spend a on a.brand_id = b.id and a.date = d.date
left join v_daily_external_costs e on e.brand_id = b.id and e.date = d.date;

-- Monthly profit rollup
create or replace view v_monthly_profit as
select
  brand_id,
  date_trunc('month', date)::date as month,
  sum(net_revenue) as net_revenue,
  sum(cogs) as cogs,
  sum(ad_spend) as ad_spend,
  sum(processor_fees) as processor_fees,
  sum(external_costs) as external_costs,
  sum(gross_profit) as gross_profit,
  sum(contribution_margin) as contribution_margin,
  sum(net_profit) as net_profit,
  case when sum(ad_spend) > 0 then sum(net_revenue) / sum(ad_spend) else null end as mer,
  case when sum(net_revenue) > 0 then (sum(gross_profit) / sum(net_revenue) * 100) else null end as gross_margin_pct
from v_daily_profit
group by brand_id, date_trunc('month', date);

-- Operator-level monthly subscription cost (YOUR costs, not per-brand)
create or replace view v_operator_monthly_subscriptions as
select
  date_trunc('month', now())::date as month,
  count(*) filter (where is_active) as active_subscriptions,
  sum(monthly_cost_usd) filter (where is_active) as total_usd,
  sum(monthly_cost_ils) filter (where is_active) as total_ils
from subscriptions;

-- Campaign-level performance (joined with insights)
create or replace view v_campaign_performance as
select
  c.id as campaign_id,
  c.brand_id,
  c.platform,
  c.name,
  c.phase,
  c.status,
  c.daily_budget,
  coalesce(sum(i.spend), 0) as total_spend,
  coalesce(sum(i.impressions), 0) as total_impressions,
  coalesce(sum(i.clicks), 0) as total_clicks,
  coalesce(sum(i.conversions), 0) as total_conversions,
  coalesce(sum(i.revenue), 0) as total_revenue,
  case when coalesce(sum(i.spend), 0) > 0 then sum(i.revenue) / sum(i.spend) else null end as roas,
  case when coalesce(sum(i.clicks), 0) > 0 then sum(i.spend) / sum(i.clicks) else null end as avg_cpc,
  case when coalesce(sum(i.conversions), 0) > 0 then sum(i.spend) / sum(i.conversions) else null end as avg_cpa
from campaigns c
left join ad_sets ads on ads.campaign_id = c.id
left join ads a on a.ad_set_id = ads.id
left join ad_insights_daily i on i.ad_id = a.id
group by c.id, c.brand_id, c.platform, c.name, c.phase, c.status, c.daily_budget;
