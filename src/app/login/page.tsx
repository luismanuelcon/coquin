"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { CoquinWordmark } from "@/components/brand/coquin-wordmark";
import { createClient } from "@/lib/supabase/client";
import { phoneLoginEmail } from "@/lib/auth/phone";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({
        email: phoneLoginEmail(phone), password,
      });
      if (authError) {
        setError("No pudimos ingresar. Revisa tu celular y contraseña.");
        return;
      }
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar. Intenta de nuevo.");
    } finally { setBusy(false); }
  }
  return <main className="auth-screen">
    <CoquinWordmark priority />
    <div className="auth-intro"><p>Tu hogar, conectado</p><h1>Qué bueno<br />tenerte aquí.</h1></div>
    <form onSubmit={submit} className="auth-form">
      <label>Celular<input autoComplete="username" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="300 123 4567" required disabled={busy} /></label>
      <label>Contraseña<span className="password-input"><input autoComplete="current-password" type={visible ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required disabled={busy} /><button type="button" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></span></label>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Ingresando..." : "Entrar"}<ArrowRight size={20} aria-hidden="true" /></button>
    </form>
  </main>;
}
