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
