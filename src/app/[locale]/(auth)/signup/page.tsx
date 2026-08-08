import { getTranslations } from "next-intl/server";
import { SignupForm } from "@/components/auth/SignupForm";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("signup"),
    };
}

export default function SignupPage() {
    return <SignupForm />;
}
