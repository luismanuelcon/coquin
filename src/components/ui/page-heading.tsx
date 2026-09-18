import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModuleIcon } from "@/components/brand/module-icon";
import type { ModuleKey } from "@/lib/types";

type PageHeadingProps = {
  tone: ModuleKey;
  eyebrow: string;
  title: string;
  subtitle?: string;
  badge?: string;
  backHref?: string;
  backLabel?: string;
};

export function PageHeading({
  tone,
  eyebrow,
  title,
  subtitle,
  badge,
  backHref = "/",
  backLabel = "Mi hogar",
}: PageHeadingProps) {
  return (
    <header className="flex flex-col gap-3">
      <div className="page-crumb">
        <Link href={backHref} className="back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{backLabel}</span>
        </Link>
        {badge ? (
          <span className="pill pill--secondary">{badge}</span>
        ) : null}
      </div>
      <div className="page-hero">
        <div className="min-w-0">
          <span className="page-hero__eyebrow">{eyebrow}</span>
          <h1 className="page-hero__title">{title}</h1>
          {subtitle ? <p className="page-hero__subtitle">{subtitle}</p> : null}
        </div>
        <span className="hero-icon" aria-hidden="true">
          <span>
            <ModuleIcon tone={tone} size="md" />
          </span>
        </span>
      </div>
    </header>
  );
}
