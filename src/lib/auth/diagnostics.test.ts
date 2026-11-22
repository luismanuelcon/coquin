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
