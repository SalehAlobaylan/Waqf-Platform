import { ExternalLink, Folder } from "lucide-react";

export function PortfolioGrid({ items, locale }: { items: any[], locale: string }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-waqf-border overflow-hidden">
            <div className="px-6 py-5 border-b border-waqf-border flex justify-between items-center">
                <h2 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary-600" />
                    {locale === "ar" ? "معرض الأعمال" : "Portfolio"}
                </h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="border border-secondary-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition bg-secondary-50 hover:bg-white group flex flex-col h-full">
                            <h3 className="font-bold text-secondary-900 group-hover:text-primary-700 transition flex items-center justify-between">
                                {item.title}
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-secondary-400 hover:text-primary-600 p-1">
                                    <ExternalLink size={16} />
                                </a>
                            </h3>
                            {item.description && (
                                <p className="text-sm text-secondary-600 mt-2 flex-grow">{item.description}</p>
                            )}
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary-400 hover:text-primary-600 truncate block mt-4 bg-white border border-secondary-100 rounded px-2 py-1">
                                {item.url}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
