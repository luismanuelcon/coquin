import { describe, expect, it } from "vitest";
import { marketBudget, marketPurchases } from "@/lib/data/mock";
import { calculateMarketBudgetSummary, createMarketPurchase, getMarketCategoryTotals } from "./market";

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
});
