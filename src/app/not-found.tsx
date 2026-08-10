"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
    const pathname = usePathname();
    const isAr = !pathname.startsWith("/en");
    const locale = isAr ? "ar" : "en";
    const dir = isAr ? "rtl" : "ltr";

    return (
        <html lang={locale} dir={dir}>
            <body style={{ margin: 0, background: "#f8faf9", color: "#101917", fontFamily: "system-ui, sans-serif" }}>
                <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
                    <div style={{ fontSize: "6rem", fontWeight: 900, opacity: 0.15, marginBottom: "1.5rem", userSelect: "none" }}>404</div>
                    <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>
                        {isAr ? "الصفحة غير موجودة" : "Page not found"}
                    </h1>
                    <p style={{ maxWidth: "24rem", color: "#5c6b66", marginBottom: "2.5rem" }}>
                        {isAr ? "الصفحة التي تبحث عنها غير موجودة." : "The page you are looking for does not exist."}
                    </p>
                    <Link
                        href={`/${locale}`}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: "3rem", padding: "0 1.5rem", borderRadius: "0.75rem", background: "#1f705d", color: "#fff", fontWeight: 700, textDecoration: "none" }}
                    >
                        {isAr ? "الصفحة الرئيسية" : "Go to Homepage"}
                    </Link>
                </div>
            </body>
        </html>
    );
}
