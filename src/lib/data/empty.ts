import type { FinanceBudgetState, HouseholdEvent, MarketState, ProjectTask } from "@/lib/types";
import { getColombiaTodayIso } from "@/lib/date";
import { getFinancePeriodRange } from "@/lib/modules/finances";

export type AppData = {
  calendar: HouseholdEvent[];
  tasks: ProjectTask[];
  market: MarketState;
  finances: FinanceBudgetState;
};
export type DataModule = keyof AppData;

export function emptyData(): AppData {
  const range = getFinancePeriodRange(1, getColombiaTodayIso());
  return {
    calendar: [],
    tasks: [],
    market: { budget: 0, purchases: [], cutoffDay: 1, period: { startDate: range.startDate, endDate: range.endDate } },
    finances: {
      settings: { cutoffDay: 1, currency: "COP" },
      activePeriodId: range.id,
      periods: [{ ...range, incomes: [], items: [], miscExpenses: [] }],
    },
  };
}
