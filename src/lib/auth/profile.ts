import type { SupabaseClient } from "@supabase/supabase-js";

export function normalizeDisplayName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || [...name].length > 80 || /[\p{Cc}\p{Cf}]/u.test(name)) {
    throw new Error("Escribe un nombre de entre 1 y 80 caracteres.");
  }
  return name;
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
