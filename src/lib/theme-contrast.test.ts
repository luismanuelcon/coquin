import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
function tokens(selector: string) {
  const body = css.slice(css.indexOf(selector)).split("}")[0];
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*(#[a-f\d]{6});/gi)].map((m) => [m[1], m[2]]));
}
function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map((v) => {
    const s = parseInt(v, 16) / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
for (const theme of ["dark", "light"]) {
  const values = { ...tokens("@theme {"), ...tokens(":root {"), ...(theme === "light" ? tokens('html[data-theme="light"] {') : {}) };
  describe(`${theme} theme contrast`, () => {
    for (const fg of ["--text", "--text-soft", "--primary", "--secondary", "--tertiary", "--color-error", "--tone-home", "--tone-calendar", "--tone-finances", "--tone-market", "--tone-tasks"]) {
      for (const bg of ["--surface", "--surface-lowest", "--surface-low", "--surface-container", "--surface-high", "--surface-highest"]) {
        it(`${fg} remains readable on ${bg}`, () => {
          expect(contrast(values[fg], values[bg])).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
    for (const tone of ["home", "calendar", "finances", "market", "tasks"]) {
      it(`${tone} picker selected value remains readable`, () => {
        expect(contrast(values[`--tone-${tone}`], values["--primary-ink"])).toBeGreaterThanOrEqual(4.5);
      });
    }
    it("keyboard focus is visible", () => {
      expect(contrast(values["--focus-halo"], values["--surface"])).toBeGreaterThanOrEqual(3);
    });
  });
}
