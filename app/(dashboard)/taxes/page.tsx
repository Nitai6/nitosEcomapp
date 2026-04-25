import { createClient } from "@/lib/supabase/server";
import { PageHeader, Kpi, EmptyState } from "@/components/page-header";
import { formatMoney } from "@/lib/utils";
import { Receipt } from "lucide-react";

export default async function TaxesPage() {
  const supabase = await createClient();

  const thisYear = new Date().getFullYear();
  const yearStart = `${thisYear}-01-01`;

  const [{ data: entity }, { data: invoices }, { data: expenses }, { data: vatReports }, { data: bituach }] = await Promise.all([
    supabase.from("tax_entities").select("*").limit(1).maybeSingle(),
    supabase.from("invoices_issued").select("*").gte("issued_at", yearStart),
    supabase.from("expenses").select("*").gte("incurred_at", yearStart),
    supabase.from("vat_reports").select("*").order("period_start", { ascending: false }).limit(6),
    supabase.from("bituach_leumi_payments").select("*").order("period_start", { ascending: false }).limit(6),
  ]);

  const salesVat = invoices?.reduce((s: number, i: any) => s + Number(i.vat_amount ?? 0), 0) ?? 0;
  const inputVat = expenses?.reduce((s: number, e: any) => s + Number(e.vat_amount ?? 0), 0) ?? 0;
  const reverseCharge = expenses?.filter((e: any) => e.is_foreign_reverse_charge).reduce((s: number, e: any) => s + (Number(e.subtotal ?? 0) * 0.18), 0) ?? 0;
  const netVatDue = salesVat - inputVat + reverseCharge;
  const yearRevenue = invoices?.reduce((s: number, i: any) => s + Number(i.subtotal ?? 0), 0) ?? 0;

  return (
    <>
      <PageHeader title="Taxes (Israel)" subtitle="VAT, Bituach Leumi, foreign reverse-charge, Cheshbonit Digitalit" />

      {!entity && (
        <div className="card-warm mb-6">
          <div className="font-medium text-accent-600 mb-1">Tax entity not configured</div>
          <p className="text-sm text-ink-muted">Go to Settings → Taxes to set your Osek Patur / Osek Murshe / Chevra Ba'am, VAT number, and reporting frequency.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label={`${thisYear} revenue`} value={formatMoney(yearRevenue)} />
        <Kpi label="Sales VAT (year)" value={formatMoney(salesVat)} />
        <Kpi label="Input VAT (year)" value={formatMoney(inputVat)} />
        <Kpi label="Net VAT due" value={formatMoney(netVatDue)} hint="Includes foreign reverse-charge" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-ink mb-3">VAT reports</h2>
          {(vatReports?.length ?? 0) === 0 ? (
            <EmptyState icon={Receipt} title="No VAT reports yet" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-muted">
                <tr><th className="py-2">Period</th><th>Net due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {vatReports!.map((r: any) => (
                  <tr key={r.id} className="border-t border-surface-border">
                    <td className="py-2">{r.period_start} → {r.period_end}</td>
                    <td className="text-ink-muted">{formatMoney(r.net_vat_due)}</td>
                    <td><span className={r.status === "submitted" ? "badge-success" : "badge-warn"}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-ink mb-3">Bituach Leumi</h2>
          {(bituach?.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted">No payments recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-muted">
                <tr><th className="py-2">Period</th><th>Due</th><th>Paid</th></tr>
              </thead>
              <tbody>
                {bituach!.map((b: any) => (
                  <tr key={b.id} className="border-t border-surface-border">
                    <td className="py-2">{b.period_start}</td>
                    <td className="text-ink-muted">{formatMoney(b.amount_due)}</td>
                    <td className="text-ink-muted">{b.paid_at ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
