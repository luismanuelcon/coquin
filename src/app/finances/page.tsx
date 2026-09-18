"use client";

import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Pencil,
  Plus,
  ReceiptText,
  Settings,
  TrendingUp,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { SwipeDeleteRow } from "@/components/ui/swipe-delete-row";
import { DatePicker } from "@/components/ui/date-picker";
import { useModule } from "@/components/data/data-provider";
import { emptyData } from "@/lib/data/empty";
const initialFinanceState = emptyData().finances;
import { getColombiaTodayIso } from "@/lib/date";
import { useScrollIntoViewOnOpen } from "@/lib/hooks/use-scroll-into-view-on-open";
import {
  calculateFinancePeriodSummary,
  ensureFinancePeriods,
  getFinancePeriodRangeFromStart,
  upsertFinancePeriod,
} from "@/lib/modules/finances";
import type {
  FinanceBudgetItem,
  FinanceIncome,
  FinanceMiscExpense,
  FinancePaymentStatus,
} from "@/lib/types";

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const dateFormatter = {
  format(date: Date) {
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${String(date.getDate()).padStart(2, "0")} ${months[date.getMonth()]} ${date.getFullYear()}`;
  },
};

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

const INPUT =
  "h-11 min-w-0 rounded-2xl border border-transparent bg-surface-container-lowest px-3 text-sm font-semibold text-on-surface outline-none placeholder:text-outline focus:border-primary-container";

export default function FinancesPage() {
  const [storedBudget, setBudgetState] = useModule("finances");
  const budgetState = useMemo(() => ensureFinancePeriods(storedBudget, getColombiaTodayIso()).state, [storedBudget]);
  const [budgetForm, setBudgetForm] = useState(emptyBudgetForm);
  const [miscForm, setMiscForm] = useState(emptyMiscForm(initialFinanceState.periods[0].startDate));
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editingMiscId, setEditingMiscId] = useState<string | null>(null);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [miscDetailOpen, setMiscDetailOpen] = useState(false);
  const [miscFormOpen, setMiscFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [summarySettingsForm, setSummarySettingsForm] = useState({ base: "", cutoffDay: "", startDate: "" });
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");

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
  const paidPercent = summary.totalPayments === 0 ? 0 : Math.round((summary.paid / summary.totalPayments) * 100);

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

  async function updateActivePeriod(nextPeriod: typeof activePeriod) {
    return setBudgetState(upsertFinancePeriod(budgetState, nextPeriod));
  }

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function handleBudgetSubmit(event: FormEvent<HTMLFormElement>) {
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
    if (
      !(await updateActivePeriod({
        ...activePeriod,
        items: editingBudgetId
          ? activePeriod.items.map((current) => (current.id === editingBudgetId ? item : current))
          : [item, ...activePeriod.items],
      }))
    )
      return;
    setBudgetForm(emptyBudgetForm());
    setEditingBudgetId(null);
    setBudgetFormOpen(false);
    setFormError("");
    showFeedback(editingBudgetId ? "Concepto actualizado" : "Concepto creado");
  }

  async function handleMiscSubmit(event: FormEvent<HTMLFormElement>) {
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
    if (
      !(await updateActivePeriod({
        ...activePeriod,
        miscExpenses: editingMiscId
          ? activePeriod.miscExpenses.map((current) => (current.id === editingMiscId ? expense : current))
          : [expense, ...activePeriod.miscExpenses],
      }))
    )
      return;
    setMiscForm(emptyMiscForm(activePeriod.startDate));
    setEditingMiscId(null);
    setMiscFormOpen(false);
    setFormError("");
    showFeedback(editingMiscId ? "Gasto actualizado" : "Gasto varios registrado");
    setMiscDetailOpen(true);
  }

  async function handleSummarySettingsSubmit(event: FormEvent<HTMLFormElement>) {
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
    if (
      !(await setBudgetState((current) => ({
        ...current,
        settings: { ...current.settings, cutoffDay },
        activePeriodId: updatedPeriod.id,
        periods: current.periods
          .filter((period) => period.id !== activePeriod.id && period.id !== updatedPeriod.id)
          .concat(updatedPeriod)
          .sort((a, b) => a.startDate.localeCompare(b.startDate)),
      })))
    )
      return;
    setMiscForm(emptyMiscForm(updatedPeriod.startDate));
    setSettingsOpen(false);
    setFormError("");
    showFeedback("Resumen actualizado");
  }

  async function deleteBudgetItem(item: FinanceBudgetItem) {
    if (!window.confirm(`Eliminar ${item.concept}?`)) return;
    if (!(await updateActivePeriod({ ...activePeriod, items: activePeriod.items.filter((current) => current.id !== item.id) }))) return;
    if (editingBudgetId === item.id) {
      setEditingBudgetId(null);
      setBudgetForm(emptyBudgetForm());
      setBudgetFormOpen(false);
    }
    showFeedback("Concepto eliminado");
  }

  async function deleteMiscExpense(expense: FinanceMiscExpense) {
    if (!window.confirm(`Eliminar gasto ${expense.concept}?`)) return;
    if (!(await updateActivePeriod({ ...activePeriod, miscExpenses: activePeriod.miscExpenses.filter((current) => current.id !== expense.id) }))) return;
    if (editingMiscId === expense.id) {
      setEditingMiscId(null);
      setMiscForm(emptyMiscForm(activePeriod.startDate));
      setMiscFormOpen(false);
    }
    showFeedback("Gasto eliminado");
  }

  const metrics = [
    { label: "Base", value: summary.base, icon: Banknote, color: "#ffb1c3" },
    { label: "Comprometido", value: summary.totalPayments, icon: ReceiptText, color: "#e87c98" },
    { label: "Pagado", value: summary.paid, icon: CheckCircle2, color: "#ffb955" },
    { label: "Por pagar", value: summary.pending, icon: CircleAlert, color: "#ff6b97" },
  ];

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="finances"
          eyebrow="Mis finanzas"
          title="Liquidez del período"
          subtitle="Ingresos, compromisos y ahorro"
          badge="Período en curso"
        />

        <section className="card-elevated" aria-label="Resumen del período">
          <span
            className="glow-blob"
            style={{ top: -48, right: -32, width: 128, height: 128, background: "rgb(255 107 151 / 15%)" }}
          />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-secondary">
                {formatDate(activePeriod.startDate)} – {formatDate(activePeriod.endDate)}
              </p>
              <p className="mt-1 text-[12px] font-semibold text-on-surface-variant">
                {summary.available < 0 ? "Déficit del período" : "Disponible del período"}
              </p>
              <p className="mt-0.5 break-words text-[30px] font-black leading-9 tracking-tight text-on-surface">
                {moneyFormatter.format(summary.available)}
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
                className="icon-fab"
                aria-label="Registrar gasto varios"
              >
                <Plus aria-hidden="true" size={20} strokeWidth={2.6} />
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen((current) => !current)}
                className="icon-fab icon-fab--ghost"
                aria-label="Configurar resumen financiero"
                aria-expanded={settingsOpen}
              >
                <Settings aria-hidden="true" size={20} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-3 flex items-center gap-2 rounded-xl bg-surface-container-lowest/60 px-3 py-2">
            <span className="grid size-6 place-items-center rounded-full bg-[rgb(255_185_85_/_20%)] text-secondary">
              <TrendingUp size={14} aria-hidden="true" />
            </span>
            <span className="text-xs font-bold text-secondary">{paidPercent}%</span>
            <span className="text-[11px] font-semibold text-on-surface-variant">del compromiso pagado</span>
          </div>

          <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="min-w-0 rounded-xl bg-surface-container p-3">
                  <div className="flex min-w-0 items-center justify-between">
                    <span className="grid size-7 place-items-center rounded-lg bg-surface-container-high" style={{ color: metric.color }}>
                      <Icon aria-hidden="true" size={16} strokeWidth={2.4} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{metric.label}</span>
                  </div>
                  <p className="mt-2 truncate text-[15px] font-bold text-on-surface">{moneyFormatter.format(metric.value)}</p>
                </div>
              );
            })}
          </div>

          {settingsOpen ? (
            <form id="finance-settings-form" className="relative z-10 mt-4 rounded-xl bg-surface-container p-3" onSubmit={handleSummarySettingsSubmit}>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_96px]">
                <label className="field">
                  <span>Base</span>
                  <div className="input-shell input-shell--muted">
                    <input
                      type="number"
                      min="0"
                      value={summarySettingsForm.base}
                      onChange={(event) => setSummarySettingsForm((current) => ({ ...current, base: event.target.value }))}
                    />
                  </div>
                </label>
                <label className="field">
                  <span>Corte</span>
                  <div className="input-shell input-shell--muted">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={summarySettingsForm.cutoffDay}
                      onChange={(event) => setSummarySettingsForm((current) => ({ ...current, cutoffDay: event.target.value }))}
                    />
                  </div>
                </label>
              </div>
              <label className="field mt-2">
                <span>Inicio período</span>
                <DatePicker
                  value={summarySettingsForm.startDate}
                  onChange={(iso) => setSummarySettingsForm((current) => ({ ...current, startDate: iso }))}
                  tone="finances"
                  ariaLabel="Inicio del período"
                  triggerClassName={`${INPUT} w-full text-left`}
                />
              </label>
              <button type="submit" className="cta-pill mt-3">
                Guardar resumen
              </button>
            </form>
          ) : null}
        </section>

        {miscFormOpen ? (
          <section id="finance-misc-form" className="card-surface p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="section-title">Registrar gasto</h2>
              <span className="pill pill--secondary">Gastos varios</span>
            </div>
            <form className="flex flex-col gap-2" onSubmit={handleMiscSubmit}>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[120px_minmax(0,1fr)]">
                <DatePicker
                  value={miscForm.date}
                  onChange={(iso) => setMiscForm((current) => ({ ...current, date: iso }))}
                  tone="finances"
                  ariaLabel="Fecha del gasto"
                  triggerClassName={`${INPUT} text-left`}
                />
                <input
                  value={miscForm.concept}
                  onChange={(event) => setMiscForm((current) => ({ ...current, concept: event.target.value }))}
                  placeholder="Café, parqueadero..."
                  className={INPUT}
                  aria-label="Concepto del gasto"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_120px]">
                <input
                  value={miscForm.category}
                  onChange={(event) => setMiscForm((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Categoría"
                  className={INPUT}
                  aria-label="Categoría del gasto"
                />
                <input
                  type="number"
                  min="0"
                  value={miscForm.amount}
                  onChange={(event) => setMiscForm((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="Valor"
                  className={INPUT}
                  aria-label="Valor del gasto"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_120px]">
                <button type="submit" className="cta-pill">
                  {editingMiscId ? "Guardar gasto" : "Registrar gasto"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMiscFormOpen(false);
                    setEditingMiscId(null);
                    setMiscForm(emptyMiscForm(activePeriod.startDate));
                  }}
                  className="cta-ghost"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {formError ? <p className="toast toast--error">{formError}</p> : null}
        {feedback ? (
          <p className="toast" aria-live="polite">{feedback}</p>
        ) : null}

        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="section-title">Conceptos</h2>
              <span className="pill">{activePeriod.items.length} activos</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingBudgetId(null);
                setBudgetForm(emptyBudgetForm());
                setBudgetFormOpen((current) => !current);
              }}
              className="icon-fab icon-fab--sm"
              aria-label="Agregar concepto"
              aria-expanded={budgetFormOpen}
            >
              <Plus aria-hidden="true" size={18} strokeWidth={2.6} />
            </button>
          </div>

          {budgetFormOpen ? (
            <form id="finance-budget-form" className="card-surface flex flex-col gap-2 p-3" onSubmit={handleBudgetSubmit}>
              <input
                value={budgetForm.concept}
                onChange={(event) => setBudgetForm((current) => ({ ...current, concept: event.target.value }))}
                placeholder="Arriendo, seguro, colegio..."
                className={`${INPUT} w-full`}
                aria-label="Concepto presupuestado"
              />
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_130px]">
                <input
                  type="number"
                  min="0"
                  value={budgetForm.amount}
                  onChange={(event) => setBudgetForm((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="Valor"
                  className={INPUT}
                  aria-label="Valor presupuestado"
                />
                <div className="input-shell">
                  <select
                    value={budgetForm.status}
                    onChange={(event) => setBudgetForm((current) => ({ ...current, status: event.target.value as FinancePaymentStatus }))}
                    aria-label="Estado de pago"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                  </select>
                </div>
              </div>
              <label className="input-shell input-shell--muted gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={budgetForm.fixed}
                  onChange={(event) => setBudgetForm((current) => ({ ...current, fixed: event.target.checked }))}
                  className="size-5 accent-primary-container"
                  style={{ minHeight: "auto", flex: "none" }}
                />
                Gasto fijo reutilizable
              </label>
              <button type="submit" className="cta-pill mt-1">
                {editingBudgetId ? "Guardar concepto" : "Crear concepto"}
              </button>
            </form>
          ) : null}

          <div className="flex flex-col gap-1.5">
            {activePeriod.items.length === 0 ? (
              <p className="rounded-2xl bg-surface-container p-4 text-sm font-semibold text-on-surface-variant">
                Sin conceptos presupuestados.
              </p>
            ) : null}
            {activePeriod.items.map((item) => (
              <SwipeDeleteRow key={item.id} deleteLabel={`Eliminar ${item.concept}`} onDelete={() => deleteBudgetItem(item)}>
                <div className="flex items-center gap-2.5 rounded-2xl bg-surface-container px-3 py-2.5">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-container-high"
                    style={{ color: item.status === "paid" ? "#ffb955" : "#ff6b97" }}
                  >
                    <ReceiptText size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-bold text-on-surface">{item.concept}</h3>
                    <p className="truncate text-[11px] font-semibold text-on-surface-variant">
                      {item.fixed ? "Fijo" : "Variable"} · {moneyFormatter.format(item.amount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const status = item.status === "paid" ? "pending" : "paid";
                      await updateActivePeriod({
                        ...activePeriod,
                        items: activePeriod.items.map((current) => (current.id === item.id ? { ...current, status } : current)),
                      });
                    }}
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={
                      item.status === "paid"
                        ? { background: "rgb(255 185 85 / 15%)", color: "#ffb955" }
                        : { background: "rgb(255 107 151 / 15%)", color: "#ff6b97" }
                    }
                    aria-label={`Marcar ${item.concept} como ${item.status === "paid" ? "pendiente" : "pagado"}`}
                  >
                    {item.status === "paid" ? "Pagado" : "Por pagar"}
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
                    className="row-tool"
                    aria-label={`Editar ${item.concept}`}
                  >
                    <Pencil aria-hidden="true" size={15} />
                  </button>
                </div>
              </SwipeDeleteRow>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMiscDetailOpen((current) => !current)}
            className="card-surface flex items-start justify-between gap-3 p-3 text-left"
            aria-expanded={miscDetailOpen}
            aria-controls="gastos-varios"
          >
            <div className="min-w-0">
              <h3 className="truncate text-[14px] font-bold text-on-surface">Gastos varios</h3>
              <p className="mt-0.5 text-[11px] font-semibold text-on-surface-variant">
                Variable · {activePeriod.miscExpenses.length} movimientos
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="whitespace-nowrap text-[14px] font-bold text-secondary">{moneyFormatter.format(summary.miscTotal)}</span>
              <ChevronRight aria-hidden="true" className={`text-secondary ${miscDetailOpen ? "rotate-90" : ""}`} size={18} />
            </div>
          </button>

          {miscDetailOpen ? (
            <div id="gastos-varios" className="flex flex-col gap-1.5">
              {activePeriod.miscExpenses.length === 0 ? (
                <p className="rounded-2xl bg-surface-container p-4 text-sm font-semibold text-on-surface-variant">
                  Sin gastos varios en este período.
                </p>
              ) : null}
              {activePeriod.miscExpenses.map((expense) => (
                <SwipeDeleteRow key={expense.id} deleteLabel={`Eliminar ${expense.concept}`} onDelete={() => deleteMiscExpense(expense)}>
                  <div className="flex items-center gap-2.5 rounded-2xl bg-surface-container-low px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[14px] font-bold text-on-surface">{expense.concept}</h3>
                      <p className="truncate text-[11px] font-semibold text-on-surface-variant">
                        {formatDate(expense.date)}{expense.category ? ` · ${expense.category}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-[14px] font-bold text-secondary">
                      {moneyFormatter.format(expense.amount)}
                    </span>
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
                      className="row-tool"
                      aria-label={`Editar ${expense.concept}`}
                    >
                      <Pencil aria-hidden="true" size={15} />
                    </button>
                  </div>
                </SwipeDeleteRow>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </AppChrome>
  );
}
