/**
 * Dev sign-in helper. Off by default. Requires explicit operator opt-in:
 *   - ENABLE_DEV_LOGIN=true
 *
 * WARNING: when enabled in production this endpoint allows anyone to sign
 * in as any user (including admins) knowing only their email.
 *
 * Cookie naming follows better-auth: the `__Secure-` prefix is used on
 * HTTPS (production) deployments.
 */
export const DEV_LOGIN_ENABLED = process.env.ENABLE_DEV_LOGIN === "true";
