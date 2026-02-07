"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    variant?: "header" | "page";
    onSearch?: (query: string) => void;
}

export function SearchBar({
    placeholder,
    className = "",
    variant = "header",
    onSearch,
}: SearchBarProps) {
    const t = useTranslations("search");
    const locale = useLocale();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Handle keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
                inputRef.current?.focus();
            }
            if (e.key === "Escape") {
                setIsOpen(false);
                setQuery("");
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSearch = useCallback((value: string) => {
        setQuery(value);

        // Debounce search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.length >= 2) {
            setIsLoading(true);
            debounceRef.current = setTimeout(() => {
                if (onSearch) {
                    onSearch(value);
                } else {
                    router.push(`/${locale}/search?q=${encodeURIComponent(value)}`);
                }
                setIsLoading(false);
            }, 300);
        }
    }, [locale, router, onSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.length >= 2) {
            if (onSearch) {
                onSearch(query);
            } else {
                router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
            }
        }
    };

    const clearSearch = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    if (variant === "header") {
        return (
            <form onSubmit={handleSubmit} className={`relative ${className}`}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder={placeholder || t("placeholder")}
                        className="w-full pl-9 pr-20 py-2 text-sm bg-secondary-100 border border-transparent 
                                   rounded-lg placeholder-secondary-400 text-secondary-900
                                   focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 
                                   transition-all duration-200"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {isLoading && (
                            <Loader2 className="w-4 h-4 text-secondary-400 animate-spin" />
                        )}
                        {query && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="p-1 hover:bg-secondary-200 rounded"
                            >
                                <X className="w-3.5 h-3.5 text-secondary-500" />
                            </button>
                        )}
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] 
                                        font-medium text-secondary-400 bg-secondary-200 rounded">
                            ⌘K
                        </kbd>
                    </div>
                </div>
            </form>
        );
    }

    // Page variant - larger search bar
    return (
        <form onSubmit={handleSubmit} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={placeholder || t("searchPlaceholder")}
                    className="w-full pl-12 pr-12 py-4 text-lg bg-white border border-secondary-200 
                               rounded-xl placeholder-secondary-400 text-secondary-900 shadow-sm
                               focus:border-primary-400 focus:ring-4 focus:ring-primary-100 
                               transition-all duration-200"
                    autoFocus
                />
                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary-100 rounded-lg"
                    >
                        <X className="w-5 h-5 text-secondary-500" />
                    </button>
                )}
            </div>
        </form>
    );
}
