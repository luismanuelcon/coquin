import { Landmark, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { ProgressBar } from "@/components/ui/progress-bar";
import { financeItems } from "@/lib/data/mock";

export default function FinancesPage() {
  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="finances"
          icon={Landmark}
          eyebrow="Finanzas del hogar"
          title="Presupuesto y pagos"
          description="Controla obligaciones, gastos recurrentes, impuestos y metas sin convertir la casa en una contabilidad pesada."
        />

        <section className="interactive-surface rounded-[30px] border border-[rgb(0_219_231_/_42%)] bg-[linear-gradient(135deg,#00dbe7_0%,#a020f0_100%)] p-5 text-white shadow-[var(--shadow-active)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-white/75">Balance mensual</p>
              <p className="mt-2 text-[34px] font-extrabold leading-10">$3.8M</p>
            </div>
            <div className="grid size-12 place-items-center rounded-full bg-white/18">
              <WalletCards aria-hidden="true" size={24} strokeWidth={2.4} />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-white/14 p-3">
              <TrendingUp aria-hidden="true" size={18} />
              <p className="mt-2 text-xs font-bold text-white/75">Ingresos</p>
              <p className="text-lg font-extrabold">$6.2M</p>
            </div>
            <div className="rounded-[22px] bg-white/14 p-3">
              <TrendingDown aria-hidden="true" size={18} />
              <p className="mt-2 text-xs font-bold text-white/75">Gastos</p>
              <p className="text-lg font-extrabold">$2.4M</p>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Presupuesto</h2>
            <span className="rounded-full border border-[var(--finance)] bg-[var(--finance-soft)] px-3 py-1 text-xs font-extrabold text-[var(--finance)]">
              61% usado
            </span>
          </div>
          <ProgressBar value={61} color="var(--finance)" />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {["Casa", "Mercado", "Ahorro"].map((label, index) => (
              <div key={label} className="interactive-surface rounded-[18px] border border-[rgb(0_219_231_/_24%)] bg-[var(--finance-soft)] px-2 py-3">
                <p className="text-[11px] font-bold text-[var(--text-soft)]">{label}</p>
                <p className="mt-1 text-sm font-extrabold text-[var(--finance)]">
                  {[42, 28, 18][index]}%
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title mb-3">Pagos y obligaciones</h2>
          <div className="flex flex-col gap-3">
            {financeItems.map((item) => (
              <article key={item.id} className="interactive-surface rounded-[24px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold">{item.title}</h3>
                    <p className="mt-1 text-xs font-bold text-[var(--text-soft)]">Vence: {item.due}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[var(--finance)]">{item.amount}</p>
                    <p className="mt-1 rounded-full border border-[var(--finance)] bg-[var(--finance-soft)] px-2 py-1 text-[11px] font-bold text-[var(--finance)]">
                      {item.status}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
