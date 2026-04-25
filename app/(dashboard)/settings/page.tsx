import { createClient } from "@/lib/supabase/server";
import { PageHeader, Kpi, EmptyState } from "@/components/page-header";
import { formatMoney } from "@/lib/utils";
import { Settings as SettingsIcon } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();

  const [{ data: brands }, { data: subs }, { data: connections }, { data: benchmarks }, { data: niches }] = await Promise.all([
    supabase.from("brands").select("*"),
    supabase.from("subscriptions").select("*").eq("is_active", true),
    supabase.from("connections").select("*"),
    supabase.from("benchmarks").select("*").limit(20),
    supabase.from("niches").select("*"),
  ]);

  const totalMonthlyUsd = subs?.reduce((s: number, r: any) => s + Number(r.monthly_cost_usd ?? 0), 0) ?? 0;
  const totalMonthlyIls = subs?.reduce((s: number, r: any) => s + Number(r.monthly_cost_ils ?? 0), 0) ?? 0;

  return (
    <>
      <PageHeader title="Settings" subtitle="Brands, subscriptions, MCP connections, niches, benchmarks" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Brands" value={String(brands?.length ?? 0)} />
        <Kpi label="Active subscriptions" value={String(subs?.length ?? 0)} />
        <Kpi label="Monthly cost (USD)" value={formatMoney(totalMonthlyUsd, "USD")} />
        <Kpi label="Monthly cost (ILS)" value={formatMoney(totalMonthlyIls)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Brands</h2>
          {(brands?.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted">No brands.</p>
          ) : (
            <ul className="space-y-2">
              {brands!.map((b: any) => (
                <li key={b.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-50">
                  <div>
                    <div className="font-medium text-ink">{b.name}</div>
                    <div className="text-xs text-ink-muted">{b.domain ?? "no domain"} · {b.country} · {b.base_currency}</div>
                  </div>
                  <span className={b.status === "active" ? "badge-success" : "badge-warn"}>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Connections (MCPs & APIs)</h2>
          {(connections?.length ?? 0) === 0 ? (
            <EmptyState icon={SettingsIcon} title="No connections" hint="Add Meta Ads, Shopify, Klaviyo etc. to pull data automatically." />
          ) : (
            <ul className="space-y-2">
              {connections!.map((c: any) => (
                <li key={c.id} className="flex items-center justify-between px-3 py-2 rounded-xl border border-surface-border">
                  <div>
                    <div className="font-medium text-ink text-sm">{c.platform}</div>
                    <div className="text-xs text-ink-muted">{c.account_ref ?? "—"}</div>
                  </div>
                  <span className={c.status === "connected" ? "badge-success" : c.status === "error" ? "badge-crit" : "badge-warn"}>{c.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-ink mb-3">Subscriptions (manually entered)</h2>
          {(subs?.length ?? 0) === 0 ? (
            <EmptyState icon={SettingsIcon} title="No subscriptions tracked" hint="Add the apps you pay for (Klaviyo, Canva, ElevenLabs, etc.) so we can subtract them from profit." />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-muted">
                <tr><th className="py-2">App</th><th>Category</th><th>Monthly (USD)</th><th>Monthly (ILS)</th><th>Billed</th></tr>
              </thead>
              <tbody>
                {subs!.map((s: any) => (
                  <tr key={s.id} className="border-t border-surface-border">
                    <td className="py-2 font-medium text-ink">{s.app_name}</td>
                    <td className="text-ink-muted">{s.category ?? "—"}</td>
                    <td className="text-ink-muted">{formatMoney(s.monthly_cost_usd, "USD")}</td>
                    <td className="text-ink-muted">{formatMoney(s.monthly_cost_ils)}</td>
                    <td className="text-ink-muted">day {s.billing_day ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Niches</h2>
          {(niches?.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted">No niches defined.</p>
          ) : (
            <ul className="space-y-2">
              {niches!.map((n: any) => (
                <li key={n.id} className="px-3 py-2 rounded-xl bg-accent-warm">
                  <div className="font-medium text-ink text-sm">{n.name}</div>
                  <div className="text-xs text-ink-muted">{n.description ?? ""}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Benchmarks</h2>
          {(benchmarks?.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted">No benchmarks set. These override defaults in audits.</p>
          ) : (
            <ul className="space-y-2">
              {benchmarks!.map((b: any) => (
                <li key={b.id} className="flex items-center justify-between px-3 py-2 rounded-xl border border-surface-border text-sm">
                  <span className="font-medium text-ink">{b.metric}</span>
                  <span className="text-ink-muted">target {b.target ?? "—"} {b.unit ?? ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
