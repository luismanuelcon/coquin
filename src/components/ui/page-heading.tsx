import { ModuleIcon } from "@/components/brand/module-icon";
import type { ModuleKey } from "@/lib/types";
import { moduleThemes } from "@/lib/design-system";

type PageHeadingProps = {
  tone: ModuleKey;
  title: string;
};

export function PageHeading({ tone, title }: PageHeadingProps) {
  const theme = moduleThemes[tone];

  return (
    <header className="flex items-center justify-between gap-4 pt-1">
      <h2 className="text-[30px] font-extrabold leading-9" style={{ color: theme.text }}>
        {title}
      </h2>
      <ModuleIcon tone={tone} size="lg" />
    </header>
  );
}
