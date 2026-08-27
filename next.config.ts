import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const securityHeaders = [
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

// Report-only until violations are measured (see Plans/Gap-Analysis.md §3).
// Tighten (drop 'unsafe-inline'/'unsafe-eval') and switch to
// Content-Security-Policy once Gap 6's analytics provider is decided.
const contentSecurityPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://avatars.githubusercontent.com https://github.com https://utfs.io https://*.ufs.sh",
    "connect-src 'self' https://*.pusher.com wss://*.pusher.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join("; ");

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
  async redirects() {
    return [
      {
        source: "/toolkit",
        destination: "/ar/toolkit",
        permanent: false,
      },
      {
        source: "/toolkit/:path*",
        destination: "https://waqf-toolkit.vercel.app/:path*",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...securityHeaders,
          { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
