import { useEffect } from "react";

export function useScrollIntoViewOnOpen(open: boolean, elementId: string) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(elementId);

      if (!element) {
        return;
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [elementId, open]);
}
