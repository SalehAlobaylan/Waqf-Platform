import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.FROM_EMAIL || "Waqf <noreply@waqf.app>";
const isDev = process.env.NODE_ENV !== "production";

const resend = apiKey ? new Resend(apiKey) : null;

let warnedMissingKey = false;

export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
    if (!resend) {
        if (!warnedMissingKey) {
            console.warn(
                "\n┌─────────────────────────────────────────────────────────────┐\n" +
                    "│  [email] RESEND_API_KEY is not set.                          │\n" +
                    "│  Outgoing emails (magic link / OTP) will be SKIPPED.         │\n" +
                    "│  Set RESEND_API_KEY in .env to deliver real emails, or use   │\n" +
                    "│  POST /api/dev/sign-in-as to mint a session in dev/test.    │\n" +
                    "└─────────────────────────────────────────────────────────────┘\n",
            );
            warnedMissingKey = true;
        }
        // NOTE: log only metadata here. NEVER add `html` to this log line —
        // html bodies can contain magic-link URLs and OTPs that should not
        // land in stdout/log aggregators.
        console.info("[email] skipped →", to, "·", subject);
        return { id: "skipped-no-key" };
    }

    if (isDev) {
        // Same warning as above: metadata only, never `html` or `text`.
        console.info("[email] dev mode — sending via Resend", { to, subject });
    }

    const { data, error } = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
        text,
    });

    if (error) {
        console.error("[email] Resend error", error);
        if (isDev) {
            // Dev/test cannot deliver real email (unverified domain, sandbox, etc.).
            // Do not fail the auth flow — better-auth still stores the magic link
            // / OTP record, so dev flows (and their tests) remain usable.
            console.warn("[email] dev mode — send failed, skipping delivery", { to, subject });
            return { id: "skipped-dev-error" };
        }
        throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
}
