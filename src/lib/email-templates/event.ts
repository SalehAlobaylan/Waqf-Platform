import { escapeHtml, escapeUrl } from "./escape";

const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://waqf.app").replace(/\/+$/, "");

export type EventKind =
    | "NEW_APPLICATION"
    | "APPLICATION_ACCEPTED"
    | "APPLICATION_REJECTED"
    | "NEW_MESSAGE";

export interface EventEmailParams {
    kind: EventKind;
    locale?: string;
    userName?: string;
    actorName?: string;
    projectTitle?: string;
    projectSlug?: string;
    applicationId?: string;
    messagePreview?: string;
    feedback?: string;
}

const isArabic = (locale?: string) => locale === "ar";

const kindCopy: Record<EventKind, { en: { badge: string; title: (p: EventEmailParams) => string; body: (p: EventEmailParams) => string }; ar: { badge: string; title: (p: EventEmailParams) => string; body: (p: EventEmailParams) => string } }> = {
    NEW_APPLICATION: {
        en: {
            badge: "NEW APPLICATION",
            title: () => "Someone applied to your project",
            body: (p) => `${p.actorName ?? "A contributor"} applied to "${p.projectTitle ?? "your project"}". Review their application and get back to them.`,
        },
        ar: {
            badge: "طلب جديد",
            title: () => "تقدم شخص للمساهمة في مشروعك",
            body: (p) => `تقدم ${p.actorName ?? "أحد المساهمين"} للانضمام إلى مشروع "${p.projectTitle ?? "مشروعك"}". راجع طلبه وتواصل معه.`,
        },
    },
    APPLICATION_ACCEPTED: {
        en: {
            badge: "APPLICATION ACCEPTED",
            title: () => "Your application was accepted",
            body: (p) => `${p.actorName ?? "The project owner"} accepted your application for "${p.projectTitle ?? "the project"}". Head to your dashboard to start collaborating.`,
        },
        ar: {
            badge: "تم قبول الطلب",
            title: () => "تم قبول طلبك",
            body: (p) => `قبل ${p.actorName ?? "صاحب المشروع"} طلبك للمساهمة في مشروع "${p.projectTitle ?? "المشروع"}". انتقل إلى لوحة التحكم لبدء التعاون.`,
        },
    },
    APPLICATION_REJECTED: {
        en: {
            badge: "APPLICATION NOT SELECTED",
            title: () => "Update on your application",
            body: (p) => `The project owner ${p.actorName ? `${p.actorName} ` : ""}did not select your application for "${p.projectTitle ?? "the project"}".${p.feedback ? ` Feedback: ${p.feedback}` : ""} Keep contributing — the right project is out there.`,
        },
        ar: {
            badge: "لم يتم اختيار الطلب",
            title: () => "تحديث بخصوص طلبك",
            body: (p) => `لم يختر صاحب المشروع${p.actorName ? ` ${p.actorName}` : ""} طلبك للمساهمة في مشروع "${p.projectTitle ?? "المشروع"}"${p.feedback ? `. ملاحظات: ${p.feedback}` : ""}. لا تتوقف عن المساهمة — المشروع المناسب في انتظارك.`,
        },
    },
    NEW_MESSAGE: {
        en: {
            badge: "NEW MESSAGE",
            title: () => "You have a new message",
            body: (p) => `${p.actorName ?? "Someone"} sent you a message${p.projectTitle ? ` about "${p.projectTitle}"` : ""}: "${p.messagePreview ?? ""}"`,
        },
        ar: {
            badge: "رسالة جديدة",
            title: () => "لديك رسالة جديدة",
            body: (p) => `أرسل لك ${p.actorName ?? "شخص"} رسالة${p.projectTitle ? ` بخصوص مشروع "${p.projectTitle}"` : ""}: "${p.messagePreview ?? ""}"`,
        },
    },
};

const baseStyles = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #f9fbfb;
    margin: 0;
    padding: 0;
    color: #101917;
`;

export function eventEmail(params: EventEmailParams) {
    const rtl = isArabic(params.locale);
    const copy = kindCopy[params.kind][rtl ? "ar" : "en"];

    const badge = copy.badge;
    const title = copy.title(params);
    const body = copy.body(params);

    let button: { label: string; url: string } | null = null;
    if (params.applicationId) {
        button = {
            label: rtl ? "فتح الطلب" : "Open Application",
            url: `/dashboard/applications/${params.applicationId}`,
        };
    } else if (params.projectSlug) {
        button = {
            label: rtl ? "عرض المشروع" : "View Project",
            url: `/projects/${params.projectSlug}`,
        };
    }

    const safeTitle = escapeHtml(title);
    const safeBody = escapeHtml(body);
    const safeUser = escapeHtml(params.userName || "");
    const buttonHtml = button
        ? `
                    <tr>
                        <td style="padding: 8px 32px 32px 32px; text-align: center;">
                            <a href="${appBaseUrl}${escapeUrl(button.url)}" style="display: inline-block; padding: 14px 32px; background-color: #1f705d; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(31,112,93,0.25);">
                                ${escapeHtml(button.label)}
                            </a>
                        </td>
                    </tr>`
        : "";

    const footer = rtl
        ? "يمكنك إدارة الإشعارات من لوحة التحكم."
        : "You can manage notifications from your dashboard.";

    const html = `<!DOCTYPE html>
<html lang="${rtl ? "ar" : "en"}" dir="${rtl ? "rtl" : "ltr"}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
</head>
<body style="${baseStyles}">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fbfb; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e9f1ef; overflow: hidden;" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="padding: 32px 32px 16px 32px; text-align: ${rtl ? "right" : "left"};">
                            <div style="display: inline-block; padding: 6px 12px; background-color: #e6f5f1; color: #1f705d; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 999px;">
                                ${escapeHtml(badge)}
                            </div>
                            <h1 style="margin: 16px 0 8px 0; font-size: 22px; font-weight: 900; color: #101917; letter-spacing: -0.02em;">
                                ${safeTitle}
                            </h1>
                            <p style="margin: 0; color: #588d81; font-size: 15px; line-height: 1.6;">
                                ${safeBody}
                            </p>
                        </td>
                    </tr>
                    ${buttonHtml}
                    <tr>
                        <td style="padding: 16px 32px; background-color: #f9fbfb; border-top: 1px solid #e9f1ef; text-align: ${rtl ? "right" : "left"};">
                            <p style="margin: 0 0 4px 0; color: #588d81; font-size: 12px; line-height: 1.5;">
                                ${escapeHtml(footer)}
                            </p>
                            <p style="margin: 8px 0 0 0; color: #101917; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
                                Waqf — Tech for Good
                            </p>
                        </td>
                    </tr>
                </table>
                ${safeUser ? `<p style="margin: 16px 0 0 0; color: #588d81; font-size: 11px; text-align: center;">${rtl ? "مرحباً" : "Hi"} ${safeUser}</p>` : ""}
            </td>
        </tr>
    </table>
</body>
</html>`;

    return {
        subject: title,
        html,
        text: `${title}\n\n${body}\n`,
    };
}
