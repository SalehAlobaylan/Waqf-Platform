export default function ExploreLoading() {
    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container max-w-[1280px] mx-auto px-4">
                <div className="h-9 w-64 bg-secondary-200/60 animate-pulse rounded-lg mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    <div className="hidden lg:block space-y-4">
                        <div className="h-10 bg-secondary-200/60 animate-pulse rounded-xl" />
                        <div className="h-10 bg-secondary-200/60 animate-pulse rounded-xl" />
                        <div className="h-10 bg-secondary-200/60 animate-pulse rounded-xl" />
                        <div className="h-10 bg-secondary-200/60 animate-pulse rounded-xl" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-secondary-100 p-5 space-y-3">
                                <div className="h-4 w-3/4 bg-secondary-200/60 animate-pulse rounded" />
                                <div className="h-3 w-full bg-secondary-200/50 animate-pulse rounded" />
                                <div className="h-3 w-2/3 bg-secondary-200/50 animate-pulse rounded" />
                                <div className="flex gap-2 pt-2">
                                    <div className="h-6 w-20 bg-secondary-200/60 animate-pulse rounded-full" />
                                    <div className="h-6 w-16 bg-secondary-200/60 animate-pulse rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
