"use client";

import { useRef, useState, type FormEvent } from "react";
import { Banknote, CheckCircle2, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { getColombiaTodayIso } from "@/lib/date";
import { MoneyInput } from "@/components/ui/money-input";
import type { FinanceIncome } from "@/lib/types";

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const input = "h-11 w-full min-w-0 rounded-xl bg-surface-container-lowest px-3 text-base text-on-surface focus-visible:outline-2 focus-visible:outline-primary";
const action = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";
const empty = () => ({ concept: "", amount: "", note: "", date: getColombiaTodayIso() });
const dateFormatter = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function FinanceIncomes({ incomes, onSave }: {
  incomes: FinanceIncome[];
  onSave: (incomes: FinanceIncome[]) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const total = incomes.reduce((sum, income) => sum + income.amount, 0);

  function close() {
    setOpen(false);
    setEditingId(null);
    setDraft(empty);
    setError("");
    addButton.current?.focus();
  }

  async function save(next: FinanceIncome[], success: string) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!(await onSave(next))) {
        setError("No se pudo guardar. Tus cambios siguen aquí; inténtalo de nuevo.");
        return;
      }
      close();
      setMessage(success);
    } catch {
      setError("No se pudo guardar. Tus cambios siguen aquí; inténtalo de nuevo.");
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(draft.amount);
    if (!draft.date) {
      setError("Selecciona la fecha del ingreso.");
      return;
    }
    if (!draft.concept.trim() || !Number.isSafeInteger(amount) || amount <= 0) {
      setError("Escribe un concepto y un valor en COP mayor a cero, sin decimales.");
      return;
    }
    const income: FinanceIncome = { id: editingId ?? `income-${crypto.randomUUID()}`, concept: draft.concept.trim(), date: draft.date, amount, note: draft.note.trim() || undefined };
    void save(editingId ? incomes.map((item) => item.id === editingId ? income : item) : [...incomes, income], editingId ? "Ingreso actualizado." : "Ingreso agregado.");
  }

  return (
    <section className={`card-surface p-4${expanded && open ? " overflow-visible" : ""}`} aria-labelledby="finance-incomes-title" aria-busy={busy}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="finance-incomes-title" className="min-w-0 flex-1">
          <button
            type="button"
            className="flex min-h-11 w-full items-center gap-2.5 rounded-xl text-left hover:bg-surface-container-high/50 focus-visible:outline-2 focus-visible:outline-primary"
            aria-expanded={expanded}
            aria-controls="finance-income-details"
            aria-label={expanded ? "Minimizar ingresos" : "Ver detalles de ingresos"}
            onClick={() => setExpanded((current) => !current)}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-container-high text-secondary"><Banknote size={18} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="section-title block">Ingresos</span>
              <span className="mt-0.5 block text-xs font-semibold text-on-surface-variant">{incomes.length} {incomes.length === 1 ? "fuente" : "fuentes"} · Período actual</span>
              {!expanded ? <span className="mt-1 block break-words text-sm font-bold text-secondary tabular-nums">{money.format(total)}</span> : null}
            </span>
            <ChevronDown size={18} aria-hidden="true" className={`shrink-0 text-secondary transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} />
          </button>
        </h2>
        <button ref={addButton} type="button" className="icon-fab focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50" aria-label="Agregar ingreso" title="Agregar ingreso" disabled={busy} aria-expanded={expanded && open} aria-controls="finance-income-form" onClick={() => { setDraft(empty); setEditingId(null); setError(""); setMessage(""); setExpanded(true); setOpen(true); }}>
          <Plus size={20} strokeWidth={2.6} aria-hidden="true" />
        </button>
      </div>
      <div id="finance-income-details" hidden={!expanded}>
      <div className="mt-4 rounded-2xl bg-surface-container-lowest p-3">
        <p className="text-xs font-semibold text-on-surface-variant">Ingresos del período</p>
        <p className="mt-1 break-words text-2xl font-black tracking-tight text-secondary tabular-nums">{money.format(total)}</p>
        <p className="mt-1 text-xs text-on-surface-variant">Suma de todos tus ingresos</p>
      </div>
      {incomes.length === 0 ? <p className="mt-4 text-sm text-on-surface-variant">Aún no hay ingresos. Agrega el primero para calcular tu disponible.</p> : (
        <ul className="mt-3 flex flex-col gap-2">
          {incomes.map((income) => (
            <li key={income.id} className="flex items-center gap-1 rounded-xl bg-surface-container-lowest/60 py-2 pl-3 pr-1">
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-bold text-on-surface">{income.concept}</p>
                {income.note ? <p className="break-words text-xs text-on-surface-variant">{income.note}</p> : null}
                <p className="mt-0.5 break-words text-xs font-semibold text-on-surface-variant tabular-nums">{money.format(income.amount)}</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">{income.date ? dateFormatter.format(new Date(`${income.date}T12:00:00Z`)) : "Sin fecha registrada"}</p>
              </div>
              <button type="button" className={action} disabled={busy} aria-label={`Editar ingreso ${income.concept}`} onClick={() => { setDraft({ concept: income.concept, amount: String(income.amount), note: income.note ?? "", date: income.date ?? "" }); setEditingId(income.id); setError(""); setMessage(""); setExpanded(true); setOpen(true); }}><Pencil size={16} aria-hidden="true" /></button>
              <button type="button" className={action} disabled={busy} aria-label={`Eliminar ingreso ${income.concept}`} onClick={() => { if (window.confirm(`¿Eliminar el ingreso «${income.concept}» de ${money.format(income.amount)}? El total de ingresos se recalculará.`)) void save(incomes.filter((item) => item.id !== income.id), "Ingreso eliminado."); }}><Trash2 size={16} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      )}
      {expanded && open ? (
        <form id="finance-income-form" onSubmit={submit} className="mt-4 rounded-2xl bg-surface-container-high/50 p-3" aria-describedby={error ? "finance-income-error" : undefined}>
          <fieldset disabled={busy} className="flex min-w-0 flex-col gap-3">
            <legend className="mb-3 font-bold">{editingId ? "Editar ingreso" : "Nuevo ingreso"}</legend>
            <label className="field"><span>Concepto</span><input autoFocus required className={input} value={draft.concept} placeholder="Ej. Consultoría" onChange={(event) => setDraft({ ...draft, concept: event.target.value })} /></label>
            <div className="field"><label htmlFor="finance-income-date">Fecha del ingreso</label><DatePicker id="finance-income-date" value={draft.date} onChange={(date) => setDraft({ ...draft, date })} tone="finances" ariaLabel="Fecha del ingreso" disabled={busy} triggerClassName={`${input} text-left`} /></div>
            <label className="field"><span>Valor (COP)</span><MoneyInput className={input} value={draft.amount} onChange={(amount) => setDraft({ ...draft, amount })} /></label>
            <label className="field"><span>Nota (opcional)</span><input className={input} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label>
            <div className="flex flex-wrap gap-2"><button type="submit" className="cta-pill min-h-11">{busy ? "Guardando…" : "Guardar ingreso"}</button><button type="button" className={action} onClick={close}>Cancelar</button></div>
          </fieldset>
        </form>
      ) : null}
      {error ? <p id="finance-income-error" role="alert" className="mt-3 text-sm text-on-surface">{error}</p> : null}
      <div role="status">{message ? <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-secondary"><CheckCircle2 size={14} aria-hidden="true" />{message}</p> : null}</div>
      </div>
    </section>
  );
}
