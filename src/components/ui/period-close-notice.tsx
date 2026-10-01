"use client";
import { useEffect, useState } from "react";
import { getColombiaTodayIso } from "@/lib/date";

export function PeriodCloseNotice({ moduleName, endDate, onClose }: { moduleName: string; endDate: string; onClose: () => Promise<boolean> }) {
  const [today, setToday] = useState(getColombiaTodayIso);
  const [later, setLater] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => setToday(getColombiaTodayIso());
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  if (today <= endDate) return null;
  const label = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${endDate}T12:00:00Z`));
  return <section className="card-surface" aria-busy={busy} aria-label={`Cierre pendiente de ${moduleName}`}>
    <h2 className="section-title">{later ? "Período abierto para completar" : "¿Quieres cerrar el período?"}</h2>
    <p className="mt-2 text-sm text-on-surface-variant">El período de {moduleName} terminó el {label}. Puedes registrar lo que falta antes de cerrarlo. Al cerrar, se guarda el historial y comienza el siguiente período.</p>
    <div className="mt-3 flex flex-col gap-2">
      <button type="button" className="cta-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" disabled={busy} onClick={async () => {
        if (!window.confirm(`¿Cerrar el período de ${moduleName} que terminó el ${label}? Revisa que hayas guardado los registros pendientes. El historial se conservará.`)) return;
        setBusy(true); setError("");
        try { if (!(await onClose())) setError("No se pudo cerrar el período. Inténtalo de nuevo."); }
        catch { setError("No se pudo cerrar el período. Inténtalo de nuevo."); }
        finally { setBusy(false); }
      }}>{busy ? "Cerrando…" : "Cerrar período"}</button>
      {!later ? <button type="button" disabled={busy} className="cta-ghost focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => setLater(true)}>Seguir registrando</button> : null}
    </div>
    {error ? <p role="alert" className="mt-2 text-sm text-error">{error}</p> : null}
  </section>;
}
