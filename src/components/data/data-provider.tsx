"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type SetStateAction } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { emptyData, type AppData, type DataModule } from "@/lib/data/empty";
import { CoquinWordmark } from "@/components/brand/coquin-wordmark";
import { validateData } from "@/lib/data/validation";

import { profileEmail, profileName, saveContactEmail, saveDisplayName } from "@/lib/auth/profile";
import type { HouseholdMember } from "@/lib/types";

type HouseholdRole = "admin" | "member";
type ContextValue = {
  data: AppData;
  householdName: string;
  userId: string;
  displayName: string;
  contactEmail: string;
  saveEmail: (value: string) => Promise<string>;
  members: HouseholdMember[];
  membersError: string;
  refreshMembers: () => Promise<void>;
  householdCode: string;
  role: HouseholdRole;
  rotateCode: () => Promise<string | null>;
  save: <K extends DataModule>(module: K, value: SetStateAction<AppData[K]>) => Promise<boolean>;
};
const DataContext = createContext<ContextValue | null>(null);

function ProtectedData({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const dataRef = useRef(data);
  const versions = useRef<Record<string, number>>({});
  const saving = useRef(false);
  const [state, setState] = useState<"loading" | "profile" | "household" | "ready" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [householdCode, setHouseholdCode] = useState("");
  const [role, setRole] = useState<HouseholdRole>("member");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [profileDraft, setProfileDraft] = useState("");
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [membersError, setMembersError] = useState("");
  const refreshMembers = useCallback(async () => {
    try {
      const { data: rows, error: rosterError } = await createClient().rpc("get_household_members");
      if (rosterError) throw rosterError;
      setMembers((rows ?? []).map((row: { user_id: string; display_name: string | null }) => ({
        userId: row.user_id, displayName: profileName({ display_name: row.display_name }),
      })));
      setMembersError("");
    } catch {
      setMembersError("No pudimos cargar los integrantes de tu familia. Reintenta para elegir un responsable.");
    }
  }, []);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const client = createClient();
      const { data: auth, error: authError } = await client.auth.getUser();
      if (authError || !auth.user) { window.location.replace("/login"); return; }
      setUserId(auth.user.id);
      const currentName = profileName(auth.user.user_metadata);
      setDisplayName(currentName);
      setContactEmail(profileEmail(auth.user.user_metadata));
      if (!currentName) { setState("profile"); return; }
      const { data: member, error: memberError } = await client.from("household_members")
        .select("household_id, role").eq("user_id", auth.user.id).maybeSingle();
      if (memberError) throw memberError;
      if (!member) { setState("household"); return; }
      const { data: household, error: householdError } = await client.from("households")
        .select("name, join_code").eq("id", member.household_id).single();
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
      setHouseholdCode(household.join_code);
      setRole(member.role === "admin" ? "admin" : "member");
      await refreshMembers();
      setState("ready");
    } catch {
      setError("No pudimos cargar tu hogar. Revisa la conexión y que la base de datos esté habilitada.");
      setState("error");
    }
  }, [refreshMembers]);
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
      setError(message.includes("INVALID_TASK_OWNER")
        ? "Ese responsable ya no pertenece a tu familia. Actualiza los integrantes y selecciona otra persona."
        : message.includes("VERSION_CONFLICT")
        ? "Otra persona modificó estos datos. Recarga antes de volver a guardar."
        : "No se confirmó el guardado. Conservamos el formulario; recarga para comprobar el estado antes de reintentar.");
      return false;
    } finally { saving.current = false; setBusy(false); }
  }
  async function completeProfile(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      await saveDisplayName(createClient(), profileDraft);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "No pudimos guardar tu nombre."); }
    finally { setBusy(false); }
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
  async function joinHousehold(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { error: joinError } = await createClient().rpc("join_household", { code });
      if (joinError) throw joinError;
      await load();
    } catch (err) {
      const message = typeof err === "object" && err && "message" in err ? String(err.message) : "";
      setError(message.includes("HOUSEHOLD_EXISTS")
        ? "Ya perteneces a un hogar."
        : message.includes("INVALID_CODE")
        ? "El código no es válido. Verifícalo con quien creó el hogar."
        : "No pudimos unirte al hogar. Intenta de nuevo.");
    } finally { setBusy(false); }
  }
  async function rotateCode() {
    try {
      const { data: newCode, error: rotateError } = await createClient().rpc("rotate_join_code");
      if (rotateError) throw rotateError;
      setHouseholdCode(String(newCode));
      return String(newCode);
    } catch { return null; }
  }
  async function saveEmail(value: string) {
    const email = await saveContactEmail(createClient(), value);
    setContactEmail(email);
    return email;
  }
  async function continueSolo() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { error: createError } = await createClient().rpc("create_household", { household_name: "Mi hogar" });
      if (createError) throw createError;
      await load();
    } catch { setError("No pudimos continuar. Intenta de nuevo."); }
    finally { setBusy(false); }
  }
  if (state !== "ready") return <main className="auth-screen">
    <CoquinWordmark priority />
    <h1>{state === "profile" ? "¿Cómo te llamas?" : state === "household" ? "Tu hogar" : state === "loading" ? "Abriendo tu hogar..." : "No pudimos conectar"}</h1>
    {error && <p role="alert" className="auth-error">{error}</p>}
    {state === "profile" && <form onSubmit={completeProfile} className="auth-form" aria-busy={busy}>
      <p className="household-hint" id="profile-help">Elige el nombre que verá tu familia al asignar las tareas. Solo necesitas hacerlo una vez.</p>
      <label>Tu nombre<input autoComplete="name" value={profileDraft} onChange={e => setProfileDraft(e.target.value)} maxLength={80} required disabled={busy} aria-describedby="profile-help" /></label>
      <button className="auth-submit" disabled={busy || !profileDraft.trim()}>{busy ? "Guardando..." : "Guardar y continuar"}</button>
    </form>}
    {state === "household" && <div className="household-setup">
      <p className="household-hint">Coquín organiza tu hogar en familia: la agenda, el mercado y las tareas se comparten con quienes se unan. Crea una familia, únete con un código o continúa solo por ahora.</p>
      <div className="household-switch" role="tablist" aria-label="Crear o unirse a un hogar">
        <button type="button" role="tab" aria-selected={mode === "create"} data-active={mode === "create" || undefined} onClick={() => { setMode("create"); setError(""); }}>Crear hogar</button>
        <button type="button" role="tab" aria-selected={mode === "join"} data-active={mode === "join" || undefined} onClick={() => { setMode("join"); setError(""); }}>Unirme con código</button>
      </div>
      {mode === "create"
        ? <form onSubmit={createHousehold} className="auth-form"><label>Nombre del hogar<input value={name} onChange={e => setName(e.target.value)} maxLength={80} required /></label><button className="auth-submit" disabled={busy || !name.trim()}>{busy ? "Creando..." : "Crear hogar"}</button></form>
        : <form onSubmit={joinHousehold} className="auth-form"><label>Código de familia<input value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} autoCapitalize="characters" autoComplete="off" spellCheck={false} inputMode="text" maxLength={8} placeholder="K9F4QM7P" required /></label><button className="auth-submit" disabled={busy || code.trim().length < 8}>{busy ? "Uniéndote..." : "Unirme al hogar"}</button></form>}
      <button type="button" className="household-skip" onClick={continueSolo} disabled={busy}>No deseo crear ni unirme a una familia; continuar solo</button>
    </div>}
    {state === "error" && <button className="auth-submit" onClick={load}>Reintentar</button>}
    {state !== "loading" && <SignOutButton />}
  </main>;
  return <DataContext.Provider value={{ data, save, userId, displayName, contactEmail, saveEmail, members, membersError, refreshMembers, householdName, householdCode, role, rotateCode }}>
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
