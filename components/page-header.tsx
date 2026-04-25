export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }: { icon: any; title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-16">
      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <div className="font-medium text-ink">{title}</div>
      {hint && <div className="text-sm text-ink-muted mt-1 max-w-md">{hint}</div>}
    </div>
  );
}

export function Kpi({ label, value, delta, hint }: { label: string; value: string; delta?: string; hint?: string }) {
  const up = delta?.startsWith("+");
  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && <div className={up ? "kpi-delta-up" : "kpi-delta-down"}>{delta}</div>}
      {hint && <div className="text-xs text-ink-subtle mt-1">{hint}</div>}
    </div>
  );
}
