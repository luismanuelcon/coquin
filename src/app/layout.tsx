import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "COQUIN",
  title: "COQUIN",
  description: "Gestion del hogar, citas, finanzas, mercado y tareas familiares.",
  icons: {
    icon: [
      { url: "/coquin-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/coquin-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/coquin-icon.png", sizes: "512x512", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f6f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
