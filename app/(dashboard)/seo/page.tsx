import { createClient } from "@/lib/supabase/server";
import { PageHeader, Kpi, EmptyState } from "@/components/page-header";
import { Search } from "lucide-react";

export default async function SeoPage() {
  const supabase = await createClient();

  const [{ data: keywords, count: kwCount }, { data: pages, count: pageCount }, { data: audits }, { data: backlinks, count: blCount }] = await Promise.all([
    supabase.from("seo_keywords").select("*", { count: "exact" }).eq("is_active", true).order("current_rank", { ascending: true }).limit(10),
    supabase.from("seo_pages").select("*", { count: "exact" }).limit(10),
    supabase.from("seo_audits").select("*").order("run_at", { ascending: false }).limit(1),
    supabase.from("backlinks").select("*", { count: "exact" }).eq("status", "live").limit(1),
  ]);

  const latest = audits?.[0];

  return (
    <>
      <PageHeader title="SEO" subtitle="Rankings, audits, backlinks, GEO readiness" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Tracked keywords" value={String(kwCount ?? 0)} />
        <Kpi label="Pages indexed" value={String(pageCount ?? 0)} />
        <Kpi label="Live backlinks" value={String(blCount ?? 0)} />
        <Kpi label="Last audit score" value={latest?.overall_score ? String(latest.overall_score) + "/100" : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Top keywords</h2>
          {(keywords?.length ?? 0) === 0 ? (
            <EmptyState icon={Search} title="No keywords tracked" hint="Add keywords to track from Settings → SEO." />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-muted">
                <tr><th className="py-2">Keyword</th><th>Volume</th><th>Rank</th><th>Target</th></tr>
              </thead>
              <tbody>
                {keywords!.map((k: any) => (
                  <tr key={k.id} className="border-t border-surface-border">
                    <td className="py-2 font-medium text-ink">{k.keyword}</td>
                    <td className="text-ink-muted">{k.search_volume ?? "—"}</td>
                    <td className="text-ink-muted">{k.current_rank ?? "—"}</td>
                    <td className="text-ink-muted">{k.target_rank ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Latest audit</h2>
          {!latest ? (
            <p className="text-sm text-ink-muted">No audits yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Technical</span><span className="font-medium">{latest.technical_score ?? "—"}/100</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Content</span><span className="font-medium">{latest.content_score ?? "—"}/100</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">On-page</span><span className="font-medium">{latest.onpage_score ?? "—"}/100</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Schema</span><span className="font-medium">{latest.schema_score ?? "—"}/100</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Core Web Vitals</span><span className="font-medium">{latest.cwv_score ?? "—"}/100</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">AI readiness (GEO)</span><span className="font-medium">{latest.ai_readiness_score ?? "—"}/100</span></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
