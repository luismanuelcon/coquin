import { describe, expect, it } from "vitest";
import { financeItems } from "@/lib/data/mock";
import { calculateFinanceObligations, getPendingFinanceItems, parseCopAmount } from "./finances";

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
});
