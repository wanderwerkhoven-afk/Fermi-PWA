"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Atom, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { signInWithEmail } from "../../lib/services/auth";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function finishLogin(action: () => Promise<unknown>) {
    setBusy(true); setMessage("");
    try { await action(); router.push("/"); }
    catch { setMessage("Inloggen is niet gelukt. Controleer je gegevens en probeer opnieuw."); }
    finally { setBusy(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void finishLogin(() => signInWithEmail(email, password));
  }

  async function resetPassword() {
    if (!email) { setMessage("Vul eerst je e-mailadres in."); return; }
    try { await sendPasswordResetEmail(auth, email); setMessage("We hebben een herstelmail gestuurd."); }
    catch { setMessage("De herstelmail kon niet worden verstuurd."); }
  }

  return (
    <main className={styles.page}>
      <div className={styles.texture} aria-hidden="true" />
      <div className={styles.orangeScrap} aria-hidden="true" />
      <div className={styles.atomArt} aria-hidden="true"><Atom /></div>

      <section className={styles.content}>
        <header className={styles.brand}>
          <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="S.V. Fermi" />
          <div><strong>SV Fermi</strong><span>Studievereniging<br />Natuurkunde</span></div>
        </header>

        <div className={styles.hero}>
          <div className={styles.rays} aria-hidden="true"><i /><i /><i /></div>
          <h1>Welkom<br /><em>terug</em><b>✦</b></h1>
          <p>Log in met je HvA- of persoonlijke e-mailadres om je activiteiten, ledenpas en community te bekijken.</p>
        </div>

        <form className={styles.card} onSubmit={submit}>
          <label className={styles.field}>
            <UserRound aria-hidden="true" />
            <input type="email" autoComplete="email" placeholder="HvA- of persoonlijk e-mailadres" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className={styles.field}>
            <LockKeyhole aria-hidden="true" />
            <input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" className={styles.eye} onClick={() => setShowPassword((v) => !v)} aria-label="Wachtwoord tonen of verbergen">
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </label>

          <button className={styles.loginButton} disabled={busy}>Inloggen <ArrowRight /></button>

          <button type="button" className={styles.forgot} onClick={resetPassword}>Wachtwoord vergeten?</button>
          {message && <p className={styles.message} role="status">{message}</p>}
        </form>

        <div className={styles.join}>
          <div><span /><Atom /><span /></div>
          <p>Nog geen account? <Link href="/register">Account maken <ArrowRight /></Link></p>
        </div>
      </section>
    </main>
  );
}
