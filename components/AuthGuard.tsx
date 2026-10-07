"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { isHvaEmail, resendVerificationEmail } from "../lib/services/auth";
import { useFermiSession } from "./SessionProvider";

const PUBLIC_ROUTES = ["/login", "/register"];
type AccessState = "loading" | "unauthenticated" | "verify-email" | "suspended" | "member" | "membership-pending" | "archive" | "missing-profile" | "error";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>("loading");
  const [previewBypass, setPreviewBypass] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [verifyBusy, setVerifyBusy] = useState(false);
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const {
    firebaseUser,
    fermiUser: profile,
    membership,
    loading: sessionLoading,
    error: sessionError,
  } = useFermiSession();

  useEffect(() => {
    setPreviewBypass(window.sessionStorage.getItem("fermi-preview-bypass") === "1");
  }, []);

  useEffect(() => {
    if (sessionLoading) {
      setAccess("loading");
      return;
    }
    if (sessionError) {
      setAccess("error");
      return;
    }
    if (!firebaseUser) {
      setAccess("unauthenticated");
      if (!isPublic) router.replace("/login/");
      return;
    }
    if (!profile) {
      setAccess("missing-profile");
      return;
    }
    if (!firebaseUser.emailVerified) {
      setAccess("verify-email");
      return;
    }
    if (profile.status === "suspended") {
      setAccess("suspended");
      return;
    }

    if (profile.status === "active" && (profile.role === "admin" || profile.role === "board")) {
      setAccess("member");
      if (isPublic) router.replace("/");
      return;
    }

    const snapshotStatus = profile.membership?.status;
    const membershipAccess =
      snapshotStatus === "pending" || membership?.status === "pending"
        ? "pending"
        : snapshotStatus === "active" || membership?.status === "active"
          ? "active"
          : "archive";

    setAccess(
      membershipAccess === "active"
        ? "member"
        : membershipAccess === "pending"
          ? "membership-pending"
          : "archive",
    );

    if (isPublic) router.replace("/");
  }, [sessionLoading, sessionError, firebaseUser, profile, membership, isPublic, router]);

  if (previewBypass && !isPublic) {
    return <>{children}</>;
  }

  if (isPublic) {
    if (access === "member" || access === "membership-pending" || access === "archive") {
      return <AccessLoading text="Je wordt doorgestuurd…" />;
    }
    return <>{children}</>;
  }

  if (access === "loading" || access === "unauthenticated") {
    return <AccessLoading text={access === "loading" ? "Fermi wordt geladen…" : "Je wordt doorgestuurd…"} />;
  }

  if (access === "verify-email") {
    const resend = async () => {
      const user = auth.currentUser;
      if (!user || verifyBusy) return;
      setVerifyBusy(true);
      setVerifyMessage("");
      try {
        await resendVerificationEmail(user);
        setVerifyMessage("Nieuwe verificatiemail verstuurd. Controleer ook je ongewenste e-mail.");
      } catch (error) {
        console.error("Verification email resend failed", error);
        setVerifyMessage("Verificatiemail versturen is niet gelukt. Probeer het over een minuut opnieuw.");
      } finally {
        setVerifyBusy(false);
      }
    };

    const usesHvaEmail = Boolean(firebaseUser?.email && isHvaEmail(firebaseUser.email));
    const goToLogin = async () => {
      await auth.signOut();
      router.replace("/login/");
    };

    return (
      <AccessCard
        title={usesHvaEmail ? "Check je HvA-mail" : "Check je e-mail"}
        body={
          usesHvaEmail
            ? "We hebben een verificatielink naar je HvA-mailadres gestuurd. Open die link en log daarna opnieuw in. Controleer ook je ongewenste e-mail of spammap."
            : "We hebben een verificatielink naar je e-mailadres gestuurd. Open die link en log daarna opnieuw in. Controleer ook je ongewenste e-mail of spammap."
        }
        actionLabel={verifyBusy ? "Versturen…" : "Verificatiemail opnieuw sturen"}
        onAction={() => void resend()}
        actionDisabled={verifyBusy}
        message={verifyMessage}
        secondaryLabel="Naar inloggen"
        onSecondary={() => void goToLogin()}
        previewBypass
      />
    );
  }

  if (access === "suspended") {
    return <AccessCard title="Account niet actief" body="Je account is momenteel niet actief. Denk je dat dit niet klopt? Neem dan contact op met S.V. Fermi." previewBypass />;
  }

  if (access === "archive") {
    return <AccessCard title="Welkom terug" body="Je hebt momenteel geen actief Fermi-lidmaatschap. Je account en eerdere Fermi-geschiedenis blijven bewaard. Meld je opnieuw aan om voor het nieuwe verenigingsjaar weer volledige toegang te krijgen." actionLabel="Opnieuw lid worden" previewBypass />;
  }

  if (access === "missing-profile" || access === "error") {
    return <AccessCard title="Toegang controleren mislukt" body="We konden je Fermi-profiel niet veilig controleren. Er is daarom geen toegang verleend. Probeer opnieuw of neem contact op met het bestuur." retry previewBypass />;
  }

  return <>{children}</>;
}

function AccessLoading({ text }: { text: string }) {
  return (
    <div className="auth-loading" role="status" aria-live="polite">
      <img
        className="auth-loader-mark"
        src="/Fermi-PWA/images/branding/atoom-loader.png"
        alt=""
        aria-hidden="true"
      />
      <p>{text}</p>
    </div>
  );
}

function AccessCard({
  title,
  body,
  retry = false,
  actionLabel,
  previewBypass = false,
  onAction,
  actionDisabled = false,
  message,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  body: string;
  retry?: boolean;
  actionLabel?: string;
  previewBypass?: boolean;
  onAction?: () => void;
  actionDisabled?: boolean;
  message?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <main className="pending-access">
      <div className="pending-card">
        <img className="pending-fermi-logo" src="/Fermi-PWA/images/branding/fermi-logo.png" alt="S.V. Fermi" />
        <p className="pending-kicker">S.V. Fermi</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="pending-email">{auth.currentUser?.email}</div>
        <div className="pending-card-actions">
          {actionLabel && <button type="button" onClick={onAction} disabled={actionDisabled}>{actionLabel}</button>}
          {retry && <button type="button" onClick={() => window.location.reload()}>Opnieuw proberen</button>}
          {secondaryLabel
            ? <button type="button" className="pending-card-secondary" onClick={onSecondary}>{secondaryLabel}</button>
            : <button type="button" className="pending-card-secondary" onClick={() => auth.signOut()}>Uitloggen</button>}
        </div>
        {message && <p className="pending-card-message" role="status">{message}</p>}
      </div>

      {previewBypass && (
        <button
          className="preview-bypass-star"
          type="button"
          aria-label="Preview bypass"
          title="Preview bypass"
          onClick={() => {
            window.sessionStorage.setItem("fermi-preview-bypass", "1");
            window.location.reload();
          }}
        >
          ★
        </button>
      )}
    </main>
  );
}
