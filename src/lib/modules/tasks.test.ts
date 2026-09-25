import { taskOwnerName, memberOptionLabel } from "./tasks";
import { describe, expect, it } from "vitest";
import { projectTasks } from "@/lib/data/mock";
import { calculateTaskProgress, countTasksByStatus, getTasksForOwner } from "./tasks";

describe("tasks module", () => {
  it("counts tasks by status", () => {
    expect(countTasksByStatus(projectTasks)).toMatchObject({
      Urgente: 1,
      "En progreso": 1,
      Pendiente: 1,
    });
  });

  it("filters tasks by owner", () => {
    expect(getTasksForOwner(projectTasks, "luis")).toHaveLength(1);
  });

  it("calculates project completion progress", () => {
    expect(calculateTaskProgress(4, 6)).toBe(67);
    expect(calculateTaskProgress(0, 0)).toBe(0);
  });
});

describe("family task assignment", () => {
  const members = [
    { userId: "11111111-1111-4111-8111-111111111111", displayName: "Ana" },
    { userId: "22222222-2222-4222-8222-222222222222", displayName: "Ana" },
  ];
  it("resolves current names by account and preserves legacy task owners", () => {
    const task = { id: "one", title: "Comprar", owner: "Nombre anterior", due: "2026-09-25", status: "Pendiente" };
    expect(taskOwnerName({ ...task, ownerId: members[0].userId }, members)).toBe("Ana");
    expect(taskOwnerName(task, members)).toBe("Nombre anterior");
    expect(taskOwnerName({ ...task, ownerId: "deleted" }, members)).toBe("Nombre anterior");
  });
  it("distinguishes identical names and marks the signed-in person", () => {
    expect(memberOptionLabel(members[0], members, members[0].userId)).toBe("Ana · 11111111 (tú)");
    expect(memberOptionLabel(members[1], members, members[0].userId)).toBe("Ana · 22222222");
  });
});
