import Link from "next/link";
import {
    Code,
    Heart,
    Search,
    ArrowRight,
    BookOpen,
    HandHeart,
    GraduationCap,
    PiggyBank,
    ChevronLeft,
    ChevronRight,
    Users,
    GitCommit,
    Folder,
    Star,
    Shield,
    Globe
} from "lucide-react";
import { prisma } from "@/lib/prisma";

interface LandingPageProps {
    locale: string;
}

// Category data
const categories = [
    {
        id: "QURAN",
        icon: BookOpen,
        color: "bg-[#1f705d]/10 text-[#1f705d]",
        title: { en: "Quran & Sunnah", ar: "القرآن والسنة" },
        description: { en: "APIs, reading apps, and memorization tools.", ar: "واجهات برمجية، تطبيقات قراءة، وأدوات حفظ." },
    },
    {
        id: "CHARITY",
        icon: HandHeart,
        color: "bg-[#d4a056]/10 text-[#d4a056]",
        title: { en: "Charity & Zakat", ar: "الزكاة والصدقات" },
        description: { en: "Donation platforms, Zakat calculators, and aid tracking.", ar: "منصات تبرع، حاسبات زكاة، وتتبع المساعدات." },
    },
    {
        id: "EDUCATION",
        icon: GraduationCap,
        color: "bg-blue-500/10 text-blue-600",
        title: { en: "Islamic EdTech", ar: "التعليم الإسلامي" },
        description: { en: "LMS for Madrasahs, Arabic learning, and kids apps.", ar: "أنظمة تعليم للمدارس، تعلم العربية، وتطبيقات أطفال." },
    },
    {
        id: "TOOLS",
        icon: PiggyBank,
        color: "bg-emerald-500/10 text-emerald-600",
        title: { en: "Halal Finance", ar: "المالية الإسلامية" },
        description: { en: "Ethical investment tools, inheritance calculators.", ar: "أدوات استثمار أخلاقية، حاسبات الميراث." },
    },
];

// How it works steps
const steps = [
    {
        icon: Search,
        title: { en: "1. Discover", ar: "1. اكتشف" },
        description: {
            en: "Find open-source projects that match your tech stack and interests.",
            ar: "اعثر على مشاريع مفتوحة المصدر تناسب مهاراتك واهتماماتك."
        },
    },
    {
        icon: Code,
        title: { en: "2. Contribute", ar: "2. ساهم" },
        description: {
            en: "Submit pull requests, fix bugs, or add features to improve the codebase.",
            ar: "أرسل طلبات سحب، أصلح الأخطاء، أو أضف ميزات لتحسين الكود."
        },
    },
    {
        icon: Heart,
        title: { en: "3. Earn Hasanat", ar: "3. اكسب الحسنات" },
        description: {
            en: "Benefit from Sadaqah Jariyah as your code serves the community continuously.",
            ar: "استفد من الصدقة الجارية كلما خدم كودك المجتمع باستمرار."
        },
        highlight: true,
    },
];

export async function LandingPage({ locale }: LandingPageProps) {
    // Fetch stats and featured projects
    const [stats, featuredProjects] = await Promise.all([
        getStats(),
        getFeaturedProjects(),
    ]);

    const isAr = locale === "ar";

    return (
        <div className="min-h-screen bg-[#f9fbfb]">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24 px-4 flex justify-center border-b border-[#e9f1ef] relative overflow-hidden"
                style={{
                    backgroundImage: 'url(https://www.transparenttextures.com/patterns/clean-gray-paper.png)',
                    backgroundColor: '#f9fbfb'
                }}
            >
                <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col gap-6 md:gap-8">
                        <div className="flex flex-col gap-4 text-left">
                            {/* Beta badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a056]/10 border border-[#d4a056]/20 w-fit">
                                <span className="w-2 h-2 rounded-full bg-[#d4a056]"></span>
                                <span className="text-[#d4a056] text-xs font-bold uppercase tracking-wide">
                                    {isAr ? "نسخة تجريبية" : "Beta Available"}
                                </span>
                            </div>

                            {/* Main heading */}
                            <h1 className="text-[#101917] text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.033em]">
                                {isAr ? (
                                    <>
                                        <span className="text-[#1f705d]">صدقة جارية عبر الكود</span>
                                        <br />
                                        <span className="mt-2 block">Tech for the Ummah</span>
                                    </>
                                ) : (
                                    <>
                                        Tech for the Ummah <br />
                                        <span className="text-[#1f705d] text-4xl md:text-5xl lg:text-6xl mt-2 block" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
                                            صدقة جارية عبر الكود
                                        </span>
                                    </>
                                )}
                            </h1>

                            <p className="text-gray-600 text-lg md:text-xl font-normal leading-relaxed max-w-xl">
                                {isAr
                                    ? "انضم إلى أول مجتمع مفتوح المصدر يبني التقنية للأمة الإسلامية. ساهم بمهاراتك في مشاريع تفيد الملايين—صدقة جارية من خلال الكود."
                                    : "Join the first open-source community building technology for the Muslim Ummah. Contribute your skills to projects that benefit millions—Sadaqah Jariyah through code."
                                }
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href={`/${locale}/explore`}
                                className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-[#1f705d] hover:bg-[#165244] text-white text-base font-bold shadow-lg shadow-[#1f705d]/25 transition-all hover:translate-y-[-1px]"
                            >
                                <Code className="w-5 h-5" />
                                <span>{isAr ? "ابدأ المساهمة" : "Start Contributing"}</span>
                            </Link>
                            <Link
                                href={`/${locale}/projects/new`}
                                className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-white border border-gray-200 text-[#101917] text-base font-bold hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-xl">+</span>
                                <span>{isAr ? "أضف مشروعاً" : "List a Project"}</span>
                            </Link>
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">A</div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">M</div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">S</div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold">+{stats.contributors}</div>
                            </div>
                            <p>
                                {isAr
                                    ? `انضم إلى ${stats.contributors}+ مساهم حول العالم`
                                    : `Join ${stats.contributors}+ contributors worldwide`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Hero Visual - Code snippet card */}
                    <div className="relative h-full min-h-[300px] lg:min-h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1f705d]/5 to-[#d4a056]/10 border border-[#1f705d]/10">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative z-10 p-8 w-full max-w-md">
                                <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <span className="text-xs text-gray-400 font-mono">contribute.js</span>
                                    </div>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div className="flex gap-2">
                                            <span className="text-purple-500">const</span>
                                            <span className="text-blue-500">sadaqah</span>
                                            <span className="text-gray-400">=</span>
                                            <span className="text-yellow-600">async</span>
                                            <span className="text-gray-400">()</span>
                                            <span className="text-purple-500">=&gt;</span>
                                            <span className="text-gray-400">{"{"}</span>
                                        </div>
                                        <div className="pl-4 flex gap-2">
                                            <span className="text-purple-500">await</span>
                                            <span className="text-blue-500">buildForUmmah</span>
                                            <span className="text-gray-400">();</span>
                                        </div>
                                        <div className="pl-4 flex gap-2">
                                            <span className="text-purple-500">return</span>
                                            <span className="text-green-600">&quot;Hasanat++&quot;</span>
                                            <span className="text-gray-400">;</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-gray-400">{"}"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Impact badge */}
                                <div className="absolute -bottom-6 -right-6 bg-[#1f705d] text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
                                    <Heart className="w-5 h-5" fill="currentColor" />
                                    <div>
                                        <p className="text-xs opacity-80">{isAr ? "التأثير" : "Impact"}</p>
                                        <p className="font-bold">{isAr ? "ملايين المستخدمين" : "1.2M Users reached"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white border-b border-[#e9f1ef]">
                <div className="max-w-[1280px] mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center md:divide-x divide-gray-100">
                        <div className="flex flex-col gap-1 p-2">
                            <span className="text-3xl font-black text-[#101917] tracking-tight flex items-center justify-center gap-2">
                                <Folder className="w-6 h-6 text-[#1f705d]" />
                                {stats.projects}+
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                                {isAr ? "مشاريع نشطة" : "Active Projects"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 p-2">
                            <span className="text-3xl font-black text-[#101917] tracking-tight flex items-center justify-center gap-2">
                                <Users className="w-6 h-6 text-[#1f705d]" />
                                {stats.contributors}+
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                                {isAr ? "مساهمين" : "Contributors"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 p-2">
                            <span className="text-3xl font-black text-[#101917] tracking-tight flex items-center justify-center gap-2">
                                <GitCommit className="w-6 h-6 text-[#1f705d]" />
                                {stats.contributions}+
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                                {isAr ? "مساهمات" : "Contributions"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 p-2">
                            <span className="text-3xl font-black text-[#101917] tracking-tight">
                                {isAr ? "صفر" : "Zero"}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                                {isAr ? "رسوم المنصة" : "Platform Fees"}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Grid */}
            <section className="py-16 md:py-24 px-4 bg-[#f9fbfb]">
                <div className="max-w-[1280px] mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-[#101917] tracking-tight mb-2">
                                {isAr ? "استكشف المجالات" : "Explore Domains"}
                            </h2>
                            <p className="text-gray-500 max-w-lg">
                                {isAr
                                    ? "اكتشف المشاريع في مختلف القطاعات التي تحتاج خبرتك."
                                    : "Discover projects across various sectors needing your expertise."
                                }
                            </p>
                        </div>
                        <Link
                            href={`/${locale}/explore`}
                            className="text-[#1f705d] font-bold flex items-center gap-1 hover:underline"
                        >
                            {isAr ? "عرض جميع الفئات" : "View All Categories"}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Link
                                    key={cat.id}
                                    href={`/${locale}/explore?category=${cat.id}`}
                                    className="group bg-white p-6 rounded-2xl border border-[#e9f1ef] hover:border-[#1f705d]/50 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#101917] mb-2">
                                        {isAr ? cat.title.ar : cat.title.en}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {isAr ? cat.description.ar : cat.description.en}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 md:py-24 px-4 bg-[#1f705d]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#1f705d]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#d4a056]/5 rounded-full blur-3xl"></div>

                <div className="max-w-[1280px] mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-[#101917] tracking-tight mb-4">
                            {isAr ? "كيف يعمل" : "How It Works"}
                        </h2>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            {isAr
                                ? "رحلتك من كتابة الكود إلى الأجر المستمر."
                                : "Your journey from code commit to eternal reward."
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={index} className="flex flex-col items-center text-center">
                                    <div className={`w-24 h-24 rounded-full bg-white border-4 ${step.highlight ? "border-[#d4a056]/40" : "border-[#1f705d]/20"
                                        } flex items-center justify-center mb-6 shadow-sm relative`}>
                                        <Icon className={`w-10 h-10 ${step.highlight ? "text-[#d4a056]" : "text-[#1f705d]"}`}
                                            fill={step.highlight ? "currentColor" : "none"}
                                        />
                                        {step.highlight && (
                                            <span className="absolute -top-2 -right-2 bg-[#d4a056] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {isAr ? "مكافأة" : "Reward"}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#101917] mb-2">
                                        {isAr ? step.title.ar : step.title.en}
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        {isAr ? step.description.ar : step.description.en}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Projects */}
            <section className="py-16 md:py-24 px-4 bg-[#f9fbfb]">
                <div className="max-w-[1280px] mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-[#101917] tracking-tight">
                            {isAr ? "المشاريع المميزة" : "Featured Projects"}
                        </h2>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProjects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/${locale}/projects/${project.slug}`}
                                className="flex flex-col rounded-xl overflow-hidden bg-white border border-[#e9f1ef] shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="relative h-48 bg-gradient-to-br from-[#1f705d]/10 to-[#d4a056]/10 flex items-center justify-center">
                                    <div className="text-6xl font-black text-[#1f705d]/20">
                                        {project.title.charAt(0)}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-800">
                                        {project._count.applications} {isAr ? "متقدم" : "applicants"}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex gap-2 mb-3 flex-wrap">
                                        {project.skills.slice(0, 2).map((ps, i) => (
                                            <span
                                                key={i}
                                                className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded"
                                            >
                                                {ps.skill.name}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-lg font-bold text-[#101917] mb-2">{project.title}</h3>
                                    <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
                                        {project.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${project.status === "OPEN" ? "bg-green-500" : "bg-yellow-500"
                                                }`}></span>
                                            <span className="text-xs text-gray-500">
                                                {project.status === "OPEN"
                                                    ? (isAr ? "مفتوح للمساهمة" : "Open for contributions")
                                                    : project.status
                                                }
                                            </span>
                                        </div>
                                        <span className="text-[#1f705d] font-bold text-sm hover:underline">
                                            {isAr ? "عرض المشروع" : "View Project"}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 md:py-24 px-4 bg-white border-b border-[#e9f1ef]">
                <div className="max-w-[1280px] mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-black text-[#101917] tracking-tight mb-4">
                            {isAr ? "أصوات من المجتمع" : "Voices from the Community"}
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            {isAr
                                ? "مطورون من حول العالم يشاركون تجربتهم مع وقف."
                                : "Developers worldwide share their Waqf experience."
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                name: isAr ? "أحمد خالد" : "Ahmed Khalid",
                                role: isAr ? "مطور Full-Stack" : "Full-Stack Developer",
                                text: isAr
                                    ? "ساعدتني منصة وقف على إيجاد مشاريع ذات أثر حقيقي. الآن كل سطر كود أكتبه يصبح صدقة جارية."
                                    : "Waqf helped me find projects with real impact. Now every line of code I write becomes Sadaqah Jariyah.",
                                initials: "AK",
                                color: "bg-[#1f705d]/10 text-[#1f705d]",
                            },
                            {
                                name: isAr ? "فاطمة نور" : "Fatima Nour",
                                role: isAr ? "مصممة UX" : "UX Designer",
                                text: isAr
                                    ? "المجتمع هنا مذهل. وجدت فريقاً يشاركني نفس الرؤية لخدمة الأمة بالتقنية."
                                    : "The community here is amazing. I found a team that shares my vision of serving the Ummah through tech.",
                                initials: "FN",
                                color: "bg-[#d4a056]/10 text-[#d4a056]",
                            },
                            {
                                name: isAr ? "عمر حسن" : "Omar Hassan",
                                role: isAr ? "مهندس Backend" : "Backend Engineer",
                                text: isAr
                                    ? "من أفضل المنصات للمساهمة في المصادر المفتوحة. المشاريع هنا تخدم ملايين المسلمين."
                                    : "One of the best platforms for open-source contribution. Projects here serve millions of Muslims.",
                                initials: "OH",
                                color: "bg-blue-500/10 text-blue-600",
                            },
                        ].map((t, i) => (
                            <div key={i} className="bg-[#f9fbfb] border border-[#e9f1ef] rounded-2xl p-6 flex flex-col">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, s) => (
                                        <Star key={s} className="w-4 h-4 text-[#d4a056]" fill="currentColor" />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-[#e9f1ef]">
                                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-sm font-bold`}>
                                        {t.initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#101917] text-sm">{t.name}</p>
                                        <p className="text-xs text-gray-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Source & Trust */}
            <section className="py-16 md:py-20 px-4 bg-[#f9fbfb]">
                <div className="max-w-[1280px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="flex flex-col items-center gap-3 p-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#1f705d]/10 flex items-center justify-center">
                                <Shield className="w-7 h-7 text-[#1f705d]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#101917]">
                                {isAr ? "مفتوح المصدر 100%" : "100% Open Source"}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                {isAr
                                    ? "كل الكود متاح للجميع. الشفافية هي أساس الثقة."
                                    : "All code is publicly available. Transparency is the foundation of trust."
                                }
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-3 p-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#d4a056]/10 flex items-center justify-center">
                                <Globe className="w-7 h-7 text-[#d4a056]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#101917]">
                                {isAr ? "مجتمع عالمي" : "Global Community"}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                {isAr
                                    ? "مطورون من أكثر من 40 دولة يساهمون معاً."
                                    : "Developers from 40+ countries contributing together."
                                }
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-3 p-6">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                <Heart className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[#101917]">
                                {isAr ? "صدقة جارية" : "Sadaqah Jariyah"}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                {isAr
                                    ? "كل مساهمة هي استثمار في الآخرة."
                                    : "Every contribution is an investment in the Hereafter."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 pb-20 pt-10">
                <div className="max-w-[1280px] mx-auto bg-[#1f705d] rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{
                        backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>
                    <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                            {isAr ? "هل أنت مستعد للبرمجة من أجل قضية؟" : "Ready to code for a cause?"}
                        </h2>
                        <p className="text-lg text-white/80">
                            {isAr
                                ? "انضم إلى آلاف المطورين الذين يحولون أكوادهم إلى صدقة جارية."
                                : "Join thousands of developers turning their commits into Sadaqah Jariyah."
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
                            <Link
                                href={`/${locale}/signup`}
                                className="bg-white text-[#1f705d] hover:bg-gray-100 px-8 py-3 rounded-xl font-bold text-lg transition-colors"
                            >
                                {isAr ? "سجل الآن" : "Sign Up Now"}
                            </Link>
                            <Link
                                href={`/${locale}/explore`}
                                className="bg-[#165244]/50 hover:bg-[#165244] border border-white/20 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors"
                            >
                                {isAr ? "استكشف المشاريع" : "Explore Projects"}
                            </Link>
                        </div>
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
            projects: projectCount || 150,
            contributors: userCount || 2000,
            contributions: applicationCount || 10000,
        };
    } catch {
        return { projects: 150, contributors: 2000, contributions: 10000 };
    }
}

async function getFeaturedProjects() {
    try {
        const projects = await prisma.project.findMany({
            where: {
                status: "OPEN",
                featured: true,
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
    } catch {
        return [];
    }
}
