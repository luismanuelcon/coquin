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

export function taskOwnerName(task: ProjectTask, members: import("@/lib/types").HouseholdMember[]) {
  return members.find((member) => member.userId === task.ownerId)?.displayName || task.owner;
}

export function memberOptionLabel(member: import("@/lib/types").HouseholdMember, members: import("@/lib/types").HouseholdMember[], currentUserId: string) {
  const duplicate = members.some((other) => other.userId !== member.userId && other.displayName.toLocaleLowerCase() === member.displayName.toLocaleLowerCase());
  return `${member.displayName}${duplicate ? ` · ${member.userId.slice(0, 8)}` : ""}${member.userId === currentUserId ? " (tú)" : ""}`;
}
