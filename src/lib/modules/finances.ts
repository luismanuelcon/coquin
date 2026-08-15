import type { FinanceItem } from "@/lib/types";

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
