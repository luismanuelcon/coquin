"use client";

import { formatCopInput, toCopDigits } from "@/lib/money";

type MoneyInputProps = {
  /** Raw digit string, e.g. "1240000". */
  value: string;
  /** Called with the raw digit string (no separators). */
  onChange: (rawDigits: string) => void;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
};

export function MoneyInput({
  value,
  onChange,
  className,
  ariaLabel,
  placeholder = "0",
  id,
  disabled,
}: MoneyInputProps) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={formatCopInput(value)}
      onChange={(event) => onChange(toCopDigits(event.target.value))}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      className={className}
    />
  );
}
