"use client";

import { CalendarDays, Clock, Plus, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AppChrome } from "@/components/layout/app-chrome";
import { EventRow } from "@/components/ui/event-row";
import { PageHeading } from "@/components/ui/page-heading";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { useModule } from "@/components/data/data-provider";
import { getColombiaTodayIso, getColombiaWorkweek } from "@/lib/date";
import { useScrollIntoViewOnOpen } from "@/lib/hooks/use-scroll-into-view-on-open";
import type { HouseholdEvent, ModuleKey } from "@/lib/types";

export default function CalendarPage() {
  const days = useMemo(() => getColombiaWorkweek(), []);
  const [events, setEvents] = useModule("calendar");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(getColombiaTodayIso());
  const [tone, setTone] = useState<ModuleKey>("calendar");
  const [lastAdded, setLastAdded] = useState("");

  const canSubmit = Boolean(title.trim() && time.trim() && date.trim());

  useScrollIntoViewOnOpen(formOpen, "calendar-event-form");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const nextEvent: HouseholdEvent = {
      id: editingId ?? crypto.randomUUID(),
      title: title.trim(),
      meta: meta.trim() || "Sin detalle",
      time: time.trim(),
      date,
      tone,
    };

    if (!await setEvents(current => editingId ? current.map(item => item.id === editingId ? nextEvent : item) : [nextEvent, ...current])) return;
    setEditingId(null);
    setLastAdded(nextEvent.title);
    setTitle("");
    setMeta("");
    setTime("");
    setDate(getColombiaTodayIso());
    setTone("calendar");
    setFormOpen(false);
  }

  async function deleteEvent(event: HouseholdEvent) {
    if (!window.confirm(`Eliminar ${event.title}?`)) {
      return;
    }

    if (!await setEvents((current) => current.filter((currentEvent) => currentEvent.id !== event.id))) return;
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
          <div className="grid grid-cols-5 gap-1 min-[360px]:gap-2">
            {days.map((item) => (
              <button
                key={item.iso}
                type="button"
                className="interactive-surface rounded-[16px] px-1.5 py-3 text-center min-[360px]:px-2"
                aria-pressed={item.active}
                style={{
                  background: item.active ? "var(--gradient-calendar)" : "var(--surface-low)",
                  color: item.active ? "white" : "var(--text-muted)",
                  border: item.active ? "1px solid rgb(180 122 15 / 34%)" : "1px solid var(--surface-stroke)",
                  boxShadow: item.active ? "0 12px 22px rgb(221 162 24 / 30%)" : "none",
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
            className="interactive-surface flex items-center gap-2 rounded-[16px] border border-[rgb(122_15_62_/_26%)] bg-[var(--primary-soft)] px-3 py-2 text-xs font-bold text-[var(--on-primary-container)]"
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
              onClick={() => {
                setEditingId(null); setTitle(""); setMeta(""); setTime(""); setDate(getColombiaTodayIso()); setTone("calendar");
                setFormOpen((current) => !current);
              }}
              className="grid size-11 place-items-center rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
              aria-label={formOpen ? "Cerrar evento" : "Crear evento"}
              aria-expanded={formOpen}
            >
              {formOpen ? <X aria-hidden="true" size={18} strokeWidth={2.6} /> : <Plus aria-hidden="true" size={20} strokeWidth={2.8} />}
            </button>
          </div>

          {formOpen ? (
            <form id="calendar-event-form" className="card mb-3 p-3" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_112px]">
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Cita, entrega, llamada..."
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--primary)]"
                />
                <TimePicker
                  value={time}
                  onChange={setTime}
                  tone="calendar"
                  ariaLabel="Hora del evento"
                  align="end"
                  triggerClassName="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] text-left"
                />
              </div>
              <div className="mt-2">
                <DatePicker
                  value={date}
                  onChange={setDate}
                  tone="calendar"
                  ariaLabel="Fecha del evento"
                  triggerClassName="h-11 w-full min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] text-left"
                />
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={meta}
                  onChange={(event) => setMeta(event.target.value)}
                  placeholder="Lugar o detalle"
                  className="h-11 w-full min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--primary)]"
                />
              </div>
              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-2 h-11 w-full rounded-full bg-[image:var(--gradient-calendar)] text-sm font-extrabold text-white shadow-[0_12px_22px_rgb(180_122_15_/_28%)] disabled:cursor-not-allowed disabled:opacity-45"
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
              <EventRow key={event.id} event={event} onDelete={deleteEvent} onEdit={item => {
                setEditingId(item.id); setTitle(item.title); setMeta(item.meta); setTime(item.time); setDate(item.date); setTone(item.tone); setFormOpen(true);
              }} />
            ))}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
