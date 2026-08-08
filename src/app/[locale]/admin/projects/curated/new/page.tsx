import { setRequestLocale, getTranslations } from "next-intl/server";
import { ProjectForm } from "@/components/projects/ProjectForm";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("adminNewCuratedProject") };
}

export default async function NewCuratedProjectPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <ProjectForm locale={locale} mode="curate" />;
}
