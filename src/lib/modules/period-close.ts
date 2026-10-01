import type { FinanceBudgetState, MarketState } from "@/lib/types";

function boundary(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, Math.min(day, new Date(Date.UTC(year, month + 1, 0)).getUTCDate()))).toISOString().slice(0, 10);
}
export function nextCutoff(start: string, day: number) {
  const date = new Date(`${start}T12:00:00Z`);
  const same = boundary(date.getUTCFullYear(), date.getUTCMonth(), day);
  return same > start ? same : boundary(date.getUTCFullYear(), date.getUTCMonth() + 1, day);
}
export function dayBefore(date: string) {
  return new Date(Date.parse(`${date}T12:00:00Z`) - 86400000).toISOString().slice(0, 10);
}
export function dayAfter(date: string) {
  return new Date(Date.parse(`${date}T12:00:00Z`) + 86400000).toISOString().slice(0, 10);
}
export function marketPeriod(state: MarketState, today: string) {
  if (state.period) return state.period;
  // Preserve legacy purchases in one open period, without silently discarding history.
  const first = state.purchases.map(p => p.date).sort()[0] ?? today;
  const startDate = `${first.slice(0, 7)}-01`;
  return { startDate, endDate: dayBefore(nextCutoff(startDate, state.cutoffDay ?? 1)) };
}
export function closeMarketPeriod(state: MarketState, today: string): MarketState {
  const period = marketPeriod(state, today);
  if (today <= period.endDate) return state;
  const startDate = dayAfter(period.endDate);
  return { ...state, cutoffDay: state.cutoffDay ?? 1,
    history: [...(state.history ?? []), { ...period, id: `market-${period.startDate}`, budget: state.budget, purchases: state.purchases }],
    purchases: [], period: { startDate, endDate: dayBefore(nextCutoff(startDate, state.cutoffDay ?? 1)) } };
}
export function closeFinancePeriod(state: FinanceBudgetState, today: string): FinanceBudgetState {
  const active = state.periods.find(p => p.id === state.activePeriodId)!;
  if (today <= active.endDate) return state;
  const startDate = dayAfter(active.endDate);
  const id = `period-${startDate}`;
  const existing = state.periods.find(p => p.id === id);
  const next = existing ?? { id, startDate, endDate: dayBefore(nextCutoff(startDate, state.settings.cutoffDay)),
    incomes: [], miscExpenses: [], items: active.items.filter(i => i.fixed).map(i => ({ ...i, consumptions: i.consumptions === undefined ? undefined : [], id: `${id}-${i.id}`, status: "pending" as const })) };
  return { ...state, activePeriodId: id, periods: existing ? state.periods : [...state.periods, next] };
}
