try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Faltan las variables de Supabase. Consulta .env.example.");
  process.exit(1);
}

try {
  for (const path of ["/auth/v1/settings", "/rest/v1/households?select=id&limit=0"]) {
    const response = await fetch(new URL(path, url), {
      headers: { apikey: key },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      if (response.status === 404 && body.code === "PGRST205") {
        console.log("Data API: accesible; households no existe o no esta expuesta en el esquema.");
        continue;
      }
      throw new Error(`${path}: HTTP ${response.status} (${body.code ?? "sin codigo"})`);
    }
    console.log(`${path}: OK (${response.status})`);
  }
  console.log("Conexion verificada. Esta comprobacion no valida tablas, RLS ni escrituras.");
} catch (error) {
  console.error("No se pudo verificar Supabase:", error instanceof Error ? error.message : "Error de conexion");
  process.exitCode = 1;
}
