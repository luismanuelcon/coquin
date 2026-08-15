import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type ModuleKey = "home" | "calendar" | "finances" | "market" | "tasks";

export type IconComponent = ComponentType<LucideProps>;

export type OverviewMetric = {
  label: string;
  value: string;
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

export type MarketItem = {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked?: boolean;
};

export type MarketBudget = {
  month: string;
  budget: number;
  spent: number;
  planned: number;
  currency: string;
};

export type ProjectTask = {
  id: string;
  title: string;
  owner: string;
  status: string;
  due: string;
};
