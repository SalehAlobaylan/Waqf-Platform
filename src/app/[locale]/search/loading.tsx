export default function SearchLoading() {
    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container max-w-4xl mx-auto px-4">
                <div className="h-12 bg-white rounded-xl border border-secondary-100 animate-pulse mb-8" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-secondary-100 p-5 space-y-3">
                            <div className="h-4 w-2/3 bg-secondary-200/60 animate-pulse rounded" />
                            <div className="h-3 w-full bg-secondary-200/50 animate-pulse rounded" />
                            <div className="h-3 w-1/2 bg-secondary-200/50 animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
