import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type ModuleKey = "home" | "calendar" | "finances" | "market" | "tasks";

export type IconComponent = ComponentType<LucideProps>;

export type OverviewMetric = {
  label: string;
  value: string;
  detail: string;
  tone: ModuleKey;
};

export type HouseholdEvent = {
  id: string;
  title: string;
  meta: string;
  time: string;
  tone: ModuleKey;
};

export type FinanceItem = {
  id: string;
  title: string;
  amount: string;
  status: string;
  due: string;
};

export type FinancePaymentStatus = "paid" | "pending";

export type FinanceIncome = {
  id: string;
  concept: string;
  amount: number;
  note?: string;
};

export type FinanceBudgetItem = {
  id: string;
  concept: string;
  amount: number;
  fixed: boolean;
  status: FinancePaymentStatus;
  note?: string;
};

export type FinanceMiscExpense = {
  id: string;
  date: string;
  concept: string;
  amount: number;
  category?: string;
  note?: string;
};

export type FinancePeriod = {
  id: string;
  startDate: string;
  endDate: string;
  incomes: FinanceIncome[];
  items: FinanceBudgetItem[];
  miscExpenses: FinanceMiscExpense[];
};

export type FinanceSettings = {
  cutoffDay: number;
  currency: string;
};

export type FinanceBudgetState = {
  settings: FinanceSettings;
  activePeriodId: string;
  periods: FinancePeriod[];
};

export type MarketCategory =
  | "Aseo"
  | "Carnes"
  | "Verduras"
  | "Despensa"
  | "Lacteos"
  | "Hogar"
  | "Otro";

export type MarketPurchase = {
  id: string;
  date: string;
  detail: string;
  category: MarketCategory;
  amount: number;
};

export type MarketBudget = {
  month: string;
  budget: number;
  currency: string;
};

export type ProjectTask = {
  id: string;
  title: string;
  owner: string;
  status: string;
  due: string;
};
