import Link from "next/link";
import {
    ArrowRight,
    Search,
    Clock,
    Shield,
    FileText,
    Link2,
    Film,
    Subtitles,
    ExternalLink,
} from "lucide-react";

interface FlagshipProject {
    title: string;
    slug: string;
    description: string;
    websiteUrl: string | null;
    externalUrl: string | null;
    githubUrl: string | null;
    toolsPreview: unknown;
}

interface FlagshipShowcaseProps {
    project: FlagshipProject;
    locale: string;
}

/**
 * Flagship band — priority representation for the showcase project.
 * Generic: shows whichever Project is `isOpenSource && featured` (Toolkit first).
 * Pure product preview (no GitHub stars/forks) — mirrors the live Toolkit UI
 * at waqf-toolkit.vercel.app (Find the tool. Open and use.) as seen in screenshot.
 *
 * Preview is static markup (no iframe, no runtime import) — respects
 * architectural boundary: Waqf owns discovery, Toolkit owns runtime.
 */
export function FlagshipShowcase({ project, locale }: FlagshipShowcaseProps) {
    const isAr = locale === "ar";
    const liveUrl = project.websiteUrl || project.externalUrl || `/${locale}/projects/${project.slug}`;
    const toolkitGithub = project.githubUrl;

    // Normalize toolsPreview → chips for "Most used" mimic
    const rawTools = Array.isArray(project.toolsPreview)
        ? (project.toolsPreview as Array<{ label: string; labelAr?: string }>)
        : [];
    // Fallback to screenshot's real Most Used when DB empty (keeps preview meaningful)
    const fallbackMostUsed = [
        { label: "Link Cleaner", labelAr: "منظف الروابط", descEn: "Clean tracking parameters out of shared links.", descAr: "إزالة معاملات التتبع من الروابط المشاركة." },
        { label: "Video Music Remover", labelAr: "مزيل موسيقى الفيديو", descEn: "Remove background music from a video, right in your browser.", descAr: "إزالة موسيقى الخلفية من الفيديو مباشرة في المتصفح." },
        { label: "Subtitle Cleaner", labelAr: "منظف الترجمة", descEn: "Clean subtitle files without changing their meaning.", descAr: "تنظيف ملفات الترجمة دون تغيير معناها." },
    ];
    const mostUsed = rawTools.length >= 3
        ? rawTools.slice(0, 3).map((t) => ({
              label: isAr ? t.labelAr || t.label : t.label,
              desc: "",
          }))
        : fallbackMostUsed.map((t) => ({
              label: isAr ? t.labelAr : t.label,
              desc: isAr ? t.descAr : t.descEn,
          }));

    const totalTools = rawTools.length > 0 ? rawTools.length : 10;

    return (
        <section className="relative overflow-hidden bg-waqf-bg border-y border-waqf-border" aria-labelledby="flagship-heading">
            {/* Warm wash mimicking toolkit's pale canvas — keeps Waqf border but adds toolkit-inspired tint */}
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 10% 0%, rgba(230,245,225,0.55) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 95% 85%, rgba(253,232,210,0.5) 0%, transparent 60%)",
                }}
            />
            <div className="relative max-w-[1280px] mx-auto px-4 py-10 md:py-14">
                {/* Top row: label + outward link */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-semibold text-primary-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden />
                            {isAr ? "مشروع مميز · مفتوح المصدر" : "Featured · Open Source"}
                        </span>
                        <span className="hidden sm:inline text-xs text-secondary-500">
                            {isAr ? "تطبيق مستقل · معاينة فقط" : "Independent app · Preview only"}
                        </span>
                    </div>
                    <Link
                        href={`/${locale}/projects/${project.slug}`}
                        className="text-xs font-semibold text-primary-600 hover:underline underline-offset-4"
                    >
                        {isAr ? "عرض صفحة المشروع" : "View project page"}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: copy + CTAs */}
                    <div className="lg:col-span-5">
                        <h2 id="flagship-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
                            {isAr ? "أدوات مفتوحة تعمل في متصفحك" : project.title}
                        </h2>
                        <p className="mt-3 text-secondary-600 leading-relaxed max-w-xl">
                            {project.description.slice(0, 180)}
                        </p>

                        {/* Tools chips preview (generic, from toolsPreview) */}
                        {rawTools.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {rawTools.slice(0, 6).map((t) => (
                                    <span
                                        key={t.label}
                                        className="rounded-full bg-white border border-waqf-border px-3 py-1.5 text-xs font-medium text-secondary-700"
                                    >
                                        {isAr ? t.labelAr || t.label : t.label}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href={liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-md h-11 px-6 bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
                            >
                                {isAr ? "استكشاف الأدوات" : "Explore Toolkit"}
                                <ExternalLink className="w-4 h-4 rtl:-scale-x-100" />
                            </a>
                            <a
                                href={toolkitGithub || `/${locale}/projects/${project.slug}#contribute`}
                                target={toolkitGithub ? "_blank" : undefined}
                                rel={toolkitGithub ? "noopener noreferrer" : undefined}
                                className="inline-flex items-center gap-2 rounded-md h-11 px-6 bg-white border border-waqf-border text-sm font-semibold text-secondary-700 hover:bg-secondary-50 transition-colors"
                            >
                                {isAr ? "ساهم" : "Contribute"}
                                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                            </a>
                        </div>

                        <p className="mt-4 text-xs leading-relaxed text-secondary-400 max-w-md">
                            {isAr
                                ? "معاينة واجهة فقط — يتم تشغيل الأدوات على موقع المشروع المستقل. لا ينكسر وقف إذا تعطل الموقع."
                                : "Interface preview only — utilities run on the independent deployment. Waqf stays up if the site is down."}
                        </p>
                    </div>

                    {/* Right: product preview — segmented as another website (browser chrome + toolkit header) */}
                    <div className="lg:col-span-7">
                        <div className="relative rounded-2xl border border-waqf-border bg-white shadow-[0_20px_60px_-24px_rgba(0,0,0,0.15),0_8px_24px_-16px_rgba(0,0,0,0.12)] overflow-hidden">
                            {/* Browser chrome — signals external site */}
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary-50 border-b border-waqf-border">
                                <div className="flex items-center gap-1.5 shrink-0" aria-hidden>
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-300 border border-red-400/30" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-300 border border-amber-400/30" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-300 border border-green-400/30" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <a
                                        href={liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-waqf-border px-3 py-1 text-[11px] font-medium text-secondary-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden />
                                        waqf-toolkit.vercel.app/{locale}
                                        <ExternalLink className="w-3 h-3 text-secondary-400" />
                                    </a>
                                </div>
                                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-secondary-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-300" aria-hidden />
                                    {isAr ? "معاينة" : "Preview"}
                                </span>
                            </div>

                            {/* Toolkit header — replicated from screenshot to feel like its own site */}
                            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#fdfaf3] border-b border-waqf-border/60">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-primary-900 text-white flex items-center justify-center text-xs font-bold">
                                        W
                                    </span>
                                    <span className="text-sm font-semibold text-secondary-900">
                                        waqf <span className="text-secondary-400 font-normal">/ toolkit</span>
                                    </span>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 text-xs text-secondary-500">
                                    <span className="inline-flex items-center gap-1">
                                        Directory <span className="text-[10px]">▾</span>
                                    </span>
                                    <span>Contribute</span>
                                    <span className="inline-flex items-center gap-1 rounded-full border border-waqf-border bg-white px-2 py-1">
                                        <span className="text-[11px]">☆</span> Saved
                                    </span>
                                    <span className="w-4 h-4 rounded-full bg-secondary-100 flex items-center justify-center text-[10px]">⬡</span>
                                    <span>{isAr ? "العربية" : "EN"}</span>
                                </div>
                                <span className="sm:hidden text-[11px] text-secondary-500">waqf / toolkit</span>
                            </div>

                            {/* Toolkit hero preview */}
                            <div className="relative bg-[#f3f5ef]/80 backdrop-blur">
                            {/* Soft inner gradient */}
                            <div
                                aria-hidden
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(240,244,237,0.9) 55%, rgba(253,248,240,0.6) 100%)",
                                }}
                            />
                            {/* Decorative faded circles (like screenshot's large pale green arcs) */}
                            <div
                                aria-hidden
                                className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-60"
                                style={{
                                    background: "radial-gradient(circle, rgba(180,210,180,0.35) 0%, transparent 70%)",
                                    border: "24px solid rgba(180,210,180,0.18)",
                                }}
                            />
                            <div
                                aria-hidden
                                className="absolute -bottom-20 -right-16 w-72 h-72 rounded-full opacity-40"
                                style={{
                                    border: "1px solid rgba(180,210,180,0.4)",
                                    background: "radial-gradient(circle, rgba(253,240,220,0.3) 0%, transparent 70%)",
                                }}
                            />

                            <div className="relative p-6 md:p-8">
                                {/* Floating tool chips — absolute, rotates mimic screenshot */}
                                <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
                                    <div className="absolute left-4 top-[38%] -rotate-3 rounded-xl bg-white border border-waqf-border shadow-sm p-2.5">
                                        <Film className="w-5 h-5 text-primary-700" />
                                    </div>
                                    <div className="absolute right-6 top-[28%] rotate-3 rounded-xl bg-white border border-waqf-border shadow-sm p-2.5">
                                        <FileText className="w-5 h-5 text-primary-700" />
                                    </div>
                                    <div className="absolute left-8 bottom-[18%] rotate-2 rounded-xl bg-white border border-waqf-border shadow-sm p-2.5">
                                        <Shield className="w-5 h-5 text-primary-700" />
                                    </div>
                                    <div className="absolute right-10 bottom-[22%] -rotate-2 rounded-xl bg-white border border-waqf-border shadow-sm p-2.5">
                                        <Clock className="w-5 h-5 text-primary-700" />
                                    </div>
                                    <div className="absolute left-[32%] top-4 rounded-xl bg-white/80 border border-waqf-border shadow-sm p-2">
                                        <Link2 className="w-4 h-4 text-secondary-500" />
                                    </div>
                                    <div className="absolute right-[28%] top-6 rounded-xl bg-white/80 border border-waqf-border shadow-sm p-2">
                                        <Subtitles className="w-4 h-4 text-secondary-500" />
                                    </div>
                                </div>

                                {/* Search mock */}
                                <div className="relative max-w-[420px] mx-auto">
                                    <div className="flex items-center gap-3 rounded-full bg-white border border-waqf-border shadow-sm px-4 h-11">
                                        <Search className="w-4 h-4 text-secondary-400 shrink-0" />
                                        <span className="text-sm text-secondary-400 truncate">
                                            {isAr ? "ابحث حسب المهمة أو الصيغة أو اسم الأداة" : "Search by task, format, or tool name"}
                                        </span>
                                    </div>
                                </div>

                                {/* Most used card — matches toolkit's card */}
                                <div className="relative mt-6 max-w-[360px] mx-auto rounded-2xl bg-white border border-waqf-border shadow-[0_8px_32px_-16px_rgba(0,0,0,0.12)] overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-waqf-border">
                                        <span className="text-[11px] font-semibold tracking-[0.14em] text-secondary-500">
                                            {isAr ? "الأكثر استخداماً" : "MOST USED"}
                                        </span>
                                        <a
                                            href={liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-primary-600 hover:underline underline-offset-4"
                                        >
                                            {isAr ? `عرض كل ${totalTools} أدوات` : `See all ${totalTools} tools`}
                                        </a>
                                    </div>
                                    <div className="divide-y divide-waqf-border/60">
                                        {mostUsed.map((tool, idx) => (
                                            <div key={tool.label} className="flex gap-3 px-4 py-3">
                                                <div className="shrink-0 w-8 h-8 rounded-lg bg-white border border-waqf-border flex items-center justify-center">
                                                    {idx === 0 ? (
                                                        <Link2 className="w-4 h-4 text-secondary-600" />
                                                    ) : idx === 1 ? (
                                                        <Film className="w-4 h-4 text-secondary-600" />
                                                    ) : (
                                                        <Subtitles className="w-4 h-4 text-secondary-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-secondary-900 flex items-center gap-1.5">
                                                        {tool.label}
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? "bg-primary-500" : idx === 1 ? "bg-accent-500" : "bg-secondary-300"}`}
                                                            aria-hidden
                                                        />
                                                    </p>
                                                    <p className="text-xs leading-relaxed text-secondary-500 truncate">
                                                        {tool.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>

                        {/* Caption — reinforces segmented external preview */}
                        <p className="mt-2 text-center text-[11px] tracking-wide text-secondary-400">
                            {isAr ? "مستضاف على waqf-toolkit.vercel.app — يفتح في تبويب جديد" : "Hosted on waqf-toolkit.vercel.app — opens in new tab"}
                        </p>
                        <p className="mt-1 text-center text-xs text-secondary-400">
                            {isAr ? "معاينة — waqf-toolkit.vercel.app" : "Preview — waqf-toolkit.vercel.app"}
                        </p>
                        <p className="mt-3 text-center text-xs text-secondary-400">
                            {isAr ? "معاينة — waqf-toolkit.vercel.app" : "Preview — waqf-toolkit.vercel.app"}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
