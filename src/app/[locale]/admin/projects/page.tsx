import { setRequestLocale } from "next-intl/server";
import { ProjectReviewQueue } from "@/components/admin/ProjectReviewQueue";

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function AdminProjectsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <ProjectReviewQueue locale={locale} />;
}
