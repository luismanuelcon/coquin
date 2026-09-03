"use client";

import { CalendarPlus, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CoquinMark } from "@/components/brand/coquin-mark";
import { CoquinWordmark } from "@/components/brand/coquin-wordmark";
import { BottomNav } from "./bottom-nav";

type AppChromeProps = {
  children: React.ReactNode;
};

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main className="app-shell">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <div className="mobile-frame">
        <div className="min-h-screen bg-[var(--surface-bg)] px-3 pb-32 pt-5 min-[390px]:px-4 md:min-h-[860px]">
          <header className="mb-6 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {isHome ? (
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-[var(--text-soft)]">Buenos dias</p>
                  <CoquinWordmark priority />
                  <h1 className="sr-only">COQUIN - Hogar en orden</h1>
                </div>
              ) : (
                <>
                  <CoquinMark />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-[var(--text-soft)]">COQUIN</p>
                    <h1 className="mt-1 truncate text-[clamp(20px,5.8vw,24px)] font-extrabold leading-8 text-[var(--text)]">
                      Gestion del hogar
                    </h1>
                  </div>
                </>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href="/calendar"
                className="interactive-surface grid size-11 shrink-0 place-items-center rounded-full border border-[var(--surface-stroke)] bg-[var(--panel)] text-[var(--text)] shadow-[var(--shadow-soft)]"
                aria-label="Abrir agenda"
              >
                <CalendarPlus aria-hidden="true" size={19} strokeWidth={2.4} />
              </Link>
              <Link
                href="/market"
                className="interactive-surface grid size-11 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-alert)] text-white shadow-[var(--shadow-active)]"
                aria-label="Abrir mercado"
              >
                <ShoppingBasket aria-hidden="true" size={20} strokeWidth={2.6} />
              </Link>
            </div>
          </header>
          <div id="main-content">{children}</div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
