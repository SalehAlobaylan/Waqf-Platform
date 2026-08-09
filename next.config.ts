import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Keep Prisma engine external so Turbopack builds don't break DB connections
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Enable standalone output for Docker, but not on Vercel (conflicts with
  // Vercel's build process which looks for .nft.json tracing files)
  output: process.env.VERCEL ? undefined : "standalone",
  // Allow images from external sources (avatars, etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
