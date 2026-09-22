"use client";

type MiscWeekendChartProps = {
  weekendTotal: number;
  weekdayTotal: number;
  weekendPercent: number;
  owedTotal: number;
  formatAmount: (amount: number) => string;
};

export function MiscWeekendChart({
  weekendTotal,
  weekdayTotal,
  weekendPercent,
  owedTotal,
  formatAmount,
}: MiscWeekendChartProps) {
  const total = weekendTotal + weekdayTotal;
  if (total === 0) {
    return (
      <p className="rounded-2xl bg-surface-container p-4 text-sm font-semibold text-on-surface-variant">
        Marca &quot;Fin de semana&quot; en tus gastos para ver cuánto gastas los fines de semana.
      </p>
    );
  }
  const pct = Math.round(weekendPercent * 100);
  return (
    <section className="card-surface flex flex-col gap-3 p-4" aria-label="Gasto de fin de semana">
      <div className="flex items-center justify-between gap-3">
        <h3 className="section-title">Fin de semana</h3>
        <span className="whitespace-nowrap text-[14px] font-bold text-secondary">{formatAmount(weekendTotal)}</span>
      </div>
      <div
        className="flex h-3 overflow-hidden rounded-full bg-surface-container"
        role="img"
        aria-label={`Fin de semana ${pct} por ciento de los gastos varios`}
      >
        <span className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--secondary)" }} />
      </div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-on-surface-variant">
        <span>Fin de semana · {pct}%</span>
        <span>Entre semana · {formatAmount(weekdayTotal)}</span>
      </div>
      {owedTotal > 0 ? (
        <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-3 py-2">
          <span className="text-[12px] font-semibold text-on-surface-variant">Me deben</span>
          <span className="text-[14px] font-bold text-primary">{formatAmount(owedTotal)}</span>
        </div>
      ) : null}
    </section>
  );
}
