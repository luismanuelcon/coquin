import Image from "next/image";

type CoquinMarkProps = {
  priority?: boolean;
};

export function CoquinMark({ priority = false }: CoquinMarkProps) {
  return (
    <div
      className="brand-mark interactive-surface"
      aria-label="Icono de COQUIN"
      role="img"
    >
      <Image
        src="/coquin-icon.png"
        alt=""
        fill
        priority={priority}
        sizes="56px"
        className="object-contain"
      />
    </div>
  );
}
