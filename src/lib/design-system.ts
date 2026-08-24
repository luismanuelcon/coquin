import { CalendarDays, CheckCircle2, Home, Landmark, ShoppingBasket } from "lucide-react";
import type { IconComponent, ModuleKey } from "./types";

export type ModuleTheme = {
  key: ModuleKey;
  label: string;
  href: string;
  icon: IconComponent;
  color: string;
  text: string;
  surface: string;
};

export const moduleThemes: Record<ModuleKey, ModuleTheme> = {
  home: {
    key: "home",
    label: "Inicio",
    href: "/",
    icon: Home,
    color: "#C2410C",
    text: "#C2410C",
    surface: "rgb(194 65 12 / 10%)",
  },
  calendar: {
    key: "calendar",
    label: "Calendario",
    href: "/calendar",
    icon: CalendarDays,
    color: "#1F2937",
    text: "#1F2937",
    surface: "rgb(31 41 55 / 8%)",
  },
  finances: {
    key: "finances",
    label: "Finanzas",
    href: "/finances",
    icon: Landmark,
    color: "#171717",
    text: "#171717",
    surface: "rgb(23 23 23 / 8%)",
  },
  market: {
    key: "market",
    label: "Mercado",
    href: "/market",
    icon: ShoppingBasket,
    color: "#C2410C",
    text: "#C2410C",
    surface: "rgb(194 65 12 / 10%)",
  },
  tasks: {
    key: "tasks",
    label: "Tareas",
    href: "/tasks",
    icon: CheckCircle2,
    color: "#6F7177",
    text: "#3F3F46",
    surface: "rgb(111 113 119 / 10%)",
  },
};

export const visibleModules: ModuleKey[] = ["home", "calendar", "finances", "market", "tasks"];
