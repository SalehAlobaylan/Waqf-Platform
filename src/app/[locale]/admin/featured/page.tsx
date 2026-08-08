import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { FeaturedCuration } from "@/components/admin/FeaturedCuration";
import { Star } from "lucide-react";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("adminFeatured"),
    };
}

export default async function AdminFeaturedPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "featured" });
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        redirect(`/${locale}/login`);
    }

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-900">
                        {t("title")}
                    </h1>
                </div>
                <p className="text-secondary-500">
                    {t("description")}
                </p>
            </div>
            <FeaturedCuration />
        </div>
    );
}
