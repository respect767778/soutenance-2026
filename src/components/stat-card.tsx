export function StatCard({
  label,
  value,
  icon,
  accent = "bg-brand-500/10 text-brand-700 border-brand-500/20",
  trend,
}: {
  label: string;
  value: string;
  icon?: string;
  accent?: string;
  trend?: string;
}) {
  return (
    <div className="card card-hover relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-white via-white to-paper-subtle/50">
      {/* Lueur d'ambiance discrète */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-500/5 blur-xl" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {label}
          </p>
          <p className="font-display mt-2 truncate text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            {value}
          </p>
          {trend ? (
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <span className="inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-emerald-800">
                ↗ {trend}
              </span>
              <span className="text-ink-subtle">ce mois</span>
            </div>
          ) : null}
        </div>

        {icon ? (
          <span
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-xl shadow-sm ${accent}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}
