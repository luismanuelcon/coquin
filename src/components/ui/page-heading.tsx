import type { IconComponent, ModuleKey } from "@/lib/types";
import { moduleThemes } from "@/lib/design-system";

type PageHeadingProps = {
  tone: ModuleKey;
  icon: IconComponent;
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeading({ tone, icon: Icon, eyebrow, title, description }: PageHeadingProps) {
  const theme = moduleThemes[tone];

  return (
    <section
      className="rounded-[28px] border p-5"
      style={{ background: theme.surface, borderColor: theme.color, boxShadow: `0 0 24px ${theme.color}18` }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase text-[var(--text-soft)]">{eyebrow}</p>
          <h2 className="mt-2 text-[28px] font-extrabold leading-9" style={{ color: theme.text }}>
            {title}
          </h2>
        </div>
        <div
          className="grid size-12 shrink-0 place-items-center rounded-full bg-[rgb(255_255_255_/_7%)]"
          style={{ color: theme.text }}
        >
          <Icon size={24} strokeWidth={2.4} />
        </div>
      </div>
      <p className="text-sm font-medium leading-6 text-[var(--text-soft)]">{description}</p>
    </section>
  );
}
