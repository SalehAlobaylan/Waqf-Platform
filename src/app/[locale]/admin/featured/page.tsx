import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { FeaturedCuration } from "@/components/admin/FeaturedCuration";
import { Star } from "lucide-react";

export const metadata = {
    title: "Featured Projects | Admin | Waqf",
};

export default async function AdminFeaturedPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        redirect("/login");
    }

    const { locale } = await params;

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-900">
                        {locale === "ar" ? "المشاريع المميزة" : "Featured Projects"}
                    </h1>
                </div>
                <p className="text-secondary-500">
                    {locale === "ar"
                        ? "إدارة المشاريع المعروضة في الصفحة الرئيسية"
                        : "Curate projects for the homepage"}
                </p>
            </div>
            <FeaturedCuration />
        </div>
    );
}
