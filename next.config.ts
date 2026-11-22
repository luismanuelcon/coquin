import type { NextConfig } from "next";
import { version } from "./package.json";

// Public release metadata, captured at build time rather than on each page visit.
const builtAt = new Date();
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_APP_UPDATED_AT: builtAt.toISOString(),
    NEXT_PUBLIC_APP_UPDATED_LABEL: new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(builtAt),
  },
};

export default nextConfig;
