"use client";

import { CalendarDays, Clock, Plus, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { AppChrome } from "@/components/layout/app-chrome";
import { EventRow } from "@/components/ui/event-row";
import { PageHeading } from "@/components/ui/page-heading";
import { calendarEvents } from "@/lib/data/mock";
import type { HouseholdEvent, ModuleKey } from "@/lib/types";

const days = [
  { day: "Lun", date: "17", active: false },
  { day: "Mar", date: "18", active: true },
  { day: "Mie", date: "19", active: false },
  { day: "Jue", date: "20", active: false },
  { day: "Vie", date: "21", active: false },
];

const tones: ModuleKey[] = ["calendar", "finances", "market", "tasks"];

export default function CalendarPage() {
  const [events, setEvents] = useState<HouseholdEvent[]>(calendarEvents);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");
  const [time, setTime] = useState("");
  const [tone, setTone] = useState<ModuleKey>("calendar");
  const [lastAdded, setLastAdded] = useState("");

  const canSubmit = Boolean(title.trim() && time.trim());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const nextEvent: HouseholdEvent = {
      id: `event-${Date.now()}`,
      title: title.trim(),
      meta: meta.trim() || "Sin detalle",
      time: time.trim(),
      tone,
    };

    setEvents((current) => [nextEvent, ...current]);
    setLastAdded(nextEvent.title);
    setTitle("");
    setMeta("");
    setTime("");
    setTone("calendar");
    setFormOpen(false);
  }

  function deleteEvent(event: HouseholdEvent) {
    if (!window.confirm(`Eliminar ${event.title}?`)) {
      return;
    }

    setEvents((current) => current.filter((currentEvent) => currentEvent.id !== event.id));
    setLastAdded("Evento eliminado");
  }

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading tone="calendar" title="Citas y eventos" />

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Esta semana</h2>
            <div className="grid size-10 place-items-center rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]">
              <CalendarDays aria-hidden="true" size={18} strokeWidth={2.4} />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {days.map((item) => (
              <button
                key={item.date}
                type="button"
                className="interactive-surface rounded-[16px] px-2 py-3 text-center"
                aria-pressed={item.active}
                style={{
                  background: item.active ? "var(--gradient-primary)" : "var(--surface-low)",
                  color: item.active ? "white" : "var(--text-muted)",
                  border: item.active ? "1px solid rgb(194 65 12 / 38%)" : "1px solid var(--surface-stroke)",
                  boxShadow: item.active ? "0 12px 22px rgb(194 65 12 / 16%)" : "none",
                }}
              >
                <span className="block text-[11px] font-bold">{item.day}</span>
                <span className="mt-1 block text-lg font-extrabold">{item.date}</span>
              </button>
            ))}
          </div>
        </section>

        {lastAdded ? (
          <p
            className="interactive-surface flex items-center gap-2 rounded-[16px] border border-[rgb(194_65_12_/_24%)] bg-[var(--primary-soft)] px-3 py-2 text-xs font-bold text-[var(--on-primary-container)]"
            aria-live="polite"
          >
            <Clock aria-hidden="true" size={16} strokeWidth={2.4} />
            {lastAdded}
          </p>
        ) : null}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Proximos eventos</h2>
            <button
              type="button"
              onClick={() => setFormOpen((current) => !current)}
              className="grid size-11 place-items-center rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
              aria-label={formOpen ? "Cerrar evento" : "Crear evento"}
              aria-expanded={formOpen}
            >
              {formOpen ? <X aria-hidden="true" size={18} strokeWidth={2.6} /> : <Plus aria-hidden="true" size={20} strokeWidth={2.8} />}
            </button>
          </div>

          {formOpen ? (
            <form className="card mb-3 p-3" onSubmit={handleSubmit}>
              <div className="grid grid-cols-[1fr_112px] gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Cita, entrega, llamada..."
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--primary)]"
                />
                <input
                  type="text"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  placeholder="09:30"
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--primary)]"
                />
              </div>
              <div className="mt-2 grid grid-cols-[1fr_128px] gap-2">
                <input
                  type="text"
                  value={meta}
                  onChange={(event) => setMeta(event.target.value)}
                  placeholder="Lugar o detalle"
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--primary)]"
                />
                <select
                  value={tone}
                  onChange={(event) => setTone(event.target.value as ModuleKey)}
                  className="h-11 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                >
                  {tones.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-2 h-11 w-full rounded-full bg-[image:var(--gradient-primary)] text-sm font-extrabold text-white shadow-[var(--shadow-active)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Guardar
              </button>
            </form>
          ) : null}

          <div className="flex flex-col gap-3">
            {events.length === 0 ? (
              <p className="rounded-[18px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-4 text-sm font-bold text-[var(--text-soft)]">
                No hay eventos registrados.
              </p>
            ) : null}
            {events.map((event) => (
              <EventRow key={event.id} event={event} onDelete={deleteEvent} />
            ))}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
