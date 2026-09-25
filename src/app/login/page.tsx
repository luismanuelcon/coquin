"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerAccount, joinRegisteredFamily } from "@/lib/auth/registration";
import { phoneLoginEmail } from "@/lib/auth/phone";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [joinFamily, setJoinFamily] = useState(false);
  const [code, setCode] = useState("");
  const [registered, setRegistered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const client = createClient();
      if (mode === "signup" && joinFamily && !/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/.test(code)) {
        setError("Escribe los 8 caracteres del código que te compartió tu familia.");
        return;
      }
      if (!registered) {
        const email = phoneLoginEmail(phone);
        if (mode === "signup") {
          if (password.length < 8) {
            setError("Usa una contraseña de al menos 8 caracteres.");
            return;
          }
          if (password !== confirm) {
            setError("Las contraseñas no coinciden.");
            return;
          }
          await registerAccount(client, email, password, displayName);
          setRegistered(true);
          setPassword("");
          setConfirm("");
        } else {
          const { error: authError } = await client.auth.signInWithPassword({ email, password });
          if (authError) {
            setError("No pudimos ingresar. Revisa tu celular y contraseña.");
            return;
          }
        }
      }
      if (mode === "signup" && joinFamily) {
        await joinRegisteredFamily(client, code);
      }
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar. Intenta de nuevo.");
    } finally { setBusy(false); }
  }
  return <main className="auth-screen">
    <Image src="/coquin-wordmark.png" alt="Coquín" width={260} height={94} priority className="auth-wordmark" />
    <div className="auth-intro">
      <p>Tu hogar, conectado</p>
      <h1>{mode === "signin" ? <>Qué bueno<br />tenerte aquí.</> : <>Crea tu<br />cuenta.</>}</h1>
      {mode === "signup" && <p className="auth-hint">Regístrate con tu nombre, celular y una contraseña. Si tu familia ya usa Coquín, puedes unirte con el código que te compartieron.</p>}
    </div>
    <div className="household-switch" role="group" aria-label="Entrar o crear cuenta">
      <button type="button" disabled={busy || registered} aria-pressed={mode === "signin"} data-active={mode === "signin" || undefined} onClick={() => { setMode("signin"); setError(""); setConfirm(""); }}>Entrar</button>
      <button type="button" disabled={busy || registered} aria-pressed={mode === "signup"} data-active={mode === "signup" || undefined} onClick={() => { setMode("signup"); setError(""); setConfirm(""); }}>Crear cuenta</button>
    </div>
    <form onSubmit={submit} className="auth-form" aria-busy={busy}>
      {registered && <p role="status" className="auth-hint">Tu cuenta ya está creada. Puedes completar la unión a tu familia o continuar sin código.</p>}
      {!registered && <>
      {mode === "signup" && <label>Tu nombre<input autoComplete="name" value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={80} placeholder="¿Cómo te llamas?" required disabled={busy} aria-describedby="display-name-help" /><span id="display-name-help" className="auth-hint">Tu familia verá este nombre al asignar tareas.</span></label>}
      <label>Celular<input autoComplete="username" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="300 123 4567" required disabled={busy} /></label>
      <label>Contraseña<span className="password-input"><input autoComplete={mode === "signup" ? "new-password" : "current-password"} type={visible ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} minLength={mode === "signup" ? 8 : undefined} required disabled={busy} /><button type="button" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></span></label>
      {mode === "signup" && <label>Repetir contraseña<span className="password-input"><input autoComplete="new-password" type={visible ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} minLength={8} required disabled={busy} /></span></label>}
      </>}
      {mode === "signup" && <>
        <label className="auth-family-option"><input type="checkbox" checked={joinFamily} onChange={e => { setJoinFamily(e.target.checked); setError(""); }} disabled={busy} />Quiero unirme a mi familia con un código</label>
        {joinFamily && <label>Código de familia<input value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[\s-]/g, ""))} autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="K9F4QM7P" minLength={8} maxLength={32} required disabled={busy} aria-describedby="family-code-help" /><span id="family-code-help" className="auth-hint">Ingresa los 8 caracteres del código que te compartieron.</span></label>}
        {!joinFamily && <p className="auth-hint">Podrás crear tu hogar o unirte a una familia más adelante.</p>}
      </>}
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? (registered ? "Uniéndote..." : mode === "signup" ? "Creando..." : "Ingresando...") : (registered ? (joinFamily ? "Unirme a mi familia" : "Continuar") : mode === "signup" ? "Crear cuenta" : "Entrar")}<ArrowRight size={20} aria-hidden="true" /></button>
      {registered && joinFamily && <button type="button" className="household-skip" disabled={busy} onClick={() => window.location.assign("/")}>Continuar sin código</button>}
    </form>
  </main>;
}
