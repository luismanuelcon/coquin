import { logAuthEvent } from "./diagnostics";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Recover an expired/stale access token once, then verify it with Auth again. */
export async function getVerifiedUser(client: SupabaseClient) {
  logAuthEvent("browser.verify.start");
  let result = await client.auth.getUser();
  logAuthEvent("browser.verify.result", { authenticated: !result.error && Boolean(result.data.user), status: result.error?.status });
  if (!result.error && result.data.user) return result.data.user;
  const recoverable = !result.error || result.error.status === 401 || result.error.status === 403 || result.error.name === "AuthSessionMissingError";
  if (recoverable) {
    const { data } = await client.auth.getSession();
    logAuthEvent("browser.session.loaded", { hasSession: Boolean(data.session) });
    if (data.session) {
      logAuthEvent("browser.refresh.start");
      const refreshed = await client.auth.refreshSession();
      logAuthEvent("browser.refresh.result", { hasSession: Boolean(refreshed.data.session), status: refreshed.error?.status });
      if (!refreshed.error && refreshed.data.session) {
        result = await client.auth.getUser();
        logAuthEvent("browser.reverify.result", { authenticated: !result.error && Boolean(result.data.user), status: result.error?.status });
        if (!result.error && result.data.user) return result.data.user;
      }
    }
  }
  // No account data is loaded until the Auth server has verified the user.
  logAuthEvent("browser.verify.failed");
  throw new Error(recoverable
    ? "No pudimos validar tu sesión después de ingresar. Puedes reintentar o volver a iniciar sesión. No se han modificado tus datos."
    : "No pudimos contactar al servicio de autenticación. Revisa la conexión y pulsa Reintentar.");
}
