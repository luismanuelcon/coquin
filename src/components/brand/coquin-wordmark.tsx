import Image from "next/image";

type CoquinWordmarkProps = {
  priority?: boolean;
};

export function CoquinWordmark({ priority = false }: CoquinWordmarkProps) {
  return (
    <div className="brand-wordmark" aria-hidden="true">
      <Image
        src="/coquin-wordmark.png"
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 430px) 56vw, 244px"
        className="object-contain object-left"
      />
    </div>
  );
}
