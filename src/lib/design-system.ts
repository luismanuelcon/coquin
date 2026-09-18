import { CalendarDays, CheckCircle2, Home, Landmark, ShoppingBasket } from "lucide-react";
import type { IconComponent, ModuleKey } from "./types";

export type ModuleTheme = {
  key: ModuleKey;
  label: string;
  navLabel: string;
  href: string;
  icon: IconComponent;
  /** Solid accent colour used for text, icons and progress fills. */
  color: string;
  /** Light-on-dark text tint used inside filled avatars. */
  text: string;
  /** Semi-transparent surface used behind icons and pills. */
  surface: string;
  /** Linear-gradient string for pill CTAs and elevated highlights. */
  gradient: string;
};

export const moduleThemes: Record<ModuleKey, ModuleTheme> = {
  home: {
    key: "home",
    label: "Inicio",
    navLabel: "Inicio",
    href: "/",
    icon: Home,
    color: "#ff6b97",
    text: "#ffb1c3",
    surface: "rgb(255 107 151 / 18%)",
    gradient: "linear-gradient(135deg, #ff6b97, #ff8fab)",
  },
  calendar: {
    key: "calendar",
    label: "Agenda",
    navLabel: "Agenda",
    href: "/calendar",
    icon: CalendarDays,
    color: "#ffb955",
    text: "#ffddb4",
    surface: "rgb(255 185 85 / 18%)",
    gradient: "linear-gradient(135deg, #ffb955, #ffddb4)",
  },
  finances: {
    key: "finances",
    label: "Finanzas",
    navLabel: "Finanzas",
    href: "/finances",
    icon: Landmark,
    color: "#ffb1c3",
    text: "#ffd9e0",
    surface: "rgb(255 177 195 / 18%)",
    gradient: "linear-gradient(135deg, #ffb1c3, #ff6b97)",
  },
  market: {
    key: "market",
    label: "Mercado",
    navLabel: "Mercado",
    href: "/market",
    icon: ShoppingBasket,
    color: "#ff8fab",
    text: "#ffd9e0",
    surface: "rgb(255 143 171 / 18%)",
    gradient: "linear-gradient(135deg, #ff8fab, #ffb955)",
  },
  tasks: {
    key: "tasks",
    label: "Tareas",
    navLabel: "Tareas",
    href: "/tasks",
    icon: CheckCircle2,
    color: "#ffb1c2",
    text: "#ffd9e0",
    surface: "rgb(232 124 152 / 20%)",
    gradient: "linear-gradient(135deg, #e87c98, #ffb1c2)",
  },
};

export const visibleModules: ModuleKey[] = ["home", "calendar", "finances", "market", "tasks"];
