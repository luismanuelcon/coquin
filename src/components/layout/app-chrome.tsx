"use client";

import { CalendarPlus, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
        <div className="min-h-screen bg-[var(--surface-bg)] px-5 py-5 md:min-h-[860px]">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--text-soft)]">
                {isHome ? "Buenos dias" : "COQUIN"}
              </p>
              <h1 className="mt-1 text-[24px] font-extrabold leading-8 text-[var(--text)]">
                {isHome ? "Hogar en orden" : "Gestion del hogar"}
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                href="/calendar"
                className="interactive-surface grid size-11 place-items-center rounded-full border border-[var(--surface-stroke)] bg-[var(--panel)] text-[var(--text)] shadow-[var(--shadow-soft)]"
                aria-label="Abrir agenda"
              >
                <CalendarPlus aria-hidden="true" size={19} strokeWidth={2.4} />
              </Link>
              <Link
                href="/market"
                className="interactive-surface grid size-11 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-active)]"
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
