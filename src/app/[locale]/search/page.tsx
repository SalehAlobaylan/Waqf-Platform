import { Suspense } from "react";
import { SearchResults } from "@/components/search/SearchResults";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Search Projects | Waqf",
    description: "Search for Islamic open-source projects to contribute to as sadaqah jariyah",
};

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
