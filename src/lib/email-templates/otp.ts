import { escapeHtml } from "./escape";

export interface OtpParams {
    otp: string;
    email: string;
    locale?: string;
    type?: "sign-in" | "email-verification" | "forget-password";
}

const baseStyles = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #f9fbfb;
    margin: 0;
    padding: 0;
    color: #101917;
`;

const isArabic = (locale?: string) => locale === "ar";

const variantCopy = (rtl: boolean, type: OtpParams["type"]) => {
    if (type === "forget-password") {
        return {
            title: rtl ? "رمز إعادة تعيين كلمة المرور" : "Reset your password",
            subtitle: rtl
                ? "استخدم الرمز التالي لإعادة تعيين كلمة المرور. ينتهي خلال ١٠ دقائق."
                : "Use the code below to reset your password. It expires in 10 minutes.",
            subject: rtl ? `رمز إعادة التعيين: ${"${otp}"}` : `Your Waqf reset code: ${"${otp}"}`,
        };
    }
    if (type === "email-verification") {
        return {
            title: rtl ? "تأكيد بريدك الإلكتروني" : "Verify your email",
            subtitle: rtl
                ? "استخدم الرمز التالي لتأكيد بريدك الإلكتروني. ينتهي خلال ١٠ دقائق."
                : "Use the code below to verify your email. It expires in 10 minutes.",
            subject: rtl ? `رمز التأكيد: ${"${otp}"}` : `Your Waqf verification code: ${"${otp}"}`,
        };
    }
    return {
        title: rtl ? "رمز تسجيل الدخول" : "Your sign-in code",
        subtitle: rtl
            ? "استخدم الرمز التالي لإكمال تسجيل الدخول. ينتهي خلال ١٠ دقائق."
            : "Use the code below to complete your sign-in. It expires in 10 minutes.",
        subject: rtl ? `رمز تسجيل الدخول إلى وقف: ${"${otp}"}` : `Your Waqf sign-in code: ${"${otp}"}`,
    };
};

export function otpEmail({ otp, email, locale, type }: OtpParams) {
    const rtl = isArabic(locale);
    const copy = variantCopy(rtl, type);

    const title = copy.title;
    const subtitle = copy.subtitle;
    const codeLabel = rtl ? "الرمز" : "CODE";
    const ignore = rtl
        ? "إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد."
        : "If you didn't request this code, you can ignore this email.";
    const brand = "Waqf — Tech for Good";

    // Defense-in-depth: better-auth already validates email format, but
    // escaping here protects against any future code path that bypasses
    // that validation. OTP is a server-generated 6-digit number — safe as-is.
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
                            <div style="display: inline-block; padding: 6px 12px; background-color: #fdf8ef; color: #92671f; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 999px;">
                                ${rtl ? "رمز التحقق" : "VERIFICATION"}
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
                            <p style="margin: 0 0 8px 0; color: #588d81; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">
                                ${codeLabel}
                            </p>
                            <div style="display: inline-block; padding: 20px 28px; background: linear-gradient(135deg, #fdf8ef 0%, #f9fbfb 100%); border: 2px solid #d4a056; border-radius: 16px;">
                                <span style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 0.4em; color: #92671f;">
                                    ${otp}
                                </span>
                            </div>
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

    const text = `${title}\n\n${codeLabel}: ${otp}\n\n${subtitle}\n\n${ignore}\n\n${brand}\n\nSent to: ${email}`;

    return {
        subject: copy.subject.replace("${otp}", otp),
        html,
        text,
    };
}
