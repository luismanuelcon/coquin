import type { MarketBudget, MarketCategory, MarketPurchase } from "@/lib/types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function calculateMarketBudgetSummary(budget: MarketBudget, purchases: MarketPurchase[]) {
  const spent = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const remaining = budget.budget - spent;
  const spentPercent = budget.budget === 0 ? 0 : Math.min(Math.round((spent / budget.budget) * 100), 100);

  return {
    budget: budget.budget,
    spent,
    remaining,
    spentPercent,
    purchaseCount: purchases.length,
    isOverBudget: remaining < 0,
  };
}

export function getMarketCategoryTotals(purchases: MarketPurchase[]) {
  const totals = purchases.reduce<Partial<Record<MarketCategory, number>>>((accumulator, purchase) => {
    accumulator[purchase.category] = (accumulator[purchase.category] ?? 0) + purchase.amount;
    return accumulator;
  }, {});

  return Object.entries(totals)
    .map(([category, total]) => ({
      category: category as MarketCategory,
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

export function createMarketPurchase(input: Omit<MarketPurchase, "id">): MarketPurchase {
  return {
    ...input,
    id: `purchase-${input.date}-${input.category}-${input.amount}-${slugify(input.detail) || "sin-detalle"}`,
  };
}

export type MarketDebt = {
  debtorId: string;
  debtorName: string;
  creditorId: string;
  creditorName: string;
  total: number;
};

/** Groups purchases marked as owed into "debtor owes creditor" totals. */
export function summarizeMarketDebts(purchases: MarketPurchase[]): MarketDebt[] {
  const debts = new Map<string, MarketDebt>();
  for (const purchase of purchases) {
    if (!purchase.owed || !purchase.debtorId || !purchase.buyerId || purchase.debtorId === purchase.buyerId) continue;
    const key = `${purchase.debtorId}->${purchase.buyerId}`;
    const existing = debts.get(key);
    if (existing) {
      existing.total += purchase.amount;
    } else {
      debts.set(key, {
        debtorId: purchase.debtorId,
        debtorName: purchase.debtorName ?? "Alguien",
        creditorId: purchase.buyerId,
        creditorName: purchase.buyerName ?? "Alguien",
        total: purchase.amount,
      });
    }
  }
  return [...debts.values()].sort((a, b) => b.total - a.total);
}
