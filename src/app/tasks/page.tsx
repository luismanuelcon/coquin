import { CheckCircle2, Hammer, UserRound } from "lucide-react";
import { AppChrome } from "@/components/layout/app-chrome";
import { PageHeading } from "@/components/ui/page-heading";
import { ProgressBar } from "@/components/ui/progress-bar";
import { projectTasks } from "@/lib/data/mock";

export default function TasksPage() {
  return (
    <AppChrome>
      <div className="page-stack">
        <PageHeading
          tone="tasks"
          icon={CheckCircle2}
          eyebrow="Tareas y proyectos"
          title="Responsabilidades"
          description="Da seguimiento a mantenimiento, rutinas, proyectos del hogar y pendientes compartidos."
        />

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Proyecto activo</h2>
            <span className="rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] px-3 py-1 text-xs font-extrabold text-[var(--urgent)]">
              68%
            </span>
          </div>
          <div className="rounded-[24px] border border-[var(--urgent)] bg-[var(--urgent-soft)] p-4 shadow-[0_0_18px_rgb(255_0_229_/_12%)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full bg-[rgb(255_255_255_/_8%)] text-[var(--urgent)]">
                <Hammer size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Mantenimiento de agosto</h3>
                <p className="text-xs font-bold text-[var(--text-soft)]">4 de 6 tareas completadas</p>
              </div>
            </div>
            <ProgressBar value={68} color="var(--urgent)" />
          </div>
        </section>

        <section>
          <h2 className="section-title mb-3">Pendientes</h2>
          <div className="flex flex-col gap-3">
            {projectTasks.map((task) => (
              <article key={task.id} className="rounded-[24px] border border-[var(--surface-stroke)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold">{task.title}</h3>
                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[var(--text-soft)]">
                      <UserRound size={14} />
                      <span>{task.owner}</span>
                      <span>·</span>
                      <span>{task.due}</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-[var(--urgent)] bg-[var(--urgent-soft)] px-3 py-1 text-[11px] font-extrabold text-[var(--urgent)]">
                    {task.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppChrome>
  );
}
