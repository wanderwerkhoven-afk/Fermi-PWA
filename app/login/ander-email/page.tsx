"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { signInWithEmail } from "../../../lib/services/auth";
import styles from "../login.module.css";

export default function AlternativeEmailLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await signInWithEmail(email, password);
      router.push("/");
    } catch {
      setMessage("Inloggen is niet gelukt. Controleer je e-mailadres en wachtwoord.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!email) {
      setMessage("Vul eerst je e-mailadres in.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setMessage("We hebben een herstelmail gestuurd.");
    } catch {
      setMessage("De herstelmail kon niet worden verstuurd.");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.texture} aria-hidden="true" />
      <div className={styles.orangeScrap} aria-hidden="true" />

      <section className={styles.content}>
        <header className={styles.brand}>
          <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="S.V. Fermi" />
          <div><strong>SV Fermi</strong><span>Studievereniging<br />Natuurkunde</span></div>
        </header>

        <div className={styles.hero}>
          <h1>Ander<br /><em>e-mailadres</em></h1>
          <p>Geen HvA-mail meer? Log hier in met het e-mailadres dat aan je Fermi-account gekoppeld is.</p>
        </div>

        <form className={styles.card} onSubmit={submit}>
          <label className={styles.field}>
            <Mail aria-hidden="true" />
            <input
              type="email"
              autoComplete="email"
              placeholder="E-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <LockKeyhole aria-hidden="true" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className={styles.eye} onClick={() => setShowPassword((v) => !v)} aria-label="Wachtwoord tonen of verbergen">
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </label>

          <button className={styles.loginButton} disabled={busy}>
            {busy ? "Bezig…" : "Inloggen"} <ArrowRight />
          </button>

          <button type="button" className={styles.forgot} onClick={resetPassword}>Wachtwoord vergeten?</button>
          {message && <p className={styles.message} role="status">{message}</p>}
        </form>

        <div className={styles.join}>
          <p><Link href="/register"><ArrowLeft /> Terug naar account maken</Link></p>
        </div>
      </section>
    </main>
  );
}
