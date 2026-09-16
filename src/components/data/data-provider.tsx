"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type SetStateAction } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { emptyData, type AppData, type DataModule } from "@/lib/data/empty";
import { CoquinWordmark } from "@/components/brand/coquin-wordmark";
import { validateData } from "@/lib/data/validation";

type ContextValue = {
  data: AppData;
  householdName: string;
  save: <K extends DataModule>(module: K, value: SetStateAction<AppData[K]>) => Promise<boolean>;
};
const DataContext = createContext<ContextValue | null>(null);

function ProtectedData({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const dataRef = useRef(data);
  const versions = useRef<Record<string, number>>({});
  const saving = useRef(false);
  const [state, setState] = useState<"loading" | "household" | "ready" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const client = createClient();
      const { data: auth, error: authError } = await client.auth.getUser();
      if (authError || !auth.user) { window.location.replace("/login"); return; }
      const { data: member, error: memberError } = await client.from("household_members")
        .select("household_id").eq("user_id", auth.user.id).maybeSingle();
      if (memberError) throw memberError;
      if (!member) { setState("household"); return; }
      const { data: household, error: householdError } = await client.from("households")
        .select("name").eq("id", member.household_id).single();
      if (householdError) throw householdError;
      const { data: rows, error: readError } = await client.from("module_documents").select("module,data,version");
      if (readError) throw readError;
      const next = emptyData();
      const nextVersions: Record<string, number> = {};
      for (const row of rows ?? []) {
        if (!validateData(row.module, row.data)) throw new Error("INVALID_DATA");
        Object.assign(next, { [row.module]: row.data });
        nextVersions[row.module] = Number(row.version);
      }
      dataRef.current = next;
      versions.current = nextVersions;
      setData(next);
      setHouseholdName(household.name);
      setState("ready");
    } catch {
      setError("No pudimos cargar tu hogar. Revisa la conexión y que la base de datos esté habilitada.");
      setState("error");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function save<K extends DataModule>(module: K, value: SetStateAction<AppData[K]>) {
    if (saving.current || state !== "ready") return false;
    const next = typeof value === "function"
      ? (value as (previous: AppData[K]) => AppData[K])(dataRef.current[module]) : value;
    if (!validateData(module, next)) {
      setError("Revisa los datos. Los valores deben ser pesos enteros, positivos y las fechas válidas.");
      return false;
    }
    saving.current = true;
    setBusy(true); setError(""); setSaved(false);
    try {
      const { data: version, error: writeError } = await createClient().rpc("save_module", {
        module_name: module, payload: next, expected_version: versions.current[module] ?? 0,
        operation_id: crypto.randomUUID(),
      });
      if (writeError) throw writeError;
      versions.current[module] = Number(version);
      dataRef.current = { ...dataRef.current, [module]: next };
      setData(dataRef.current);
      setSaved(true);
      return true;
    } catch (err) {
      const message = typeof err === "object" && err && "message" in err ? String(err.message) : "";
      setError(message.includes("VERSION_CONFLICT")
        ? "Otra persona modificó estos datos. Recarga antes de volver a guardar."
        : "No se confirmó el guardado. Conservamos el formulario; recarga para comprobar el estado antes de reintentar.");
      return false;
    } finally { saving.current = false; setBusy(false); }
  }
  async function createHousehold(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { error: createError } = await createClient().rpc("create_household", { household_name: name.trim() });
      if (createError) throw createError;
      await load();
    } catch { setError("No pudimos crear el hogar. Intenta de nuevo."); }
    finally { setBusy(false); }
  }
  if (state !== "ready") return <main className="auth-screen">
    <CoquinWordmark priority />
    <h1>{state === "household" ? "Crea tu hogar" : state === "loading" ? "Abriendo tu hogar..." : "No pudimos conectar"}</h1>
    {error && <p role="alert" className="auth-error">{error}</p>}
    {state === "household" && <form onSubmit={createHousehold} className="auth-form"><label>Nombre del hogar<input value={name} onChange={e => setName(e.target.value)} maxLength={80} required /></label><button className="auth-submit" disabled={busy || !name.trim()}>{busy ? "Creando..." : "Crear hogar"}</button></form>}
    {state === "error" && <button className="auth-submit" onClick={load}>Reintentar</button>}
    {state !== "loading" && <SignOutButton />}
  </main>;
  return <DataContext.Provider value={{ data, save, householdName }}>
    <div className="sync-status" aria-live="polite">
      {error ? <span role="alert">{error} <button onClick={() => { if (window.confirm("¿Recargar los datos? Se descartarán los formularios sin guardar.")) void load(); }}>Recargar</button></span> : busy ? "Guardando..." : saved ? "Guardado" : null}
    </div>
    <fieldset className="data-content" disabled={busy} aria-busy={busy}>{children}</fieldset>
  </DataContext.Provider>;
}
export function DataProvider({ children }: { children: ReactNode }) {
  return usePathname() === "/login" ? children : <ProtectedData>{children}</ProtectedData>;
}
export function useAppData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("Missing DataProvider");
  return context;
}
export function useModule<K extends DataModule>(module: K) {
  const { data, save } = useAppData();
  return [data[module], (value: SetStateAction<AppData[K]>) => save(module, value)] as const;
}
export function SignOutButton() {
  const [error, setError] = useState(false);
  return <><button type="button" className="sign-out" onClick={async () => {
    try {
      const { error: signOutError } = await createClient().auth.signOut({ scope: "local" });
      if (signOutError) throw signOutError;
      window.location.replace("/login");
    } catch { setError(true); }
  }}>Salir</button>{error && <span role="alert">No se pudo cerrar la sesión.</span>}</>;
}
