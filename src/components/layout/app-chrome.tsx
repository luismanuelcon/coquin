"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, History, Home as HomeIcon, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { SignOutButton, useAppData } from "@/components/data/data-provider";
import { moduleThemes } from "@/lib/design-system";
import type { ModuleKey } from "@/lib/types";

const pathToTone: Record<string, ModuleKey> = {
  "/": "home",
  "/calendar": "calendar",
  "/finances": "finances",
  "/market": "market",
  "/tasks": "tasks",
};

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userMenu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !userMenu.current?.contains(event.target)) userMenu.current?.removeAttribute("open");
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && userMenu.current?.open) {
        userMenu.current.removeAttribute("open");
        userMenu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissEscape);
    };
  }, []);
  const tone = pathToTone[pathname] ?? "home";
  const theme = moduleThemes[tone];
  const headerLabel = pathname === "/history" ? "Históricos" : pathname === "/settings" ? "Ajustes" : theme.label;
  const { householdName, displayName } = useAppData();
  return (
    <main className="app-shell">
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <div className="mobile-frame">
        <header className="app-header" aria-label="Barra superior">
          <div className="app-header__inner">
            <Link href="/" className="brand-badge" aria-label="Coquín inicio">
              <span className="brand-badge__ring">
                <span>
                  <HomeIcon size={18} strokeWidth={2.4} aria-hidden="true" />
                </span>
              </span>
              <span className="brand-badge__stack">
                <span className="brand-badge__title">Coquín</span>
                <span className="brand-badge__label">{headerLabel}</span>
              </span>
            </Link>
            <div className="header-actions">
              <Link
                href="/settings"
                className="header-icon-button"
                aria-label="Ajustes"
                title="Ajustes"
                aria-current={pathname === "/settings" ? "page" : undefined}
              >
                <Settings size={22} strokeWidth={2.2} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="header-icon-button"
                data-notify="on"
                aria-label="Notificaciones"
                title="Notificaciones"
              >
                <Bell size={22} strokeWidth={2.2} aria-hidden="true" />
              </button>
              <details ref={userMenu} className="relative" key={pathname} onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.removeAttribute("open");
              }}>
                <summary className="avatar-ring list-none cursor-pointer focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden" aria-label="Menú del usuario" title="Menú del usuario">
                <Image
                  src="/coquin-icon.png"
                  alt=""
                  width={32}
                  height={32}
                  priority
                  className="object-cover"
                />
                </summary>
                <nav aria-label="Menú del usuario" className="absolute right-0 top-full z-50 mt-3 w-52 rounded-2xl border border-surface-container-high bg-surface-container p-2 shadow-xl">
                  <p className="truncate px-3 py-2 text-xs font-semibold text-on-surface-variant">{displayName}</p>
                  <Link href="/history" aria-current={pathname === "/history" ? "page" : undefined} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary aria-[current=page]:bg-surface-container-high aria-[current=page]:text-primary"><History size={18} aria-hidden="true" />Históricos</Link>
                  <Link href="/settings" aria-current={pathname === "/settings" ? "page" : undefined} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary aria-[current=page]:bg-surface-container-high aria-[current=page]:text-primary"><Settings size={18} aria-hidden="true" />Ajustes</Link>
                </nav>
              </details>
            </div>
          </div>
        </header>
        <div className="app-content">
          <div className="household-session">
            <span>{displayName} · {householdName}</span>
            <SignOutButton />
          </div>
          <div id="main-content">{children}</div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
