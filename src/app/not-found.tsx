import Link from "next/link";

export default function NotFound() {
    return (
        <html lang="en" dir="ltr">
            <body style={{ margin: 0, background: "#f8faf9", color: "#101917", fontFamily: "system-ui, sans-serif" }}>
                <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
                    <div style={{ fontSize: "6rem", fontWeight: 900, opacity: 0.15, marginBottom: "1.5rem", userSelect: "none" }}>404</div>
                    <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Page not found / الصفحة غير موجودة</h1>
                    <p style={{ maxWidth: "24rem", color: "#5c6b66", marginBottom: "2.5rem" }}>
                        The page you are looking for does not exist.
                        <br />
                        الصفحة التي تبحث عنها غير موجودة.
                    </p>
                    <Link
                        href="/"
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: "3rem", padding: "0 1.5rem", borderRadius: "0.75rem", background: "#1f705d", color: "#fff", fontWeight: 700, textDecoration: "none" }}
                    >
                        Go to Homepage / الصفحة الرئيسية
                    </Link>
                </div>
            </body>
        </html>
    );
}
