"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[global-error]", error);
    }, [error]);

    return (
        <html lang="en" dir="ltr">
            <body style={{ margin: 0, background: "#f8faf9", color: "#101917", fontFamily: "system-ui, sans-serif" }}>
                <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
                    <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>
                        Something went wrong / حدث خطأ ما
                    </h1>
                    <p style={{ maxWidth: "24rem", color: "#5c6b66", marginBottom: "2.5rem" }}>
                        An unexpected error occurred. Please try again.
                        <br />
                        حدث خطأ غير متوقع. حاول مرة أخرى.
                    </p>
                    <button
                        onClick={reset}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: "3rem", padding: "0 1.5rem", borderRadius: "0.75rem", background: "#1f705d", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}
                    >
                        Try Again / إعادة المحاولة
                    </button>
                </div>
            </body>
        </html>
    );
}
