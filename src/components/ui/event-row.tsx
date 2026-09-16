import { Clock3, Pencil } from "lucide-react";
import { moduleThemes } from "@/lib/design-system";
import type { HouseholdEvent } from "@/lib/types";
import { SwipeDeleteRow } from "./swipe-delete-row";

type EventRowProps = {
  event: HouseholdEvent;
  onDelete?: (event: HouseholdEvent) => void;
  onEdit?: (event: HouseholdEvent) => void;
};

function formatTime12(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return value;
  const [h, m] = value.split(":").map(Number);
  const meridiem = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${meridiem}`;
}

export function EventRow({ event, onDelete, onEdit }: EventRowProps) {
  const theme = moduleThemes[event.tone];
  const content = (
    <article className="interactive-surface flex items-center gap-3 rounded-[20px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-3 shadow-[var(--shadow-soft)]">
      <div
        className="grid size-11 shrink-0 place-items-center rounded-full"
        style={{ background: theme.surface, color: theme.text }}
      >
        <Clock3 aria-hidden="true" size={19} strokeWidth={2.4} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="break-words text-sm font-semibold text-[var(--text)]">{event.title}</h3>
        <p className="mt-0.5 break-words text-xs font-medium text-[var(--text-soft)]">{event.meta}</p>
      </div>
      <time className="shrink-0 rounded-full border border-[var(--outline-soft)] bg-[var(--surface-low)] px-2 py-1 text-xs font-bold text-[var(--text-muted)]">
        {formatTime12(event.time)}
      </time>
      {onEdit && <button type="button" className="row-tool" onClick={() => onEdit(event)} aria-label={`Editar ${event.title}`} title="Editar evento"><Pencil size={16} /></button>}
    </article>
  );

  if (onDelete) {
    return (
      <SwipeDeleteRow deleteLabel={`Eliminar ${event.title}`} onDelete={() => onDelete(event)}>
        {content}
      </SwipeDeleteRow>
    );
  }

  return content;
}
