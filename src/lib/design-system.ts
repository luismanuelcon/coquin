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
    color: "#E63C7A",
    text: "#ffc5dc",
    surface: "rgb(230 60 122 / 14%)",
  },
  calendar: {
    key: "calendar",
    label: "Calendario",
    href: "/calendar",
    icon: CalendarDays,
    color: "#DDA218",
    text: "#f4d497",
    surface: "rgb(221 162 24 / 16%)",
  },
  finances: {
    key: "finances",
    label: "Finanzas",
    href: "/finances",
    icon: Landmark,
    color: "#1F8A5B",
    text: "#a6e3c3",
    surface: "rgb(31 138 91 / 14%)",
  },
  market: {
    key: "market",
    label: "Mercado",
    href: "/market",
    icon: ShoppingBasket,
    color: "#B41E5C",
    text: "#ffc5dc",
    surface: "rgb(180 30 92 / 14%)",
  },
  tasks: {
    key: "tasks",
    label: "Tareas",
    href: "/tasks",
    icon: CheckCircle2,
    color: "#7C4DE0",
    text: "#dccfff",
    surface: "rgb(124 77 224 / 14%)",
  },
};

export const visibleModules: ModuleKey[] = ["home", "calendar", "finances", "market", "tasks"];
