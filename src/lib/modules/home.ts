import type { HouseholdEvent, OverviewMetric, ProjectTask } from "@/lib/types";

export function getOverviewValue(metrics: OverviewMetric[], label: string) {
  return metrics.find((metric) => metric.label === label)?.value ?? null;
}

export function countTodaysEvents(events: HouseholdEvent[]) {
  return events.length;
}

export function countUrgentTasks(tasks: ProjectTask[]) {
  return tasks.filter((task) => task.status.toLowerCase() === "urgente").length;
}

export function getHomeAttentionSummary(events: HouseholdEvent[], tasks: ProjectTask[]) {
  return {
    eventsToday: countTodaysEvents(events),
    urgentTasks: countUrgentTasks(tasks),
    totalAttentionItems: countTodaysEvents(events) + countUrgentTasks(tasks),
  };
}
