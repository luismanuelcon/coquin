"use client";
import { useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { MoneyInput } from "@/components/ui/money-input";
import { DatePicker } from "@/components/ui/date-picker";
import { getColombiaTodayIso } from "@/lib/date";
import { summarizeBudgetItem } from "@/lib/modules/finances";
import type { FinanceBudgetItem, FinanceConsumption } from "@/lib/types";

const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const formatDate = (value: string) => new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
const input = "h-11 w-full rounded-xl bg-surface-container-lowest px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary";
export function BudgetConsumptions({ item, onSave }: { item: FinanceBudgetItem; onSave: (entries: FinanceConsumption[]) => Promise<boolean> }) {
  const [date, setDate] = useState(getColombiaTodayIso);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const totals = summarizeBudgetItem(item);
  async function save(entries: FinanceConsumption[]) {
    if (busy) return;
    setBusy(true); setMessage(""); setError(false);
    try {
      if (!(await onSave(entries))) { setError(true); setMessage("No se pudo guardar. Inténtalo de nuevo."); return; }
      setAmount(""); setNote(""); setDate(getColombiaTodayIso()); setEditing(null); setMessage("Consumos actualizados.");
    } catch { setError(true); setMessage("No se pudo guardar. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!date || !Number.isSafeInteger(value) || value <= 0 || value > 1e12) { setError(true); setMessage("Selecciona una fecha y un valor entero mayor a cero."); return; }
    if (item.consumptions === undefined && item.status === "paid" && !window.confirm("Este gasto figura como pagado. Al registrar consumos, el dinero pagado se calculará únicamente con estos movimientos. ¿Continuar?")) return;
    const entry = { id: editing ?? crypto.randomUUID(), date, amount: value, note: note.trim() || undefined };
    void save(editing ? (item.consumptions ?? []).map(e => e.id === editing ? entry : e) : [...(item.consumptions ?? []), entry]);
  }
  return <details className="group/consumptions rounded-b-2xl bg-surface-container px-4 pb-4">
    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl py-3 text-sm font-bold text-secondary focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
      <span><span className="group-open/consumptions:hidden">Ver consumos</span><span className="hidden group-open/consumptions:inline">Ocultar consumos</span><span className="mt-1 block text-xs font-medium text-on-surface-variant">Reservado: {money(totals.remaining)}{totals.excess ? ` · Excedido: ${money(totals.excess)}` : ""}</span></span>
      <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform motion-reduce:transition-none group-open/consumptions:rotate-180" />
    </summary>
    <p className="text-xs text-on-surface-variant">Presupuesto: {money(item.amount)} · Consumido / pagado: {money(totals.consumed)}</p>
    <p className="mt-2 text-xs text-on-surface-variant">El restante está reservado dentro de tus gastos. Los consumos no se suman otra vez; si excedes el presupuesto, el excedente reduce tu disponible.</p>
    {item.consumptions?.map(entry => <div key={entry.id} className="mt-3 rounded-xl bg-surface-container-lowest p-3">
      <p className="break-words text-sm">{formatDate(entry.date)} · {money(entry.amount)}{entry.note ? ` · ${entry.note}` : ""}</p>
      <div className="flex gap-3"><button type="button" disabled={busy} className="min-h-11 rounded-lg px-3 text-sm font-bold text-primary hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50" onClick={() => { setEditing(entry.id); setDate(entry.date); setAmount(String(entry.amount)); setNote(entry.note ?? ""); setMessage(""); setError(false); }}>Editar</button><button type="button" disabled={busy} className="min-h-11 rounded-lg px-3 text-sm font-bold text-primary hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50" onClick={() => { if (window.confirm("¿Eliminar este consumo? El saldo reservado se recalculará.")) void save(item.consumptions!.filter(e => e.id !== entry.id)); }}>Eliminar</button></div>
    </div>)}
    {!item.consumptions?.length ? <p className="mt-2 text-xs text-on-surface-variant">Sin consumos detallados.</p> : null}
    <form className="mt-3" onSubmit={submit}><fieldset disabled={busy} className="flex min-w-0 flex-col gap-3">
      <legend className="mb-2 text-sm font-bold">{editing ? "Editar consumo" : "Registrar consumo"}</legend>
      <div className="field"><span>Fecha del consumo</span><DatePicker value={date} onChange={setDate} tone="finances" ariaLabel={`Fecha de consumo de ${item.concept}`} triggerClassName={`${input} text-left`} /></div>
      <label className="field"><span>Valor (COP)</span><MoneyInput value={amount} onChange={setAmount} className={input} /></label>
      <label className="field"><span>Detalle (opcional)</span><input value={note} onChange={e => setNote(e.target.value)} className={input} /></label>
      <button className="cta-pill" type="submit">{busy ? "Guardando…" : editing ? "Guardar consumo" : "Agregar consumo"}</button>
      {editing ? <button type="button" className="cta-ghost" onClick={() => { setEditing(null); setAmount(""); setNote(""); setDate(getColombiaTodayIso()); setMessage(""); setError(false); }}>Cancelar edición</button> : null}
    </fieldset></form>
    {message ? <p role={error ? "alert" : "status"} className={`mt-3 text-sm ${error ? "text-error" : "text-secondary"}`}>{message}</p> : null}
  </details>;
}
