"use client";

import { Check, Moon, Sun } from "lucide-react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { useTheme, type ThemeName } from "@/lib/hooks/use-theme";

const THEME_OPTIONS: {
  value: ThemeName;
  label: string;
  description: string;
  icon: typeof Moon;
}[] = [
  { value: "dark", label: "Oscuro", description: "Tema por defecto, plum profundo", icon: Moon },
  { value: "light", label: "Claro", description: "Fondos claros y suaves", icon: Sun },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="home"
          eyebrow="Personalización"
          title="Ajustes"
          subtitle="Adapta Coquín a tu gusto"
          badge="Portal"
        />

        <section className="card-surface flex flex-col gap-3 p-4" aria-label="Tema de la aplicación">
          <div className="flex flex-col gap-1">
            <h2 className="section-title">Tema</h2>
            <p className="text-[12px] font-semibold text-on-surface-variant">
              Elige cómo se ve el portal. Se guarda en este dispositivo.
            </p>
          </div>

          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Selecciona un tema">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTheme(option.value)}
                  className="theme-option"
                  data-selected={selected || undefined}
                >
                  <span className="theme-option__icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-[15px] font-bold text-on-surface">{option.label}</span>
                    <span className="block text-[12px] font-semibold text-on-surface-variant">
                      {option.description}
                    </span>
                  </span>
                  {selected ? (
                    <span className="theme-option__check" aria-hidden="true">
                      <Check size={16} strokeWidth={2.8} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
