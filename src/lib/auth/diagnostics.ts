/** Only allow operational fields: never pass auth objects or provider messages. */
export function logAuthEvent(event: string, details: { status?: number; authenticated?: boolean; hasSession?: boolean } = {}) {
  console.info("[Coquin Auth]", {
    event,
    timestamp: new Date().toISOString(),
    ...(typeof details.status === "number" ? { status: details.status } : {}),
    ...(typeof details.authenticated === "boolean" ? { authenticated: details.authenticated } : {}),
    ...(typeof details.hasSession === "boolean" ? { hasSession: details.hasSession } : {}),
  });
}
