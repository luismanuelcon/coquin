import { Check, PackageCheck, PiggyBank, ShoppingBasket } from "lucide-react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { ProgressBar } from "@/components/ui/progress-bar";
import { marketBudget, marketItems } from "@/lib/data/mock";

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: marketBudget.currency,
  maximumFractionDigits: 0,
});

export default function MarketPage() {
  const remaining = marketBudget.budget - marketBudget.spent;
  const projected = marketBudget.spent + marketBudget.planned;
  const spentPercent = Math.round((marketBudget.spent / marketBudget.budget) * 100);
  const projectedPercent = Math.round((projected / marketBudget.budget) * 100);

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="market"
          icon={ShoppingBasket}
          eyebrow="Mercado e inventario"
          title="Lista inteligente"
          description="Agrupa compras, cantidades y existencias para que el mercado semanal no dependa de la memoria."
        />

        <section className="grid grid-cols-2 gap-3">
          <article className="rounded-[24px] border border-[var(--market)] bg-[var(--market-soft)] p-4 text-[var(--market)] shadow-[0_0_18px_rgb(255_138_0_/_12%)]">
            <ShoppingBasket size={22} strokeWidth={2.4} />
            <p className="mt-4 text-3xl font-extrabold">18</p>
            <p className="text-xs font-bold">items pendientes</p>
          </article>
          <article className="rounded-[24px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-4 text-[var(--text)] shadow-[var(--shadow-soft)]">
            <PackageCheck size={22} strokeWidth={2.4} />
            <p className="mt-4 text-3xl font-extrabold">7</p>
            <p className="text-xs font-bold text-[var(--text-soft)]">bajos de stock</p>
          </article>
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase text-[var(--text-soft)]">
                Presupuesto mensual · {marketBudget.month}
              </p>
              <h2 className="mt-2 text-[30px] font-extrabold leading-9 text-[var(--market)]">
                {moneyFormatter.format(marketBudget.budget)}
              </h2>
            </div>
            <div className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--market)] bg-[var(--market-soft)] text-[var(--market)] shadow-[0_0_18px_rgb(255_138_0_/_16%)]">
              <PiggyBank size={23} strokeWidth={2.4} />
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--text-muted)]">Gastado</span>
              <span className="text-[var(--market)]">{spentPercent}%</span>
            </div>
            <ProgressBar value={spentPercent} color="var(--market)" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[18px] border border-[rgb(255_138_0_/_28%)] bg-[var(--market-soft)] p-3">
              <p className="text-[10px] font-extrabold uppercase text-[var(--text-soft)]">Gastado</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--market)]">
                {moneyFormatter.format(marketBudget.spent)}
              </p>
            </div>
            <div className="rounded-[18px] border border-[var(--surface-stroke)] bg-[var(--surface-low)] p-3">
              <p className="text-[10px] font-extrabold uppercase text-[var(--text-soft)]">Restante</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--text)]">
                {moneyFormatter.format(remaining)}
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgb(255_0_229_/_30%)] bg-[var(--urgent-soft)] p-3">
              <p className="text-[10px] font-extrabold uppercase text-[var(--text-soft)]">Proyectado</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--urgent)]">{projectedPercent}%</p>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Lista de compra</h2>
            <span className="rounded-full border border-[var(--market)] bg-[var(--market-soft)] px-3 py-1 text-xs font-extrabold text-[var(--market)]">
              $310k estimado
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {marketItems.map((item) => (
              <article key={item.id} className="flex items-center gap-3 rounded-[20px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] p-3">
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-full border"
                  style={{
                    background: item.checked ? "var(--market)" : "var(--panel)",
                    color: item.checked ? "white" : "var(--outline)",
                    borderColor: item.checked ? "var(--market)" : "var(--outline-soft)",
                  }}
                >
                  {item.checked ? <Check size={17} strokeWidth={2.6} /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-extrabold">{item.name}</h3>
                  <p className="mt-0.5 text-xs font-bold text-[var(--text-soft)]">{item.category}</p>
                </div>
                <span className="rounded-full border border-[rgb(255_138_0_/_38%)] bg-[var(--market-soft)] px-3 py-1 text-xs font-extrabold text-[var(--market)]">
                  {item.quantity}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-extrabold uppercase text-[var(--text-soft)]">Categorias</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Despensa", "Lacteos", "Aseo", "Frutas", "Hogar", "Mascotas"].map((category) => (
              <span
                key={category}
                className="rounded-full border border-[rgb(255_138_0_/_38%)] bg-[var(--market-soft)] px-3 py-2 text-xs font-extrabold text-[var(--market)]"
              >
                {category}
              </span>
            ))}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
