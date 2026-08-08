export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container max-w-6xl mx-auto px-4">
                <div className="h-9 w-52 bg-secondary-200/60 animate-pulse rounded-lg mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-secondary-100 p-5">
                            <div className="h-8 w-16 bg-secondary-200/60 animate-pulse rounded mb-3" />
                            <div className="h-3 w-24 bg-secondary-200/50 animate-pulse rounded" />
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-secondary-100 p-5 space-y-3">
                            <div className="h-4 w-1/2 bg-secondary-200/60 animate-pulse rounded" />
                            <div className="h-3 w-full bg-secondary-200/50 animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
