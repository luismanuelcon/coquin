"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { getColombiaTodayIso } from "@/lib/date";
import type { ModuleKey } from "@/lib/types";

type DatePickerProps = {
  value: string;
  onChange: (isoDate: string) => void;
  tone?: ModuleKey;
  min?: string;
  max?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  id?: string;
  triggerClassName?: string;
  align?: "start" | "end";
};

const toneAccent: Record<ModuleKey, { color: string; soft: string; onAccent: string }> = {
  home: { color: "var(--primary)", soft: "var(--primary-soft)", onAccent: "var(--primary-ink)" },
  calendar: { color: "var(--warning)", soft: "var(--warning-soft)", onAccent: "#1a120b" },
  finances: { color: "var(--finance)", soft: "var(--finance-soft)", onAccent: "#0f2018" },
  market: { color: "var(--market)", soft: "var(--market-soft)", onAccent: "#3a1526" },
  tasks: { color: "var(--primary)", soft: "var(--primary-soft)", onAccent: "var(--primary-ink)" },
};

const weekdays = ["L", "M", "M", "J", "V", "S", "D"];
const monthFormatter = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" });
const buttonLabelFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});
const dayAriaFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseIso(iso: string): { year: number; month: number; day: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return { year: y, month: m - 1, day: d };
}

function toLocalNoonDate(iso: string) {
  const parts = parseIso(iso);
  if (!parts) return null;
  return new Date(parts.year, parts.month, parts.day, 12, 0, 0);
}

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstOfMonth.getDay(); // Sun=0..Sat=6
  const leading = (dayOfWeek + 6) % 7; // move so Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { year: number; month: number; day: number; inMonth: boolean }[] = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = leading - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const d = new Date(year, month - 1, day);
    cells.push({ year: d.getFullYear(), month: d.getMonth(), day, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ year, month, day, inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1];
    const next = new Date(last.year, last.month, last.day + 1);
    cells.push({ year: next.getFullYear(), month: next.getMonth(), day: next.getDate(), inMonth: false });
    if (cells.length >= 42) break;
  }
  return cells;
}

export function DatePicker({
  value,
  onChange,
  tone = "calendar",
  min,
  max,
  placeholder = "Selecciona fecha",
  ariaLabel,
  disabled,
  id,
  triggerClassName,
  align = "start",
}: DatePickerProps) {
  const generatedId = useId();
  const buttonId = id ?? `date-picker-${generatedId}`;
  const dialogId = `${buttonId}-dialog`;
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const today = getColombiaTodayIso();
  const selected = useMemo(() => parseIso(value), [value]);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selected ?? parseIso(today) ?? { year: new Date().getFullYear(), month: new Date().getMonth(), day: 1 };
    return { year: base.year, month: base.month };
  });

  useEffect(() => {
    if (!open) return;
    const base = selected ?? parseIso(today);
    if (base) setViewMonth({ year: base.year, month: base.month });
  }, [open, selected, today]);

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: MouseEvent | TouchEvent) {
      if (!containerRef.current) return;
      if (event.target instanceof Node && containerRef.current.contains(event.target)) return;
      setOpen(false);
    }
    function handleKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setFlipUp(spaceBelow < 360 && rect.top > 360);
  }, [open]);

  const cells = useMemo(() => buildMonthGrid(viewMonth.year, viewMonth.month), [viewMonth]);
  const minDate = min ? toLocalNoonDate(min) : null;
  const maxDate = max ? toLocalNoonDate(max) : null;
  const accent = toneAccent[tone];

  const handleSelect = useCallback(
    (year: number, month: number, day: number) => {
      onChange(toIso(year, month, day));
      setOpen(false);
      buttonRef.current?.focus();
    },
    [onChange],
  );

  const gotoPrev = useCallback(() => {
    setViewMonth((current) => {
      const d = new Date(current.year, current.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);
  const gotoNext = useCallback(() => {
    setViewMonth((current) => {
      const d = new Date(current.year, current.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  const displayLabel = useMemo(() => {
    if (!selected) return placeholder;
    const d = new Date(selected.year, selected.month, selected.day, 12);
    return buttonLabelFormatter.format(d).replace(".", "");
  }, [selected, placeholder]);

  const monthTitle = useMemo(() => {
    const d = new Date(viewMonth.year, viewMonth.month, 1);
    const label = monthFormatter.format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [viewMonth]);

  return (
    <div ref={containerRef} className="date-picker">
      <button
        ref={buttonRef}
        type="button"
        id={buttonId}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={ariaLabel}
        data-empty={!selected || undefined}
        data-open={open || undefined}
        className={triggerClassName}
      >
        <span className="date-picker__label">{displayLabel}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={ariaLabel ?? "Seleccionar fecha"}
          id={dialogId}
          className="date-picker__pop"
          data-align={align}
          data-flip={flipUp || undefined}
          style={
            {
              ["--dp-accent" as string]: accent.color,
              ["--dp-accent-soft" as string]: accent.soft,
              ["--dp-on-accent" as string]: accent.onAccent,
            } as React.CSSProperties
          }
        >
          <div className="date-picker__head">
            <button
              type="button"
              onClick={gotoPrev}
              aria-label="Mes anterior"
              className="date-picker__nav"
            >
              <ChevronLeft aria-hidden="true" size={18} strokeWidth={2.4} />
            </button>
            <span className="date-picker__title">{monthTitle}</span>
            <button
              type="button"
              onClick={gotoNext}
              aria-label="Mes siguiente"
              className="date-picker__nav"
            >
              <ChevronRight aria-hidden="true" size={18} strokeWidth={2.4} />
            </button>
          </div>
          <div className="date-picker__weekdays" aria-hidden="true">
            {weekdays.map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
          <div className="date-picker__grid" role="grid">
            {cells.map((cell) => {
              const iso = toIso(cell.year, cell.month, cell.day);
              const cellDate = new Date(cell.year, cell.month, cell.day, 12);
              const disabledCell =
                (minDate !== null && cellDate < minDate) || (maxDate !== null && cellDate > maxDate);
              const isSelected = !!selected && iso === toIso(selected.year, selected.month, selected.day);
              const isToday = iso === today;
              return (
                <button
                  key={`${iso}-${cell.inMonth}`}
                  type="button"
                  role="gridcell"
                  aria-label={dayAriaFormatter.format(cellDate)}
                  aria-selected={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  data-outside={!cell.inMonth || undefined}
                  data-today={isToday || undefined}
                  data-selected={isSelected || undefined}
                  disabled={disabledCell}
                  onClick={() => handleSelect(cell.year, cell.month, cell.day)}
                  className="date-picker__cell"
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
          <div className="date-picker__foot">
            <button
              type="button"
              className="date-picker__quick"
              onClick={() => {
                const parts = parseIso(today);
                if (parts) handleSelect(parts.year, parts.month, parts.day);
              }}
            >
              Hoy
            </button>
            {selected ? (
              <button
                type="button"
                className="date-picker__quick date-picker__quick--ghost"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
              >
                Limpiar
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
