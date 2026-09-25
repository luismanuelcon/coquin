import { describe, expect, it } from "vitest";
import { emptyData } from "./empty";
import { validateData } from "./validation";

describe("module document validation", () => {
  it("accepts the initial empty documents", () => {
    for (const [module, value] of Object.entries(emptyData())) expect(validateData(module, value)).toBe(true);
  });
  it("accepts legacy owners and validates account IDs on new assignments", () => {
    const task = { id: "one", title: "Comprar", owner: "Ana", due: "2026-09-25", status: "Pendiente" };
    expect(validateData("tasks", [task])).toBe(true);
    expect(validateData("tasks", [{ ...task, ownerId: "11111111-1111-4111-8111-111111111111" }])).toBe(true);
    expect(validateData("tasks", [{ ...task, ownerId: "Ana" }])).toBe(false);
    expect(validateData("tasks", [{ ...task, ownerId: null }])).toBe(false);
  });
  it("rejects duplicate IDs and malformed records", () => {
    const task = { id: "one", title: "Comprar", owner: "Prueba", due: "Hoy", status: "Pendiente" };
    expect(validateData("tasks", [task, task])).toBe(false);
    expect(validateData("tasks", [{ id: "one" }])).toBe(false);
  });
  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 1e12 + 1])("rejects invalid COP value %s", amount => {
    expect(validateData("market", { budget: amount, purchases: [] })).toBe(false);
  });
  it("rejects normalized but nonexistent dates", () => {
    expect(validateData("market", { budget: 100, purchases: [{
      id: "one", detail: "Prueba", amount: 10, date: "2026-02-30", category: "Otro",
    }] })).toBe(false);
  });
  it("requires an existing active financial period", () => {
    const finance = emptyData().finances;
    expect(validateData("finances", { ...finance, activePeriodId: "missing" })).toBe(false);
    expect(validateData("finances", { ...finance, periods: [] })).toBe(false);
  });
  it("rejects optional values that would crash rendering", () => {
    const finance = emptyData().finances;
    finance.periods[0].miscExpenses.push({ id: "one", concept: "Prueba", amount: 10, date: "2026-09-16", note: {} as string });
    expect(validateData("finances", finance)).toBe(false);
  });
});
