import { afterEach, describe, expect, it, vi } from "vitest";
import { confirmServerSession } from "./server-session";
afterEach(() => vi.unstubAllGlobals());
describe("server session confirmation", () => {
  it("sends cookies and disables caching before navigation", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    await expect(confirmServerSession()).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("/api/auth/session", expect.objectContaining({ credentials: "same-origin", cache: "no-store" }));
  });
  it("explains a cookie/session mismatch instead of redirecting silently", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(confirmServerSession()).rejects.toThrow("servidor no reconoció");
  });
  it("distinguishes service outages from a missing session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(confirmServerSession()).rejects.toThrow("Intenta de nuevo");
  });
});
