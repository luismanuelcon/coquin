import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseConfig } from "./config";

afterEach(() => vi.unstubAllEnvs());

describe("Supabase configuration", () => {
  it("requires both environment variables before creating a client", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(() => getSupabaseConfig()).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });

  it("uses the configured project and public key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(getSupabaseConfig()).toEqual({ url: "https://example.supabase.co", key: "sb_publishable_test" });
  });
});
