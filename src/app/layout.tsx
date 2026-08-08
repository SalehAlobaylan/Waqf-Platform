import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Waqf - وقف",
    template: "%s | Waqf",
  },
  description:
    "Connect with projects that matter and contribute your skills to lasting impact",
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
