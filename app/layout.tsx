import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthGuard from "../components/AuthGuard";

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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body><AuthGuard>{children}</AuthGuard></body>
    </html>
  );
}
