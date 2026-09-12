import clsx from "clsx";
import Image from "next/image";
import { moduleThemes } from "@/lib/design-system";
import type { ModuleKey } from "@/lib/types";

type ModuleIconProps = {
  tone: ModuleKey;
  size?: "nav" | "sm" | "md" | "lg";
  className?: string;
};

const moduleIconAssets: Partial<Record<ModuleKey, string>> = {
  home: "/modules/inicio.png",
  calendar: "/modules/calendario.png",
  finances: "/modules/finanzas.png",
  market: "/modules/mercado.png",
  tasks: "/modules/tareas.png",
};

export function ModuleIcon({ tone, size = "md", className }: ModuleIconProps) {
  const theme = moduleThemes[tone];
  const Icon = theme.icon;
  const asset = moduleIconAssets[tone];

  return (
    <span
      className={clsx("module-icon", `module-icon-${size}`, asset && "module-icon-asset", className)}
      style={
        {
          "--module-color": theme.color,
          "--module-text": theme.text,
          "--module-surface": theme.surface,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {asset ? (
        <Image
          src={asset}
          alt=""
          fill
          unoptimized
          sizes="48px"
          className="module-icon-image"
        />
      ) : (
        <>
          <span className="module-icon-orb" />
          <Icon className="module-icon-glyph" strokeWidth={2.45} />
        </>
      )}
    </span>
  );
}
