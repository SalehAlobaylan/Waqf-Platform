import { Skeleton } from "@/components/ui/Card";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-waqf-bg py-8">
            <div className="container max-w-6xl mx-auto px-4">
                <Skeleton className="h-9 w-52 mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mb-10">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <div className="w-6 h-0.5 bg-secondary-100 mb-3" />
                            <Skeleton className="h-9 w-16 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg border border-waqf-border p-5 space-y-3">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
