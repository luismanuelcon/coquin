import { describe, expect, it } from "vitest";
import { formatCopInput, toCopDigits } from "./money";

describe("money formatting", () => {
  it("keeps only digits and drops leading zeros", () => {
    expect(toCopDigits("$1.240.000")).toBe("1240000");
    expect(toCopDigits("00123")).toBe("123");
    expect(toCopDigits("abc")).toBe("");
    expect(toCopDigits(50000)).toBe("50000");
  });

  it("groups thousands with dots for Colombian pesos", () => {
    expect(formatCopInput("1240000")).toBe("1.240.000");
    expect(formatCopInput("999")).toBe("999");
    expect(formatCopInput("1000")).toBe("1.000");
    expect(formatCopInput("")).toBe("");
    expect(formatCopInput("0")).toBe("0");
  });

  it("formats progressively as digits are typed", () => {
    expect(formatCopInput("1")).toBe("1");
    expect(formatCopInput("12")).toBe("12");
    expect(formatCopInput("123")).toBe("123");
    expect(formatCopInput("1234")).toBe("1.234");
    expect(formatCopInput("12345")).toBe("12.345");
    expect(formatCopInput("123456")).toBe("123.456");
    expect(formatCopInput("1234567")).toBe("1.234.567");
  });
});
