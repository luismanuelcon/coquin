import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getVerifiedUser } from "./verified-user";
function mock() {
  const auth = { getUser: vi.fn(), getSession: vi.fn(), refreshSession: vi.fn() };
  return { auth, client: { auth } as unknown as SupabaseClient };
}
describe("verified user recovery", () => {
  it("returns only a verified user", async () => {
    const { auth, client } = mock();
    auth.getUser.mockResolvedValue({ data: { user: { id: "user" } }, error: null });
    expect(await getVerifiedUser(client)).toEqual({ id: "user" });
    expect(auth.refreshSession).not.toHaveBeenCalled();
  });
  it("refreshes stale credentials and verifies again", async () => {
    const { auth, client } = mock();
    auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: { status: 401 } }).mockResolvedValueOnce({ data: { user: { id: "user" } }, error: null });
    auth.getSession.mockResolvedValue({ data: { session: {} } });
    auth.refreshSession.mockResolvedValue({ data: { session: {} }, error: null });
    expect(await getVerifiedUser(client)).toEqual({ id: "user" });
    expect(auth.getUser).toHaveBeenCalledTimes(2);
  });
  it("does not treat a stored session as verified after failed refresh", async () => {
    const { auth, client } = mock();
    auth.getUser.mockResolvedValue({ data: { user: null }, error: { status: 401 } });
    auth.getSession.mockResolvedValue({ data: { session: {} } });
    auth.refreshSession.mockResolvedValue({ data: { session: null }, error: {} });
    await expect(getVerifiedUser(client)).rejects.toThrow("validar tu sesión");
  });
  it("keeps a network failure recoverable without repeated token refresh", async () => {
    const { auth, client } = mock();
    auth.getUser.mockResolvedValue({ data: { user: null }, error: { status: 503 } });
    await expect(getVerifiedUser(client)).rejects.toThrow("servicio de autenticación");
    expect(auth.refreshSession).not.toHaveBeenCalled();
  });
});
