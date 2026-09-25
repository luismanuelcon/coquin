"use client";

import { useState } from "react";
import { Check, Copy, Moon, RefreshCw, Sun } from "lucide-react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { useAppData, SignOutButton } from "@/components/data/data-provider";
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

function FamilyCodeSection() {
  const { householdName, householdCode, role, rotateCode } = useAppData();
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const formatted = `${householdCode.slice(0, 4)}-${householdCode.slice(4)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(householdCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard no disponible */ }
  }
  async function rotate() {
    if (rotating) return;
    if (!window.confirm("¿Generar un código nuevo? El código actual dejará de funcionar. Los miembros actuales no se ven afectados.")) return;
    setRotating(true);
    await rotateCode();
    setRotating(false);
  }

  return (
    <section className="card-surface flex flex-col gap-3 p-4" aria-label="Código de familia">
      <div className="flex flex-col gap-1">
        <h2 className="section-title">Código de familia</h2>
        <p className="text-[12px] font-semibold text-on-surface-variant">
          Compártelo para que otras personas se unan a {householdName}.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-highest px-4 py-3">
        <span className="break-all text-[22px] font-extrabold tracking-[0.08em] text-on-surface">{formatted}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copiar código"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-container text-on-surface"
        >
          {copied ? <Check size={18} strokeWidth={2.8} /> : <Copy size={18} strokeWidth={2.2} />}
        </button>
      </div>
      {role === "admin" ? (
        <button
          type="button"
          onClick={rotate}
          disabled={rotating}
          className="flex items-center justify-center gap-2 rounded-full border border-outline px-4 py-3 text-[13px] font-bold text-on-surface disabled:opacity-50"
        >
          <RefreshCw size={16} strokeWidth={2.4} />
          {rotating ? "Generando..." : "Generar nuevo código"}
        </button>
      ) : (
        <p className="text-[12px] font-semibold text-on-surface-variant">
          Solo el administrador del hogar puede generar un código nuevo.
        </p>
      )}
    </section>
  );
}

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

        <FamilyCodeSection />

        <section className="card-surface flex flex-col gap-3 p-4" aria-label="Tema de la aplicación">
          <div className="flex flex-col gap-1">
            <h2 className="section-title">Tema</h2>
            <p className="text-[12px] font-semibold text-on-surface-variant">
              Elige cómo se ve el portal. Se guarda en este dispositivo.
            </p>
          </div>

          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Selecciona un tema">
            {THEME_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const selected = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onKeyDown={(event) => {
                    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1
                      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
                    if (!step && event.key !== "Home" && event.key !== "End") return;
                    event.preventDefault();
                    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? THEME_OPTIONS.length - 1
                      : (index + step + THEME_OPTIONS.length) % THEME_OPTIONS.length;
                    setTheme(THEME_OPTIONS[nextIndex].value);
                    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
                    buttons?.[nextIndex]?.focus();
                  }}
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

        <section className="card-surface flex flex-col gap-3 p-4" aria-label="Sesión">
          <div className="flex flex-col gap-1">
            <h2 className="section-title">Sesión</h2>
            <p className="text-[12px] font-semibold text-on-surface-variant">
              Cierra la sesión en este dispositivo. Tu hogar y tus datos se conservan.
            </p>
          </div>
          <div className="flex justify-start">
            <SignOutButton />
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
