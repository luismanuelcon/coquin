"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { moduleThemes, visibleModules } from "@/lib/design-system";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav-safe fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] px-4 pb-4 md:absolute md:left-1/2 md:-translate-x-1/2"
      aria-label="Navegacion principal"
    >
      <div className="grid grid-cols-5 gap-1 rounded-[28px] border border-[var(--surface-stroke)] bg-[rgb(255_255_255_/_94%)] p-2 shadow-[0_18px_38px_rgb(23_23_23_/_14%)] backdrop-blur">
        {visibleModules.map((key) => {
          const item = moduleThemes[key];
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={clsx(
                "interactive-surface flex h-14 flex-col items-center justify-center gap-1 rounded-[22px] text-[10px] font-bold transition",
                active ? "text-[var(--active-text)] shadow-[0_10px_20px_rgb(23_23_23_/_8%)]" : "text-[var(--text-soft)]",
              )}
              style={
                {
                  background: active ? item.surface : "transparent",
                  "--active-text": item.text,
                  "--active-glow": item.color,
                } as React.CSSProperties
              }
              aria-current={active ? "page" : undefined}
            >
              <Icon aria-hidden="true" size={19} strokeWidth={2.3} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
