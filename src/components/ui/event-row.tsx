import { Clock3, Trash2 } from "lucide-react";
import { moduleThemes } from "@/lib/design-system";
import type { HouseholdEvent } from "@/lib/types";
import { SwipeDeleteRow } from "./swipe-delete-row";

type EventRowProps = {
  event: HouseholdEvent;
  onDelete?: (event: HouseholdEvent) => void;
};

export function EventRow({ event, onDelete }: EventRowProps) {
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
        <h3 className="truncate text-sm font-bold text-[var(--text)]">{event.title}</h3>
        <p className="mt-0.5 truncate text-xs font-medium text-[var(--text-soft)]">{event.meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <time className="rounded-full border border-[var(--outline-soft)] bg-[var(--surface-low)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
          {event.time}
        </time>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(event)}
            className="grid size-10 place-items-center rounded-full bg-[var(--urgent-soft)] text-[var(--urgent)]"
            aria-label={`Eliminar ${event.title}`}
          >
            <Trash2 aria-hidden="true" size={16} strokeWidth={2.4} />
          </button>
        ) : null}
      </div>
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
