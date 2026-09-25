import type { SupabaseClient } from "@supabase/supabase-js";

export async function registerAccount(client: SupabaseClient, email: string, password: string) {
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) {
    throw new Error("No pudimos crear la cuenta. Si ya registraste este celular, selecciona Entrar.");
  }
  // Internal phone identifiers cannot receive confirmation emails.
  if (!data.session) {
    throw new Error("No pudimos activar el acceso a tu cuenta. Contacta al administrador. Si ya tienes una cuenta activa, selecciona Entrar.");
  }
}

export async function joinRegisteredFamily(client: SupabaseClient, code: string) {
  const { error } = await client.rpc("join_household", { code });
  // A previous request may have succeeded even if its response was lost.
  if (!error || error.message.includes("HOUSEHOLD_EXISTS")) return;
  throw new Error(error.message.includes("INVALID_CODE")
    ? "Tu cuenta está creada, pero el código no es válido. Verifícalo con tu familia y vuelve a intentar, o continúa sin código."
    : "Tu cuenta está creada, pero no pudimos confirmar la unión a tu familia. Reintenta o continúa para revisar tu hogar.");
}
