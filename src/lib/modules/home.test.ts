import { describe, expect, it } from "vitest";
import { overviewMetrics, projectTasks, todayEvents } from "@/lib/data/mock";
import { countTodaysEvents, countUrgentTasks, getHomeAttentionSummary, getOverviewValue } from "./home";

describe("home module", () => {
  it("reads overview metric values by label", () => {
    expect(getOverviewValue(overviewMetrics, "Citas hoy")).toBe("3");
    expect(getOverviewValue(overviewMetrics, "Mercado usado")).toBe("63%");
    expect(getOverviewValue(overviewMetrics, "No existe")).toBeNull();
  });

  it("summarizes attention items for the home dashboard", () => {
    expect(countTodaysEvents(todayEvents)).toBe(3);
    expect(countUrgentTasks(projectTasks)).toBe(1);
    expect(getHomeAttentionSummary(todayEvents, projectTasks)).toEqual({
      eventsToday: 3,
      urgentTasks: 1,
      totalAttentionItems: 4,
    });
  });
});
