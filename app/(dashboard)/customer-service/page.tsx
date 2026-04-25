import { createClient } from "@/lib/supabase/server";
import { PageHeader, Kpi, EmptyState } from "@/components/page-header";
import { HeadphonesIcon } from "lucide-react";

export default async function CustomerServicePage() {
  const supabase = await createClient();

  const [{ data: open, count: openCount }, { data: resolved, count: resolvedCount }, { data: all }] = await Promise.all([
    supabase.from("cs_tickets").select("*", { count: "exact" }).in("status", ["open", "waiting_customer", "waiting_internal"]).order("created_at", { ascending: false }).limit(10),
    supabase.from("cs_tickets").select("*", { count: "exact" }).eq("status", "resolved").limit(1),
    supabase.from("cs_tickets").select("created_at, first_response_at, resolved_at, status").limit(100),
  ]);

  const avgFirstResponseMin = (() => {
    const withResponse = all?.filter((t: any) => t.first_response_at) ?? [];
    if (!withResponse.length) return null;
    const mins = withResponse.map((t: any) => (new Date(t.first_response_at).getTime() - new Date(t.created_at).getTime()) / 60000);
    return mins.reduce((s, v) => s + v, 0) / mins.length;
  })();

  return (
    <>
      <PageHeader title="Customer Service" subtitle="Tickets, DMs, email, chat" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Open tickets" value={String(openCount ?? 0)} />
        <Kpi label="Resolved" value={String(resolvedCount ?? 0)} />
        <Kpi label="Avg first response" value={avgFirstResponseMin ? `${Math.round(avgFirstResponseMin)} min` : "—"} />
        <Kpi label="Total handled" value={String((openCount ?? 0) + (resolvedCount ?? 0))} />
      </div>

      <div className="card">
        <h2 className="font-semibold text-ink mb-3">Open tickets</h2>
        {(open?.length ?? 0) === 0 ? (
          <EmptyState icon={HeadphonesIcon} title="No open tickets" hint="Connect Gmail/IG/FB from Settings to pull tickets automatically." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-ink-muted">
              <tr><th className="py-2">Customer</th><th>Subject</th><th>Channel</th><th>Status</th><th>Priority</th><th>Opened</th></tr>
            </thead>
            <tbody>
              {open!.map((t: any) => (
                <tr key={t.id} className="border-t border-surface-border">
                  <td className="py-2 font-medium text-ink">{t.customer_name || t.customer_email || "—"}</td>
                  <td className="text-ink-muted">{t.subject ?? "(no subject)"}</td>
                  <td className="text-ink-muted">{t.channel}</td>
                  <td><span className="badge-primary">{t.status}</span></td>
                  <td><span className={t.priority === "urgent" ? "badge-crit" : t.priority === "high" ? "badge-warn" : "badge-primary"}>{t.priority}</span></td>
                  <td className="text-ink-muted">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
