import { ModuleIcon } from "@/components/brand/module-icon";
import type { ModuleKey } from "@/lib/types";

type PageHeadingProps = {
  tone: ModuleKey;
  title: string;
};

export function PageHeading({ tone, title }: PageHeadingProps) {

  return (
    <header className="flex items-center justify-between gap-4 pt-1">
      <h2 className="text-[26px] font-medium leading-8 text-[var(--text)]">
        {title}
      </h2>
      <ModuleIcon tone={tone} size="lg" />
    </header>
  );
}
