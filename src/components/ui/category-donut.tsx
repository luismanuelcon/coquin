"use client";

import type { MiscCategorySlice } from "@/lib/modules/finances";

const CATEGORY_COLORS: Record<string, string> = {
  Comida: "#ff6b97",
  Transporte: "#ffb955",
  Parqueadero: "#c58bff",
  Entretenimiento: "#5cc8ff",
  Ropa: "#ff8fab",
  Salud: "#5fd6a4",
  Viaje: "#ffd166",
  Hogar: "#e87c98",
  Servicios: "#7c9bff",
  Educación: "#ffb1c2",
  Mascotas: "#ffa06b",
  Otros: "#a58a8f",
};

const FALLBACK_COLOR = "#a58a8f";
const RADIUS = 52;
const STROKE = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function colorFor(category: string) {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
}

type CategoryDonutProps = {
  total: number;
  slices: MiscCategorySlice[];
  formatAmount: (amount: number) => string;
};

export function CategoryDonut({ total, slices, formatAmount }: CategoryDonutProps) {
  if (total === 0 || slices.length === 0) {
    return (
      <p className="rounded-2xl bg-surface-container p-4 text-sm font-semibold text-on-surface-variant">
        Aún no hay gastos para graficar. Registra el primero para ver el resumen.
      </p>
    );
  }

  const top = slices[0];
  let offset = 0;

  return (
    <section className="card-surface flex flex-col gap-3 p-4" aria-label="Resumen de gastos por categoría">
      <div className="flex items-center gap-4">
        <div className="chart-glow relative shrink-0" style={{ ["--chart-glow" as string]: colorFor(top.category) }}>
          <span className="chart-glow__halo" aria-hidden="true" />
          <svg
            viewBox="0 0 140 140"
            className="chart-glow__svg size-[132px] -rotate-90"
            role="img"
            aria-label={`Total de gastos varios ${formatAmount(total)}. Mayor rubro ${top.category} con ${Math.round(
              top.percent * 100,
            )} por ciento.`}
          >
            <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="var(--surface-low)" strokeWidth={STROKE} />
            {slices.map((slice) => {
              const dash = slice.percent * CIRCUMFERENCE;
              const circle = (
                <circle
                  key={slice.category}
                  cx="70"
                  cy="70"
                  r={RADIUS}
                  fill="none"
                  stroke={colorFor(slice.category)}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += dash;
              return circle;
            })}
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total gastado</p>
          <p className="break-words text-[22px] font-black leading-7 tracking-tight text-on-surface">
            {formatAmount(total)}
          </p>
          <p className="mt-1 text-[12px] font-semibold text-on-surface-variant">
            Más gastas en <span className="font-bold" style={{ color: colorFor(top.category) }}>{top.category}</span>{" "}
            ({Math.round(top.percent * 100)}%)
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5" aria-label="Desglose por categoría">
        {slices.map((slice) => (
          <li key={slice.category} className="flex items-center gap-2.5">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ background: colorFor(slice.category) }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-on-surface">{slice.category}</span>
            <span className="shrink-0 text-[11px] font-semibold text-on-surface-variant">
              {Math.round(slice.percent * 100)}%
            </span>
            <span className="shrink-0 whitespace-nowrap text-[13px] font-bold text-secondary">
              {formatAmount(slice.amount)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
