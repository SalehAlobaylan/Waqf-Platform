import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimit } from "@/lib/rate-limit";

const handler = toNextJsHandler(auth);

export const GET = rateLimit({ windowMs: 60_000, max: 60 }, handler.GET);
export const POST = rateLimit({ windowMs: 60_000, max: 15 }, handler.POST);
