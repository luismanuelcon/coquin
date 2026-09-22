"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { phoneLoginEmail } from "@/lib/auth/phone";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
        const { error: signUpError } = await client.auth.signUp({ email, password });
        if (signUpError) {
          setError("No pudimos crear la cuenta. Puede que el celular ya esté registrado.");
          return;
        }
      }
      const { error: authError } = await client.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(mode === "signup"
          ? "Creamos tu cuenta, pero falta confirmarla antes de entrar."
          : "No pudimos ingresar. Revisa tu celular y contraseña.");
        return;
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
      {mode === "signup" && <p className="auth-hint">Después de crear tu cuenta podrás crear una familia, unirte con un código o continuar sin familia.</p>}
    </div>
    <div className="household-switch" role="tablist" aria-label="Entrar o crear cuenta">
      <button type="button" role="tab" aria-selected={mode === "signin"} data-active={mode === "signin" || undefined} onClick={() => { setMode("signin"); setError(""); setConfirm(""); }}>Entrar</button>
      <button type="button" role="tab" aria-selected={mode === "signup"} data-active={mode === "signup" || undefined} onClick={() => { setMode("signup"); setError(""); setConfirm(""); }}>Crear cuenta</button>
    </div>
    <form onSubmit={submit} className="auth-form">
      <label>Celular<input autoComplete="username" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="300 123 4567" required disabled={busy} /></label>
      <label>Contraseña<span className="password-input"><input autoComplete={mode === "signup" ? "new-password" : "current-password"} type={visible ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} minLength={mode === "signup" ? 8 : undefined} required disabled={busy} /><button type="button" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></span></label>
      {mode === "signup" && <label>Repetir contraseña<span className="password-input"><input autoComplete="new-password" type={visible ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} minLength={8} required disabled={busy} /></span></label>}
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? (mode === "signup" ? "Creando..." : "Ingresando...") : (mode === "signup" ? "Crear cuenta" : "Entrar")}<ArrowRight size={20} aria-hidden="true" /></button>
    </form>
  </main>;
}
