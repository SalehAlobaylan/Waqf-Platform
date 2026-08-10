"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [locale] = useState<"ar" | "en">(() =>
        typeof window !== "undefined" && window.location.pathname.startsWith("/en") ? "en" : "ar"
    );

    useEffect(() => {
        console.error("[global-error]", error);
    }, [error]);

    const isAr = locale === "ar";
    const dir = isAr ? "rtl" : "ltr";

    return (
        <html lang={locale} dir={dir}>
            <body style={{ margin: 0, background: "#f8faf9", color: "#101917", fontFamily: "system-ui, sans-serif" }}>
                <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
                    <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>
                        {isAr ? "حدث خطأ ما" : "Something went wrong"}
                    </h1>
                    <p style={{ maxWidth: "24rem", color: "#5c6b66", marginBottom: "2.5rem" }}>
                        {isAr ? "حدث خطأ غير متوقع. حاول مرة أخرى." : "An unexpected error occurred. Please try again."}
                    </p>
                    <button
                        onClick={reset}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: "3rem", padding: "0 1.5rem", borderRadius: "0.75rem", background: "#1f705d", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}
                    >
                        {isAr ? "إعادة المحاولة" : "Try Again"}
                    </button>
                </div>
            </body>
        </html>
    );
}
