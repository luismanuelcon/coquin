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
  const Icon = theme.icon;
  const content = (
    <article
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
      style={{ background: "var(--surface-container)" }}
    >
      <div
        className="grid size-9 shrink-0 place-items-center rounded-full"
        style={{ background: "var(--surface-high)", color: theme.color }}
      >
        <Icon aria-hidden="true" size={18} strokeWidth={2.4} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[15px] font-bold leading-5 text-on-surface">{event.title}</h3>
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-on-surface-variant">
          <Clock3 aria-hidden="true" size={13} />
          {event.meta}
        </p>
      </div>
      <span
        className="shrink-0 rounded-full bg-surface-container-highest px-2.5 py-1 text-[11px] font-bold text-on-surface"
      >
        {formatTime12(event.time)}
      </span>
      {onEdit ? (
        <button
          type="button"
          className="row-tool"
          onClick={() => onEdit(event)}
          aria-label={`Editar ${event.title}`}
          title="Editar evento"
        >
          <Pencil size={16} />
        </button>
      ) : null}
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
