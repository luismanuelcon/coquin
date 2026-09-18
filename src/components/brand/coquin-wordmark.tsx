import { Home } from "lucide-react";

type CoquinWordmarkProps = {
  priority?: boolean;
};

export function CoquinWordmark(_props: CoquinWordmarkProps) {
  return (
    <div className="brand-badge" aria-label="Coquín">
      <span className="brand-badge__ring">
        <span>
          <Home size={18} strokeWidth={2.4} aria-hidden="true" />
        </span>
      </span>
      <span className="brand-badge__stack">
        <span className="brand-badge__title">Coquín</span>
        <span className="brand-badge__label">Hogar</span>
      </span>
    </div>
  );
}
