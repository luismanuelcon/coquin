"use client";

import { CalendarDays, CheckCircle2, CircleDollarSign, PiggyBank, Plus, ReceiptText, Tags } from "lucide-react";
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
  }

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="market"
          icon={PiggyBank}
          eyebrow="Mercado mensual"
          title="Presupuesto y compras"
          description="Registra cada compra del mes por categoria y valor para saber cuanto se ha gastado, en que se fue y cuanto queda disponible."
        />

        <section className="card p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase text-[var(--text-soft)]">
                Presupuesto mensual · {marketBudget.month}
              </p>
              <h2 className="mt-2 text-[34px] font-extrabold leading-10 text-[var(--market)]">
                {moneyFormatter.format(activeBudget.budget)}
              </h2>
            </div>
            <div className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--market)] bg-[var(--market-soft)] text-[var(--market)] shadow-[0_0_18px_rgb(255_138_0_/_16%)]">
              <CircleDollarSign aria-hidden="true" size={23} strokeWidth={2.4} />
            </div>
          </div>

          <label className="mb-5 flex flex-col gap-2 text-xs font-extrabold uppercase text-[var(--text-soft)]">
            Ajustar presupuesto del mes
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="10000"
              value={budgetAmount}
              onChange={(event) => setBudgetAmount(Number(event.target.value))}
              onInput={(event) => setBudgetAmount(Number(event.currentTarget.value))}
              className="h-12 rounded-[16px] border border-[rgb(255_138_0_/_30%)] bg-[var(--surface-lowest)] px-4 text-sm font-bold normal-case text-[var(--text)] outline-none focus:border-[var(--market)] focus:shadow-[0_0_12px_rgb(255_138_0_/_16%)]"
            />
          </label>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--text-muted)]">Uso del presupuesto</span>
              <span className="text-[var(--market)]">{summary.spentPercent}%</span>
            </div>
            <ProgressBar value={summary.spentPercent} color="var(--market)" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[18px] border border-[rgb(255_138_0_/_28%)] bg-[var(--market-soft)] p-3">
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
            <div className="rounded-[18px] border border-[rgb(255_0_229_/_30%)] bg-[var(--urgent-soft)] p-3">
              <p className="text-[10px] font-extrabold uppercase text-[var(--text-soft)]">Compras</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--urgent)]">{summary.purchaseCount}</p>
            </div>
          </div>

          {summary.isOverBudget ? (
            <div className="mt-4 rounded-[18px] border border-[var(--urgent)] bg-[var(--urgent-soft)] p-3 text-xs font-bold text-[var(--urgent)]">
              Te pasaste por {moneyFormatter.format(Math.abs(summary.remaining))}. Ajusta el presupuesto o revisa las categorias con mayor gasto.
            </div>
          ) : null}
        </section>

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Agregar compra</h2>
              <p className="mt-1 text-xs font-bold text-[var(--text-soft)]">
                Ejemplo: 2 de agosto · Aseo · $80.000
              </p>
            </div>
            <div className="grid size-10 place-items-center rounded-full border border-[var(--market)] bg-[var(--market-soft)] text-[var(--market)]">
              <Plus aria-hidden="true" size={18} strokeWidth={2.5} />
            </div>
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-xs font-extrabold uppercase text-[var(--text-soft)]">
              Fecha
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-12 rounded-[16px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-4 text-sm font-bold normal-case text-[var(--text)] outline-none focus:border-[var(--market)] focus:shadow-[0_0_12px_rgb(255_138_0_/_16%)]"
              />
            </label>

            <div className="grid grid-cols-[1fr_120px] gap-3">
              <label className="flex min-w-0 flex-col gap-2 text-xs font-extrabold uppercase text-[var(--text-soft)]">
                Detalle
                <input
                  type="text"
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  onInput={(event) => setDetail(event.currentTarget.value)}
                  placeholder="Carnes, verduras, aseo..."
                  className="h-12 rounded-[16px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-4 text-sm font-bold normal-case text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--market)] focus:shadow-[0_0_12px_rgb(255_138_0_/_16%)]"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-extrabold uppercase text-[var(--text-soft)]">
                Valor
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  onInput={(event) => setAmount(event.currentTarget.value)}
                  placeholder="80000"
                  className="h-12 rounded-[16px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold normal-case text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--market)] focus:shadow-[0_0_12px_rgb(255_138_0_/_16%)]"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-xs font-extrabold uppercase text-[var(--text-soft)]">
              Categoria
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as MarketCategory)}
                className="h-12 rounded-[16px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-4 text-sm font-bold normal-case text-[var(--text)] outline-none focus:border-[var(--market)] focus:shadow-[0_0_12px_rgb(255_138_0_/_16%)]"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-1 h-12 rounded-full bg-[image:var(--gradient-alert)] text-sm font-extrabold text-white shadow-[0_0_18px_rgb(255_138_0_/_20%)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Registrar compra
            </button>

            {lastAdded ? (
              <p
                className="interactive-surface flex items-center gap-2 rounded-[16px] border border-[rgb(0_242_255_/_30%)] bg-[var(--primary-soft)] px-3 py-2 text-xs font-bold text-[var(--on-primary-container)]"
                aria-live="polite"
              >
                <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2.4} />
                {lastAdded}
              </p>
            ) : null}
          </form>
        </section>

        <section className="interactive-surface rounded-[28px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-[var(--text-soft)]">Gasto por categoria</p>
              <h2 className="mt-1 text-xl font-extrabold">En que se fue</h2>
            </div>
            <Tags aria-hidden="true" className="text-[var(--market)]" size={22} strokeWidth={2.4} />
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
            <div>
              <p className="text-xs font-extrabold uppercase text-[var(--text-soft)]">Movimientos</p>
              <h2 className="section-title">Compras registradas</h2>
            </div>
            <ReceiptText aria-hidden="true" className="text-[var(--market)]" size={22} strokeWidth={2.4} />
          </div>

          <div className="flex flex-col gap-3">
            {purchases.map((purchase) => (
              <article
                key={purchase.id}
                className="interactive-surface flex items-center gap-3 rounded-[22px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] p-3"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-full border border-[rgb(255_138_0_/_34%)] bg-[var(--market-soft)] text-[var(--market)]">
                  <CalendarDays aria-hidden="true" size={18} strokeWidth={2.4} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-extrabold">{purchase.detail}</h3>
                  <p className="mt-0.5 text-xs font-bold text-[var(--text-soft)]">
                    {dateFormatter.format(new Date(`${purchase.date}T12:00:00`))} · {purchase.category}
                  </p>
                </div>
                <span className="rounded-full border border-[rgb(255_138_0_/_38%)] bg-[var(--market-soft)] px-3 py-1 text-xs font-extrabold text-[var(--market)]">
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
