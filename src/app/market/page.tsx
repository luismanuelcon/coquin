"use client";

import {
  Pencil,
  Plus,
  ReceiptText,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DatePicker } from "@/components/ui/date-picker";
import { useModule } from "@/components/data/data-provider";
import { getColombiaTodayIso } from "@/lib/date";
import { useScrollIntoViewOnOpen } from "@/lib/hooks/use-scroll-into-view-on-open";
import {
  calculateMarketBudgetSummary,
  createMarketPurchase,
  getMarketCategoryTotals,
} from "@/lib/modules/market";
import type { MarketCategory, MarketPurchase } from "@/lib/types";

const categories: MarketCategory[] = ["Aseo", "Carnes", "Verduras", "Despensa", "Lacteos", "Hogar", "Otro"];

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const dateFormatter = {
  format(date: Date) {
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${String(date.getDate()).padStart(2, "0")} ${months[date.getMonth()]}`;
  },
};

export default function MarketPage() {
  const [market, setMarket] = useModule("market");
  const purchases = market.purchases;
  const budgetAmount = market.budget;
  const [budgetDraft, setBudgetDraft] = useState(String(budgetAmount));
  const [editingId, setEditingId] = useState<string | null>(null);
  const marketBudget = { month: "Presupuesto del hogar", currency: "COP" };
  const [purchaseFormOpen, setPurchaseFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [date, setDate] = useState(getColombiaTodayIso());
  const [category, setCategory] = useState<MarketCategory>("Aseo");
  const [detail, setDetail] = useState("");
  const [amount, setAmount] = useState("");
  const [lastAdded, setLastAdded] = useState("");

  const activeBudget = useMemo(
    () => ({ ...marketBudget, budget: Math.max(budgetAmount, 0) }),
    [budgetAmount],
  );
  const summary = useMemo(() => calculateMarketBudgetSummary(activeBudget, purchases), [activeBudget, purchases]);
  const categoryTotals = useMemo(() => getMarketCategoryTotals(purchases), [purchases]);
  const numericAmount = Number(amount);
  const canSubmit = Boolean(date && detail.trim() && numericAmount > 0);
  const canSaveBudget = Number(budgetDraft) >= 0;

  useScrollIntoViewOnOpen(settingsOpen, "market-budget-form");
  useScrollIntoViewOnOpen(purchaseFormOpen, "market-purchase-form");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const purchase = createMarketPurchase({ date, category, detail: detail.trim(), amount: numericAmount });
    purchase.id = editingId ?? crypto.randomUUID();
    if (
      !(await setMarket((current) => ({
        ...current,
        purchases: editingId
          ? current.purchases.map((item) => (item.id === editingId ? purchase : item))
          : [purchase, ...current.purchases],
      })))
    )
      return;
    setEditingId(null);
    setLastAdded(`${purchase.detail} registrado por ${moneyFormatter.format(purchase.amount)}`);
    setDetail("");
    setAmount("");
    setPurchaseFormOpen(false);
  }

  async function handleBudgetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSaveBudget) return;
    if (!(await setMarket((current) => ({ ...current, budget: Number(budgetDraft) })))) return;
    setSettingsOpen(false);
  }

  const inputClass =
    "h-11 min-w-0 rounded-2xl border border-transparent bg-surface-container-lowest px-3 text-sm font-semibold text-on-surface outline-none placeholder:text-outline focus:border-primary-container";

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="market"
          eyebrow="Mercado & despensa"
          title="Presupuesto y compras"
          subtitle={`${summary.purchaseCount} compras este mes`}
          badge="Este mes"
        />

        <section className="card-elevated" aria-label="Presupuesto del hogar">
          <span
            className="glow-blob"
            style={{ top: -64, right: -64, width: 144, height: 144, background: "rgb(255 107 151 / 15%)" }}
          />
          <span
            className="glow-blob"
            style={{ bottom: -64, left: -64, width: 144, height: 144, background: "rgb(255 185 85 / 10%)" }}
          />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{marketBudget.month}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[17px] font-extrabold text-primary-fixed-dim">$</span>
                <span className="text-[26px] font-black leading-8 tracking-tight text-on-surface">
                  {new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(activeBudget.budget)}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDate(getColombiaTodayIso());
                  setCategory("Aseo");
                  setDetail("");
                  setAmount("");
                  setPurchaseFormOpen((current) => !current);
                  setSettingsOpen(false);
                }}
                className="icon-fab icon-fab--sm"
                aria-label={purchaseFormOpen ? "Cerrar compra" : "Registrar compra"}
                aria-expanded={purchaseFormOpen}
              >
                {purchaseFormOpen ? <X aria-hidden="true" size={18} strokeWidth={2.6} /> : <Plus aria-hidden="true" size={18} strokeWidth={2.8} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen((current) => !current);
                  setBudgetDraft(String(budgetAmount));
                  setPurchaseFormOpen(false);
                }}
                className="icon-fab icon-fab--sm icon-fab--ghost"
                aria-label={settingsOpen ? "Cerrar presupuesto" : "Configurar presupuesto"}
                aria-expanded={settingsOpen}
              >
                <Settings aria-hidden="true" size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-on-surface-variant">Uso del presupuesto</span>
              <span className="text-secondary">{summary.spentPercent}%</span>
            </div>
            <ProgressBar value={summary.spentPercent} ariaLabel="Presupuesto utilizado" />
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-surface-container p-2.5">
              <p className="text-[10px] font-bold uppercase text-on-surface-variant">Gastado</p>
              <p className="mt-1 text-[15px] font-bold text-on-surface">{moneyFormatter.format(summary.spent)}</p>
            </div>
            <div className="rounded-xl bg-surface-container p-2.5">
              <p className="text-[10px] font-bold uppercase text-secondary">Restante</p>
              <p className="mt-1 text-[15px] font-bold text-secondary">{moneyFormatter.format(Math.max(summary.remaining, 0))}</p>
            </div>
            <div className="rounded-xl bg-surface-container p-2.5">
              <p className="text-[10px] font-bold uppercase text-on-surface-variant">Compras</p>
              <p className="mt-1 text-[15px] font-bold text-on-surface">{summary.purchaseCount}</p>
            </div>
          </div>

          {summary.isOverBudget ? (
            <div className="relative z-10 mt-3 rounded-xl bg-[rgb(147_0_10_/_30%)] px-3 py-2 text-xs font-bold text-error">
              Sobrepasado por {moneyFormatter.format(Math.abs(summary.remaining))}
            </div>
          ) : null}
        </section>

        {settingsOpen ? (
          <form id="market-budget-form" className="card-surface flex flex-col gap-2 p-3" onSubmit={handleBudgetSubmit}>
            <div className="input-shell">
              <span className="text-secondary font-bold">$</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="10000"
                value={budgetDraft}
                onChange={(event) => setBudgetDraft(event.target.value)}
                aria-label="Presupuesto mensual"
              />
            </div>
            <button type="submit" disabled={!canSaveBudget} className="cta-pill">
              Guardar presupuesto
            </button>
          </form>
        ) : null}

        {purchaseFormOpen ? (
          <section id="market-purchase-form" className="card-surface p-3">
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-[128px_minmax(0,1fr)]">
                <DatePicker
                  value={date}
                  onChange={setDate}
                  tone="market"
                  ariaLabel="Fecha"
                  triggerClassName={`${inputClass} text-left`}
                />
                <input
                  type="text"
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  placeholder="Compra"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-[minmax(0,1fr)_120px]">
                <div className="input-shell">
                  <select value={category} onChange={(event) => setCategory(event.target.value as MarketCategory)} aria-label="Categoria">
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Valor"
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={!canSubmit} className="cta-pill">
                <ShoppingCart size={18} aria-hidden="true" />
                {editingId ? "Guardar cambios" : "Registrar compra"}
              </button>
            </form>
          </section>
        ) : null}

        {lastAdded ? (
          <p className="toast" aria-live="polite">{lastAdded}</p>
        ) : null}

        <section className="card-surface" aria-label="Gasto por categoria">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Gasto por categoría</h2>
            <Tags aria-hidden="true" className="text-secondary" size={18} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col gap-3">
            {categoryTotals.length === 0 ? (
              <p className="text-sm font-semibold text-on-surface-variant">Sin compras registradas.</p>
            ) : null}
            {categoryTotals.map((item) => {
              const value = summary.spent === 0 ? 0 : Math.round((item.total / summary.spent) * 100);
              return (
                <div key={item.category}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold">
                    <span className="text-on-surface-variant">{item.category}</span>
                    <span className="shrink-0 whitespace-nowrap text-on-surface">{moneyFormatter.format(item.total)}</span>
                  </div>
                  <ProgressBar value={value} ariaLabel={`Gasto en ${item.category}`} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="card-surface p-0" aria-label="Compras registradas">
          <div className="flex items-center justify-between gap-3 p-4 pb-3">
            <h2 className="section-title">Compras registradas</h2>
            <ReceiptText aria-hidden="true" className="text-primary" size={20} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col">
            {purchases.length === 0 ? (
              <p className="border-t border-surface-container-high p-4 text-sm font-semibold text-on-surface-variant">
                Sin compras registradas.
              </p>
            ) : null}
            {purchases.map((purchase: MarketPurchase) => (
              <div
                key={purchase.id}
                className="flex items-center gap-2.5 border-t border-surface-container-high px-4 py-3"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-container-high text-primary">
                  <Store size={17} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[14px] font-bold text-on-surface">{purchase.detail}</h3>
                  <p className="truncate text-[11px] font-semibold text-on-surface-variant">
                    {purchase.category} · {dateFormatter.format(new Date(`${purchase.date}T12:00:00`))}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-[14px] font-bold text-on-surface">
                  -{moneyFormatter.format(purchase.amount)}
                </span>
                <div className="flex shrink-0 items-center">
                  <button
                    className="row-tool"
                    type="button"
                    aria-label={`Editar ${purchase.detail}`}
                    title="Editar compra"
                    onClick={() => {
                      setEditingId(purchase.id);
                      setDate(purchase.date);
                      setDetail(purchase.detail);
                      setCategory(purchase.category);
                      setAmount(String(purchase.amount));
                      setPurchaseFormOpen(true);
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="row-tool"
                    type="button"
                    aria-label={`Eliminar ${purchase.detail}`}
                    title="Eliminar compra"
                    onClick={async () => {
                      if (!window.confirm(`¿Eliminar ${purchase.detail}?`)) return;
                      if (await setMarket((current) => ({ ...current, purchases: current.purchases.filter((item) => item.id !== purchase.id) })))
                        setLastAdded("Compra eliminada");
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="cta-pill"
          onClick={() => {
            setEditingId(null);
            setDate(getColombiaTodayIso());
            setCategory("Aseo");
            setDetail("");
            setAmount("");
            setPurchaseFormOpen(true);
            setSettingsOpen(false);
          }}
        >
          <Plus size={20} aria-hidden="true" />
          Registrar compra
        </button>
      </div>
    </AppChrome>
  );
}
