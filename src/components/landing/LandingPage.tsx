import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CountUp } from "./CountUp";
import { StatusBadge } from "@/components/ui/Badge";

interface LandingPageProps {
    locale: string;
}

// Eight-point star (khatam) lattice — brand-rooted texture, not decoration for its own sake
const STAR_LATTICE_LIGHT =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.55' stroke-width='1'%3E%3Crect x='18' y='18' width='36' height='36'/%3E%3Crect x='18' y='18' width='36' height='36' transform='rotate(45 36 36)'/%3E%3C/g%3E%3C/svg%3E\")";

const categories = [
    {
        id: "QURAN",
        title: { en: "Quran & Sunnah", ar: "القرآن والسنة" },
        description: {
            en: "APIs, reading apps, and memorization tools.",
            ar: "واجهات برمجية، تطبيقات قراءة، وأدوات حفظ.",
        },
    },
    {
        id: "CHARITY",
        title: { en: "Charity & Zakat", ar: "الزكاة والصدقات" },
        description: {
            en: "Donation platforms, Zakat calculators, and aid tracking.",
            ar: "منصات تبرع، حاسبات زكاة، وتتبع المساعدات.",
        },
    },
    {
        id: "EDUCATION",
        title: { en: "Education", ar: "التعليم" },
        description: {
            en: "LMS platforms, language learning, and kids apps.",
            ar: "أنظمة تعليم، تعلم اللغات، وتطبيقات أطفال.",
        },
    },
    {
        id: "TOOLS",
        title: { en: "Finance", ar: "المالية" },
        description: {
            en: "Ethical investment tools, budgeting, and calculators.",
            ar: "أدوات استثمار أخلاقية، ميزانيات، وحاسبات.",
        },
    },
];

const steps = [
    {
        numeral: "01",
        title: { en: "Discover", ar: "اكتشف" },
        description: {
            en: "Find projects that match your skills and interests.",
            ar: "اعثر على مشاريع تناسب مهاراتك واهتماماتك.",
        },
    },
    {
        numeral: "02",
        title: { en: "Contribute", ar: "ساهم" },
        description: {
            en: "Submit pull requests, fix bugs, or add features to improve the codebase.",
            ar: "أرسل طلبات سحب، أصلح الأخطاء، أو أضف ميزات لتحسين الكود.",
        },
    },
    {
        numeral: "03",
        title: { en: "Lasting impact", ar: "أثر دائم" },
        description: {
            en: "Your code keeps serving people long after the merge.",
            ar: "يبقى كودك يخدم الناس طويلاً بعد اكتمال عملك.",
        },
    },
];

export async function LandingPage({ locale }: LandingPageProps) {
    const [stats, featuredProjects] = await Promise.all([
        getStats(),
        getFeaturedProjects(),
    ]);

    const isAr = locale === "ar";

    return (
        <div className="min-h-screen">
            {/* Hero — one composition: brand mark, headline, sentence, CTAs */}
            <section className="relative w-full overflow-hidden bg-primary-950 text-white">
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: STAR_LATTICE_LIGHT }}
                />
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 90% 70% at 50% 0%, transparent 40%, rgba(8,37,32,0.55) 100%)",
                    }}
                />
                <div className="relative max-w-[1280px] mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
                    <div className="rise flex items-center gap-5 mb-8">
                        <p
                            className="text-accent-400 font-arabic text-6xl md:text-8xl leading-none"
                            lang="ar"
                        >
                            وقف
                        </p>
                        <span aria-hidden className="h-px w-16 md:w-28 bg-accent-500/60" />
                    </div>
                    <h1 className="rise max-w-3xl text-4xl md:text-6xl font-bold leading-[1.08] tracking-tight text-balance">
                        {isAr ? (
                            <>
                                أوقف خبرتك التقنية —{" "}
                                <span className="relative inline-block text-accent-400">
                                    عمل يبقى
                                    <svg
                                        aria-hidden
                                        className="draw absolute -bottom-2 start-0 w-full h-2 text-accent-500"
                                        viewBox="0 0 200 9"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M2 7 C 60 1, 140 1, 198 6"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                            </>
                        ) : (
                            <>
                                Tech for good —{" "}
                                <span className="relative inline-block text-accent-400">
                                    work that endures
                                    <svg
                                        aria-hidden
                                        className="draw absolute -bottom-2 start-0 w-full h-2 text-accent-500"
                                        viewBox="0 0 200 9"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M2 7 C 60 1, 140 1, 198 6"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                            </>
                        )}
                    </h1>
                    <p
                        className="rise mt-6 max-w-xl text-lg md:text-xl leading-relaxed text-primary-100"
                        style={{ animationDelay: "120ms" }}
                    >
                        {isAr
                            ? "وقف يربط المطورين بالمشاريع التي تحتاج مساعدتك — مفتوحة أو مغلقة أو خاصة. ساهم بمهاراتك في عمل يظل يفيد الناس طويلاً بعد اكتماله."
                            : "Waqf matches developers with projects that need help — open, closed, or private. Contribute your skills to work that keeps serving people long after the merge."}
                    </p>
                    <div
                        className="rise mt-10 flex flex-wrap gap-3"
                        style={{ animationDelay: "240ms" }}
                    >
                        <Link
                            href={`/${locale}/explore`}
                            className="inline-flex items-center gap-2 rounded-md h-12 px-7 bg-accent-500 text-primary-950 text-base font-semibold hover:bg-accent-400 transition-colors"
                        >
                            {isAr ? "ابدأ المساهمة" : "Start contributing"}
                            <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                        </Link>
                        <Link
                            href={`/${locale}/projects/new`}
                            className="inline-flex items-center rounded-md h-12 px-7 border border-white/30 text-white text-base font-semibold hover:bg-white/10 transition-colors"
                        >
                            {isAr ? "أضف مشروعاً" : "List a project"}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats — quiet but crafted: gold tick, big numeral, count-up */}
            <section className="border-b border-waqf-border bg-white">
                <div className="max-w-[1280px] mx-auto px-4 py-10 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 md:divide-x md:divide-waqf-border">
                    {[
                        {
                            value: stats.projects,
                            label: isAr ? "مشاريع نشطة" : "Active projects",
                        },
                        {
                            value: stats.contributors,
                            label: isAr ? "مساهمين" : "Contributors",
                        },
                        {
                            value: stats.contributions,
                            label: isAr ? "مساهمات" : "Contributions",
                        },
                    ].map((s, i) => (
                        <div key={s.label} className={i > 0 ? "md:ps-8" : undefined}>
                            <span aria-hidden className="block w-6 h-0.5 bg-accent-500 mb-4" />
                            <p className="text-4xl md:text-5xl font-bold tracking-tight text-secondary-900">
                                <CountUp value={s.value} />
                            </p>
                            <p className="mt-1 text-sm text-secondary-500">{s.label}</p>
                        </div>
                    ))}
                    <div className="md:ps-8">
                        <span aria-hidden className="block w-6 h-0.5 bg-accent-500 mb-4" />
                        <p className="text-4xl md:text-5xl font-bold tracking-tight text-primary-700">
                            {isAr ? "صفر" : "Zero"}
                        </p>
                        <p className="mt-1 text-sm text-secondary-500">
                            {isAr ? "رسوم المنصة" : "Platform fees"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Domains — editorial index, not cards */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-[1280px] mx-auto">
                    <div className="flex items-end justify-between gap-6 mb-10">
                        <h2 className="text-3xl font-bold tracking-tight text-secondary-900">
                            {isAr ? "استكشف المجالات" : "Explore domains"}
                        </h2>
                        <Link
                            href={`/${locale}/explore`}
                            className="shrink-0 text-primary-600 font-semibold hover:underline underline-offset-4"
                        >
                            {isAr ? "عرض جميع الفئات" : "All categories"}
                        </Link>
                    </div>

                    <ul className="border-t border-waqf-border">
                        {categories.map((cat, i) => (
                            <li key={cat.id} className="border-b border-waqf-border">
                                <Link
                                    href={`/${locale}/explore?category=${cat.id}`}
                                    className="reveal group relative grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 md:gap-x-12 py-6 md:py-8 transition-colors hover:bg-primary-50/50"
                                >
                                    <span
                                        aria-hidden
                                        className="absolute inset-y-0 start-0 w-0.5 bg-primary-600 scale-y-0 group-hover:scale-y-100 origin-top transition-transform"
                                    />
                                    <span className="text-sm tabular-nums text-secondary-400 w-8 transition-colors group-hover:text-accent-600">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span>
                                        <span className="block text-xl md:text-2xl font-bold tracking-tight text-secondary-900 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                                            {isAr ? cat.title.ar : cat.title.en}
                                        </span>
                                        <span className="mt-1 block text-secondary-500">
                                            {isAr ? cat.description.ar : cat.description.en}
                                        </span>
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-secondary-300 transition-all group-hover:text-primary-600 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* How it works — numbered columns with ghost numerals */}
            <section id="how-it-works" className="py-16 md:py-24 px-4 bg-white border-y border-waqf-border">
                <div className="max-w-[1280px] mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-secondary-900 mb-12">
                        {isAr ? "كيف يعمل" : "How it works"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                        {steps.map((step) => (
                            <div
                                key={step.numeral}
                                className="reveal relative border-t-2 border-primary-600 pt-6"
                            >
                                <span
                                    aria-hidden
                                    className="absolute end-0 -top-7 text-[88px] leading-none font-bold text-primary-50 select-none pointer-events-none"
                                >
                                    {step.numeral}
                                </span>
                                <span className="relative block text-sm font-semibold tabular-nums text-primary-600">
                                    {step.numeral}
                                </span>
                                <h3 className="relative mt-2 text-xl font-bold tracking-tight text-secondary-900">
                                    {isAr ? step.title.ar : step.title.en}
                                </h3>
                                <p className="relative mt-2 text-secondary-500 leading-relaxed max-w-xs">
                                    {isAr ? step.description.ar : step.description.en}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured projects */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-[1280px] mx-auto">
                    <div className="flex items-end justify-between gap-6 mb-10">
                        <h2 className="text-3xl font-bold tracking-tight text-secondary-900">
                            {isAr ? "المشاريع المميزة" : "Featured projects"}
                        </h2>
                        <Link
                            href={`/${locale}/explore`}
                            className="shrink-0 text-primary-600 font-semibold hover:underline underline-offset-4"
                        >
                            {isAr ? "جميع المشاريع" : "All projects"}
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProjects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/${locale}/projects/${project.slug}`}
                                className="reveal group relative flex flex-col rounded-lg border border-waqf-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_12px_32px_-16px_rgba(8,37,32,0.25)]"
                            >
                                <span
                                    aria-hidden
                                    className="absolute inset-x-6 top-0 h-0.5 bg-accent-500 scale-x-0 group-hover:scale-x-100 origin-left rtl:origin-right transition-transform duration-300"
                                />
                                <div className="flex items-center justify-between gap-4">
                                    <StatusBadge status={project.status} locale={locale} />
                                    <span className="text-xs tabular-nums text-secondary-500">
                                        {project._count.applications}{" "}
                                        {isAr ? "متقدم" : "applicants"}
                                    </span>
                                </div>

                                <h3 className="mt-4 text-lg font-bold tracking-tight text-secondary-900 group-hover:text-primary-700 transition-colors">
                                    {project.title}
                                </h3>
                                <p className="mt-2 text-sm text-secondary-500 leading-relaxed line-clamp-2 flex-1">
                                    {project.description}
                                </p>

                                <div className="mt-6 pt-4 border-t border-waqf-border flex items-center justify-between gap-4">
                                    <span className="text-sm text-secondary-500 truncate">
                                        {project.skills.map((ps) => ps.skill.name).join(" · ")}
                                    </span>
                                    <span className="shrink-0 text-sm font-semibold text-primary-600 flex items-center gap-1">
                                        {isAr ? "عرض" : "View"}
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Principles — plain statement, no icon tiles */}
            <section id="about" className="py-16 md:py-20 px-4 bg-white border-t border-waqf-border">
                <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-8 md:gap-16">
                    <h2 className="reveal text-3xl font-bold tracking-tight text-secondary-900 border-s-2 border-primary-600 ps-6 md:-ms-6">
                        {isAr ? "مبني على أصول الوقف" : "Built on waqf principles"}
                    </h2>
                    <div className="reveal space-y-6 text-secondary-600 leading-relaxed">
                        <p>
                            {isAr
                                ? "الوقف في الإسلام أصلٌ يبقى نافعاً لمن يعتمد عليه. نطبق المبدأ نفسه على البرمجيات: مشاريع مملوكة بوضوح، تقدم مرئي، وإشراف من المجتمع."
                                : "A waqf is an endowment held in trust — assets that keep benefiting people indefinitely. We apply the same principle to software: clear project ownership, visible progress, and community oversight."}
                        </p>
                        <p>
                            {isAr
                                ? "لا رسوم على المنصة، ولا إعلانات. المشاريع هنا تصل إلى من يحتاجها فعلاً، ومساهمتك تبقى تعمل بعد أن تنتقل."
                                : "No platform fees, no ads. Projects here reach the people who actually need them, and your contribution keeps running long after you move on."}
                        </p>
                    </div>
                </div>
            </section>

            {/* Closing CTA — flat band with lattice */}
            <section className="relative bg-primary-900 text-white overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: STAR_LATTICE_LIGHT }}
                />
                <div className="relative max-w-[1280px] mx-auto px-4 py-20 md:py-28 flex flex-col items-center text-center gap-6">
                    <span aria-hidden className="w-10 h-0.5 bg-accent-500" />
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl text-balance">
                        {isAr ? "ابدأ ببناء ما يدوم" : "Start building what lasts"}
                    </h2>
                    <p className="text-lg text-primary-100 max-w-xl">
                        {isAr
                            ? "اعثر على مشروع يحتاج مهاراتك، أو أضف مشروعاً يبحث عن مساهمين."
                            : "Find a project that needs your skills, or list one that needs contributors."}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <Link
                            href={`/${locale}/signup`}
                            className="rounded-md px-8 h-12 inline-flex items-center bg-white text-primary-900 font-semibold hover:bg-primary-50 transition-colors"
                        >
                            {isAr ? "سجل الآن" : "Sign up"}
                        </Link>
                        <Link
                            href={`/${locale}/explore`}
                            className="rounded-md px-8 h-12 inline-flex items-center border border-white/30 font-semibold hover:bg-white/10 transition-colors"
                        >
                            {isAr ? "استكشف المشاريع" : "Explore projects"}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Helper functions
async function getStats() {
    try {
        const [projectCount, userCount, applicationCount] = await Promise.all([
            prisma.project.count({ where: { status: "OPEN" } }),
            prisma.user.count(),
            prisma.application.count({ where: { status: "ACCEPTED" } }),
        ]);
        return {
            projects: projectCount,
            contributors: userCount,
            contributions: applicationCount,
        };
    } catch (e) {
        console.error("[LandingPage] Failed to fetch stats:", e);
        return { projects: 0, contributors: 0, contributions: 0 };
    }
}

async function getFeaturedProjects() {
    try {
        const now = new Date();
        const projects = await prisma.project.findMany({
            where: {
                status: "OPEN",
                featured: true,
                // A featuredUntil in the past means the feature expired
                OR: [
                    { featuredUntil: null },
                    { featuredUntil: { gt: now } },
                ],
            },
            take: 3,
            include: {
                skills: {
                    take: 2,
                    include: { skill: true },
                },
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        if (projects.length === 0) {
            // Fallback to any open projects
            return prisma.project.findMany({
                where: { status: "OPEN" },
                take: 3,
                include: {
                    skills: {
                        take: 2,
                        include: { skill: true },
                    },
                    _count: {
                        select: { applications: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        }

        return projects;
    } catch (e) {
        console.error("[LandingPage] Failed to fetch featured projects:", e);
        return [];
    }
}
