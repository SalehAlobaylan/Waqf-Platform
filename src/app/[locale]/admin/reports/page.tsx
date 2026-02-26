import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ReportQueue } from "@/components/admin/ReportQueue";
import { Flag } from "lucide-react";

export const metadata = {
    title: "Content Reports | Admin | Waqf",
};

export default async function AdminReportsPage({
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
        <div className="container max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <Flag className="w-5 h-5 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-900">
                        {locale === "ar" ? "بلاغات المحتوى" : "Content Reports"}
                    </h1>
                </div>
                <p className="text-secondary-500">
                    {locale === "ar"
                        ? "مراجعة وإدارة بلاغات المحتوى المقدمة من المستخدمين"
                        : "Review and manage content reports submitted by users"}
                </p>
            </div>
            <ReportQueue />
        </div>
    );
}
