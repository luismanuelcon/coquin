import type { FinanceIncome } from "@/lib/types";
import { describe, expect, it } from "vitest";
import { calculateFinancePeriodSummary, summarizeFinanceIncomes, withBudgetConsumptions } from "./finances";
import { emptyData } from "@/lib/data/empty";
import { validateData } from "@/lib/data/validation";

describe("income status and consumed budgets", () => {
  it("includes expected income in the budget while separating received money", () => {
    const incomes: FinanceIncome[] = [{ id: "salary", concept: "Salario", amount: 1000 }, { id: "consulting", concept: "Consultoría", amount: 250, status: "pending" as const }];
    expect(summarizeFinanceIncomes(incomes)).toEqual({ total: 1250, pending: 250, received: 1000 });
    const period = { ...emptyData().finances.periods[0], incomes };
    expect(calculateFinancePeriodSummary(period).base).toBe(1250);
    incomes[1] = { ...incomes[1], status: "received" };
    expect(summarizeFinanceIncomes(incomes)).toEqual({ total: 1250, pending: 0, received: 1250 });
    expect(calculateFinancePeriodSummary(period).base).toBe(1250);
  });
  it("moves a fully consumed budget out of pending and reverses after deleting a consumption", () => {
    const item = { id: "fuel", concept: "Gasolina", amount: 200000, fixed: true, status: "pending" as const };
    const entries = [{ id: "1", date: "2026-11-21", amount: 100000 }, { id: "2", date: "2026-11-22", amount: 100000 }];
    const full = withBudgetConsumptions(item, entries);
    expect(full.status).toBe("paid");
    expect(calculateFinancePeriodSummary({ ...emptyData().finances.periods[0], items: [full] })).toMatchObject({ totalPayments: 200000, paid: 200000, pending: 0 });
    const partial = withBudgetConsumptions(full, entries.slice(0, 1));
    expect(partial.status).toBe("pending");
    expect(calculateFinancePeriodSummary({ ...emptyData().finances.periods[0], items: [partial] })).toMatchObject({ paid: 100000, pending: 100000 });
  });
  it("validates received, pending and legacy income statuses", () => {
    const state = emptyData().finances;
    state.periods[0].incomes = [{ id: "1", concept: "Ingreso", amount: 100 }];
    expect(validateData("finances", state)).toBe(true);
    state.periods[0].incomes[0].status = "pending";
    expect(validateData("finances", state)).toBe(true);
    state.periods[0].incomes[0].status = "received";
    expect(validateData("finances", state)).toBe(true);
    state.periods[0].incomes[0].status = "invalid" as never;
    expect(validateData("finances", state)).toBe(false);
  });
});
