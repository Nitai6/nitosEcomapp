import { createClient } from "@/lib/supabase/server";
import { PageHeader, Kpi, EmptyState } from "@/components/page-header";
import { Hammer } from "lucide-react";

export default async function EcomBuilderPage() {
  const supabase = await createClient();

  const [{ data: builds }] = await Promise.all([
    supabase.from("builds").select("*").order("started_at", { ascending: false }),
  ]);

  const active = builds?.filter((b: any) => !["handoff", "archived"].includes(b.stage)).length ?? 0;
  const launched = builds?.filter((b: any) => b.actual_launch).length ?? 0;

  return (
    <>
      <PageHeader title="Ecom Builder" subtitle="Store-build projects powered by the build-agent" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Total projects" value={String(builds?.length ?? 0)} />
        <Kpi label="Active builds" value={String(active)} />
        <Kpi label="Launched" value={String(launched)} />
        <Kpi label="Average stage" value={builds?.length ? "in progress" : "—"} />
      </div>

      <div className="card">
        <h2 className="font-semibold text-ink mb-3">All builds</h2>
        {(builds?.length ?? 0) === 0 ? (
          <EmptyState icon={Hammer} title="No builds yet" hint="Kick off a new build by spawning the ecom-builder agent from the Overview." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-ink-muted">
              <tr><th className="py-2">Project</th><th>Client</th><th>Niche</th><th>Stage</th><th>Target launch</th></tr>
            </thead>
            <tbody>
              {builds!.map((b: any) => (
                <tr key={b.id} className="border-t border-surface-border">
                  <td className="py-2 font-medium text-ink">{b.project_name}</td>
                  <td className="text-ink-muted">{b.client_name ?? "—"}</td>
                  <td className="text-ink-muted">{b.niche ?? "—"}</td>
                  <td><span className="badge-primary">{b.stage}</span></td>
                  <td className="text-ink-muted">{b.target_launch ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
