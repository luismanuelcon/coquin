import type { IconComponent, ModuleKey } from "@/lib/types";
import { moduleThemes } from "@/lib/design-system";

type PageHeadingProps = {
  tone: ModuleKey;
  icon: IconComponent;
  title: string;
};

export function PageHeading({ tone, icon: Icon, title }: PageHeadingProps) {
  const theme = moduleThemes[tone];

  return (
    <header className="flex items-center justify-between gap-4 pt-1">
      <h2 className="text-[30px] font-extrabold leading-9" style={{ color: theme.text }}>
        {title}
      </h2>
      <div
        className="grid size-11 shrink-0 place-items-center rounded-full border bg-[rgb(255_255_255_/_5%)]"
        style={{ borderColor: theme.color, color: theme.text, boxShadow: `0 0 18px ${theme.color}14` }}
      >
        <Icon aria-hidden="true" size={22} strokeWidth={2.4} />
      </div>
    </header>
  );
}
