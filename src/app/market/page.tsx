"use client";

import {
  CalendarDays,
  CheckCircle2,
  PiggyBank,
  Plus,
  ReceiptText,
  Settings,
  Tags,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { ProgressBar } from "@/components/ui/progress-bar";
import { marketBudget, marketPurchases } from "@/lib/data/mock";
import {
  calculateMarketBudgetSummary,
  createMarketPurchase,
  getMarketCategoryTotals,
} from "@/lib/modules/market";
import type { MarketCategory, MarketPurchase } from "@/lib/types";

const categories: MarketCategory[] = [
  "Aseo",
  "Carnes",
  "Verduras",
  "Despensa",
  "Lacteos",
  "Hogar",
  "Otro",
];

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: marketBudget.currency,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
});

export default function MarketPage() {
  const [purchases, setPurchases] = useState<MarketPurchase[]>(marketPurchases);
  const [budgetAmount, setBudgetAmount] = useState(marketBudget.budget);
  const [budgetDraft, setBudgetDraft] = useState(String(marketBudget.budget));
  const [purchaseFormOpen, setPurchaseFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [date, setDate] = useState("2026-08-02");
  const [category, setCategory] = useState<MarketCategory>("Aseo");
  const [detail, setDetail] = useState("");
  const [amount, setAmount] = useState("");
  const [lastAdded, setLastAdded] = useState("");

  const activeBudget = useMemo(
    () => ({
      ...marketBudget,
      budget: Math.max(budgetAmount, 0),
    }),
    [budgetAmount],
  );
  const summary = useMemo(() => calculateMarketBudgetSummary(activeBudget, purchases), [activeBudget, purchases]);
  const categoryTotals = useMemo(() => getMarketCategoryTotals(purchases), [purchases]);
  const numericAmount = Number(amount);
  const canSubmit = Boolean(date && detail.trim() && numericAmount > 0);
  const canSaveBudget = Number(budgetDraft) >= 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const purchase = createMarketPurchase({
      date,
      category,
      detail: detail.trim(),
      amount: numericAmount,
    });

    setPurchases((current) => [purchase, ...current]);
    setLastAdded(`${purchase.detail} registrado por ${moneyFormatter.format(purchase.amount)}`);
    setDetail("");
    setAmount("");
    setPurchaseFormOpen(false);
  }

  function handleBudgetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSaveBudget) {
      return;
    }

    setBudgetAmount(Number(budgetDraft));
    setSettingsOpen(false);
  }

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="market"
          icon={PiggyBank}
          title="Presupuesto y compras"
        />

        <section className="card p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase text-[var(--text-soft)]">
                {marketBudget.month}
              </p>
              <h2 className="mt-2 text-[34px] font-extrabold leading-10 text-[var(--market)]">
                {moneyFormatter.format(activeBudget.budget)}
              </h2>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPurchaseFormOpen((current) => !current);
                  setSettingsOpen(false);
                }}
                className="grid size-12 place-items-center rounded-full border border-[var(--market)] bg-[var(--market-soft)] text-[var(--market)] shadow-[0_12px_22px_rgb(194_65_12_/_14%)]"
                aria-label={purchaseFormOpen ? "Cerrar compra" : "Registrar compra"}
                aria-expanded={purchaseFormOpen}
              >
                {purchaseFormOpen ? <X aria-hidden="true" size={20} strokeWidth={2.6} /> : <Plus aria-hidden="true" size={22} strokeWidth={2.8} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen((current) => !current);
                  setBudgetDraft(String(budgetAmount));
                  setPurchaseFormOpen(false);
                }}
                className="grid size-12 place-items-center rounded-full border border-[rgb(255_255_255_/_16%)] bg-[var(--surface-low)] text-[var(--text)]"
                aria-label={settingsOpen ? "Cerrar presupuesto" : "Configurar presupuesto"}
                aria-expanded={settingsOpen}
              >
                <Settings aria-hidden="true" size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--text-muted)]">Uso del presupuesto</span>
              <span className="text-[var(--market)]">{summary.spentPercent}%</span>
            </div>
            <ProgressBar value={summary.spentPercent} color="var(--market)" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[18px] border border-[rgb(194_65_12_/_24%)] bg-[var(--market-soft)] p-3">
              <p className="text-[10px] font-extrabold uppercase text-[var(--text-soft)]">Gastado</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--market)]">
                {moneyFormatter.format(summary.spent)}
              </p>
            </div>
            <div className="rounded-[18px] border border-[var(--surface-stroke)] bg-[var(--surface-low)] p-3">
              <p className="text-[10px] font-extrabold uppercase text-[var(--text-soft)]">Restante</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--text)]">
                {moneyFormatter.format(Math.max(summary.remaining, 0))}
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgb(194_65_12_/_24%)] bg-[var(--urgent-soft)] p-3">
              <p className="text-[10px] font-extrabold uppercase text-[var(--text-soft)]">Compras</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--urgent)]">{summary.purchaseCount}</p>
            </div>
          </div>

          {summary.isOverBudget ? (
            <div className="mt-4 rounded-[18px] border border-[var(--urgent)] bg-[var(--urgent-soft)] p-3 text-xs font-bold text-[var(--urgent)]">
              Sobrepasado por {moneyFormatter.format(Math.abs(summary.remaining))}
            </div>
          ) : null}
        </section>

        {settingsOpen ? (
          <form className="card p-3" onSubmit={handleBudgetSubmit}>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="10000"
                value={budgetDraft}
                onChange={(event) => setBudgetDraft(event.target.value)}
                className="h-11 min-w-0 rounded-[14px] border border-[rgb(194_65_12_/_24%)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--market)]"
                aria-label="Presupuesto mensual"
              />
              <button
                type="submit"
                disabled={!canSaveBudget}
                className="h-11 rounded-full bg-[image:var(--gradient-alert)] px-5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : null}

        {purchaseFormOpen ? (
          <section className="card p-3">
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <div className="grid grid-cols-[128px_1fr] gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--market)]"
                  aria-label="Fecha"
                />
                <input
                  type="text"
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  placeholder="Compra"
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--market)]"
                />
              </div>

              <div className="grid grid-cols-[1fr_112px] gap-2">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as MarketCategory)}
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--market)]"
                  aria-label="Categoria"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Valor"
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--market)]"
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="h-11 rounded-full bg-[image:var(--gradient-alert)] text-sm font-extrabold text-white shadow-[0_12px_22px_rgb(194_65_12_/_14%)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Registrar compra
              </button>
            </form>
          </section>
        ) : null}

        {lastAdded ? (
          <p
            className="interactive-surface flex items-center gap-2 rounded-[16px] border border-[rgb(194_65_12_/_24%)] bg-[var(--primary-soft)] px-3 py-2 text-xs font-bold text-[var(--on-primary-container)]"
            aria-live="polite"
          >
            <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2.4} />
            {lastAdded}
          </p>
        ) : null}

        <section className="interactive-surface rounded-[24px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Gasto por categoria</h2>
            <Tags aria-hidden="true" className="text-[var(--market)]" size={20} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col gap-3">
            {categoryTotals.map((item) => {
              const value = summary.spent === 0 ? 0 : Math.round((item.total / summary.spent) * 100);

              return (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
                    <span className="text-[var(--text-muted)]">{item.category}</span>
                    <span className="text-[var(--market)]">{moneyFormatter.format(item.total)}</span>
                  </div>
                  <ProgressBar value={value} color="var(--market)" />
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Compras registradas</h2>
            <ReceiptText aria-hidden="true" className="text-[var(--market)]" size={22} strokeWidth={2.4} />
          </div>

          <div className="flex flex-col gap-2">
            {purchases.map((purchase) => (
              <article
                key={purchase.id}
                className="interactive-surface flex items-center gap-3 rounded-[18px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] p-3"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[rgb(194_65_12_/_24%)] bg-[var(--market-soft)] text-[var(--market)]">
                  <CalendarDays aria-hidden="true" size={17} strokeWidth={2.4} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-extrabold">{purchase.detail}</h3>
                  <p className="mt-0.5 text-xs font-bold text-[var(--text-soft)]">
                    {dateFormatter.format(new Date(`${purchase.date}T12:00:00`))} · {purchase.category}
                  </p>
                </div>
                <span className="rounded-full border border-[rgb(194_65_12_/_24%)] bg-[var(--market-soft)] px-3 py-1 text-xs font-extrabold text-[var(--market)]">
                  {moneyFormatter.format(purchase.amount)}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
