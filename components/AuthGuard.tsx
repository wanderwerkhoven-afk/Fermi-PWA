"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../lib/firebase";
import { getMembershipAccess, requestMembershipRenewal } from "../lib/services/memberships";
import { getUserProfile } from "../lib/services/users";

const PUBLIC_ROUTES = ["/login"];
type AccessState = "loading" | "unauthenticated" | "pending-account" | "suspended" | "member" | "membership-pending" | "archive" | "missing-profile" | "error";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>("loading");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

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
    return <AccessCard title="Bijna binnen!" body="Je account is aangemaakt en wacht nog op activatie door S.V. Fermi." preview />;
  }

  if (access === "suspended") {
    return <AccessCard title="Account niet actief" body="Je account is momenteel niet actief. Denk je dat dit niet klopt? Neem dan contact op met S.V. Fermi." />;
  }

  if (access === "membership-pending") {
    return <AccessCard title="Aanmelding ontvangen" body="Je nieuwe lidmaatschapsaanmelding is ontvangen en wordt nog verwerkt. Je eerdere Fermi-geschiedenis blijft bewaard." />;
  }

  if (access === "archive") {
    const renew = async () => {
      if (!auth.currentUser || actionBusy) return;
      setActionBusy(true);
      setActionError("");
      try {
        await requestMembershipRenewal(auth.currentUser.uid);
        setAccess("membership-pending");
      } catch (error) {
        console.error("Membership renewal failed", error);
        setActionError("Aanmelden is niet gelukt. Probeer het opnieuw of neem contact op met S.V. Fermi.");
      } finally {
        setActionBusy(false);
      }
    };
    return <AccessCard title="Welkom terug" body="Je hebt momenteel geen actief Fermi-lidmaatschap. Je account en eerdere Fermi-geschiedenis blijven bewaard. Meld je opnieuw aan om voor het nieuwe verenigingsjaar weer volledige toegang te krijgen." actionLabel={actionBusy ? "Aanmelden…" : "Opnieuw lid worden"} onAction={() => void renew()} actionDisabled={actionBusy} error={actionError} />;
  }

  if (access === "missing-profile" || access === "error") {
    return <AccessCard title="Toegang controleren mislukt" body="We konden je Fermi-profiel niet veilig controleren. Er is daarom geen toegang verleend. Probeer opnieuw of neem contact op met het bestuur." retry />;
  }

  return <>{children}</>;
}

function AccessLoading({ text }: { text: string }) {
  return <div className="auth-loading" role="status" aria-live="polite"><div className="auth-loader-mark">⚛</div><p>{text}</p></div>;
}

function AccessCard({ title, body, retry = false, actionLabel, onAction, actionDisabled = false, error, preview = false }: { title: string; body: string; retry?: boolean; actionLabel?: string; onAction?: () => void; actionDisabled?: boolean; error?: string; preview?: boolean }) {
  return (
    <main className="pending-access">
      {preview && <Link href="/" className="pending-preview-star" title="Tijdelijk naar de site" aria-label="Tijdelijk naar de Fermi-site">★</Link>}
      <div className="pending-card">
        <div className="pending-atom">⚛</div>
        <p className="pending-kicker">S.V. Fermi</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="pending-email">{auth.currentUser?.email}</div>
        {actionLabel && <button type="button" onClick={onAction} disabled={actionDisabled}>{actionLabel}</button>}
        {error && <p className="pending-error" role="alert">{error}</p>}
        {retry && <button onClick={() => window.location.reload()}>Opnieuw proberen</button>}
        <button onClick={() => auth.signOut()}>Uitloggen</button>
      </div>
    </main>
  );
}
