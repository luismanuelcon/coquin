"use client";

import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { pickerAccents } from "@/lib/design-system";
import type { ModuleKey } from "@/lib/types";

type Meridiem = "AM" | "PM";

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  tone?: ModuleKey;
  minuteStep?: number;
  ariaLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  triggerClassName?: string;
  align?: "start" | "end";
};



const ITEM_HEIGHT = 44;

function triggerHaptic() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  navigator.vibrate?.(4);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parse24h(value: string): { hour: number; minute: number } | null {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { hour: h, minute: m };
}

function to24h(hour12: number, minute: number, meridiem: Meridiem): string {
  const h = meridiem === "AM" ? (hour12 === 12 ? 0 : hour12) : hour12 === 12 ? 12 : hour12 + 12;
  return `${pad(h)}:${pad(minute)}`;
}

function to12h(hour24: number): { hour12: number; meridiem: Meridiem } {
  const meridiem: Meridiem = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, meridiem };
}

function formatDisplay(value: string): string | null {
  const parsed = parse24h(value);
  if (!parsed) return null;
  const { hour12, meridiem } = to12h(parsed.hour);
  return `${hour12}:${pad(parsed.minute)} ${meridiem}`;
}

function roundToStep(minute: number, step: number) {
  return Math.min(59, Math.max(0, Math.round(minute / step) * step));
}

type ColumnProps<T> = {
  items: readonly T[];
  index: number;
  onIndexChange: (index: number) => void;
  render: (item: T) => string;
  ariaLabel: string;
};

function WheelColumn<T>({ items, index, onIndexChange, render, ariaLabel }: ColumnProps<T>) {
  const ref = useRef<HTMLUListElement>(null);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targetTop = index * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - targetTop) < 1) return;
    el.scrollTo({ top: targetTop, behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = index * ITEM_HEIGHT;
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        const el = ref.current;
        if (!el) return;
        const nextIndex = Math.round(el.scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(items.length - 1, nextIndex));
        if (clamped !== index) {
          triggerHaptic();
          onIndexChange(clamped);
        } else if (Math.abs(el.scrollTop - clamped * ITEM_HEIGHT) > 1) {
          el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
        }
      }, 90);
    });
  }, [index, items.length, onIndexChange]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onIndexChange(Math.min(items.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      onIndexChange(Math.max(0, index - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      onIndexChange(0);
    } else if (event.key === "End") {
      event.preventDefault();
      onIndexChange(items.length - 1);
    }
  }

  return (
    <ul
      ref={ref}
      className="time-picker__col"
      role="listbox"
      tabIndex={0}
      aria-label={ariaLabel}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, i) => (
        <li
          key={i}
          role="option"
          aria-selected={i === index}
          data-active={i === index || undefined}
          className="time-picker__cell"
          onClick={() => onIndexChange(i)}
        >
          {render(item)}
        </li>
      ))}
    </ul>
  );
}

export function TimePicker({
  value,
  onChange,
  tone = "calendar",
  minuteStep = 5,
  ariaLabel,
  placeholder = "Hora",
  disabled,
  id,
  triggerClassName,
  align = "start",
}: TimePickerProps) {
  const generatedId = useId();
  const buttonId = id ?? `time-picker-${generatedId}`;
  const dialogId = `${buttonId}-dialog`;
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const accent = pickerAccents[tone];

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => {
    const step = Math.max(1, Math.min(30, Math.floor(minuteStep)));
    return Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step).filter((m) => m < 60);
  }, [minuteStep]);
  const meridiems = useMemo<Meridiem[]>(() => ["AM", "PM"], []);

  const parsed = parse24h(value);
  const initial = useMemo(() => {
    if (parsed) {
      const { hour12, meridiem } = to12h(parsed.hour);
      const nearestMinute = roundToStep(parsed.minute, Math.max(1, Math.floor(minuteStep)));
      return {
        hourIndex: hours.indexOf(hour12),
        minuteIndex: Math.max(0, minutes.indexOf(nearestMinute)),
        meridiemIndex: meridiem === "AM" ? 0 : 1,
      };
    }
    return { hourIndex: hours.indexOf(9), minuteIndex: 0, meridiemIndex: 0 };
  }, [parsed, hours, minutes, minuteStep]);

  const [hourIndex, setHourIndex] = useState(initial.hourIndex);
  const [minuteIndex, setMinuteIndex] = useState(initial.minuteIndex);
  const [meridiemIndex, setMeridiemIndex] = useState(initial.meridiemIndex);

  const initialRef = useRef(initial);
  initialRef.current = initial;
  const justOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    justOpenedRef.current = true;
    setHourIndex(initialRef.current.hourIndex);
    setMinuteIndex(initialRef.current.minuteIndex);
    setMeridiemIndex(initialRef.current.meridiemIndex);
  }, [open]);

  // Commit selection live so it survives closing without pressing "Aceptar".
  useEffect(() => {
    if (!open) return;
    if (justOpenedRef.current) {
      justOpenedRef.current = false;
      return;
    }
    const next = to24h(hours[hourIndex], minutes[minuteIndex], meridiems[meridiemIndex]);
    if (next !== value) onChange(next);
  }, [open, hourIndex, minuteIndex, meridiemIndex, hours, minutes, meridiems, value, onChange]);

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
    setFlipUp(spaceBelow < 320 && rect.top > 320);
  }, [open]);

  function commit() {
    const hour12 = hours[hourIndex];
    const minute = minutes[minuteIndex];
    const meridiem = meridiems[meridiemIndex];
    onChange(to24h(hour12, minute, meridiem));
    setOpen(false);
    buttonRef.current?.focus();
  }

  const display = value ? formatDisplay(value) : null;

  return (
    <div ref={containerRef} className="time-picker">
      <button
        ref={buttonRef}
        type="button"
        id={buttonId}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={ariaLabel}
        data-empty={!display || undefined}
        data-open={open || undefined}
        className={triggerClassName}
      >
        <span className="time-picker__label">{display ?? placeholder}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={ariaLabel ?? "Seleccionar hora"}
          id={dialogId}
          className="time-picker__pop"
          data-align={align}
          data-flip={flipUp || undefined}
          style={
            {
              ["--tp-accent" as string]: accent.color,
              ["--tp-accent-soft" as string]: accent.soft,
              ["--tp-on-accent" as string]: accent.onAccent,
            } as React.CSSProperties
          }
        >
          <div className="time-picker__wheels" aria-hidden={false}>
            <div className="time-picker__highlight" aria-hidden="true" />
            <WheelColumn
              items={hours}
              index={hourIndex}
              onIndexChange={setHourIndex}
              render={(h) => String(h)}
              ariaLabel="Hora"
            />
            <span className="time-picker__sep" aria-hidden="true">:</span>
            <WheelColumn
              items={minutes}
              index={minuteIndex}
              onIndexChange={setMinuteIndex}
              render={(m) => pad(m)}
              ariaLabel="Minutos"
            />
            <WheelColumn
              items={meridiems}
              index={meridiemIndex}
              onIndexChange={setMeridiemIndex}
              render={(m) => m}
              ariaLabel="AM o PM"
            />
          </div>
          <div className="time-picker__foot">
            <button type="button" className="time-picker__quick" onClick={commit}>
              Listo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
