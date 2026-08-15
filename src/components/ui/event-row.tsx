import { Clock3 } from "lucide-react";
import { moduleThemes } from "@/lib/design-system";
import type { HouseholdEvent } from "@/lib/types";

type EventRowProps = {
  event: HouseholdEvent;
};

export function EventRow({ event }: EventRowProps) {
  const theme = moduleThemes[event.tone];

  return (
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
      <time className="rounded-full border border-[var(--outline-soft)] bg-[var(--surface-low)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
        {event.time}
      </time>
    </article>
  );
}
