import { describe, expect, it } from "vitest";
import { calendarEvents } from "@/lib/data/mock";
import { countEventsByTone, getCalendarEventLabels, getEventsByTone } from "./calendar";

describe("calendar module", () => {
  it("filters events by module tone", () => {
    expect(getEventsByTone(calendarEvents, "calendar")).toHaveLength(2);
    expect(getEventsByTone(calendarEvents, "finances")).toHaveLength(1);
  });

  it("counts events by category tone", () => {
    expect(countEventsByTone(calendarEvents)).toMatchObject({
      calendar: 2,
      finances: 1,
      market: 1,
      tasks: 1,
    });
  });

  it("formats labels for compact calendar lists", () => {
    expect(getCalendarEventLabels(calendarEvents)[0]).toContain("09:30 ·");
  });
});
