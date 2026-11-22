import { expect, it, vi } from "vitest";
import { logAuthEvent } from "./diagnostics";
it("logs only allowlisted operational fields", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});
  try {
    const details = { status: 401, authenticated: false, access_token: "secret", password: "secret", email: "private" };
    logAuthEvent("test.failure", details);
    expect(info).toHaveBeenCalledWith("[Coquin Auth]", { event: "test.failure", timestamp: expect.any(String), status: 401, authenticated: false });
    expect(JSON.stringify(info.mock.calls)).not.toContain("secret");
  } finally { info.mockRestore(); }
});
it("exposes known error codes and redacts unexpected strings", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});
  try {
    logAuthEvent("test", { code: "refresh_token_not_found" });
    expect(info.mock.calls[0][1]).toMatchObject({ code: "refresh_token_not_found" });
    logAuthEvent("test", { code: "private-provider-content" });
    expect(info.mock.calls[1][1]).toMatchObject({ code: "other_auth_error" });
    expect(JSON.stringify(info.mock.calls)).not.toContain("private-provider-content");
  } finally { info.mockRestore(); }
});
