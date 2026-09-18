import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DataProvider } from "@/components/data/data-provider";

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
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#17111a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
