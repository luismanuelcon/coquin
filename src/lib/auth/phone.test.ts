import { describe, expect, it } from "vitest";
import { normalizePhone, phoneLoginEmail } from "./phone";

describe("trial phone login", () => {
  it("resolves Colombian local and international formatting to the same account", () => {
    expect(phoneLoginEmail("300 123 4567")).toBe(phoneLoginEmail("+57 (300) 123-4567"));
    expect(phoneLoginEmail("3001234567")).toBe("573001234567@phone.coquin.invalid");
  });
  it("preserves other international country codes", () => {
    expect(normalizePhone("+1 202 555 0100")).toBe("+12025550100");
  });
  it.each(["", "123", "3001234567@example.com", "+00 3001234567"])("rejects invalid identifier %s", value => {
    expect(() => phoneLoginEmail(value)).toThrow();
  });
});
