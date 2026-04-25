import { createClient } from "@/lib/supabase/server";
import { PageHeader, Kpi, EmptyState } from "@/components/page-header";
import { formatMoney, formatNumber } from "@/lib/utils";
import { Megaphone } from "lucide-react";

export default async function AdsPage() {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString().slice(0, 10);

  const [{ data: campaigns }, { data: spend }, { data: creatives }, { data: killLog }] = await Promise.all([
    supabase.from("v_campaign_performance").select("*").order("total_spend", { ascending: false }).limit(10),
    supabase.from("v_daily_ad_spend").select("*").gte("date", sinceIso),
    supabase.from("creatives").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("kill_scale_log").select("*").order("at", { ascending: false }).limit(5),
  ]);

  const agg = (spend ?? []).reduce(
    (a: any, r: any) => ({
      spend: a.spend + Number(r.total_ad_spend ?? 0),
      revenue: a.revenue + Number(r.platform_attributed_revenue ?? 0),
      clicks: a.clicks + Number(r.clicks ?? 0),
      conversions: a.conversions + Number(r.conversions ?? 0),
    }),
    { spend: 0, revenue: 0, clicks: 0, conversions: 0 }
  );
  const roas = agg.spend > 0 ? agg.revenue / agg.spend : null;
  const cpa = agg.conversions > 0 ? agg.spend / agg.conversions : null;

  return (
    <>
      <PageHeader title="Ads" subtitle="All paid-ad platforms, 30 days" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Ad spend" value={formatMoney(agg.spend)} />
        <Kpi label="Platform revenue" value={formatMoney(agg.revenue)} hint="Per-platform attribution" />
        <Kpi label="ROAS" value={roas ? roas.toFixed(2) + "×" : "—"} />
        <Kpi label="CPA" value={cpa ? formatMoney(cpa) : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-ink mb-3">Top campaigns</h2>
          {(campaigns?.length ?? 0) === 0 ? (
            <EmptyState icon={Megaphone} title="No campaigns yet" hint="Connect Meta Ads in Settings, then data flows here automatically." />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-muted">
                <tr>
                  <th className="py-2">Campaign</th><th>Platform</th><th>Phase</th><th>Spend</th><th>Revenue</th><th>ROAS</th><th>CPA</th>
                </tr>
              </thead>
              <tbody>
                {campaigns!.map((c: any) => (
                  <tr key={c.campaign_id} className="border-t border-surface-border">
                    <td className="py-2 font-medium text-ink">{c.name}</td>
                    <td className="text-ink-muted">{c.platform}</td>
                    <td><span className="badge-primary">{c.phase}</span></td>
                    <td className="text-ink-muted">{formatMoney(c.total_spend)}</td>
                    <td className="text-ink-muted">{formatMoney(c.total_revenue)}</td>
                    <td className="text-ink-muted">{c.roas ? Number(c.roas).toFixed(2) + "×" : "—"}</td>
                    <td className="text-ink-muted">{c.avg_cpa ? formatMoney(c.avg_cpa) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Recent creatives</h2>
          {(creatives?.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted">No creatives yet.</p>
          ) : (
            <ul className="space-y-2">
              {creatives!.map((c: any) => (
                <li key={c.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-50">
                  <div>
                    <div className="font-medium text-ink text-sm">{c.concept || "Untitled"}</div>
                    <div className="text-xs text-ink-muted">{c.type} · {c.format_tag ?? "no format"}</div>
                  </div>
                  <span className={c.status === "winner" ? "badge-success" : c.status === "killed" ? "badge-crit" : "badge-primary"}>{c.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Kill / Scale log</h2>
          {(killLog?.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted">No actions logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {killLog!.map((k: any) => (
                <li key={k.id} className="px-3 py-2 rounded-xl border border-surface-border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink text-sm">{k.action}</span>
                    <span className="text-xs text-ink-muted">{new Date(k.at).toLocaleDateString()}</span>
                  </div>
                  {k.reason && <div className="text-xs text-ink-muted mt-1">{k.reason}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
