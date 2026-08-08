import { escapeHtml, escapeUrl } from "./escape";

export interface MagicLinkParams {
    url: string;
    email: string;
    locale?: string;
}

const baseStyles = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #f9fbfb;
    margin: 0;
    padding: 0;
    color: #101917;
`;

const isArabic = (locale?: string) => locale === "ar";

export function magicLinkEmail({ url, email, locale }: MagicLinkParams) {
    const rtl = isArabic(locale);

    const title = rtl ? "سجّل دخولك إلى وقف" : "Sign in to Waqf";
    const subtitle = rtl
        ? "انقر الزر أدناه لإكمال تسجيل الدخول. الرابط صالح لمدة ١٠ دقائق."
        : "Click the button below to complete your sign-in. The link expires in 10 minutes.";
    const buttonLabel = rtl ? "تسجيل الدخول" : "Sign in to Waqf";
    const linkFallback = rtl
        ? "إذا لم يعمل الزر، انسخ والصق الرابط التالي في متصفحك:"
        : "If the button doesn't work, copy and paste this link into your browser:";
    const ignore = rtl
        ? "إذا لم تطلب هذا البريد، يمكنك تجاهله بأمان."
        : "If you didn't request this email, you can safely ignore it.";
    const brand = "Waqf — Tech for Good";

    const safeUrl = escapeUrl(url);
    const safeEmail = escapeHtml(email);

    const html = `<!DOCTYPE html>
<html lang="${rtl ? "ar" : "en"}" dir="${rtl ? "rtl" : "ltr"}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
</head>
<body style="${baseStyles}">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fbfb; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e9f1ef; overflow: hidden;" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="padding: 32px 32px 16px 32px; text-align: ${rtl ? "right" : "left"};">
                            <div style="display: inline-block; padding: 6px 12px; background-color: #e6f5f1; color: #1f705d; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 999px;">
                                ${rtl ? "تسجيل دخول" : "SIGN IN"}
                            </div>
                            <h1 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 900; color: #101917; letter-spacing: -0.02em;">
                                ${title}
                            </h1>
                            <p style="margin: 0; color: #588d81; font-size: 15px; line-height: 1.5;">
                                ${subtitle}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 32px 32px 32px; text-align: center;">
                            <a href="${safeUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1f705d; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(31,112,93,0.25);">
                                ${buttonLabel}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 32px 32px; text-align: ${rtl ? "right" : "left"};">
                            <p style="margin: 0 0 8px 0; color: #588d81; font-size: 13px;">
                                ${linkFallback}
                            </p>
                            <p style="margin: 0; word-break: break-all; color: #1f705d; font-size: 12px; font-family: 'JetBrains Mono', monospace;">
                                ${safeUrl}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 32px; background-color: #f9fbfb; border-top: 1px solid #e9f1ef; text-align: ${rtl ? "right" : "left"};">
                            <p style="margin: 0 0 4px 0; color: #588d81; font-size: 12px; line-height: 1.5;">
                                ${ignore}
                            </p>
                            <p style="margin: 8px 0 0 0; color: #101917; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
                                ${brand}
                            </p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 16px 0 0 0; color: #588d81; font-size: 11px; text-align: center;">
                    ${rtl ? "هذا البريد أُرسل إلى" : "Sent to"} ${safeEmail}
                </p>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const text = `${title}\n\n${subtitle}\n\n${buttonLabel}:\n${url}\n\n${ignore}\n\n${brand}\n\nSent to: ${email}`;

    return {
        subject: rtl ? "سجّل دخولك إلى وقف" : "Sign in to Waqf",
        html,
        text,
    };
}
