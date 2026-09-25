import clsx from "clsx";
import { moduleThemes } from "@/lib/design-system";
import type { ModuleKey } from "@/lib/types";

type ModuleIconProps = {
  tone: ModuleKey;
  size?: "nav" | "sm" | "md" | "lg";
  filled?: boolean;
  className?: string;
};

const sizeMap = {
  nav: { box: 32, glyph: 18, radius: 12 },
  sm: { box: 36, glyph: 18, radius: 12 },
  md: { box: 40, glyph: 20, radius: 14 },
  lg: { box: 44, glyph: 22, radius: 16 },
} as const;

export function ModuleIcon({ tone, size = "md", filled = false, className }: ModuleIconProps) {
  const theme = moduleThemes[tone];
  const Icon = theme.icon;
  const dims = sizeMap[size];

  const style = filled
    ? { background: theme.gradient, color: "#1f0a10", boxShadow: `0 4px 16px color-mix(in srgb, ${theme.color} 25%, transparent)` }
    : { background: theme.surface, color: theme.color };

  return (
    <span
      className={clsx("inline-flex shrink-0 items-center justify-center", className)}
      style={{
        width: dims.box,
        height: dims.box,
        borderRadius: dims.radius,
        ...style,
      }}
      aria-hidden="true"
    >
      <Icon size={dims.glyph} strokeWidth={2.4} />
    </span>
  );
}
