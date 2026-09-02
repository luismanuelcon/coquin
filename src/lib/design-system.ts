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
    color: "#E04473",
    text: "#9F1239",
    surface: "rgb(224 68 115 / 12%)",
  },
  calendar: {
    key: "calendar",
    label: "Calendario",
    href: "/calendar",
    icon: CalendarDays,
    color: "#D69A16",
    text: "#854D0E",
    surface: "rgb(214 154 22 / 12%)",
  },
  finances: {
    key: "finances",
    label: "Finanzas",
    href: "/finances",
    icon: Landmark,
    color: "#9A6B33",
    text: "#5C3612",
    surface: "rgb(154 107 51 / 12%)",
  },
  market: {
    key: "market",
    label: "Mercado",
    href: "/market",
    icon: ShoppingBasket,
    color: "#F05C74",
    text: "#BE123C",
    surface: "rgb(240 92 116 / 12%)",
  },
  tasks: {
    key: "tasks",
    label: "Tareas",
    href: "/tasks",
    icon: CheckCircle2,
    color: "#B66A9B",
    text: "#7E225F",
    surface: "rgb(182 106 155 / 12%)",
  },
};

export const visibleModules: ModuleKey[] = ["home", "calendar", "finances", "market", "tasks"];
