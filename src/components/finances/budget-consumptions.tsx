"use client";
import { useState, type FormEvent } from "react";
import { MoneyInput } from "@/components/ui/money-input";
import { DatePicker } from "@/components/ui/date-picker";
import { getColombiaTodayIso } from "@/lib/date";
import { summarizeBudgetItem } from "@/lib/modules/finances";
import type { FinanceBudgetItem, FinanceConsumption } from "@/lib/types";

const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const formatDate = (value: string) => new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
const input = "h-10 w-full rounded-xl bg-surface-container-lowest px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary";
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
  return <div className="rounded-b-2xl bg-surface-container px-3 pb-3 pt-0.5">
    <p className="text-xs font-bold text-secondary">Reservado: {money(totals.remaining)}{totals.excess ? ` · Excedido: ${money(totals.excess)}` : ""}</p>
    {item.consumptions?.map(entry => <div key={entry.id} className="mt-2 flex items-center gap-2 rounded-xl bg-surface-container-lowest px-3 py-2">
      <p className="min-w-0 flex-1 break-words text-xs">{formatDate(entry.date)} · {money(entry.amount)}{entry.note ? ` · ${entry.note}` : ""}</p>
      <button type="button" disabled={busy} className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-primary hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50" onClick={() => { setEditing(entry.id); setDate(entry.date); setAmount(String(entry.amount)); setNote(entry.note ?? ""); setMessage(""); setError(false); }}>Editar</button><button type="button" disabled={busy} className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-primary hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50" onClick={() => { if (window.confirm("¿Eliminar este consumo? El saldo reservado se recalculará.")) void save(item.consumptions!.filter(e => e.id !== entry.id)); }}>Eliminar</button>
    </div>)}
    <form className="mt-3" onSubmit={submit}><fieldset disabled={busy} className="flex min-w-0 flex-col gap-2">
      <legend className="mb-1 text-xs font-bold">{editing ? "Editar consumo" : "Registrar consumo"}</legend>
      <div className="flex gap-2">
        <div className="field flex-1"><span>Fecha</span><DatePicker value={date} onChange={setDate} tone="finances" ariaLabel={`Fecha de consumo de ${item.concept}`} triggerClassName={`${input} text-left`} /></div>
        <label className="field flex-1"><span>Valor (COP)</span><MoneyInput value={amount} onChange={setAmount} className={input} /></label>
      </div>
      <label className="field"><span>Detalle (opcional)</span><input value={note} onChange={e => setNote(e.target.value)} className={input} /></label>
      <button className="cta-pill !h-11 !text-sm" type="submit">{busy ? "Guardando…" : editing ? "Guardar consumo" : "Agregar consumo"}</button>
      {editing ? <button type="button" className="cta-ghost !h-10" onClick={() => { setEditing(null); setAmount(""); setNote(""); setDate(getColombiaTodayIso()); setMessage(""); setError(false); }}>Cancelar edición</button> : null}
    </fieldset></form>
    {message ? <p role={error ? "alert" : "status"} className={`mt-2 text-xs ${error ? "text-error" : "text-secondary"}`}>{message}</p> : null}
  </div>;
}
