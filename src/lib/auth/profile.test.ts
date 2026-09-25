import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeContactEmail, normalizeDisplayName, profileEmail, profileName, saveDisplayName } from "./profile";

describe("display names", () => {
  it("normalizes whitespace and preserves accents", () => {
    expect(normalizeDisplayName("  María   José  ")).toBe("María José");
  });
  it.each(["", "   ", "x".repeat(81), "Ana\u200b", "Ana\u0000"])("rejects invalid names", (name) => {
    expect(() => normalizeDisplayName(name)).toThrow();
  });
  it("asks old accounts to complete their name without using their phone/email", () => {
    expect(profileName({ phone: "3001234567" })).toBe("");
    expect(profileName({ display_name: {} })).toBe("");
    expect(profileName({ display_name: "Ana" })).toBe("Ana");
  });
  it("saves the signed-in user's metadata", async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const client = { auth: { updateUser } } as unknown as SupabaseClient;
    expect(await saveDisplayName(client, " Ana ")).toBe("Ana");
    expect(updateUser).toHaveBeenCalledWith({ data: { display_name: "Ana" } });
  });
  it("keeps a failed profile update retryable", async () => {
    const client = { auth: { updateUser: vi.fn().mockResolvedValue({ error: {} }) } } as unknown as SupabaseClient;
    await expect(saveDisplayName(client, "Ana")).rejects.toThrow("Intenta de nuevo");
  });
});

describe("contact email", () => {
  it("treats an empty value as not provided", () => {
    expect(normalizeContactEmail("   ")).toBe("");
  });
  it("trims and lowercases valid emails", () => {
    expect(normalizeContactEmail("  Ana@Correo.COM ")).toBe("ana@correo.com");
  });
  it.each(["ana", "ana@", "ana@correo", "a b@correo.com", `${"a".repeat(250)}@correo.com`])("rejects invalid emails", (value) => {
    expect(() => normalizeContactEmail(value)).toThrow();
  });
  it("reads the stored contact email", () => {
    expect(profileEmail({ contact_email: "ana@correo.com" })).toBe("ana@correo.com");
    expect(profileEmail({})).toBe("");
  });
});
