import { describe, expect, it } from "vitest";
import { closeFinancePeriod, closeMarketPeriod, marketPeriod, nextCutoff } from "./period-close";
import { emptyData } from "@/lib/data/empty";
import { validateData } from "@/lib/data/validation";
import type { MarketState } from "@/lib/types";

describe("explicit period closure", () => {
  const market: MarketState = { budget: 100, cutoffDay: 1, period: { startDate: "2026-09-01", endDate: "2026-09-30" }, purchases: [{ id: "p", date: "2026-09-30", detail: "Compra", category: "Otro", amount: 20 }] };
  it("keeps the period and purchases until its last day ends", () => {
    expect(closeMarketPeriod(market, "2026-09-30")).toBe(market);
    expect(marketPeriod(market, "2026-10-01")).toEqual(market.period);
  });
  it("archives late additions and resets only on explicit closure", () => {
    const closed = closeMarketPeriod(market, "2026-10-01");
    expect(closed.period).toEqual({ startDate: "2026-10-01", endDate: "2026-10-31" });
    expect(closed.history?.[0].purchases).toEqual(market.purchases);
    expect(closed.purchases).toEqual([]);
    expect(closed.budget).toBe(100);
    expect(validateData("market", closed)).toBe(true);
    expect(closeMarketPeriod(closed, "2026-10-01")).toBe(closed);
  });
  it("preserves legacy purchases and derives a stable initial period", () => {
    expect(marketPeriod({ budget: 100, purchases: market.purchases }, "2026-10-01")).toEqual(market.period);
  });
  it("handles 31st cutoffs, leap years and year rollover without drifting", () => {
    expect(nextCutoff("2026-01-31", 31)).toBe("2026-02-28");
    expect(nextCutoff("2026-02-28", 31)).toBe("2026-03-31");
    expect(nextCutoff("2028-01-31", 31)).toBe("2028-02-29");
    expect(nextCutoff("2026-12-20", 20)).toBe("2027-01-20");
  });
  it("closes finances independently, preserving history and carrying only fixed items", () => {
    const state = emptyData().finances;
    state.settings.cutoffDay = 20;
    state.periods = [{ id: "old", startDate: "2026-09-20", endDate: "2026-10-19", incomes: [{ id: "i", concept: "Salario", amount: 100 }], miscExpenses: [], items: [{ id: "fixed", concept: "Arriendo", amount: 10, fixed: true, status: "paid" }, { id: "variable", concept: "Viaje", amount: 10, fixed: false, status: "paid" }] }];
    state.activePeriodId = "old";
    expect(closeFinancePeriod(state, "2026-10-01")).toBe(state);
    const closed = closeFinancePeriod(state, "2026-10-20");
    expect(closed.periods[0]).toEqual(state.periods[0]);
    expect(closed.periods[1]).toMatchObject({ startDate: "2026-10-20", endDate: "2026-11-19", incomes: [], miscExpenses: [] });
    expect(closed.periods[1].items).toHaveLength(1);
    expect(closed.periods[1].items[0].status).toBe("pending");
    expect(validateData("finances", closed)).toBe(true);
  });
  it("advances one period at a time after a long absence", () => {
    expect(closeMarketPeriod(market, "2027-01-01").period?.startDate).toBe("2026-10-01");
  });
  it("rejects malformed stored settings and archives", () => {
    expect(validateData("market", { ...market, cutoffDay: 32 })).toBe(false);
    expect(validateData("market", { ...market, period: { startDate: "2026-02-30", endDate: "2026-03-20" } })).toBe(false);
    expect(validateData("market", { ...market, history: [{ id: "x", startDate: "2026-01-01", endDate: "2026-01-31", budget: 10, purchases: [{}] }] })).toBe(false);
  });
});
