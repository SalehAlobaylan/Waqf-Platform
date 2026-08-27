import { redirect } from "next/navigation";

// Locale-aware marketing shortcut: /{locale}/toolkit → independent Toolkit deployment.
// Keeps Waqf independent (no runtime import), pure redirect to live site.
// If env is not set, falls back to the Waqf project page so the shortcut never 404s.
export default async function ToolkitRedirect({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const toolkitUrl =
        process.env.TOOLKIT_URL ||
        process.env.NEXT_PUBLIC_TOOLKIT_URL ||
        "https://waqf-toolkit.vercel.app";

    // Preserve locale when pointing to Toolkit (it supports /en and /ar)
    const target = toolkitUrl.endsWith("/") ? `${toolkitUrl}${locale}` : `${toolkitUrl}/${locale}`;

    // Hard redirect — marketing shortcut should go straight to the product
    redirect(target);
}

export function generateMetadata() {
    return {
        title: "Toolkit — redirect",
        robots: { index: false, follow: false },
    };
}
