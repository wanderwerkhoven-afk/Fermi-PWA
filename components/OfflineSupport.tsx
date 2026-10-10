"use client";

import { useEffect, useState } from "react";

/** Registers an app-shell-only SW. Firestore manages its own IndexedDB persistence. */
export default function OfflineSupport() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    // Next.js client-side route requests require a network connection.
    // Offline, use full navigation so the service worker can return cached HTML.
    const offlineNavigation = (event: MouseEvent) => {
      if (navigator.onLine || event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin || !url.pathname.startsWith("/Fermi-PWA/")) return;
      if (!(/^\\/Fermi-PWA\\/(?:$|agenda\\/(?:$|activiteit\\/$))/.test(url.pathname))) return;
      event.preventDefault();
      event.stopPropagation();
      location.assign(url.href);
    };
    document.addEventListener("click", offlineNavigation, true);
    if ("serviceWorker" in navigator && window.isSecureContext) {
      const base = window.location.pathname.startsWith("/Fermi-PWA/") ? "/Fermi-PWA" : "";
      void navigator.serviceWorker.register(base + "/sw.js", { scope: base + "/" })
        .catch((error) => console.warn("Offline ondersteuning kon niet worden geactiveerd", error));
    }
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      document.removeEventListener("click", offlineNavigation, true);
    };
  }, []);

  if (!offline) return null;
  return (
    <div role="status" aria-live="polite" style={{
      position: "fixed", zIndex: 9999, bottom: "calc(env(safe-area-inset-bottom, 0px) + 74px)",
      left: "50%", transform: "translateX(-50%)", maxWidth: "calc(100vw - 32px)",
      padding: "9px 14px", borderRadius: 24, background: "#06283B",
      border: "1px solid #39718B", boxShadow: "0 5px 20px #0005",
      color: "#fff", fontSize: 12, textAlign: "center", pointerEvents: "none"
    }}>
      Je bent offline · Opgeslagen gegevens worden getoond
    </div>
  );
}
