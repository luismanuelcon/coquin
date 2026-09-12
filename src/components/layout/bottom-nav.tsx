"use client";

import Link from "next/link";
import { ModuleIcon } from "@/components/brand/module-icon";
import { usePathname } from "next/navigation";
import { moduleThemes, visibleModules } from "@/lib/design-system";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-navigation" aria-label="Navegación principal">
      <div className="nav-items">
        {visibleModules.map(key => {
          const item = moduleThemes[key];
          return <Link key={key} href={item.href} aria-current={pathname === item.href ? "page" : undefined}><span><ModuleIcon tone={key} size="nav" /></span>{key === "calendar" ? "Agenda" : item.label}</Link>;
        })}
      </div>
    </nav>
  );
}
