import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { joinRegisteredFamily, registerAccount } from "./registration";

function clientStub(session: object | null = { access_token: "test" }, error: object | null = null) {
  const signUp = vi.fn().mockResolvedValue({ data: { session }, error });
  const signInWithPassword = vi.fn();
  const rpc = vi.fn().mockResolvedValue({ error: null });
  const client = { auth: { signUp, signInWithPassword }, rpc } as unknown as SupabaseClient;
  return { client, signUp, signInWithPassword, rpc };
}

describe("registration and optional family membership", () => {
  it("uses the signup session without a second login or creating a household", async () => {
    const { client, signInWithPassword, rpc } = clientStub();
    await registerAccount(client, "phone@example.invalid", "password123");
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not treat an unconfirmed signup as an active account", async () => {
    const { client } = clientStub(null);
    await expect(registerAccount(client, "phone@example.invalid", "password123")).rejects.toThrow("activar");
  });

  it("reports rejected signups without proceeding", async () => {
    const { client } = clientStub(null, { message: "User already registered" });
    await expect(registerAccount(client, "phone@example.invalid", "password123")).rejects.toThrow("selecciona Entrar");
  });

  it("allows correcting a rejected family code without registering again", async () => {
    const { client, signUp, rpc } = clientStub();
    await registerAccount(client, "phone@example.invalid", "password123");
    rpc.mockResolvedValueOnce({ error: { message: "INVALID_CODE" } });
    await expect(joinRegisteredFamily(client, "AAAAAAAA")).rejects.toThrow("Tu cuenta está creada");
    await joinRegisteredFamily(client, "K9F4QM7P");
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenLastCalledWith("join_household", { code: "K9F4QM7P" });
  });

  it("recovers when a previous join succeeded but its response was lost", async () => {
    const { client, rpc } = clientStub();
    rpc.mockResolvedValue({ error: { message: "HOUSEHOLD_EXISTS" } });
    await expect(joinRegisteredFamily(client, "K9F4QM7P")).resolves.toBeUndefined();
  });

  it("keeps connection failures retryable", async () => {
    const { client, rpc } = clientStub();
    rpc.mockResolvedValue({ error: { message: "Failed to fetch" } });
    await expect(joinRegisteredFamily(client, "K9F4QM7P")).rejects.toThrow("Reintenta");
  });
});
