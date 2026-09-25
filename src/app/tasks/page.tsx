"use client";

import { Check, Hammer, Pencil, Plus, RefreshCw, UserRound, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SwipeDeleteRow } from "@/components/ui/swipe-delete-row";
import { DatePicker } from "@/components/ui/date-picker";
import { useAppData, useModule } from "@/components/data/data-provider";
import { celebrate } from "@/lib/ui/celebrate";
import { useScrollIntoViewOnOpen } from "@/lib/hooks/use-scroll-into-view-on-open";
import { calculateTaskProgress, taskOwnerName, memberOptionLabel } from "@/lib/modules/tasks";
import type { ProjectTask } from "@/lib/types";

const statuses = ["Pendiente", "En progreso", "Urgente", "Completada"];

const dueFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

function formatDueDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return dueFormatter.format(new Date(y, m - 1, d, 12)).replace(".", "");
}

const statusStyles: Record<string, { bg: string; color: string }> = {
  Pendiente: { bg: "rgb(255 185 85 / 15%)", color: "var(--secondary)" },
  "En progreso": { bg: "rgb(255 107 151 / 15%)", color: "var(--primary)" },
  Urgente: { bg: "rgb(255 180 171 / 15%)", color: "var(--color-error)" },
  Completada: { bg: "var(--surface-high)", color: "var(--text-soft)" },
};

function getStatusStyle(status: string) {
  return statusStyles[status] ?? statusStyles.Pendiente;
}

const FILTERS = ["Todos", "Pendiente", "En progreso", "Completada"] as const;
type Filter = (typeof FILTERS)[number];

export default function TasksPage() {
  const { members, membersError, refreshMembers, userId } = useAppData();
  const [tasks, setTasks] = useModule("tasks");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("Todos");
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
  const editingTask = tasks.find((task) => task.id === editingId);
  const selectedMember = members.find((member) => member.userId === owner && member.displayName);
  const keepingPreviousOwner = owner === "previous" && !!editingTask;
  const canSubmit = Boolean(title.trim() && due.trim() && (keepingPreviousOwner || (selectedMember && !membersError)));

  const counts = useMemo(() => {
    const base: Record<string, number> = { Todos: tasks.length };
    for (const f of FILTERS.slice(1)) base[f] = tasks.filter((t) => t.status === f).length;
    return base;
  }, [tasks]);

  const filteredTasks = filter === "Todos" ? tasks : tasks.filter((task) => task.status === filter);

  useScrollIntoViewOnOpen(formOpen, "task-form");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const task: ProjectTask = {
      id: editingId ?? crypto.randomUUID(),
      title: title.trim(),
      owner: keepingPreviousOwner ? editingTask!.owner : selectedMember!.displayName,
      ...(keepingPreviousOwner
        ? editingTask!.ownerId ? { ownerId: editingTask!.ownerId } : {}
        : { ownerId: selectedMember!.userId }),
      due: due.trim(),
      status,
    };

    if (!(await setTasks((current) => (editingId ? current.map((item) => (item.id === editingId ? task : item)) : [task, ...current])))) return;
    setEditingId(null);
    setLastAdded(task.title);
    celebrate();
    setTitle("");
    setOwner("");
    setDue("");
    setStatus("Pendiente");
    setFormOpen(false);
  }

  async function toggleCompleted(taskId: string) {
    await setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "Completada" ? "Pendiente" : "Completada" }
          : task,
      ),
    );
  }

  async function deleteTask(task: ProjectTask) {
    if (!window.confirm(`Eliminar ${task.title}?`)) return;
    if (!(await setTasks((current) => current.filter((currentTask) => currentTask.id !== task.id)))) return;
    setLastAdded("Tarea eliminada");
  }

  const inputClass =
    "h-11 min-w-0 rounded-2xl border border-transparent bg-surface-container-lowest px-3 text-sm font-semibold text-on-surface outline-none placeholder:text-outline focus:border-tertiary-container";

  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="tasks"
          eyebrow="Responsabilidades"
          title="Tareas del hogar"
          subtitle={`${tasks.length} tareas organizadas`}
          badge="Activo"
        />

        <section className="card-elevated" aria-label="Proyecto activo">
          <span
            className="glow-blob"
            style={{ bottom: -32, right: -32, width: 112, height: 112, background: "rgb(255 107 151 / 10%)" }}
          />
          <div className="relative z-10 mb-3 flex items-center justify-between">
            <h2 className="section-title">Progreso general</h2>
            <span className="pill pill--secondary">{progress}%</span>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-container-high text-secondary">
              <Hammer aria-hidden="true" size={20} strokeWidth={2.4} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-bold text-on-surface">Actividades de la semana</h3>
              <p className="text-xs font-semibold text-on-surface-variant">
                {completedCount} de {tasks.length} completadas
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <ProgressBar value={progress} ariaLabel="Progreso de tareas" />
          </div>
        </section>

        <div className="chip-row" aria-label="Filtros de tareas">
          {FILTERS.map((f) => (
            <button key={f} type="button" className="chip" data-active={filter === f} onClick={() => setFilter(f)} aria-pressed={filter === f}>
              {f === "Todos" ? "Todos" : f}
              <span className="chip__count">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>

        {lastAdded ? (
          <p className="toast" aria-live="polite">{lastAdded}</p>
        ) : null}

        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Actividades</h2>
            <button
              type="button"
              onClick={() => {
                void refreshMembers();
                setEditingId(null);
                setTitle("");
                setOwner("");
                setDue("");
                setStatus("Pendiente");
                setFormOpen((current) => !current);
              }}
              className="icon-fab icon-fab--secondary"
              aria-label={formOpen ? "Cerrar tarea" : "Crear tarea"}
              aria-expanded={formOpen}
            >
              {formOpen ? <X aria-hidden="true" size={20} strokeWidth={2.6} /> : <Plus aria-hidden="true" size={20} strokeWidth={2.8} />}
            </button>
          </div>

          {formOpen ? (
            <form id="task-form" className="card-surface flex flex-col gap-2 overflow-visible p-3" onSubmit={handleSubmit}>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Tarea"
                aria-label="Nombre de la tarea"
                required
                className={`${inputClass} w-full`}
              />
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_130px]">
                <label className="field text-xs font-semibold text-on-surface-variant">
                  Responsable
                  <select value={owner} onChange={(event) => setOwner(event.target.value)} className={inputClass} required aria-describedby="task-owner-help">
                    <option value="" disabled>Elige un integrante</option>
                    {editingTask && <option value="previous">{taskOwnerName(editingTask, members)} (responsable actual)</option>}
                    {members.filter((member) => member.displayName).map((member) => (
                      <option key={member.userId} value={member.userId}>{memberOptionLabel(member, members, userId)}</option>
                    ))}
                  </select>
                </label>
                <DatePicker
                  value={due}
                  onChange={setDue}
                  tone="tasks"
                  ariaLabel="Fecha de vencimiento"
                  placeholder="Fecha"
                  align="end"
                  triggerClassName={`${inputClass} text-left`}
                />
              </div>
              <p id="task-owner-help" className="text-xs text-on-surface-variant">Aparecen los integrantes de tu familia que ya guardaron su nombre.</p>
              {membersError && <p role="alert" className="auth-error">{membersError}</p>}
              <button type="button" className="back-link" onClick={() => void refreshMembers()}>Actualizar integrantes</button>
              <div className="input-shell">
                <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Estado">
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={!canSubmit} className="cta-pill mt-1">
                Guardar tarea
              </button>
            </form>
          ) : null}

          <div className="flex flex-col gap-1.5">
            {filteredTasks.length === 0 ? (
              <p className="rounded-2xl bg-surface-container p-4 text-sm font-semibold text-on-surface-variant">
                No hay tareas en esta vista.
              </p>
            ) : null}
            {filteredTasks.map((task) => {
              const completed = task.status === "Completada";
              const inProgress = task.status === "En progreso";
              const statusStyle = getStatusStyle(task.status);

              return (
                <SwipeDeleteRow key={task.id} deleteLabel={`Eliminar ${task.title}`} onDelete={() => deleteTask(task)}>
                  <article
                    className="relative flex items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2.5"
                    style={{ background: completed ? "var(--surface-low)" : "var(--surface-container)", opacity: completed ? 0.85 : 1 }}
                  >
                    {inProgress ? (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                        style={{ background: "#ff6b97", boxShadow: "0 0 8px rgb(255 107 151 / 80%)" }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => toggleCompleted(task.id)}
                      className="grid size-8 shrink-0 place-items-center rounded-full"
                      style={
                        completed
                          ? { background: "#ff6b97", color: "#66002c" }
                          : inProgress
                            ? { background: "rgb(255 107 151 / 20%)", color: "var(--primary)" }
                            : { background: "var(--surface-lowest)", color: "var(--outline)" }
                      }
                      aria-label={completed ? "Marcar pendiente" : "Completar tarea"}
                      aria-pressed={completed}
                    >
                      {inProgress && !completed ? (
                        <RefreshCw aria-hidden="true" size={15} strokeWidth={2.6} />
                      ) : (
                        <Check aria-hidden="true" size={16} strokeWidth={2.8} />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`min-w-0 truncate text-[14px] font-bold ${completed ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
                          {task.title}
                        </h3>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {task.status}
                        </span>
                      </div>
                      <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant">
                        <UserRound aria-hidden="true" size={13} />
                        <span className="min-w-0 truncate">{taskOwnerName(task, members)}</span>
                        <span>·</span>
                        <span className="shrink-0">{formatDueDate(task.due)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="row-tool"
                      aria-label={`Editar ${task.title}`}
                      title="Editar tarea"
                      onClick={() => {
                        setEditingId(task.id);
                        setTitle(task.title);
                        void refreshMembers();
                        setOwner("previous");
                        setDue(task.due);
                        setStatus(task.status);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
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
