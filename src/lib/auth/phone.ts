export function normalizePhone(value: string) {
  const cleaned = value.trim().replace(/[\s()-]/g, "");
  const phone = /^3\d{9}$/.test(cleaned) ? "+57" + cleaned : cleaned;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error("Escribe tu celular con indicativo, por ejemplo +57 300 123 4567.");
  }
  return phone;
}

// Trial accounts use an internal email identifier, not SMS verification.
// Provision this address with Supabase Auth's admin API; it cannot receive mail.
export function phoneLoginEmail(value: string) {
  return `${normalizePhone(value).slice(1)}@phone.coquin.invalid`;
}
