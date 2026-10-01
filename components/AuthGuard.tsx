"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../lib/services/users";

const PUBLIC_ROUTES = ["/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setPending(false);
        if (!isPublic) router.replace("/login/");
        setReady(true);
        return;
      }

      if (isPublic) {
        router.replace("/");
        setReady(true);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        setPending(profile?.status === "pending");
      } catch {
        setPending(false);
      }
      setReady(true);
    });
    return unsubscribe;
  }, [pathname, router]);

  if (!ready) {
    return <div className="auth-loading" role="status" aria-live="polite"><div className="auth-loader-mark">⚛</div><p>Fermi wordt geladen…</p></div>;
  }

  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) return <>{children}</>;

  if (pending) {
    return (
      <main className="pending-access">
        <div className="pending-card">
          <div className="pending-atom">⚛</div>
          <p className="pending-kicker">S.V. Fermi</p>
          <h1>Bijna binnen!</h1>
          <p>Je account is aangemaakt. Je lidmaatschap moet alleen nog door Fermi worden geactiveerd voordat je de ledenapp kunt gebruiken.</p>
          <div className="pending-email">{auth.currentUser?.email}</div>
          <button onClick={() => auth.signOut()}>Uitloggen</button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
