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
    text: "#6E0F3B",
    surface: "rgb(224 68 115 / 13%)",
  },
  calendar: {
    key: "calendar",
    label: "Calendario",
    href: "/calendar",
    icon: CalendarDays,
    color: "#B88714",
    text: "#60410A",
    surface: "rgb(184 135 20 / 13%)",
  },
  finances: {
    key: "finances",
    label: "Finanzas",
    href: "/finances",
    icon: Landmark,
    color: "#174A41",
    text: "#0F3D36",
    surface: "rgb(23 74 65 / 12%)",
  },
  market: {
    key: "market",
    label: "Mercado",
    href: "/market",
    icon: ShoppingBasket,
    color: "#C2416C",
    text: "#8F143E",
    surface: "rgb(194 65 108 / 13%)",
  },
  tasks: {
    key: "tasks",
    label: "Tareas",
    href: "/tasks",
    icon: CheckCircle2,
    color: "#7A4E5D",
    text: "#4B1029",
    surface: "rgb(122 78 93 / 12%)",
  },
};

export const visibleModules: ModuleKey[] = ["home", "calendar", "finances", "market", "tasks"];
