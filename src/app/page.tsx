"use client";

import { useMemo } from "react";
import {
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  Clock3,
  Home,
  ListChecks,
  ListPlus,
  Plus,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { AppChrome } from "@/components/layout/app-chrome";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAppData } from "@/components/data/data-provider";
import { getColombiaTodayIso } from "@/lib/date";
import { getHomeAttentionSummary } from "@/lib/modules/home";
import { calculateMarketBudgetSummary } from "@/lib/modules/market";
import { calculateTaskProgress } from "@/lib/modules/tasks";
import { calculateFinancePeriodSummary, ensureFinancePeriods } from "@/lib/modules/finances";

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);

function compact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

const monthLabel = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" });
function periodBadge(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "Período";
  const [y, m, d] = iso.split("-").map(Number);
  return monthLabel.format(new Date(y, m - 1, d)).replace(/^\w/, (c) => c.toUpperCase());
}

function formatTime12(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return value;
  const [h, m] = value.split(":").map(Number);
  const meridiem = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${meridiem}`;
}

type Bar = { label: string; value: number; highlight?: boolean };

function FinanceBars({ bars }: { bars: Bar[] }) {
  const max = Math.max(1, ...bars.map((bar) => bar.value));
  const slot = 320 / bars.length;
  const barWidth = 26;
  const top = 12;
  const bottom = 104;
  const usable = bottom - top;

  const points = bars.map((bar, index) => {
    const cx = slot * index + slot / 2;
    const height = Math.max(4, (bar.value / max) * usable);
    const y = bottom - height;
    return { cx, y, height, ...bar };
  });

  const trend = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.cx.toFixed(0)} ${(point.y - 6).toFixed(0)}`)
    .join(" ");

  return (
    <div className="relative w-full">
      <svg className="h-32 w-full overflow-visible" viewBox="0 0 320 116" fill="none" preserveAspectRatio="none" role="img" aria-label="Comparativo del período">
        <defs>
          <linearGradient id="barGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff6b97" />
            <stop offset="100%" stopColor="#dc9100" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="trendLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ffb955" />
            <stop offset="55%" stopColor="#ff6b97" />
            <stop offset="100%" stopColor="#ffd9e0" />
          </linearGradient>
        </defs>
        <line x1="0" x2="320" y1="20" y2="20" stroke="var(--text)" strokeOpacity="0.06" strokeDasharray="3 3" />
        <line x1="0" x2="320" y1="62" y2="62" stroke="var(--text)" strokeOpacity="0.06" strokeDasharray="3 3" />
        <line x1="0" x2="320" y1="104" y2="104" stroke="var(--text)" strokeOpacity="0.08" />
        {points.map((point) => (
          <g key={point.label}>
            <rect
              x={point.cx - barWidth / 2}
              y={top}
              width={barWidth}
              height={usable}
              rx={8}
              fill="var(--text)"
              fillOpacity="0.05"
            />
            <rect
              x={point.cx - (barWidth - 6) / 2}
              y={point.y}
              width={barWidth - 6}
              height={point.height}
              rx={6}
              fill={point.highlight ? "url(#barGlow)" : "var(--surface-highest)"}
              fillOpacity={point.highlight ? 1 : 0.85}
              filter={point.highlight ? "drop-shadow(0 0 8px rgba(255,107,151,0.5))" : undefined}
            />
          </g>
        ))}
        <path d={trend} fill="none" stroke="url(#trendLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].cx} cy={points[points.length - 1].y - 6} r="4.5" fill="#ffb955" stroke="var(--surface-bg)" strokeWidth="2" />
      </svg>
      <div className="mt-1 grid grid-cols-4 text-center text-[11px] font-semibold text-on-surface-variant">
        {bars.map((bar) => (
          <span key={bar.label} className={bar.highlight ? "font-bold text-primary" : undefined}>
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data, householdName } = useAppData();
  const todayEvents = data.calendar;
  const projectTasks = data.tasks;
  const marketPurchases = data.market.purchases;

  const marketBudget = { budget: data.market.budget, currency: "COP", month: "Hogar" };
  const market = calculateMarketBudgetSummary(marketBudget, marketPurchases);
  const attention = getHomeAttentionSummary(todayEvents, projectTasks);

  const finance = useMemo(() => {
    const state = ensureFinancePeriods(data.finances, getColombiaTodayIso()).state;
    const period = state.periods.find((item) => item.id === state.activePeriodId) ?? state.periods[0];
    return { summary: calculateFinancePeriodSummary(period), period };
  }, [data.finances]);
  const summary = finance.summary;

  const completedTasks = projectTasks.filter((task) => task.status === "Completada").length;
  const taskProgress = calculateTaskProgress(completedTasks, projectTasks.length || 1);
  const pendingTasks = projectTasks.filter((task) => task.status !== "Completada").length;
  const urgentTask =
    projectTasks.find((task) => task.status === "Urgente") ??
    projectTasks.find((task) => task.status !== "Completada");

  const upcoming = [...todayEvents]
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 2);

  const financeBars: Bar[] = [
    { label: "Base", value: summary.base },
    { label: "Compr.", value: summary.totalPayments },
    { label: "Pagado", value: summary.paid },
    { label: "Dispon.", value: Math.max(summary.available, 0), highlight: true },
  ];

  const quickActions = [
    { label: "+ Gasto", href: "/finances?quick=misc", icon: Plus, gradient: "linear-gradient(135deg, #ff6b97, #ffb1c3)", color: "#66002c" },
    { label: "Nueva cita", href: "/calendar", icon: CalendarPlus, gradient: "linear-gradient(135deg, #ffb955, #ffddb4)", color: "#452b00" },
    { label: "Crear tarea", href: "/tasks", icon: ListPlus, gradient: "linear-gradient(135deg, #e87c98, #ffb1c2)", color: "#5f0f2c" },
    { label: "Lista despensa", href: "/market", icon: ShoppingCart, gradient: "linear-gradient(135deg, #e87c98, #ffb1c2)", color: "#5f0f2c" },
  ];

  const savingsInsight =
    market.spentPercent >= 100
      ? "Ya superaste el presupuesto de mercado. Revisa los gastos del ciclo."
      : `Te queda ${money(Math.max(market.remaining, 0))} de tu presupuesto de mercado este mes.`;

  return (
    <AppChrome>
      <div className="page-stack">
        {/* Welcome header */}
        <header className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1">
              <span className="size-2 rounded-full bg-secondary" style={{ boxShadow: "0 0 8px #ffb955" }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Espacio compartido</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-[11px] font-semibold text-primary">
              <Home size={15} className="text-secondary" aria-hidden="true" />
              <span className="max-w-[120px] truncate">{householdName || "Mi hogar"}</span>
            </span>
          </div>
          <div>
            <h1 className="page-hero__title">Hola, familia</h1>
            <p className="page-hero__subtitle">Resumen de tu hogar para hoy.</p>
          </div>
        </header>

        {/* Financial hero bento */}
        <section className="card-elevated" aria-label="Salud financiera">
          <span className="glow-blob" style={{ top: -48, right: -48, width: 160, height: 160, background: "rgb(255 107 151 / 20%)" }} />
          <span className="glow-blob" style={{ bottom: -40, left: -40, width: 144, height: 144, background: "rgb(255 185 85 / 15%)" }} />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-[rgb(255_107_151_/_20%)] text-primary">
                  <Wallet size={16} aria-hidden="true" />
                </span>
                <span className="text-[15px] font-bold text-on-surface">Flujo & salud financiera</span>
              </div>
              <span className="pill pill--secondary">{periodBadge(finance.period.startDate)}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-on-surface-variant">Disponible del período</span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span
                  className="bg-gradient-to-r from-primary via-primary-fixed to-secondary bg-clip-text text-[30px] font-black leading-9 tracking-tight text-transparent"
                >
                  $ {money(summary.available)}
                </span>
                <span className="text-[11px] font-semibold text-on-surface-variant">COP</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[rgb(255_185_85_/_15%)] px-2 py-0.5 text-[11px] font-bold text-secondary">
                  <TrendingUp size={13} aria-hidden="true" />
                  {summary.totalPayments === 0 ? "0%" : `${Math.round((summary.paid / summary.totalPayments) * 100)}%`}
                </span>
              </div>
            </div>

            <FinanceBars bars={financeBars} />

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col rounded-xl bg-surface-container-lowest/70 p-2.5">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant">
                  <span className="size-1.5 rounded-full bg-primary" /> Base
                </span>
                <span className="mt-1 text-[13px] font-bold text-primary">{compact(summary.base)}</span>
              </div>
              <div className="flex flex-col rounded-xl bg-surface-container-lowest/70 p-2.5">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant">
                  <span className="size-1.5 rounded-full bg-secondary" /> Comprometido
                </span>
                <span className="mt-1 text-[13px] font-bold text-secondary">{compact(summary.totalPayments)}</span>
              </div>
              <div className="flex flex-col rounded-xl bg-surface-container-lowest/70 p-2.5">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant">
                  <span className="size-1.5 rounded-full bg-tertiary-container" /> Por pagar
                </span>
                <span className="mt-1 text-[13px] font-bold text-tertiary">{compact(summary.pending)}</span>
              </div>
            </div>

            <Link href="/finances" className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-primary">
              Ver finanzas <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Market budget quick summary */}
        <section className="card-surface flex flex-col gap-3" aria-label="Presupuesto de mercado">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full bg-[rgb(255_185_85_/_18%)] text-secondary">
                <ShoppingCart size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="section-title text-[16px]">Mercado & despensa</h2>
                <p className="text-[11px] font-semibold text-on-surface-variant">
                  {market.purchaseCount} compras registradas
                </p>
              </div>
            </div>
            <Link
              href="/market"
              className="inline-flex items-center gap-1 rounded-full bg-primary-container px-3 py-1.5 text-[11px] font-bold text-on-primary"
              style={{ boxShadow: "0 2px 12px rgb(255 107 151 / 30%)" }}
            >
              <Plus size={15} aria-hidden="true" /> Gasto
            </Link>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-on-surface">
                $ {money(market.spent)} <span className="font-normal text-on-surface-variant">consumido</span>
              </span>
              <span className="text-on-surface-variant">Meta: $ {money(market.budget)}</span>
            </div>
            <ProgressBar value={market.spentPercent} ariaLabel="Presupuesto de mercado utilizado" />
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="font-bold text-secondary">{market.spentPercent}% del presupuesto</span>
              <span className="text-on-surface-variant">Disponible: $ {money(Math.max(market.remaining, 0))}</span>
            </div>
          </div>
        </section>

        {/* Agenda + Tasks bento */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <section className="card-surface flex flex-col gap-2.5" aria-label="Agenda de hoy">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock size={19} className="text-primary" aria-hidden="true" />
                <span className="section-title text-[16px]">Citas ({attention.eventsToday})</span>
              </div>
              <Link href="/calendar" className="text-[12px] font-bold text-primary" aria-label="Ver agenda">
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="rounded-xl bg-surface-container-low p-3 text-[13px] font-semibold text-on-surface-variant">
                No hay citas para hoy.
              </p>
            ) : (
              upcoming.map((event, index) => (
                <Link
                  key={event.id}
                  href="/calendar"
                  className="flex flex-col gap-1 rounded-xl p-2.5"
                  style={{ background: index === 0 ? "var(--surface-high)" : "var(--surface-low)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[14px] font-bold text-on-surface">{event.title}</span>
                    <span className="shrink-0 text-[11px] font-bold text-secondary">{formatTime12(event.time)}</span>
                  </div>
                  <span className="flex items-center gap-1 truncate text-[11px] font-semibold text-on-surface-variant">
                    <Clock3 size={12} aria-hidden="true" /> {event.meta}
                  </span>
                </Link>
              ))
            )}
          </section>

          <section className="card-surface flex flex-col gap-2.5" aria-label="Tareas y hogar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks size={19} className="text-secondary" aria-hidden="true" />
                <span className="section-title text-[16px]">Tareas</span>
              </div>
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                {pendingTasks} pendientes
              </span>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl bg-surface-container-low p-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-on-surface">Progreso general</span>
                <span className="font-bold text-secondary">{taskProgress}%</span>
              </div>
              <ProgressBar value={taskProgress} ariaLabel="Progreso de tareas" />
            </div>
            {urgentTask ? (
              <Link
                href="/tasks"
                className="flex flex-col gap-1 rounded-xl p-2.5"
                style={{ background: "rgb(255 107 151 / 15%)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={
                      urgentTask.status === "Urgente"
                        ? { background: "rgb(255 180 171 / 25%)", color: "var(--color-error)" }
                        : { background: "var(--surface-high)", color: "var(--text-soft)" }
                    }
                  >
                    {urgentTask.status}
                  </span>
                  <span className="flex items-center gap-1 truncate text-[11px] font-semibold text-on-surface-variant">
                    {urgentTask.owner}
                  </span>
                </div>
                <span className="truncate text-[13px] font-bold text-on-surface">{urgentTask.title}</span>
              </Link>
            ) : (
              <p className="rounded-xl bg-surface-container-low p-3 text-[13px] font-semibold text-on-surface-variant">
                Sin tareas pendientes.
              </p>
            )}
          </section>
        </div>

        {/* Quick actions */}
        <section className="flex flex-col gap-2" aria-label="Acciones rápidas">
          <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Acciones rápidas</span>
          <div className="grid grid-cols-4 gap-2.5">
            {quickActions.map(({ label, href, icon: Icon, gradient, color }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-container-low p-2.5 text-center"
              >
                <span
                  className="grid size-12 place-items-center rounded-full"
                  style={{ background: gradient, color, boxShadow: "0 4px 14px rgb(0 0 0 / 30%)" }}
                  aria-hidden="true"
                >
                  <Icon size={22} strokeWidth={2.3} />
                </span>
                <span className="text-[11px] font-semibold leading-tight text-on-surface">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Coquín insight */}
        <section
          className="card-surface flex items-start gap-3"
          style={{ background: "linear-gradient(90deg, var(--surface-high), var(--surface-container), var(--surface-high))" }}
          aria-label="Consejo de Coquín"
        >
          <span className="glow-blob" style={{ top: 0, right: 0, width: 128, height: 128, background: "rgb(255 185 85 / 10%)" }} />
          <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-[rgb(255_185_85_/_18%)] text-secondary">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Consejo Coquín</span>
              <span className="size-1 rounded-full bg-secondary" />
              <span className="text-[11px] font-semibold text-on-surface-variant">Resumen</span>
            </div>
            <p className="text-[13px] leading-snug text-on-surface">{savingsInsight}</p>
          </div>
        </section>

        <Link href="/finances" className="cta-pill">
          <ClipboardList size={20} aria-hidden="true" />
          Ver panel financiero
        </Link>
      </div>
    </AppChrome>
  );
}
