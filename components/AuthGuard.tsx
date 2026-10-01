"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../lib/services/users";
import type { AccountStatus } from "../lib/models/backend";

const PUBLIC_ROUTES = ["/login"];
type AccessState = "loading" | "unauthenticated" | AccountStatus | "missing-profile" | "error";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>("loading");

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

        setAccess(profile.status);

        if (isPublic && profile.status === "active") {
          router.replace("/");
        }
      } catch (error) {
        console.error("Fermi access check failed", error);
        setAccess("error");
      }
    });

    return unsubscribe;
  }, [isPublic, pathname, router]);

  if (isPublic) {
    if (access === "active") {
      return <AccessLoading text="Je wordt doorgestuurd…" />;
    }
    return <>{children}</>;
  }

  if (access === "loading" || access === "unauthenticated") {
    return <AccessLoading text={access === "loading" ? "Fermi wordt geladen…" : "Je wordt doorgestuurd…"} />;
  }

  if (access === "pending") {
    return <AccessCard title="Bijna binnen!" body="Je account is aangemaakt. Je lidmaatschap moet alleen nog door Fermi worden geactiveerd voordat je de ledenapp kunt gebruiken." />;
  }

  if (access === "suspended") {
    return <AccessCard title="Account gepauzeerd" body="Je account is momenteel niet actief. Neem contact op met S.V. Fermi als je denkt dat dit niet klopt." />;
  }

  if (access === "archived") {
    return <AccessCard title="Account niet actief" body="Dit Fermi-account is gearchiveerd en heeft geen toegang tot de ledenapp." />;
  }

  if (access === "missing-profile" || access === "error") {
    return <AccessCard title="Toegang controleren mislukt" body="We konden je Fermi-profiel niet veilig controleren. Er is daarom geen toegang verleend. Probeer opnieuw of neem contact op met het bestuur." retry />;
  }

  return <>{children}</>;
}

function AccessLoading({ text }: { text: string }) {
  return <div className="auth-loading" role="status" aria-live="polite"><div className="auth-loader-mark">⚛</div><p>{text}</p></div>;
}

function AccessCard({ title, body, retry = false }: { title: string; body: string; retry?: boolean }) {
  return (
    <main className="pending-access">
      <div className="pending-card">
        <div className="pending-atom">⚛</div>
        <p className="pending-kicker">S.V. Fermi</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="pending-email">{auth.currentUser?.email}</div>
        {retry && <button onClick={() => window.location.reload()}>Opnieuw proberen</button>}
        <button onClick={() => auth.signOut()}>Uitloggen</button>
      </div>
    </main>
  );
}
