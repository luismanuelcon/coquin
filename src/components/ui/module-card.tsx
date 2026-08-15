import type { ModuleKey } from "@/lib/types";
import { moduleThemes } from "@/lib/design-system";

type ModuleCardProps = {
  tone: ModuleKey;
  title: string;
  value: string;
  detail: string;
};

export function ModuleCard({ tone, title, value, detail }: ModuleCardProps) {
  const theme = moduleThemes[tone];
  const Icon = theme.icon;

  return (
    <article
      className="rounded-[24px] border p-4"
      style={{ background: theme.surface, color: theme.text, borderColor: theme.color }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="grid size-10 place-items-center rounded-full bg-[rgb(255_255_255_/_6%)]">
          <Icon size={20} strokeWidth={2.4} />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-normal">{title}</span>
      </div>
      <p className="text-[28px] font-extrabold leading-8">{value}</p>
      <p className="mt-1 text-xs font-semibold opacity-80">{detail}</p>
    </article>
  );
}
