import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "League Champion Database",
    template: "%s | League Champion Database",
  },
  description:
    "A fast static League of Legends champion database with roles, classes, regions, abilities, runes, items, and official Riot assets.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "League Champion Database",
    description:
      "Browse and search all League of Legends champions by role, class, region, difficulty, release date, and build data.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#050812",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://ddragon.leagueoflegends.com" />
        <link rel="preconnect" href="https://cmsassets.rgpub.io" />
        <link rel="dns-prefetch" href="https://ddragon.leagueoflegends.com" />
        <link rel="dns-prefetch" href="https://cmsassets.rgpub.io" />
      </head>
      <body>{children}</body>
    </html>
  );
}
