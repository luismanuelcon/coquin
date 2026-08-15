import { ArrowRight, Bell, CalendarPlus, Landmark, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { AppChrome } from "@/components/layout/app-chrome";
import { EventRow } from "@/components/ui/event-row";
import { ModuleCard } from "@/components/ui/module-card";
import { marketBudget, marketPurchases, overviewMetrics, projectTasks, todayEvents } from "@/lib/data/mock";
import { moduleThemes } from "@/lib/design-system";
import { getHomeAttentionSummary } from "@/lib/modules/home";
import { calculateMarketBudgetSummary } from "@/lib/modules/market";

export default function HomePage() {
  const attentionSummary = getHomeAttentionSummary(todayEvents, projectTasks);
  const marketSummary = calculateMarketBudgetSummary(marketBudget, marketPurchases);

  return (
    <AppChrome>
      <div className="page-stack">
        <section className="interactive-surface rounded-[30px] border border-[rgb(0_242_255_/_42%)] bg-[image:var(--gradient-primary)] p-5 text-white shadow-[var(--shadow-active)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Resumen de hoy</p>
              <h2 className="mt-2 text-[30px] font-extrabold leading-9">
                {attentionSummary.eventsToday} eventos, {attentionSummary.urgentTasks} urgente
              </h2>
            </div>
            <div className="grid size-12 place-items-center rounded-full bg-white/18">
              <Bell aria-hidden="true" size={23} strokeWidth={2.4} />
            </div>
          </div>
          <p className="mt-4 text-sm font-medium leading-6 text-white/82">
            Lo importante esta arriba: agenda inmediata, pagos por vencer, mercado al {marketSummary.spentPercent}% y tareas de hoy.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href="/calendar" className="interactive-surface rounded-full bg-white px-4 py-3 text-center text-sm font-extrabold text-[#00363a]">
              Abrir agenda
            </Link>
            <Link href="/tasks" className="interactive-surface rounded-full border border-white/24 bg-white/10 px-4 py-3 text-center text-sm font-extrabold text-white">
              Ver tareas
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {overviewMetrics.map((metric) => (
            <ModuleCard
              key={metric.label}
              tone={metric.tone}
              title={metric.label}
              value={metric.value}
              detail={metric.detail}
            />
          ))}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Agenda inmediata</h2>
            <Link href="/calendar" className="flex items-center gap-1 text-xs font-extrabold text-[var(--primary)]">
              Ver todo <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {todayEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Acciones rapidas</h2>
            <span className="rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] px-3 py-1 text-xs font-bold text-[var(--urgent)]">
              {attentionSummary.urgentTasks} urgente
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Cita", icon: CalendarPlus, tone: "calendar" as const },
              { label: "Gasto", icon: Landmark, tone: "finances" as const },
              { label: "Mercado", icon: ShoppingBasket, tone: "market" as const },
            ].map((action) => {
              const Icon = action.icon;
              const theme = moduleThemes[action.tone];

              return (
                <Link
                  key={action.label}
                  href={action.tone === "calendar" ? "/calendar" : action.tone === "finances" ? "/finances" : "/market"}
                  className="flex h-[92px] flex-col items-center justify-center gap-2 rounded-[22px] text-xs font-extrabold"
                  style={{ background: theme.surface, color: theme.text }}
                >
                <Icon aria-hidden="true" size={22} strokeWidth={2.4} />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Tareas del hogar</h2>
            <Link href="/tasks" className="text-xs font-extrabold text-[var(--urgent)]">
              Gestionar
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {projectTasks.slice(0, 2).map((task) => (
              <article key={task.id} className="interactive-surface rounded-[24px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold">{task.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-[var(--text-soft)]">
                      {task.owner} · {task.due}
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] px-3 py-1 text-[11px] font-extrabold text-[var(--urgent)]">
                    {task.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
