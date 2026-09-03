"use client";

import { Check, CheckCircle2, Hammer, Plus, UserRound, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SwipeDeleteRow } from "@/components/ui/swipe-delete-row";
import { projectTasks } from "@/lib/data/mock";
import { useScrollIntoViewOnOpen } from "@/lib/hooks/use-scroll-into-view-on-open";
import { calculateTaskProgress } from "@/lib/modules/tasks";
import type { ProjectTask } from "@/lib/types";

const statuses = ["Pendiente", "En progreso", "Urgente", "Completada"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<ProjectTask[]>(projectTasks);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [due, setDue] = useState("");
  const [status, setStatus] = useState("Pendiente");
  const [lastAdded, setLastAdded] = useState("");

  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === "Completada").length,
    [tasks],
  );
  const progress = calculateTaskProgress(completedCount, tasks.length || 1);
  const canSubmit = Boolean(title.trim() && owner.trim() && due.trim());

  useScrollIntoViewOnOpen(formOpen, "task-form");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const task: ProjectTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      owner: owner.trim(),
      due: due.trim(),
      status,
    };

    setTasks((current) => [task, ...current]);
    setLastAdded(task.title);
    setTitle("");
    setOwner("");
    setDue("");
    setStatus("Pendiente");
    setFormOpen(false);
  }

  function toggleCompleted(taskId: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "Completada" ? "Pendiente" : "Completada",
            }
          : task,
      ),
    );
  }

  function deleteTask(task: ProjectTask) {
    if (!window.confirm(`Eliminar ${task.title}?`)) {
      return;
    }

    setTasks((current) => current.filter((currentTask) => currentTask.id !== task.id));
    setLastAdded("Tarea eliminada");
  }

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading tone="tasks" title="Responsabilidades" />

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Proyecto activo</h2>
            <span className="rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] px-3 py-1 text-xs font-extrabold text-[var(--urgent)]">
              {progress}%
            </span>
          </div>
          <div className="interactive-surface rounded-[20px] border border-[var(--urgent)] bg-[var(--urgent-soft)] p-4 shadow-[0_12px_22px_rgb(161_98_7_/_12%)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[rgb(255_255_255_/_8%)] text-[var(--urgent)]">
                <Hammer aria-hidden="true" size={20} strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-extrabold">Mantenimiento de agosto</h3>
                <p className="text-xs font-bold text-[var(--text-soft)]">
                  {completedCount} de {tasks.length} completadas
                </p>
              </div>
            </div>
            <ProgressBar value={progress} color="var(--urgent)" />
          </div>
        </section>

        {lastAdded ? (
          <p
            className="interactive-surface flex items-center gap-2 rounded-[16px] border border-[rgb(75_16_41_/_24%)] bg-[var(--primary-soft)] px-3 py-2 text-xs font-bold text-[var(--on-primary-container)]"
            aria-live="polite"
          >
            <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2.4} />
            {lastAdded}
          </p>
        ) : null}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Pendientes</h2>
            <button
              type="button"
              onClick={() => setFormOpen((current) => !current)}
              className="grid size-11 place-items-center rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] text-[var(--urgent)]"
              aria-label={formOpen ? "Cerrar tarea" : "Crear tarea"}
              aria-expanded={formOpen}
            >
              {formOpen ? <X aria-hidden="true" size={18} strokeWidth={2.6} /> : <Plus aria-hidden="true" size={20} strokeWidth={2.8} />}
            </button>
          </div>

          {formOpen ? (
            <form id="task-form" className="card mb-3 p-3" onSubmit={handleSubmit}>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Tarea"
                className="h-11 w-full rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--urgent)]"
              />
              <div className="mt-2 grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_120px]">
                <input
                  type="text"
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  placeholder="Responsable"
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--urgent)]"
                />
                <input
                  type="text"
                  value={due}
                  onChange={(event) => setDue(event.target.value)}
                  placeholder="Fecha"
                  className="h-11 min-w-0 rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--urgent)]"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 h-11 w-full rounded-[14px] border border-[var(--surface-stroke)] bg-[var(--surface-lowest)] px-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--urgent)]"
                aria-label="Estado"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-2 h-11 w-full rounded-full bg-[image:var(--gradient-alert)] text-sm font-extrabold text-white shadow-[0_12px_22px_rgb(159_18_57_/_16%)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Guardar
              </button>
            </form>
          ) : null}

          <div className="flex flex-col gap-2">
            {tasks.length === 0 ? (
              <p className="rounded-[18px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-4 text-sm font-bold text-[var(--text-soft)]">
                No hay tareas registradas.
              </p>
            ) : null}
            {tasks.map((task) => {
              const completed = task.status === "Completada";

              return (
                <SwipeDeleteRow key={task.id} deleteLabel={`Eliminar ${task.title}`} onDelete={() => deleteTask(task)}>
                <article
                  key={task.id}
                  className="interactive-surface flex items-center gap-3 rounded-[18px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-3 shadow-[var(--shadow-soft)]"
                >
                  <button
                    type="button"
                    onClick={() => toggleCompleted(task.id)}
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] text-[var(--urgent)]"
                    aria-label={completed ? "Marcar pendiente" : "Completar tarea"}
                    aria-pressed={completed}
                  >
                    <Check aria-hidden="true" size={18} strokeWidth={2.7} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className={`truncate text-sm font-extrabold ${completed ? "text-[var(--text-soft)] line-through" : ""}`}>
                      {task.title}
                    </h3>
                    <div className="mt-1 flex min-w-0 items-center gap-2 text-xs font-bold text-[var(--text-soft)]">
                      <UserRound aria-hidden="true" size={14} />
                      <span className="min-w-0 truncate">{task.owner}</span>
                      <span>·</span>
                      <span className="shrink-0">{task.due}</span>
                    </div>
                  </div>
                  <span className="max-w-[88px] shrink-0 truncate rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] px-3 py-1 text-[11px] font-extrabold text-[var(--urgent)]">
                    {task.status}
                  </span>
                </article>
                </SwipeDeleteRow>
              );
            })}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
