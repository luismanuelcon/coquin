import type { FinanceBudgetItem, FinanceBudgetState, FinanceItem, FinancePeriod } from "@/lib/types";

export function parseCopAmount(amount: string) {
  return Number(amount.replaceAll(".", "").replaceAll("$", "").trim());
}

export function getPendingFinanceItems(items: FinanceItem[]) {
  return items.filter((item) => item.status.toLowerCase() === "pendiente");
}

export function calculateFinanceObligations(items: FinanceItem[]) {
  const total = items.reduce((sum, item) => sum + parseCopAmount(item.amount), 0);
  const pending = getPendingFinanceItems(items).reduce(
    (sum, item) => sum + parseCopAmount(item.amount),
    0,
  );

  return {
    total,
    pending,
    scheduled: total - pending,
  };
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function clampCutoffDay(day: number) {
  return Math.min(Math.max(Math.trunc(day) || 1, 1), 31);
}

function addMonths(date: Date, months: number) {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const maxDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
  next.setUTCDate(Math.min(date.getUTCDate(), maxDay));
  return next;
}

function dateFromParts(year: number, month: number, preferredDay: number) {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(preferredDay, lastDay)));
}

export function getFinancePeriodRange(cutoffDay: number, referenceIsoDate: string) {
  const cutoff = clampCutoffDay(cutoffDay);
  const reference = new Date(`${referenceIsoDate}T12:00:00Z`);
  const referenceDay = reference.getUTCDate();
  const startMonthOffset = referenceDay >= cutoff ? 0 : -1;
  const start = dateFromParts(reference.getUTCFullYear(), reference.getUTCMonth() + startMonthOffset, cutoff);
  const nextStart = addMonths(start, 1);
  const end = new Date(nextStart);
  end.setUTCDate(end.getUTCDate() - 1);

  return {
    id: `period-${toIsoDate(start)}`,
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
  };
}

export function getFinancePeriodRangeFromStart(startIsoDate: string) {
  const start = new Date(`${startIsoDate}T12:00:00Z`);
  const nextStart = addMonths(start, 1);
  const end = new Date(nextStart);
  end.setUTCDate(end.getUTCDate() - 1);

  return {
    id: `period-${toIsoDate(start)}`,
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
  };
}

export function getMiscExpensesTotal(period: FinancePeriod) {
  return period.miscExpenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateFinancePeriodSummary(period: FinancePeriod) {
  const miscTotal = getMiscExpensesTotal(period);
  const budgetedTotal = period.items.reduce((sum, item) => sum + item.amount, 0);
  const totalPayments = budgetedTotal + miscTotal;
  const paid = period.items.reduce((sum, item) => sum + (item.status === "paid" ? item.amount : 0), 0);
  const base = period.incomes.reduce((sum, income) => sum + income.amount, 0);

  return {
    base,
    budgetedTotal,
    miscTotal,
    totalPayments,
    paid,
    pending: totalPayments - paid,
    available: base - totalPayments,
  };
}

export function createNextFinancePeriod(previousPeriod: FinancePeriod) {
  const start = addMonths(new Date(`${previousPeriod.startDate}T12:00:00Z`), 1);
  const end = addMonths(new Date(`${previousPeriod.endDate}T12:00:00Z`), 1);
  const fixedItems: FinanceBudgetItem[] = previousPeriod.items
    .filter((item) => item.fixed)
    .map((item) => ({
      ...item,
      id: `item-${toIsoDate(start)}-${item.id}`,
      status: "pending",
    }));

  return {
    id: `period-${toIsoDate(start)}`,
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
    incomes: [],
    items: fixedItems,
    miscExpenses: [],
  };
}

export function upsertFinancePeriod(state: FinanceBudgetState, period: FinancePeriod) {
  const exists = state.periods.some((item) => item.id === period.id);

  return {
    ...state,
    activePeriodId: period.id,
    periods: exists
      ? state.periods.map((item) => (item.id === period.id ? period : item))
      : [...state.periods, period].sort((a, b) => a.startDate.localeCompare(b.startDate)),
  };
}

export function ensureFinancePeriods(state: FinanceBudgetState, referenceIsoDate: string) {
  const targetRange = getFinancePeriodRange(state.settings.cutoffDay, referenceIsoDate);
  const periods = [...state.periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const existingTarget = periods.find((period) => period.id === targetRange.id);
  let latestPeriod = periods.at(-1);
  let generatedCount = 0;

  if (!latestPeriod) {
    return { state, generatedCount };
  }

  while (latestPeriod.startDate < targetRange.startDate) {
    const nextPeriod = createNextFinancePeriod(latestPeriod);
    periods.push(nextPeriod);
    latestPeriod = nextPeriod;
    generatedCount += 1;
  }

  const activePeriod = existingTarget ?? periods.find((period) => period.id === targetRange.id) ?? latestPeriod;
  const hasNextPeriod = periods.some((period) => period.startDate > activePeriod.startDate);

  if (!hasNextPeriod) {
    periods.push(createNextFinancePeriod(activePeriod));
    generatedCount += 1;
  }

  return {
    state: {
      ...state,
      activePeriodId: activePeriod.id,
      periods: periods.sort((a, b) => a.startDate.localeCompare(b.startDate)),
    },
    generatedCount,
  };
}
