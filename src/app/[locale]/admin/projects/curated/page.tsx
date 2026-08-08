import { setRequestLocale, getTranslations } from "next-intl/server";
import { CuratedProjectsList } from "@/components/admin/CuratedProjectsList";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("adminCuratedProjects"),
    };
}

export default async function CuratedProjectsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <CuratedProjectsList locale={locale} />;
}
