/**
 * Dev sign-in helper. Off by default. Requires BOTH:
 *   - ENABLE_DEV_LOGIN=true (explicit operator opt-in)
 *   - NODE_ENV !== "production" (safety net against prod enablement)
 *
 * In production better-auth uses the `__Secure-` cookie prefix; this
 * helper writes the unprefixed name and would silently fail to mint a
 * session — hence the extra prod guard.
 */
export const DEV_LOGIN_ENABLED =
    process.env.ENABLE_DEV_LOGIN === "true" &&
    process.env.NODE_ENV !== "production";
