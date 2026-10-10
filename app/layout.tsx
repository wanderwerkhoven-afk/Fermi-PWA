import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./tour.css";
import "./touch.css";
import AuthGuard from "../components/AuthGuard";
import { SessionProvider } from "../components/SessionProvider";
import { AppDataProvider } from "../components/AppDataProvider";
import GuidedAppTour from "../components/GuidedAppTour";
import MembershipPendingDialog from "../components/MembershipPendingDialog";
import OfflineSupport from "../components/OfflineSupport";

export const metadata: Metadata = {
  title: "S.V. Fermi",
  description: "De ledenapp van S.V. Fermi",
  manifest: "/Fermi-PWA/manifest.webmanifest",
  icons: {
    icon: "/Fermi-PWA/icon.svg",
    shortcut: "/Fermi-PWA/icon.svg",
    apple: "/Fermi-PWA/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#06283B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body><SessionProvider><AppDataProvider><AuthGuard>{children}</AuthGuard><GuidedAppTour /><MembershipPendingDialog /><OfflineSupport /></AppDataProvider></SessionProvider></body>
    </html>
  );
}
