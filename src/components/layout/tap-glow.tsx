"use client";

import { useEffect } from "react";

/** Global tap ripple: spawns a luminous burst at each pointer press. */
export function TapGlow() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const layer = document.createElement("div");
    layer.className = "tap-glow-layer";
    document.body.appendChild(layer);

    function onPointerDown(event: PointerEvent) {
      const dot = document.createElement("span");
      dot.className = "tap-glow";
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      layer.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove(), { once: true });
    }

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      layer.remove();
    };
  }, []);

  return null;
}
