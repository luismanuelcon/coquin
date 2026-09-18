"use client";

import { Plus, X } from "lucide-react";
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

const monthLabel = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" });

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
  const badge = monthLabel.format(new Date()).replace(/^\w/, (c) => c.toUpperCase());

  useScrollIntoViewOnOpen(formOpen, "calendar-event-form");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const nextEvent: HouseholdEvent = {
      id: editingId ?? crypto.randomUUID(),
      title: title.trim(),
      meta: meta.trim() || "Sin detalle",
      time: time.trim(),
      date,
      tone,
    };

    if (!(await setEvents((current) => (editingId ? current.map((item) => (item.id === editingId ? nextEvent : item)) : [nextEvent, ...current])))) return;
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
    if (!window.confirm(`Eliminar ${event.title}?`)) return;
    if (!(await setEvents((current) => current.filter((currentEvent) => currentEvent.id !== event.id)))) return;
    setLastAdded("Evento eliminado");
  }

  const inputClass =
    "h-11 min-w-0 rounded-2xl border border-transparent bg-surface-container-lowest px-3 text-sm font-semibold text-on-surface outline-none placeholder:text-outline focus:border-primary-container";

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="calendar"
          eyebrow="Citas & eventos"
          title="Agenda del hogar"
          subtitle={`${events.length} eventos en tu semana`}
          badge={badge}
        />

        <section className="card-elevated" aria-label="Esta semana">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Esta semana</h2>
            <span className="pill pill--secondary">Vie activo</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {days.map((item) => (
              <button
                key={item.iso}
                type="button"
                className="flex h-[84px] flex-col items-center justify-center gap-1 rounded-2xl transition-transform active:scale-95"
                aria-pressed={item.active}
                style={
                  item.active
                    ? {
                        background: "linear-gradient(180deg, #ffb955, #dc9100)",
                        color: "#452b00",
                        boxShadow: "0 8px 24px rgb(255 185 85 / 40%)",
                      }
                    : { background: "#2f2731", color: "#debfc4" }
                }
              >
                <span className="text-[11px] font-bold">{item.day}</span>
                <span className="text-xl font-extrabold" style={{ color: item.active ? "#452b00" : "#ebdfec" }}>
                  {item.date}
                </span>
              </button>
            ))}
          </div>
        </section>

        {lastAdded ? (
          <p className="toast" aria-live="polite">{lastAdded}</p>
        ) : null}

        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Próximos eventos</h2>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setMeta("");
                setTime("");
                setDate(getColombiaTodayIso());
                setTone("calendar");
                setFormOpen((current) => !current);
              }}
              className="icon-fab icon-fab--secondary"
              aria-label={formOpen ? "Cerrar evento" : "Crear evento"}
              aria-expanded={formOpen}
            >
              {formOpen ? <X aria-hidden="true" size={20} strokeWidth={2.6} /> : <Plus aria-hidden="true" size={20} strokeWidth={2.8} />}
            </button>
          </div>

          {formOpen ? (
            <form id="calendar-event-form" className="card-surface flex flex-col gap-2 p-3" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_120px]">
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Cita, entrega, llamada..."
                  className={inputClass}
                />
                <TimePicker
                  value={time}
                  onChange={setTime}
                  tone="calendar"
                  ariaLabel="Hora del evento"
                  align="end"
                  triggerClassName={`${inputClass} text-left`}
                />
              </div>
              <DatePicker
                value={date}
                onChange={setDate}
                tone="calendar"
                ariaLabel="Fecha del evento"
                triggerClassName={`${inputClass} w-full text-left`}
              />
              <input
                type="text"
                value={meta}
                onChange={(event) => setMeta(event.target.value)}
                placeholder="Lugar o detalle"
                className={`${inputClass} w-full`}
              />
              <button type="submit" disabled={!canSubmit} className="cta-pill mt-1">
                Guardar evento
              </button>
            </form>
          ) : null}

          <div className="flex flex-col gap-1.5">
            {events.length === 0 ? (
              <p className="rounded-2xl bg-surface-container p-4 text-sm font-semibold text-on-surface-variant">
                No hay eventos registrados.
              </p>
            ) : null}
            {events.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onDelete={deleteEvent}
                onEdit={(item) => {
                  setEditingId(item.id);
                  setTitle(item.title);
                  setMeta(item.meta);
                  setTime(item.time);
                  setDate(item.date);
                  setTone(item.tone);
                  setFormOpen(true);
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
