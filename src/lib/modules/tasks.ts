import type { ProjectTask } from "@/lib/types";

export function countTasksByStatus(tasks: ProjectTask[]) {
  return tasks.reduce<Record<string, number>>((counts, task) => {
    counts[task.status] = (counts[task.status] ?? 0) + 1;
    return counts;
  }, {});
}

export function getTasksForOwner(tasks: ProjectTask[], owner: string) {
  return tasks.filter((task) => task.owner.toLowerCase() === owner.toLowerCase());
}

export function calculateTaskProgress(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}
