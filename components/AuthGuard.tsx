"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { getMembershipAccess } from "../lib/services/memberships";
import { getUserProfile } from "../lib/services/users";

const PUBLIC_ROUTES = ["/login"];
type AccessState = "loading" | "unauthenticated" | "pending-account" | "suspended" | "member" | "membership-pending" | "archive" | "missing-profile" | "error";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>("loading");
  const [previewBypass, setPreviewBypass] = useState(false);
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  useEffect(() => {
    setPreviewBypass(window.sessionStorage.getItem("fermi-preview-bypass") === "1");
  }, []);

  useEffect(() => {
    setAccess("loading");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAccess("unauthenticated");
        if (!isPublic) router.replace("/login/");
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (!profile) {
          setAccess("missing-profile");
          return;
        }
        if (profile.status === "pending") {
          setAccess("pending-account");
          return;
        }
        if (profile.status === "suspended") {
          setAccess("suspended");
          return;
        }

        // Active board/admin accounts must remain able to operate the association
        // even when their personal annual membership is not active.
        if (profile.status === "active" && (profile.role === "admin" || profile.role === "board")) {
          setAccess("member");
          if (isPublic) router.replace("/");
          return;
        }

        const membershipAccess = await getMembershipAccess(user.uid);
        setAccess(membershipAccess === "active" ? "member" : membershipAccess === "pending" ? "membership-pending" : "archive");
        if (isPublic) router.replace("/");
      } catch (error) {
        console.error("Fermi access check failed", error);
        setAccess("error");
      }
    });
    return unsubscribe;
  }, [isPublic, pathname, router]);

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

  if (access === "pending-account") {
    return <AccessCard title="Bijna binnen!" body="Je account is aangemaakt en wacht nog op activatie door S.V. Fermi." previewBypass />;
  }

  if (access === "suspended") {
    return <AccessCard title="Account niet actief" body="Je account is momenteel niet actief. Denk je dat dit niet klopt? Neem dan contact op met S.V. Fermi." previewBypass />;
  }

  if (access === "membership-pending") {
    return <AccessCard title="Aanmelding ontvangen" body="Je nieuwe lidmaatschapsaanmelding is ontvangen en wordt nog verwerkt. Je eerdere Fermi-geschiedenis blijft bewaard." previewBypass />;
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

function AccessCard({ title, body, retry = false, actionLabel, previewBypass = false }: { title: string; body: string; retry?: boolean; actionLabel?: string; previewBypass?: boolean }) {
  return (
    <main className="pending-access">
      <div className="pending-card">
        <div className="pending-atom">⚛</div>
        <p className="pending-kicker">S.V. Fermi</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="pending-email">{auth.currentUser?.email}</div>
        {actionLabel && <button type="button" disabled title="Herinschrijving wordt in de volgende stap gekoppeld">{actionLabel}</button>}
        {retry && <button onClick={() => window.location.reload()}>Opnieuw proberen</button>}
        <button onClick={() => auth.signOut()}>Uitloggen</button>
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
