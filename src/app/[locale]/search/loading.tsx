import { Skeleton } from "@/components/ui/Card";

export default function SearchLoading() {
    return (
        <div className="min-h-screen bg-waqf-bg py-8">
            <div className="container max-w-4xl mx-auto px-4">
                <Skeleton className="h-12 mb-8" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg border border-waqf-border p-5 space-y-3">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
