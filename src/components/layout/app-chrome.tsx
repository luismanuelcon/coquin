"use client";

import { CoquinWordmark } from "@/components/brand/coquin-wordmark";
import { ModuleIcon } from "@/components/brand/module-icon";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === "/";
  return (
    <main className="app-shell">
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <div className="mobile-frame">
        <div className="app-content">
          <header className="app-header">
            <Link href="/" className="brand-home" aria-label="Coquin, inicio">
              <CoquinWordmark priority />
            </Link>
            <Link href="/calendar" className="header-icon-button" aria-label="Abrir agenda" title="Abrir agenda"><ModuleIcon tone="calendar" size="sm" /></Link>
          </header>
          {isHome ? <div className="home-greeting"><div><p>Tu espacio compartido</p><h1>Hola, familia<span>.</span></h1></div><span className="household-badge">Mi hogar</span></div> : <Link href="/" className="back-home"><ArrowLeft size={16} aria-hidden="true" /> Mi hogar</Link>}
          <div id="main-content">{children}</div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
