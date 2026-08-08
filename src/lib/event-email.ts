import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { eventEmail, EventEmailParams } from "@/lib/email-templates/event";

/**
 * Send an event-driven email (application received, accepted, rejected,
 * new message) to a user. Falls back to `preferredLanguage` when the user
 * has no ContributorProfile (or when no explicit locale was provided).
 * Never throws: email failures must not break the underlying API action.
 */
export async function sendEventEmail(
    userId: string,
    params: EventEmailParams,
    options?: { locale?: string }
): Promise<void> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                name: true,
                preferredLanguage: true,
            },
        });

        if (!user?.email) return;

        const locale = options?.locale ?? user.preferredLanguage;
        const { subject, html, text } = eventEmail({
            ...params,
            locale,
            userName: user.name ?? undefined,
        });

        await sendEmail({ to: user.email, subject, html, text });
    } catch (error) {
        // Event emails are best-effort: log metadata, never fail the flow.
        console.warn("[email] event email skipped", { userId, kind: params.kind, error });
    }
}
