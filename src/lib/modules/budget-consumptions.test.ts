import { describe, it, expect } from "vitest";
import { calculateFinancePeriodSummary, createNextFinancePeriod } from "./finances";
import { closeFinancePeriod } from "./period-close";
import { validateData } from "@/lib/data/validation";
import type { FinanceBudgetState, FinancePeriod } from "@/lib/types";
const period: FinancePeriod = { id: "period-2026-09-01", startDate: "2026-09-01", endDate: "2026-09-30", incomes: [{ id: "income", concept: "Ingreso", amount: 1000000 }], miscExpenses: [], items: [{ id: "fuel", concept: "Gasolina", amount: 200000, fixed: true, status: "pending", consumptions: [{ id: "fill", date: "2026-09-15", amount: 100000 }] }] };
describe("budgeted consumption", () => {
  it("reserves the whole budget without double counting consumption", () => {
    expect(calculateFinancePeriodSummary(period)).toMatchObject({ totalPayments: 200000, paid: 100000, pending: 100000, available: 800000 });
  });
  it("counts excess spending once and never produces negative pending amounts", () => {
    const extra = { ...period, items: [{ ...period.items[0], consumptions: [{ id: "fill", date: "2026-09-15", amount: 230000 }] }] };
    expect(calculateFinancePeriodSummary(extra)).toMatchObject({ totalPayments: 230000, paid: 230000, pending: 0, available: 770000 });
  });
  it("restores the reserve when all consumptions are removed, regardless of legacy status", () => {
    expect(calculateFinancePeriodSummary({ ...period, items: [{ ...period.items[0], status: "paid", consumptions: [] }] })).toMatchObject({ paid: 0, pending: 200000, available: 800000 });
  });
  it("retains consumptions in history but never copies them to the new period", () => {
    const state: FinanceBudgetState = { settings: { cutoffDay: 1, currency: "COP" }, activePeriodId: period.id, periods: [period] };
    const closed = closeFinancePeriod(state, "2026-10-01");
    expect(closed.periods[0].items[0].consumptions).toHaveLength(1);
    expect(closed.periods[1].items[0].consumptions).toEqual([]);
    expect(createNextFinancePeriod(period).items[0].consumptions).toEqual([]);
    expect(validateData("finances", closed)).toBe(true);
    const bad = structuredClone(state);
    bad.periods[0].items[0].consumptions![0].amount = -1;
    expect(validateData("finances", bad)).toBe(false);
    bad.periods[0].items[0].consumptions![0].amount = 1;
    bad.periods[0].items[0].consumptions![0].date = "2026-02-30";
    expect(validateData("finances", bad)).toBe(false);
  });
});
