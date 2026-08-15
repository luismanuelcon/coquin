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
    color: "#00F2FF",
    text: "#74F5FF",
    surface: "rgb(0 242 255 / 8%)",
  },
  calendar: {
    key: "calendar",
    label: "Calendario",
    href: "/calendar",
    icon: CalendarDays,
    color: "#00F2FF",
    text: "#74F5FF",
    surface: "rgb(0 242 255 / 8%)",
  },
  finances: {
    key: "finances",
    label: "Finanzas",
    href: "/finances",
    icon: Landmark,
    color: "#00DBE7",
    text: "#74F5FF",
    surface: "rgb(0 219 231 / 8%)",
  },
  market: {
    key: "market",
    label: "Mercado",
    href: "/market",
    icon: ShoppingBasket,
    color: "#FF8A00",
    text: "#FFB65C",
    surface: "rgb(255 138 0 / 9%)",
  },
  tasks: {
    key: "tasks",
    label: "Tareas",
    href: "/tasks",
    icon: CheckCircle2,
    color: "#FF00E5",
    text: "#FF8CF2",
    surface: "rgb(255 0 229 / 9%)",
  },
};

export const visibleModules: ModuleKey[] = ["home", "calendar", "finances", "market", "tasks"];
