"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Home as HomeIcon, Settings } from "lucide-react";
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
  const tone = pathToTone[pathname] ?? "home";
  const theme = moduleThemes[tone];
  const headerLabel = pathname === "/settings" ? "Ajustes" : theme.label;
  const { householdName } = useAppData();
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
              <span className="avatar-ring" aria-label={`Coquín · ${householdName || "Mi hogar"}`}>
                <Image
                  src="/coquin-icon.png"
                  alt=""
                  width={32}
                  height={32}
                  priority
                  className="object-cover"
                />
              </span>
            </div>
          </div>
        </header>
        <div className="app-content">
          <div className="household-session">
            <span>{householdName}</span>
            <SignOutButton />
          </div>
          <div id="main-content">{children}</div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
