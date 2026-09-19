/** Fires a global success celebration used by the SuccessBurst overlay. */
export function celebrate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("coquin:celebrate"));
}
