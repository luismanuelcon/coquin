import type { HouseholdEvent, ModuleKey } from "@/lib/types";

export function getEventsByTone(events: HouseholdEvent[], tone: ModuleKey) {
  return events.filter((event) => event.tone === tone);
}

export function countEventsByTone(events: HouseholdEvent[]) {
  return events.reduce<Record<ModuleKey, number>>(
    (counts, event) => ({
      ...counts,
      [event.tone]: counts[event.tone] + 1,
    }),
    {
      home: 0,
      calendar: 0,
      finances: 0,
      market: 0,
      tasks: 0,
    },
  );
}

export function getCalendarEventLabels(events: HouseholdEvent[]) {
  return events.map((event) => `${event.time} · ${event.title}`);
}
