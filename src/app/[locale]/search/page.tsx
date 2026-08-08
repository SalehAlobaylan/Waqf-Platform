import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SearchResults } from "@/components/search/SearchResults";
import { Loader2 } from "lucide-react";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("search"),
    };
}

function SearchLoading() {
    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchLoading />}>
            <SearchResults />
        </Suspense>
    );
}
