import { CalendarDays, Filter, Plus } from "lucide-react";
import { AppChrome } from "@/components/layout/app-chrome";
import { EventRow } from "@/components/ui/event-row";
import { PageHeading } from "@/components/ui/page-heading";
import { calendarEvents } from "@/lib/data/mock";

const days = [
  { day: "Lun", date: "17", active: false },
  { day: "Mar", date: "18", active: true },
  { day: "Mie", date: "19", active: false },
  { day: "Jue", date: "20", active: false },
  { day: "Vie", date: "21", active: false },
];

export default function CalendarPage() {
  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="calendar"
          icon={CalendarDays}
          eyebrow="Calendario familiar"
          title="Citas y eventos"
          description="Organiza medicos, colegio, servicios, impuestos y compromisos de la casa en una sola vista."
        />

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Esta semana</h2>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
              aria-label="Filtrar calendario"
            >
              <Filter size={18} strokeWidth={2.4} />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {days.map((item) => (
              <button
                key={item.date}
                type="button"
                className="rounded-[20px] px-2 py-3 text-center"
                style={{
                  background: item.active ? "var(--gradient-primary)" : "var(--surface-low)",
                  color: item.active ? "white" : "var(--text-muted)",
                  border: item.active ? "1px solid rgb(0 242 255 / 58%)" : "1px solid var(--surface-stroke)",
                  boxShadow: item.active ? "0 0 18px rgb(0 242 255 / 18%)" : "none",
                }}
              >
                <span className="block text-[11px] font-bold">{item.day}</span>
                <span className="mt-1 block text-lg font-extrabold">{item.date}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Proximos eventos</h2>
            <button className="flex items-center gap-1 rounded-full bg-[image:var(--gradient-primary)] px-3 py-2 text-xs font-extrabold text-white shadow-[var(--shadow-active)]">
              <Plus size={14} /> Nuevo
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {calendarEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--primary)] bg-[var(--primary-soft)] p-5">
          <p className="text-xs font-extrabold uppercase text-[var(--text-soft)]">Recordatorios</p>
          <h2 className="mt-2 text-xl font-extrabold text-[var(--on-primary-container)]">
            Impuestos y pagos pueden vivir en el calendario
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[var(--text-soft)]">
            Cada evento puede tener categoria, responsable, recurrencia y alerta para anticipar vencimientos.
          </p>
        </section>
      </div>
    </AppChrome>
  );
}
