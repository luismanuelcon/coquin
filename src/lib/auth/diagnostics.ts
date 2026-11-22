const safeCodes = new Set(["session_not_found", "session_expired", "refresh_token_not_found", "refresh_token_already_used", "user_not_found", "user_banned", "bad_jwt", "invalid_credentials", "over_request_rate_limit", "unexpected_failure"]);
/** Only allow operational fields: never pass auth objects or provider messages. */
export function logAuthEvent(event: string, details: { code?: string; status?: number; authenticated?: boolean; hasSession?: boolean } = {}) {
  console.info("[Coquin Auth]", {
    event,
    timestamp: new Date().toISOString(),
    ...(details.code ? { code: safeCodes.has(details.code) ? details.code : "other_auth_error" } : {}),
    ...(typeof details.status === "number" ? { status: details.status } : {}),
    ...(typeof details.authenticated === "boolean" ? { authenticated: details.authenticated } : {}),
    ...(typeof details.hasSession === "boolean" ? { hasSession: details.hasSession } : {}),
  });
}
