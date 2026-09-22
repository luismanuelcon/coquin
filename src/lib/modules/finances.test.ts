import { describe, expect, it } from "vitest";
import { financeBudgetState, financeItems } from "@/lib/data/mock";
import type { FinanceBudgetState, FinancePeriod } from "@/lib/types";
import {
  calculateFinanceObligations,
  calculateFinancePeriodSummary,
  createNextFinancePeriod,
  ensureFinancePeriods,
  getFinancePeriodRange,
  getFinancePeriodRangeFromStart,
  getPendingFinanceItems,
  normalizeExpenseCategory,
  parseCopAmount,
  summarizeMiscByCategory,
  summarizeMiscFlags,
  upsertFinancePeriod,
} from "./finances";

describe("finances module", () => {
  it("parses COP display amounts into numeric values", () => {
    expect(parseCopAmount("$1.240.000")).toBe(1240000);
  });

  it("calculates pending and total obligations", () => {
    expect(getPendingFinanceItems(financeItems)).toHaveLength(1);
    expect(calculateFinanceObligations(financeItems)).toEqual({
      total: 1946500,
      pending: 420000,
      scheduled: 1526500,
    });
  });

  it("gets the active range from a configurable cutoff day", () => {
    expect(getFinancePeriodRange(20, "2026-08-22")).toEqual({
      id: "period-2026-08-20",
      startDate: "2026-08-20",
      endDate: "2026-09-19",
    });
  });

  it("gets a monthly range from a custom start date", () => {
    expect(getFinancePeriodRangeFromStart("2026-08-15")).toEqual({
      id: "period-2026-08-15",
      startDate: "2026-08-15",
      endDate: "2026-09-14",
    });
  });

  it("calculates period totals including misc expenses", () => {
    const period = financeBudgetState.periods[1];

    expect(calculateFinancePeriodSummary(period)).toEqual({
      base: 6550000,
      budgetedTotal: 1946500,
      miscTotal: 20000,
      totalPayments: 1966500,
      paid: 306500,
      pending: 1660000,
      available: 4583500,
    });
  });

  it("summarizes weekend and owed misc totals", () => {
    const period: FinancePeriod = {
      id: "period-flags",
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      incomes: [],
      items: [],
      miscExpenses: [
        { id: "m1", date: "2026-09-05", concept: "Cine", amount: 30000, weekend: true },
        { id: "m2", date: "2026-09-06", concept: "Mercado", amount: 50000, weekend: true, owed: true },
        { id: "m3", date: "2026-09-08", concept: "Café", amount: 20000 },
      ],
    };

    expect(summarizeMiscFlags(period)).toEqual({
      total: 100000,
      weekendTotal: 80000,
      weekdayTotal: 20000,
      weekendPercent: 0.8,
      owedTotal: 50000,
    });
  });

  it("copies fixed items into the next period as pending and clears variable data", () => {
    const period = createNextFinancePeriod(financeBudgetState.periods[1]);

    expect(period.startDate).toBe("2026-09-20");
    expect(period.endDate).toBe("2026-10-19");
    expect(period.incomes).toHaveLength(0);
    expect(period.miscExpenses).toHaveLength(0);
    expect(period.items).toHaveLength(2);
    expect(period.items.every((item) => item.fixed && item.status === "pending")).toBe(true);
  });

  it("automatically creates missing current and next periods from fixed items", () => {
    const previousOnlyState = {
      ...financeBudgetState,
      activePeriodId: financeBudgetState.periods[0].id,
      periods: [financeBudgetState.periods[0]],
    };
    const result = ensureFinancePeriods(previousOnlyState, "2026-08-22");

    expect(result.generatedCount).toBe(2);
    expect(result.state.activePeriodId).toBe("period-2026-08-20");
    expect(result.state.periods.map((period) => period.id)).toEqual([
      "period-2026-07-20",
      "period-2026-08-20",
      "period-2026-09-20",
    ]);

    const currentPeriod = result.state.periods[1];
    const nextPeriod = result.state.periods[2];

    expect(currentPeriod.items).toHaveLength(3);
    expect(nextPeriod.items).toHaveLength(3);
    expect(nextPeriod.items.every((item) => item.fixed && item.status === "pending")).toBe(true);
    expect(nextPeriod.incomes).toHaveLength(0);
    expect(nextPeriod.miscExpenses).toHaveLength(0);
  });

  it("keeps the configured period active when its start does not align to the cutoff grid", () => {
    const configuredState: FinanceBudgetState = {
      settings: { cutoffDay: 20, currency: "COP" },
      activePeriodId: "period-2026-08-15",
      periods: [
        {
          id: "period-2026-08-15",
          startDate: "2026-08-15",
          endDate: "2026-09-14",
          incomes: [{ id: "income-base", concept: "Base", amount: 5000000 }],
          items: [{ id: "item-1", concept: "Arriendo", amount: 1200000, fixed: true, status: "pending" }],
          miscExpenses: [],
        },
      ],
    };

    const result = ensureFinancePeriods(configuredState, "2026-09-18");
    const active = result.state.periods.find((period) => period.id === result.state.activePeriodId);

    expect(result.state.activePeriodId).toBe("period-2026-08-15");
    expect(active?.incomes).toEqual([{ id: "income-base", concept: "Base", amount: 5000000 }]);
    expect(active?.items).toHaveLength(1);
  });

  it("does not wipe base or budget items after configuring a period and adding a concept", () => {
    const configuredState: FinanceBudgetState = {
      settings: { cutoffDay: 20, currency: "COP" },
      activePeriodId: "period-2026-08-15",
      periods: [
        {
          id: "period-2026-08-15",
          startDate: "2026-08-15",
          endDate: "2026-09-14",
          incomes: [{ id: "income-base", concept: "Base", amount: 5000000 }],
          items: [],
          miscExpenses: [],
        },
      ],
    };

    const ensured = ensureFinancePeriods(configuredState, "2026-09-18").state;
    const active = ensured.periods.find((period) => period.id === ensured.activePeriodId)!;
    const withConcept = {
      ...active,
      items: [{ id: "item-new", concept: "Internet", amount: 90000, fixed: true, status: "pending" as const }, ...active.items],
    };
    const saved = upsertFinancePeriod(ensured, withConcept);
    const reEnsured = ensureFinancePeriods(saved, "2026-09-18").state;
    const finalActive = reEnsured.periods.find((period) => period.id === reEnsured.activePeriodId)!;

    expect(finalActive.incomes).toEqual([{ id: "income-base", concept: "Base", amount: 5000000 }]);
    expect(finalActive.items).toHaveLength(1);
    expect(finalActive.items[0].concept).toBe("Internet");
  });

  it("normalizes unknown or empty categories into 'Otros'", () => {
    expect(normalizeExpenseCategory("comida")).toBe("Comida");
    expect(normalizeExpenseCategory("  Salud ")).toBe("Salud");
    expect(normalizeExpenseCategory("")).toBe("Otros");
    expect(normalizeExpenseCategory(undefined)).toBe("Otros");
    expect(normalizeExpenseCategory("Criptomonedas")).toBe("Otros");
  });

  it("summarizes misc expenses by category sorted by spend", () => {
    const period: FinancePeriod = {
      id: "period-2026-08-15",
      startDate: "2026-08-15",
      endDate: "2026-09-14",
      incomes: [],
      items: [],
      miscExpenses: [
        { id: "m1", date: "2026-08-16", concept: "Almuerzo", amount: 30000, category: "Comida" },
        { id: "m2", date: "2026-08-17", concept: "Cena", amount: 20000, category: "comida" },
        { id: "m3", date: "2026-08-18", concept: "Cine", amount: 40000, category: "Entretenimiento" },
        { id: "m4", date: "2026-08-19", concept: "Propina", amount: 10000 },
      ],
    };

    const { total, slices } = summarizeMiscByCategory(period);

    expect(total).toBe(100000);
    expect(slices).toEqual([
      { category: "Comida", amount: 50000, percent: 0.5 },
      { category: "Entretenimiento", amount: 40000, percent: 0.4 },
      { category: "Otros", amount: 10000, percent: 0.1 },
    ]);
  });

  it("returns an empty summary when there are no misc expenses", () => {
    const period: FinancePeriod = {
      id: "period-empty",
      startDate: "2026-08-15",
      endDate: "2026-09-14",
      incomes: [],
      items: [],
      miscExpenses: [],
    };

    expect(summarizeMiscByCategory(period)).toEqual({ total: 0, slices: [] });
  });
});
