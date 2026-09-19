"use client";

import { useEffect, useState } from "react";

/** Global success flash: replays a luminous burst whenever `celebrate()` fires. */
export function SuccessBurst() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    function onCelebrate() {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      setTick((current) => current + 1);
    }
    window.addEventListener("coquin:celebrate", onCelebrate);
    return () => window.removeEventListener("coquin:celebrate", onCelebrate);
  }, []);

  if (tick === 0) return null;

  return (
    <div key={tick} className="success-burst" aria-hidden="true">
      <span className="success-burst__flash" />
      <span className="success-burst__ring" />
      <span className="success-burst__ring success-burst__ring--delayed" />
    </div>
  );
}
