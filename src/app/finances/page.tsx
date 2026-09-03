"use client";

import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  CirclePlus,
  CircleAlert,
  Pencil,
  Plus,
  ReceiptText,
  Settings,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { SwipeDeleteRow } from "@/components/ui/swipe-delete-row";
import { financeBudgetState } from "@/lib/data/mock";
import { useScrollIntoViewOnOpen } from "@/lib/hooks/use-scroll-into-view-on-open";
import {
  calculateFinancePeriodSummary,
  ensureFinancePeriods,
  getFinancePeriodRangeFromStart,
  upsertFinancePeriod,
} from "@/lib/modules/finances";
import type {
  FinanceBudgetItem,
  FinanceBudgetState,
  FinanceIncome,
  FinanceMiscExpense,
  FinancePaymentStatus,
} from "@/lib/types";

const storageKey = "coquin.finances.budget.v1";

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: financeBudgetState.settings.currency,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

type BudgetForm = {
  concept: string;
  amount: string;
  fixed: boolean;
  status: FinancePaymentStatus;
  note: string;
};

function emptyBudgetForm(): BudgetForm {
  return { concept: "", amount: "", fixed: true, status: "pending", note: "" };
}

function emptyMiscForm(periodStart: string) {
  return { date: periodStart, concept: "", amount: "", category: "", note: "" };
}

export default function FinancesPage() {
  const [budgetState, setBudgetState] = useState<FinanceBudgetState>(financeBudgetState);
  const [loaded, setLoaded] = useState(false);
  const [budgetForm, setBudgetForm] = useState(emptyBudgetForm);
  const [miscForm, setMiscForm] = useState(emptyMiscForm(financeBudgetState.periods[1].startDate));
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editingMiscId, setEditingMiscId] = useState<string | null>(null);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [miscDetailOpen, setMiscDetailOpen] = useState(false);
  const [miscFormOpen, setMiscFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [summarySettingsForm, setSummarySettingsForm] = useState({ base: "", cutoffDay: "", startDate: "" });
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const shouldOpenMiscForm = new URLSearchParams(window.location.search).get("quick") === "misc";
    const initialState = saved ? (JSON.parse(saved) as FinanceBudgetState) : financeBudgetState;
    const ensured = ensureFinancePeriods(initialState, todayIso);
    const active = ensured.state.periods.find((period) => period.id === ensured.state.activePeriodId);

    setBudgetState(ensured.state);
    if (active) {
      setMiscForm(emptyMiscForm(active.startDate));
    }
    if (ensured.generatedCount > 0) {
      showFeedback("Periodo actualizado con gastos fijos pendientes");
    }
    if (shouldOpenMiscForm) {
      setMiscFormOpen(true);
      window.history.replaceState(null, "", "/finances");
    }
    setLoaded(true);
  }, [todayIso]);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(budgetState));
    }
  }, [budgetState, loaded]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("quick") === "misc") {
      setMiscFormOpen(true);
      window.history.replaceState(null, "", "/finances");
    }
  });

  const activePeriod = useMemo(
    () => budgetState.periods.find((period) => period.id === budgetState.activePeriodId) ?? budgetState.periods[0],
    [budgetState],
  );
  const summary = useMemo(() => calculateFinancePeriodSummary(activePeriod), [activePeriod]);

  useScrollIntoViewOnOpen(budgetFormOpen, "finance-budget-form");
  useScrollIntoViewOnOpen(miscFormOpen, "finance-misc-form");
  useScrollIntoViewOnOpen(settingsOpen, "finance-settings-form");

  useEffect(() => {
    setSummarySettingsForm({
      base: String(summary.base),
      cutoffDay: String(budgetState.settings.cutoffDay),
      startDate: activePeriod.startDate,
    });
  }, [activePeriod.id, activePeriod.startDate, budgetState.settings.cutoffDay, summary.base]);

  function updateActivePeriod(nextPeriod: typeof activePeriod) {
    setBudgetState((current) => upsertFinancePeriod(current, nextPeriod));
  }

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  function handleBudgetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(budgetForm.amount);

    if (!budgetForm.concept.trim() || amount <= 0) {
      setFormError("Agrega concepto y valor mayor a cero.");
      return;
    }

    const item: FinanceBudgetItem = {
      id: editingBudgetId ?? newId("item"),
      concept: budgetForm.concept.trim(),
      amount,
      fixed: budgetForm.fixed,
      status: budgetForm.status,
      note: budgetForm.note.trim() || undefined,
    };

    updateActivePeriod({
      ...activePeriod,
      items: editingBudgetId
        ? activePeriod.items.map((current) => (current.id === editingBudgetId ? item : current))
        : [item, ...activePeriod.items],
    });
    setBudgetForm(emptyBudgetForm());
    setEditingBudgetId(null);
    setBudgetFormOpen(false);
    setFormError("");
    showFeedback(editingBudgetId ? "Concepto actualizado" : "Concepto creado");
  }

  function handleMiscSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(miscForm.amount);

    if (!miscForm.date || !miscForm.concept.trim() || amount <= 0) {
      setFormError("Agrega fecha, concepto y valor mayor a cero.");
      return;
    }

    const expense: FinanceMiscExpense = {
      id: editingMiscId ?? newId("misc"),
      date: miscForm.date,
      concept: miscForm.concept.trim(),
      amount,
      category: miscForm.category.trim() || undefined,
      note: miscForm.note.trim() || undefined,
    };

    updateActivePeriod({
      ...activePeriod,
      miscExpenses: editingMiscId
        ? activePeriod.miscExpenses.map((current) => (current.id === editingMiscId ? expense : current))
        : [expense, ...activePeriod.miscExpenses],
    });
    setMiscForm(emptyMiscForm(activePeriod.startDate));
    setEditingMiscId(null);
    setMiscFormOpen(false);
    setFormError("");
    showFeedback(editingMiscId ? "Gasto actualizado" : "Gasto varios registrado");
    setMiscDetailOpen(true);
  }

  function handleSummarySettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const base = Number(summarySettingsForm.base);
    const cutoffDay = Math.min(Math.max(Number(summarySettingsForm.cutoffDay) || 1, 1), 31);

    if (!summarySettingsForm.startDate || base < 0) {
      setFormError("Agrega una base y una fecha valida.");
      return;
    }

    const range = getFinancePeriodRangeFromStart(summarySettingsForm.startDate);
    const baseIncome: FinanceIncome = {
      id: activePeriod.incomes.find((income) => income.concept === "Base")?.id ?? newId("income-base"),
      concept: "Base",
      amount: base,
    };
    const updatedPeriod = {
      ...activePeriod,
      id: range.id,
      startDate: range.startDate,
      endDate: range.endDate,
      incomes: [baseIncome],
    };

    setBudgetState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        cutoffDay,
      },
      activePeriodId: updatedPeriod.id,
      periods: current.periods
        .filter((period) => period.id !== activePeriod.id && period.id !== updatedPeriod.id)
        .concat(updatedPeriod)
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    }));
    setMiscForm(emptyMiscForm(updatedPeriod.startDate));
    setSettingsOpen(false);
    setFormError("");
    showFeedback("Resumen actualizado");
  }

  function deleteBudgetItem(item: FinanceBudgetItem) {
    if (!window.confirm(`Eliminar ${item.concept}?`)) {
      return;
    }
    updateActivePeriod({ ...activePeriod, items: activePeriod.items.filter((current) => current.id !== item.id) });
    if (editingBudgetId === item.id) {
      setEditingBudgetId(null);
      setBudgetForm(emptyBudgetForm());
      setBudgetFormOpen(false);
    }
    showFeedback("Concepto eliminado");
  }

  function deleteMiscExpense(expense: FinanceMiscExpense) {
    if (!window.confirm(`Eliminar gasto ${expense.concept}?`)) {
      return;
    }
    updateActivePeriod({
      ...activePeriod,
      miscExpenses: activePeriod.miscExpenses.filter((current) => current.id !== expense.id),
    });
    if (editingMiscId === expense.id) {
      setEditingMiscId(null);
      setMiscForm(emptyMiscForm(activePeriod.startDate));
      setMiscFormOpen(false);
    }
    showFeedback("Gasto eliminado");
  }

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading tone="finances" title="Administracion" />

        <section className="interactive-surface rounded-[30px] border border-[rgb(194_65_12_/_28%)] bg-[image:var(--gradient-primary)] p-4 text-white shadow-[var(--shadow-active)] min-[390px]:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-white/75">
                {formatDate(activePeriod.startDate)} - {formatDate(activePeriod.endDate)}
              </p>
              <p className="mt-2 whitespace-nowrap text-[clamp(28px,7.6vw,32px)] font-extrabold leading-10">
                {moneyFormatter.format(summary.available)}
              </p>
              <p className="mt-1 text-xs font-bold text-white/75">
                {summary.available < 0 ? "Deficit del periodo" : "Disponible del periodo"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingMiscId(null);
                  setMiscForm(emptyMiscForm(activePeriod.startDate));
                  setMiscFormOpen(true);
                }}
                className="grid size-12 place-items-center rounded-full bg-white text-[#7c2d12]"
                aria-label="Registrar gasto varios"
              >
                <CirclePlus aria-hidden="true" size={24} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen((current) => !current)}
                className="grid size-12 place-items-center rounded-full bg-white/18 text-white"
                aria-label="Configurar resumen financiero"
                aria-expanded={settingsOpen}
              >
                <Settings aria-hidden="true" size={23} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: "Base", value: summary.base, icon: Banknote },
              { label: "Comprometido", value: summary.totalPayments, icon: ReceiptText },
              { label: "Pagado", value: summary.paid, icon: CheckCircle2 },
              { label: "Por pagar", value: summary.pending, icon: CircleAlert },
            ].map((metric) => {
              const Icon = metric.icon;

              return (
                <div key={metric.label} className="min-w-0 rounded-[20px] bg-white/14 p-3">
                  <div className="flex min-w-0 items-center gap-2 text-white/78">
                    <Icon aria-hidden="true" size={16} strokeWidth={2.4} />
                    <p className="min-w-0 truncate text-[11px] font-bold uppercase">{metric.label}</p>
                  </div>
                  <p className="mt-2 truncate text-sm font-extrabold">{moneyFormatter.format(metric.value)}</p>
                </div>
              );
            })}
          </div>

          {settingsOpen ? (
            <form id="finance-settings-form" className="mt-4 rounded-[20px] bg-white/14 p-3" onSubmit={handleSummarySettingsSubmit}>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_96px]">
                <label className="flex min-w-0 flex-col gap-1 text-[10px] font-extrabold uppercase text-white/75">
                  Base
                  <input
                    type="number"
                    min="0"
                    value={summarySettingsForm.base}
                    onChange={(event) => setSummarySettingsForm((current) => ({ ...current, base: event.target.value }))}
                    className="h-11 min-w-0 rounded-[14px] border border-white/22 bg-white/12 px-3 text-xs font-extrabold text-white outline-none focus:border-white/70"
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-1 text-[10px] font-extrabold uppercase text-white/75">
                  Corte
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={summarySettingsForm.cutoffDay}
                    onChange={(event) => setSummarySettingsForm((current) => ({ ...current, cutoffDay: event.target.value }))}
                    className="h-11 min-w-0 rounded-[14px] border border-white/22 bg-white/12 px-3 text-xs font-extrabold text-white outline-none focus:border-white/70"
                  />
                </label>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_92px]">
                <label className="flex min-w-0 flex-col gap-1 text-[10px] font-extrabold uppercase text-white/75">
                  Inicio periodo
                  <input
                    type="date"
                    value={summarySettingsForm.startDate}
                    onChange={(event) => setSummarySettingsForm((current) => ({ ...current, startDate: event.target.value }))}
                    className="h-11 min-w-0 rounded-[14px] border border-white/22 bg-white/12 px-3 text-xs font-extrabold text-white outline-none focus:border-white/70"
                  />
                </label>
                <button type="submit" className="h-11 rounded-full bg-white text-xs font-extrabold text-[#7c2d12] min-[380px]:mt-5">
                  Guardar
                </button>
              </div>
            </form>
          ) : null}
        </section>

        {miscFormOpen ? (
          <section id="finance-misc-form" className="card p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="section-title">Registrar gasto</h2>
              <span className="rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] px-3 py-1 text-xs font-extrabold text-[var(--urgent)]">
                Gastos varios
              </span>
            </div>
            <form className="flex flex-col gap-2" onSubmit={handleMiscSubmit}>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[116px_minmax(0,1fr)]">
                <input
                  type="date"
                  value={miscForm.date}
                  onChange={(event) => setMiscForm((current) => ({ ...current, date: event.target.value }))}
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-2 text-[11px] font-bold text-[var(--text)] outline-none focus:border-[var(--finance)]"
                  aria-label="Fecha del gasto"
                />
                <input
                  value={miscForm.concept}
                  onChange={(event) => setMiscForm((current) => ({ ...current, concept: event.target.value }))}
                  placeholder="Cafe, parqueadero..."
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-xs font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--finance)]"
                  aria-label="Concepto del gasto"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_112px]">
                <input
                  value={miscForm.category}
                  onChange={(event) => setMiscForm((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Categoria"
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-xs font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--finance)]"
                  aria-label="Categoria del gasto"
                />
                <input
                  type="number"
                  min="0"
                  value={miscForm.amount}
                  onChange={(event) => setMiscForm((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="Valor"
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-xs font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--finance)]"
                  aria-label="Valor del gasto"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_96px]">
                <button type="submit" className="h-11 rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] text-xs font-extrabold text-[var(--urgent)]">
                  {editingMiscId ? "Guardar gasto" : "Registrar gasto"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMiscFormOpen(false);
                    setEditingMiscId(null);
                    setMiscForm(emptyMiscForm(activePeriod.startDate));
                  }}
                  className="h-11 rounded-full border border-[var(--surface-stroke)] bg-[var(--surface-low)] text-xs font-extrabold text-[var(--text-muted)]"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {formError ? (
          <p className="rounded-[16px] border border-[var(--urgent)] bg-[var(--urgent-soft)] px-3 py-2 text-xs font-bold text-[var(--urgent)]">
            {formError}
          </p>
        ) : null}
        {feedback ? (
          <p
            className="rounded-[16px] border border-[var(--finance)] bg-[var(--finance-soft)] px-3 py-2 text-xs font-bold text-[var(--finance)]"
            aria-live="polite"
          >
            {feedback}
          </p>
        ) : null}

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="section-title">Conceptos</h2>
            <button
              type="button"
              onClick={() => {
                setEditingBudgetId(null);
                setBudgetForm(emptyBudgetForm());
                setBudgetFormOpen((current) => !current);
              }}
              className="grid size-11 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-active)]"
              aria-label="Agregar concepto"
              aria-expanded={budgetFormOpen}
            >
              <Plus aria-hidden="true" size={20} strokeWidth={2.6} />
            </button>
          </div>
          {budgetFormOpen ? (
            <form id="finance-budget-form" className="mb-5 flex flex-col gap-3" onSubmit={handleBudgetSubmit}>
              <input
                value={budgetForm.concept}
                onChange={(event) => setBudgetForm((current) => ({ ...current, concept: event.target.value }))}
                placeholder="Arriendo, seguro, colegio..."
                className="h-12 min-w-0 rounded-[16px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-4 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--finance)]"
                aria-label="Concepto presupuestado"
              />
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="number"
                  min="0"
                  value={budgetForm.amount}
                  onChange={(event) => setBudgetForm((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="Valor"
                  className="h-12 min-w-0 rounded-[16px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-4 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--finance)]"
                  aria-label="Valor presupuestado"
                />
                <select
                  value={budgetForm.status}
                  onChange={(event) => setBudgetForm((current) => ({ ...current, status: event.target.value as "paid" | "pending" }))}
                  className="h-12 min-w-0 rounded-[16px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--finance)]"
                  aria-label="Estado de pago"
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                </select>
              </div>
              <label className="flex min-h-11 items-center gap-3 rounded-[16px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-4 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={budgetForm.fixed}
                  onChange={(event) => setBudgetForm((current) => ({ ...current, fixed: event.target.checked }))}
                  className="size-5 accent-[var(--finance)]"
                />
                Gasto fijo reutilizable
              </label>
              <button type="submit" className="h-12 rounded-full bg-[image:var(--gradient-primary)] text-sm font-extrabold text-white shadow-[var(--shadow-active)]">
                {editingBudgetId ? "Guardar concepto" : "Crear concepto"}
              </button>
            </form>
          ) : null}

          <div className="overflow-hidden rounded-[20px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)]">
            <div className="grid grid-cols-[minmax(0,1fr)_86px_44px] items-center gap-2 bg-[var(--surface-low)] px-3 py-2 text-[10px] font-extrabold uppercase text-[var(--text-soft)]">
              <span>Concepto</span>
              <span className="text-center">Estado</span>
              <span aria-hidden="true" />
            </div>
            {activePeriod.items.length === 0 ? (
              <p className="border-t border-[var(--surface-stroke)] p-3 text-sm font-bold text-[var(--text-soft)]">Sin conceptos presupuestados.</p>
            ) : null}
            {activePeriod.items.map((item) => (
              <SwipeDeleteRow key={item.id} deleteLabel={`Eliminar ${item.concept}`} onDelete={() => deleteBudgetItem(item)}>
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_86px_44px] items-center gap-2 border-t border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 py-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold">{item.concept}</h3>
                    <p className="mt-1 text-xs font-bold text-[var(--text-soft)]">
                      {item.fixed ? "Fijo" : "Variable"} · {moneyFormatter.format(item.amount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const status = item.status === "paid" ? "pending" : "paid";
                      updateActivePeriod({
                        ...activePeriod,
                        items: activePeriod.items.map((current) => (current.id === item.id ? { ...current, status } : current)),
                      });
                    }}
                    className={`h-11 rounded-full border px-2 text-[10px] font-extrabold ${item.status === "paid" ? "border-[var(--finance)] bg-[var(--finance-soft)] text-[var(--finance)]" : "border-[var(--urgent)] bg-[var(--urgent-soft)] text-[var(--urgent)]"}`}
                    aria-label={`Marcar ${item.concept} como ${item.status === "paid" ? "pendiente" : "pagado"}`}
                  >
                    {item.status === "paid" ? "Pagado" : "Pendiente"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetForm({
                        concept: item.concept,
                        amount: String(item.amount),
                        fixed: item.fixed,
                        status: item.status,
                        note: item.note ?? "",
                      });
                      setEditingBudgetId(item.id);
                      setBudgetFormOpen(true);
                    }}
                    className="grid size-11 place-items-center rounded-full bg-[var(--surface-low)] text-[var(--text-muted)]"
                    aria-label={`Editar ${item.concept}`}
                  >
                    <Pencil aria-hidden="true" size={16} />
                  </button>
                </div>
              </SwipeDeleteRow>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setMiscDetailOpen((current) => !current)}
              className="interactive-surface rounded-[22px] border border-[var(--urgent)] bg-[var(--urgent-soft)] p-3 text-left shadow-[0_12px_22px_rgb(194_65_12_/_10%)]"
              aria-expanded={miscDetailOpen}
              aria-controls="gastos-varios"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-extrabold text-[var(--text)]">Gastos varios</h3>
                  <p className="mt-1 text-xs font-bold text-[var(--text-soft)]">
                    Variable · {activePeriod.miscExpenses.length} movimientos
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="whitespace-nowrap text-sm font-extrabold text-[var(--urgent)]">
                    {moneyFormatter.format(summary.miscTotal)}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className={miscDetailOpen ? "rotate-90 text-[var(--urgent)]" : "text-[var(--urgent)]"}
                    size={18}
                  />
                </div>
              </div>
            </button>

            {miscDetailOpen ? (
              <div id="gastos-varios" className="overflow-hidden rounded-[20px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)]">
                <div className="grid grid-cols-[minmax(0,1fr)_88px_44px] items-center gap-2 bg-[var(--surface-low)] px-3 py-2 text-[10px] font-extrabold uppercase text-[var(--text-soft)]">
                  <span>Detalle</span>
                  <span className="text-right">Valor</span>
                  <span aria-hidden="true" />
                </div>
                {activePeriod.miscExpenses.length === 0 ? (
                  <p className="border-t border-[var(--surface-stroke)] p-3 text-sm font-bold text-[var(--text-soft)]">Sin gastos varios en este periodo.</p>
                ) : null}
                {activePeriod.miscExpenses.map((expense) => (
                  <SwipeDeleteRow key={expense.id} deleteLabel={`Eliminar ${expense.concept}`} onDelete={() => deleteMiscExpense(expense)}>
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_88px_44px] items-center gap-2 border-t border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 py-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-extrabold">{expense.concept}</h3>
                        <p className="mt-0.5 truncate text-[11px] font-bold text-[var(--text-soft)]">
                          {formatDate(expense.date)}{expense.category ? ` · ${expense.category}` : ""}
                        </p>
                      </div>
                      <p className="min-w-0 truncate text-right text-xs font-extrabold text-[var(--urgent)]">{moneyFormatter.format(expense.amount)}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setMiscForm({
                            date: expense.date,
                            concept: expense.concept,
                            amount: String(expense.amount),
                            category: expense.category ?? "",
                            note: expense.note ?? "",
                          });
                          setEditingMiscId(expense.id);
                          setMiscFormOpen(true);
                        }}
                        className="grid size-11 place-items-center rounded-full bg-[var(--surface-low)] text-[var(--text-muted)]"
                        aria-label={`Editar ${expense.concept}`}
                      >
                        <Pencil aria-hidden="true" size={15} />
                      </button>
                    </div>
                  </SwipeDeleteRow>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
