import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimit } from "@/lib/rate-limit";

const handler = toNextJsHandler(auth);

// Dev/test suites (Playwright) legitimately burst through /api/auth/* —
// generous limits there keep e2e runs stable while production stays strict.
const isDev = process.env.NODE_ENV !== "production";

export const GET = rateLimit({ windowMs: 60_000, max: isDev ? 300 : 60 }, handler.GET);
export const POST = rateLimit({ windowMs: 60_000, max: isDev ? 100 : 15 }, handler.POST);
