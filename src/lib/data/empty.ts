import type { FinanceBudgetState, HouseholdEvent, MarketPurchase, ProjectTask } from "@/lib/types";
import { getColombiaTodayIso } from "@/lib/date";
import { getFinancePeriodRange } from "@/lib/modules/finances";

export type AppData = {
  calendar: HouseholdEvent[];
  tasks: ProjectTask[];
  market: { budget: number; purchases: MarketPurchase[] };
  finances: FinanceBudgetState;
};
export type DataModule = keyof AppData;

export function emptyData(): AppData {
  const range = getFinancePeriodRange(1, getColombiaTodayIso());
  return {
    calendar: [],
    tasks: [],
    market: { budget: 0, purchases: [] },
    finances: {
      settings: { cutoffDay: 1, currency: "COP" },
      activePeriodId: range.id,
      periods: [{ ...range, incomes: [], items: [], miscExpenses: [] }],
    },
  };
}
