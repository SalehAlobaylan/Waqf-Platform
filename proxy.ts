import createMiddleware from "next-intl/middleware";
import { routing } from "./src/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files (images, etc.)
  // - Next.js internals
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    // Also match root
    "/",
  ],
};
