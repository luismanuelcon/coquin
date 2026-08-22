import { describe, expect, it } from "vitest";
import { financeBudgetState, financeItems } from "@/lib/data/mock";
import {
  calculateFinanceObligations,
  calculateFinancePeriodSummary,
  createNextFinancePeriod,
  ensureFinancePeriods,
  getFinancePeriodRange,
  getFinancePeriodRangeFromStart,
  getPendingFinanceItems,
  parseCopAmount,
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
      paid: 286500,
      pending: 1680000,
      available: 4583500,
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
});
