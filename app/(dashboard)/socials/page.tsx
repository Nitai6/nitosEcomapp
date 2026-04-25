import { createClient } from "@/lib/supabase/server";
import { PageHeader, Kpi, EmptyState } from "@/components/page-header";
import { formatNumber } from "@/lib/utils";
import { Share2 } from "lucide-react";

export default async function SocialsPage() {
  const supabase = await createClient();

  const [{ data: accounts }, { data: posts }, { data: calendar }] = await Promise.all([
    supabase.from("social_accounts").select("*").order("followers", { ascending: false }),
    supabase.from("social_posts").select("*").order("posted_at", { ascending: false }).limit(10),
    supabase.from("content_calendar").select("*").order("planned_for", { ascending: true }).limit(10),
  ]);

  const totalFollowers = accounts?.reduce((s: number, a: any) => s + (a.followers ?? 0), 0) ?? 0;
  const themePages = accounts?.filter((a: any) => a.is_theme_page).length ?? 0;

  return (
    <>
      <PageHeader title="Socials" subtitle="Theme pages + brand pages across YT, IG, TT, X, Bluesky, FB, Pinterest" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Accounts" value={String(accounts?.length ?? 0)} />
        <Kpi label="Theme pages" value={String(themePages)} />
        <Kpi label="Total followers" value={formatNumber(totalFollowers)} />
        <Kpi label="Scheduled posts" value={String(calendar?.filter((c: any) => c.status === "scheduled").length ?? 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Accounts</h2>
          {(accounts?.length ?? 0) === 0 ? (
            <EmptyState icon={Share2} title="No accounts yet" hint="Add accounts from Settings → Social." />
          ) : (
            <ul className="space-y-2">
              {accounts!.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-50">
                  <div>
                    <div className="font-medium text-ink text-sm">@{a.handle}</div>
                    <div className="text-xs text-ink-muted">{a.platform}{a.is_theme_page ? " · theme page" : ""}</div>
                  </div>
                  <span className="text-xs font-medium text-ink">{formatNumber(a.followers)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Upcoming in calendar</h2>
          {(calendar?.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted">Nothing planned.</p>
          ) : (
            <ul className="space-y-2">
              {calendar!.map((c: any) => (
                <li key={c.id} className="px-3 py-2 rounded-xl border border-surface-border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink text-sm">{c.title}</span>
                    <span className="badge-primary">{c.status}</span>
                  </div>
                  <div className="text-xs text-ink-muted mt-1">{c.platform} · {c.planned_for ? new Date(c.planned_for).toLocaleDateString() : "no date"}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
