import { describe, expect, it } from "vitest";
import { marketBudget, marketPurchases } from "@/lib/data/mock";
import { calculateMarketBudgetSummary, createMarketPurchase, getMarketCategoryTotals, summarizeMarketDebts } from "./market";

describe("market module", () => {
  it("calculates monthly budget usage from purchases", () => {
    expect(calculateMarketBudgetSummary(marketBudget, marketPurchases)).toEqual({
      budget: 1200000,
      spent: 760000,
      remaining: 440000,
      spentPercent: 63,
      purchaseCount: 5,
      isOverBudget: false,
    });
  });

  it("groups monthly purchases by category", () => {
    expect(getMarketCategoryTotals(marketPurchases)[0]).toEqual({
      category: "Despensa",
      total: 248000,
    });
  });

  it("creates a purchase with a deterministic local id", () => {
    expect(
      createMarketPurchase({
        date: "2026-08-02",
        detail: "Aseo",
        category: "Aseo",
        amount: 80000,
      }),
    ).toMatchObject({
      id: "purchase-2026-08-02-Aseo-80000-aseo",
    });
  });

  it("summarizes owed purchases into debtor-owes-creditor totals", () => {
    const debts = summarizeMarketDebts([
      { id: "a", date: "2026-10-01", detail: "Arroz", category: "Despensa", amount: 12000, owed: true, debtorId: "d1", debtorName: "Ana", buyerId: "b1", buyerName: "Luis" },
      { id: "b", date: "2026-10-02", detail: "Leche", category: "Lacteos", amount: 8000, owed: true, debtorId: "d1", debtorName: "Ana", buyerId: "b1", buyerName: "Luis" },
      { id: "c", date: "2026-10-03", detail: "Jabón", category: "Aseo", amount: 5000 },
    ]);
    expect(debts).toEqual([
      { debtorId: "d1", debtorName: "Ana", creditorId: "b1", creditorName: "Luis", total: 20000 },
    ]);
  });

  it("ignores owed purchases where debtor and buyer are the same", () => {
    expect(
      summarizeMarketDebts([
        { id: "a", date: "2026-10-01", detail: "Arroz", category: "Despensa", amount: 12000, owed: true, debtorId: "x", buyerId: "x" },
      ]),
    ).toEqual([]);
  });
});
