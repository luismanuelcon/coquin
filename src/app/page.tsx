"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowRight, CheckCheck, ChevronRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { AppChrome } from "@/components/layout/app-chrome";
import { ModuleIcon } from "@/components/brand/module-icon";
import { EventRow } from "@/components/ui/event-row";
import { marketBudget, marketPurchases, projectTasks, todayEvents } from "@/lib/data/mock";
import { getHomeAttentionSummary } from "@/lib/modules/home";
import { calculateMarketBudgetSummary } from "@/lib/modules/market";

const money = (value: number) => new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);

export default function HomePage() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [view, setView] = useState<"agenda" | "tasks">("agenda");
  const attention = getHomeAttentionSummary(todayEvents, projectTasks);
  const market = calculateMarketBudgetSummary(marketBudget, marketPurchases);
  const lastPurchase = marketPurchases[marketPurchases.length - 1];

  return (
    <AppChrome>
      <div className="page-stack home-dashboard">
        <section className="balance-section" aria-label="Presupuesto de mercado">
          <div className="balance-topline"><span><span className="status-dot" /> Presupuesto de mercado</span><span>{marketBudget.month} · COP</span></div>
          <div className="balance-label">Disponible este mes <button type="button" className="balance-visibility" onClick={() => setBalanceVisible(!balanceVisible)} aria-label={balanceVisible ? "Ocultar saldo" : "Mostrar saldo"} aria-pressed={!balanceVisible} title={balanceVisible ? "Ocultar saldo" : "Mostrar saldo"}>{balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}</button></div>
          <div className="balance-amount">{balanceVisible ? <><span>$</span>{money(market.remaining)}</> : "••••••"}</div>
          <Link href="/market" className="balance-detail">Ver presupuesto <ArrowRight size={16} aria-hidden="true" /></Link>
          <div className="budget-meter" role="progressbar" aria-label="Presupuesto utilizado" aria-valuemin={0} aria-valuemax={100} aria-valuenow={market.spentPercent}><span style={{ width: market.spentPercent + "%" }} /></div>
          <div className="balance-foot"><span>{market.spentPercent}% utilizado</span><span>{balanceVisible ? "$" + money(market.budget) + " de presupuesto" : "Saldo oculto"}</span></div>
        </section>
        <section className="quick-actions" aria-label="Acciones rápidas">
          {[
            { label: "Agendar", href: "/calendar", tone: "calendar" as const },
            { label: "Gasto", href: "/finances?quick=misc", tone: "finances" as const },
            { label: "Mercado", href: "/market", tone: "market" as const },
            { label: "Tareas", href: "/tasks", tone: "tasks" as const },
          ].map(({ label, href, tone }) => <Link href={href} key={label}><span className={label === "Gasto" ? "action-icon action-pink" : "action-icon"}><ModuleIcon tone={tone} size="md" /></span><span>{label}</span></Link>)}
        </section>
        <section className="home-overview" aria-label="Resumen del hogar">
          <Link href="/calendar" className="overview-item"><ModuleIcon tone="calendar" size="md" /><span><strong>{attention.eventsToday} citas</strong><small>En tu agenda de hoy</small></span><ChevronRight size={17} aria-hidden="true" /></Link>
          <Link href="/tasks" className="overview-item"><ModuleIcon tone="tasks" size="md" /><span><strong>{attention.urgentTasks} urgente</strong><small>Pendiente del hogar</small></span><ChevronRight size={17} aria-hidden="true" /></Link>
        </section>
        <section className="home-activity">
          <div className="section-heading"><h2>Tu día, en orden</h2><Link href={view === "agenda" ? "/calendar" : "/tasks"}>Ver todo <ArrowRight size={15} aria-hidden="true" /></Link></div>
          <div className="activity-tabs" aria-label="Actividad del hogar">
            <button type="button" aria-pressed={view === "agenda"} onClick={() => setView("agenda")}>Agenda <span>{todayEvents.length}</span></button>
            <button type="button" aria-pressed={view === "tasks"} onClick={() => setView("tasks")}>Tareas <span>{projectTasks.length}</span></button>
          </div>
          <div className="activity-list">
            {view === "agenda" ? todayEvents.map(event => <Link href="/calendar" key={event.id}><EventRow event={event} /></Link>) : projectTasks.map(task => <Link className="home-task" key={task.id} href="/tasks"><CheckCheck size={21} aria-hidden="true" /><span><strong>{task.title}</strong><small>{task.owner} · {task.due}</small></span><span className={task.status === "Urgente" ? "task-status urgent-status" : "task-status"}>{task.status}</span></Link>)}
          </div>
        </section>
        <section className="home-recent">
          <div className="section-heading"><h2>Última compra</h2><Link href="/market" aria-label="Ver compras de mercado" title="Ver compras de mercado"><ArrowRight size={20} /></Link></div>
          <Link href="/market" className="purchase-row"><span className="purchase-icon"><ArrowDownLeft size={23} aria-hidden="true" /></span><span><strong>{lastPurchase.detail}</strong><small>{lastPurchase.category} · {marketBudget.month}</small></span><b>${money(lastPurchase.amount)}</b></Link>
        </section>
      </div>
    </AppChrome>
  );
}
