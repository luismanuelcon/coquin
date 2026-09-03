"use client";

import Image from "next/image";
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
                className="header-icon-button"
                aria-label="Abrir agenda"
              >
                <Image
                  src="/modules/calendario.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                  priority
                />
              </Link>
              <Link
                href="/market"
                className="header-icon-button"
                aria-label="Abrir mercado"
              >
                <Image
                  src="/modules/mercado.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                  priority
                />
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
