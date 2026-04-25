import { createClient } from "@/lib/supabase/server";
import { PageHeader, Kpi, EmptyState } from "@/components/page-header";
import { formatMoney, formatPct } from "@/lib/utils";
import { Mail } from "lucide-react";

export default async function EmailsSmsPage() {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const [{ data: flows }, { data: campaigns }, { data: sends }] = await Promise.all([
    supabase.from("email_flows").select("*").eq("is_active", true),
    supabase.from("email_campaigns").select("*").order("sent_at", { ascending: false }).limit(10),
    supabase.from("email_sends").select("opened, clicked, converted, revenue").gte("sent_at", sinceIso),
  ]);

  const total = sends?.length ?? 0;
  const opens = sends?.filter((s: any) => s.opened).length ?? 0;
  const clicks = sends?.filter((s: any) => s.clicked).length ?? 0;
  const revenue = sends?.reduce((s: number, r: any) => s + Number(r.revenue ?? 0), 0) ?? 0;
  const openRate = total > 0 ? (opens / total) * 100 : 0;
  const ctr = total > 0 ? (clicks / total) * 100 : 0;

  return (
    <>
      <PageHeader title="Emails & SMS" subtitle="Flows, campaigns, segments, attribution — 30 days" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Active flows" value={String(flows?.length ?? 0)} />
        <Kpi label="Open rate" value={formatPct(openRate)} />
        <Kpi label="Click rate" value={formatPct(ctr)} />
        <Kpi label="Attributed revenue" value={formatMoney(revenue)} />
      </div>

      <div className="card">
        <h2 className="font-semibold text-ink mb-3">Recent campaigns</h2>
        {(campaigns?.length ?? 0) === 0 ? (
          <EmptyState icon={Mail} title="No campaigns yet" hint="Connect Klaviyo in Settings to sync flows and campaigns." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-ink-muted">
              <tr><th className="py-2">Campaign</th><th>Channel</th><th>Segment</th><th>Sent</th><th>Status</th></tr>
            </thead>
            <tbody>
              {campaigns!.map((c: any) => (
                <tr key={c.id} className="border-t border-surface-border">
                  <td className="py-2 font-medium text-ink">{c.name}</td>
                  <td className="text-ink-muted">{c.channel}</td>
                  <td className="text-ink-muted">{c.segment ?? "—"}</td>
                  <td className="text-ink-muted">{c.sent_at ? new Date(c.sent_at).toLocaleDateString() : "—"}</td>
                  <td><span className={c.status === "sent" ? "badge-success" : "badge-primary"}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
