import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ArrowLeft, Clock, Users, ExternalLink, Github, Calendar, CheckCircle, Tag } from "lucide-react";

interface ProjectPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

const categoryColors: Record<string, string> = {
    QURAN: "bg-emerald-100 text-emerald-700",
    PRAYER: "bg-blue-100 text-blue-700",
    CHARITY: "bg-rose-100 text-rose-700",
    EDUCATION: "bg-amber-100 text-amber-700",
    COMMUNITY: "bg-purple-100 text-purple-700",
    TOOLS: "bg-slate-100 text-slate-700",
};

export async function generateMetadata({ params }: ProjectPageProps) {
    const { slug } = await params;
    const project = await prisma.project.findUnique({
        where: { slug },
        select: { title: true, description: true },
    });

    return {
        title: project ? `${project.title} | Waqf` : "Project | Waqf",
        description: project?.description?.slice(0, 160) || "View project details on Waqf",
    };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { locale, slug } = await params;
    const session = await auth();

    const project = await prisma.project.findUnique({
        where: { slug },
        include: {
            skills: {
                include: {
                    skill: true,
                },
            },
            owner: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
            organization: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
            _count: {
                select: {
                    applications: true,
                },
            },
        },
    });

    if (!project) {
        notFound();
    }

    const isOwner = session?.user?.id === project.owner.id;
    const requiredSkills = project.skills.filter((s) => s.isRequired);
    const optionalSkills = project.skills.filter((s) => !s.isRequired);

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="container max-w-5xl mx-auto px-4 py-8">
                    <Link
                        href={`/${locale}/explore`}
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Explore
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${categoryColors[project.category]}`}>
                                    {project.category}
                                </span>
                                {project.status === "OPEN" && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-green-400/20 text-green-100 rounded-full">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Open for Contributors
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>

                            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium">
                                        {project.owner.name.charAt(0)}
                                    </div>
                                    {project.owner.name}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    {project._count.applications} applicants
                                </span>
                                {project.timeCommitment && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {project.timeCommitment}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {isOwner ? (
                                <Link
                                    href={`/${locale}/projects/${project.slug}/edit`}
                                    className="px-6 py-3 bg-white text-primary-700 font-medium rounded-xl hover:bg-white/90 transition-colors text-center shadow-lg"
                                >
                                    Edit Project
                                </Link>
                            ) : (
                                <button className="px-6 py-3 bg-white text-primary-700 font-medium rounded-xl hover:bg-white/90 transition-colors shadow-lg">
                                    Contribute to this Project
                                </button>
                            )}
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                                >
                                    <Github className="w-5 h-5" />
                                    View on GitHub
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container max-w-5xl mx-auto px-4 py-8">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-white rounded-xl border border-secondary-100 p-6">
                            <h2 className="text-lg font-semibold text-secondary-900 mb-4">About this Project</h2>
                            <div className="prose prose-secondary max-w-none">
                                <p className="text-secondary-700 whitespace-pre-wrap">{project.description}</p>
                            </div>
                        </div>

                        {/* Impact */}
                        {project.impact && (
                            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6">
                                <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🌟</span>
                                    Impact on the Ummah
                                </h2>
                                <p className="text-primary-800">{project.impact}</p>
                            </div>
                        )}

                        {/* Skills */}
                        <div className="bg-white rounded-xl border border-secondary-100 p-6">
                            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Required Skills</h2>

                            {requiredSkills.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-sm text-secondary-500 mb-3">Required</p>
                                    <div className="flex flex-wrap gap-2">
                                        {requiredSkills.map((ps) => (
                                            <span
                                                key={ps.skillId}
                                                className="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-sm font-medium"
                                            >
                                                {locale === "ar" ? ps.skill.nameAr : ps.skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {optionalSkills.length > 0 && (
                                <div>
                                    <p className="text-sm text-secondary-500 mb-3">Nice to have</p>
                                    <div className="flex flex-wrap gap-2">
                                        {optionalSkills.map((ps) => (
                                            <span
                                                key={ps.skillId}
                                                className="px-3 py-1.5 bg-secondary-50 text-secondary-600 rounded-lg text-sm"
                                            >
                                                {locale === "ar" ? ps.skill.nameAr : ps.skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Owner Card */}
                        <div className="bg-white rounded-xl border border-secondary-100 p-6">
                            <h3 className="text-sm font-medium text-secondary-500 mb-4">Project Owner</h3>
                            <Link
                                href={`/${locale}/profile/${project.owner.id}`}
                                className="flex items-center gap-3 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-lg font-bold">
                                    {project.owner.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                                        {project.owner.name}
                                    </p>
                                    <p className="text-sm text-secondary-500">View Profile</p>
                                </div>
                            </Link>
                        </div>

                        {/* Details */}
                        <div className="bg-white rounded-xl border border-secondary-100 p-6">
                            <h3 className="text-sm font-medium text-secondary-500 mb-4">Details</h3>
                            <dl className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-secondary-600">Status</dt>
                                    <dd className="font-medium text-secondary-900 flex items-center gap-1.5">
                                        <Tag className="w-4 h-4" />
                                        {project.status}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-secondary-600">Language</dt>
                                    <dd className="font-medium text-secondary-900">{project.language}</dd>
                                </div>
                                {project.duration && (
                                    <div className="flex justify-between">
                                        <dt className="text-secondary-600">Duration</dt>
                                        <dd className="font-medium text-secondary-900">{project.duration}</dd>
                                    </div>
                                )}
                                {project.timeCommitment && (
                                    <div className="flex justify-between">
                                        <dt className="text-secondary-600">Commitment</dt>
                                        <dd className="font-medium text-secondary-900">{project.timeCommitment}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Share */}
                        <div className="bg-white rounded-xl border border-secondary-100 p-6">
                            <h3 className="text-sm font-medium text-secondary-500 mb-4">Share Project</h3>
                            <div className="flex gap-2">
                                <button className="flex-1 p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors">
                                    <ExternalLink className="w-5 h-5 mx-auto" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
