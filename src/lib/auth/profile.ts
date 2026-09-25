import type { SupabaseClient } from "@supabase/supabase-js";

export function normalizeDisplayName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || [...name].length > 80 || /[\p{Cc}\p{Cf}]/u.test(name)) {
    throw new Error("Escribe un nombre de entre 1 y 80 caracteres.");
  }
  return name;
}

// Optional contact email. Empty means "not provided"; anything present must be valid.
export function normalizeContactEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email) return "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Escribe un correo válido, por ejemplo nombre@correo.com.");
  }
  return email;
}

export function profileEmail(metadata: Record<string, unknown> | undefined) {
  return typeof metadata?.contact_email === "string" ? metadata.contact_email : "";
}

export function profileName(metadata: Record<string, unknown> | undefined) {
  if (typeof metadata?.display_name !== "string") return "";
  try { return normalizeDisplayName(metadata.display_name); } catch { return ""; }
}

export async function saveDisplayName(client: SupabaseClient, value: string) {
  const displayName = normalizeDisplayName(value);
  const { error } = await client.auth.updateUser({ data: { display_name: displayName } });
  if (error) throw new Error("No pudimos guardar tu nombre. Intenta de nuevo.");
  return displayName;
}

export async function saveContactEmail(client: SupabaseClient, value: string) {
  const email = normalizeContactEmail(value);
  const { error } = await client.auth.updateUser({ data: { contact_email: email } });
  if (error) throw new Error("No pudimos guardar tu correo. Intenta de nuevo.");
  return email;
}
