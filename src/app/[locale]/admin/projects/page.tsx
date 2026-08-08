import { setRequestLocale, getTranslations } from "next-intl/server";
import { ProjectReviewQueue } from "@/components/admin/ProjectReviewQueue";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("adminProjects"),
    };
}

export default async function AdminProjectsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <ProjectReviewQueue locale={locale} />;
}
