/** Strips everything but digits and removes leading zeros (keeps a lone "0" empty). */
export function toCopDigits(value: string | number): string {
  return String(value)
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "");
}

/** Formats a raw digit string into Colombian peso grouping, e.g. "1240000" -> "1.240.000". */
export function formatCopInput(value: string | number): string {
  const digits = toCopDigits(value);
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
