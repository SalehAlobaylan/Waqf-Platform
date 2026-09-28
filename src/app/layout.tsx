import type { Metadata, Viewport } from "next";
import "./globals.css";

// Icons and the share card come from the file conventions in this folder
// (favicon.ico, icon.png, apple-icon.png, opengraph-image.png), so they are
// picked up automatically on every route.
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  // Plain string, no template: the `%s | Waqf` template lives in
  // [locale]/layout.tsx alongside its own default. A template here would be
  // inherited by that default and render "Waqf - وقف | Waqf".
  title: "Waqf - وقف",
  description:
    "Connect with projects that matter and contribute your skills to lasting impact",
  applicationName: "Waqf",
  openGraph: {
    type: "website",
    siteName: "Waqf",
    locale: "en_US",
    alternateLocale: "ar_AR",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#082520",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This root layout is a pass-through.
  // The <html> and <body> tags are rendered by the [locale]/layout.tsx
  // to properly set lang/dir attributes per locale.
  return children;
}
