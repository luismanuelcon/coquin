"use client";

import { useEffect, useState } from "react";
import { ChevronDown, History } from "lucide-react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { useAppData } from "@/components/data/data-provider";
import { calculateFinancePeriodSummary, summarizeBudgetItem } from "@/lib/modules/finances";
import { getMarketCategoryTotals } from "@/lib/modules/market";

const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
function Metric({ label, value }: { label: string; value: number }) {
  return <div className="min-w-0 rounded-xl bg-surface-container-lowest p-3"><p className="text-xs text-on-surface-variant">{label}</p><p className="mt-1 break-words text-sm font-bold tabular-nums">{money(value)}</p></div>;
}
export default function HistoryPage() {
  const { data } = useAppData();
  const [module, setModule] = useState<"finances" | "market">("finances");
  useEffect(() => {
    const syncModule = () => setModule(new URLSearchParams(window.location.search).get("module") === "market" ? "market" : "finances");
    syncModule();
    window.addEventListener("popstate", syncModule);
    return () => window.removeEventListener("popstate", syncModule);
  }, []);
  function selectModule(value: "finances" | "market") {
    setModule(value);
    const url = new URL(window.location.href);
    url.searchParams.set("module", value);
    window.history.replaceState(window.history.state, "", url);
  }
  const active = data.finances.periods.find(p => p.id === data.finances.activePeriodId);
  const finances = data.finances.periods.filter(p => active && p.startDate < active.startDate).sort((a, b) => b.startDate.localeCompare(a.startDate));
  const market = [...(data.market.history ?? [])].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const rows = module === "finances" ? finances.map(p => ({ ...p, total: calculateFinancePeriodSummary(p).totalPayments })) : market.map(p => ({ ...p, total: p.purchases.reduce((sum, purchase) => sum + purchase.amount, 0) }));
  const total = rows.reduce((sum, p) => sum + p.total, 0);
  return <AppChrome><div className="page-stack">
    <PageHeading tone="home" eyebrow="Tu historial" title="Históricos" subtitle="Revisa tus períodos cerrados y compara sus resultados" badge="Períodos guardados" />
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Módulo del historial">
      {([ ["finances", "Finanzas"], ["market", "Mercado"] ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={module === value} className={`min-h-11 rounded-2xl px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-primary ${module === value ? "bg-surface-container-high text-secondary" : "bg-surface-container text-on-surface-variant"}`} onClick={() => selectModule(value)}>{label}</button>)}
    </div>
    <section className="card-elevated" aria-label="Resumen histórico">
      <div className="flex items-center gap-2"><History size={18} className="text-secondary" aria-hidden="true" /><h2 className="section-title">{rows.length} {rows.length === 1 ? "período cerrado" : "períodos cerrados"}</h2></div>
      <p className="mt-2 text-xs text-on-surface-variant">{module === "finances" ? "Compromisos y gastos varios registrados al cierre; incluye pagos pendientes." : "Compras registradas al cierre de cada período."}</p>
      <div className="mt-3 grid grid-cols-2 gap-2"><Metric label={module === "finances" ? "Total comprometido" : "Total comprado"} value={total} /><Metric label="Promedio por período" value={rows.length ? total / rows.length : 0} /></div>
      {rows.length > 1 ? <p className="mt-3 text-sm text-on-surface-variant">Último período: {money(Math.abs(rows[0].total - rows[1].total))} {rows[0].total >= rows[1].total ? "más" : "menos"} que el anterior. Los períodos pueden tener distinta duración.</p> : null}
    </section>
    <p className="text-xs text-on-surface-variant">Expande un período para ver el detalle. El período abierto aparece en su módulo y se guarda aquí al cerrarlo.</p>
    {!rows.length ? <section className="card-surface"><h2 className="section-title">Aún no hay períodos cerrados</h2><p className="mt-2 text-sm text-on-surface-variant">Cuando confirmes un cierre en {module === "finances" ? "Finanzas" : "Mercado"}, podrás consultar aquí su resumen y sus registros.</p></section> : null}
    {module === "finances" ? finances.map(period => {
      const summary = calculateFinancePeriodSummary(period);
      return <details key={period.id} className="card-surface group">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-primary">
          <div className="flex min-h-11 items-center justify-between gap-2"><h2 className="text-sm font-bold">{date(period.startDate)} – {date(period.endDate)}</h2><ChevronDown size={18} className="shrink-0 text-secondary transition-transform motion-reduce:transition-none group-open:rotate-180" aria-hidden="true" /></div>
          <div className="grid grid-cols-2 gap-2"><Metric label="Ingresos" value={summary.base} /><Metric label="Disponible al cierre" value={summary.available} /></div>
          <p className="mt-2 text-xs text-on-surface-variant">{period.incomes.length} ingresos · {period.items.length} gastos mensuales · {period.miscExpenses.length} gastos varios · <span className="group-open:hidden">Ver detalle</span><span className="hidden group-open:inline">Ocultar detalle</span></p>
        </summary>
        <div className="mt-4 space-y-4 border-t border-surface-container-high pt-4">
          <div className="grid grid-cols-2 gap-2"><Metric label="Comprometido" value={summary.totalPayments} /><Metric label="Pendiente al cierre" value={summary.pending} /></div>
          <section><h3 className="font-bold text-secondary">Ingresos</h3>{period.incomes.length ? period.incomes.map(i => <p key={i.id} className="mt-2 break-words text-sm">{i.date ? date(i.date) : "Sin fecha"} · {i.concept} · {money(i.amount)}{i.note ? ` · ${i.note}` : ""}</p>) : <p className="text-sm">Sin ingresos registrados.</p>}</section>
          <section><h3 className="font-bold text-secondary">Gastos mensuales</h3>{period.items.length ? period.items.map(i => <p key={i.id} className="mt-2 break-words text-sm">{i.concept} · {money(i.amount)} · {i.consumptions !== undefined ? `Consumido: ${money(summarizeBudgetItem(i).consumed)} · Reservado: ${money(summarizeBudgetItem(i).remaining)}` : i.status === "paid" ? "Pagado" : "Pendiente"} · {i.fixed ? "Recurrente" : "Ocasional"}{i.note ? ` · ${i.note}` : ""}{i.consumptions?.map(entry => <span key={entry.id} className="mt-1 block pl-3 text-on-surface-variant">{date(entry.date)} · {money(entry.amount)}{entry.note ? ` · ${entry.note}` : ""}</span>)}</p>) : <p className="text-sm">Sin gastos mensuales registrados.</p>}</section>
          <section><h3 className="font-bold text-secondary">Gastos varios</h3>{period.miscExpenses.length ? period.miscExpenses.map(i => <p key={i.id} className="mt-2 break-words text-sm">{date(i.date)} · {i.concept} · {i.category || "Otros"} · {money(i.amount)}{i.weekend ? " · Fin de semana" : ""}{i.owed ? " · Me deben" : ""}{i.note ? ` · ${i.note}` : ""}</p>) : <p className="text-sm">Sin gastos varios.</p>}</section>
        </div>
      </details>;
    }) : market.map(period => {
      const spent = period.purchases.reduce((sum, p) => sum + p.amount, 0);
      return <details key={period.id} className="card-surface group">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-primary">
          <div className="flex min-h-11 items-center justify-between gap-2"><h2 className="text-sm font-bold">{date(period.startDate)} – {date(period.endDate)}</h2><ChevronDown size={18} className="shrink-0 text-secondary transition-transform motion-reduce:transition-none group-open:rotate-180" aria-hidden="true" /></div>
          <div className="grid grid-cols-2 gap-2"><Metric label="Comprado" value={spent} /><Metric label="Saldo del presupuesto" value={period.budget - spent} /></div>
          <p className="mt-2 text-xs text-on-surface-variant">{period.purchases.length} compras · <span className="group-open:hidden">Ver detalle</span><span className="hidden group-open:inline">Ocultar detalle</span></p>
        </summary>
        <div className="mt-4 space-y-4 border-t border-surface-container-high pt-4"><Metric label="Presupuesto del período" value={period.budget} />
          <section><h3 className="font-bold text-secondary">Por categoría</h3>{getMarketCategoryTotals(period.purchases).map(c => <p key={c.category} className="mt-2 text-sm">{c.category} · {money(c.total)}</p>)}</section>
          <section><h3 className="font-bold text-secondary">Compras</h3>{period.purchases.length ? period.purchases.map(p => <p key={p.id} className="mt-2 break-words text-sm">{date(p.date)} · {p.detail} · {p.category} · {money(p.amount)}</p>) : <p className="text-sm">Sin compras registradas.</p>}</section>
        </div>
      </details>;
    })}
  </div></AppChrome>;
}
