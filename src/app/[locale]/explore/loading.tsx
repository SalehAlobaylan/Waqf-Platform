import { Skeleton } from "@/components/ui/Card";

export default function ExploreLoading() {
    return (
        <div className="min-h-screen bg-waqf-bg py-8">
            <div className="container max-w-[1280px] mx-auto px-4">
                <Skeleton className="h-9 w-64 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    <div className="hidden lg:block space-y-4">
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg border border-waqf-border p-6 space-y-3">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                                <Skeleton className="h-px w-full mt-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
