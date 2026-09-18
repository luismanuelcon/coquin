"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { moduleThemes, visibleModules } from "@/lib/design-system";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-navigation" aria-label="Navegación principal">
      <div className="nav-items">
        {visibleModules.map((key) => {
          const item = moduleThemes[key];
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.navLabel}
            >
              <Icon aria-hidden="true" strokeWidth={active ? 2.6 : 2.2} />
              <span>{item.navLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
