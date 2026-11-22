import { logAuthEvent } from "./diagnostics";
/** Confirm that navigation will see the same authenticated cookie session. */
export async function confirmServerSession() {
  logAuthEvent("server-session.check.start");
  const response = await fetch("/api/auth/session", {
    credentials: "same-origin",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  logAuthEvent("server-session.check.result", { status: response.status, authenticated: response.ok });
  if (!response.ok) {
    throw new Error(response.status === 401
      ? "Tu acceso fue aceptado, pero el servidor no reconoció la sesión. Verifica que el navegador permita cookies para este sitio e intenta de nuevo. Si persiste, contacta al administrador."
      : "No pudimos comprobar la sesión con el servidor. Intenta de nuevo en unos momentos.");
  }
}
