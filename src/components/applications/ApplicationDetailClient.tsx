"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatus";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ApplicationStatus } from "@prisma/client";

interface ApplicationDetailClientProps {
    application: {
        id: string;
        status: ApplicationStatus;
        message: string | null;
        portfolioUrl: string | null;
        hoursPerWeek: number | null;
        createdAt: string;
        project: {
            id: string;
            title: string;
            slug: string;
            category: string;
            owner: {
                id: string;
                name: string;
                image: string | null;
            } | null;
        };
        contributor: {
            id: string;
            name: string;
            email: string;
            image: string | null;
            contributorProfile?: {
                bio: string | null;
                skills: {
                    skill: { name: string };
                    level: string;
                }[];
            } | null;
        };
        messages: Array<{
            id: string;
            content: string;
            createdAt: string;
            readAt: string | null;
            sender: {
                id: string;
                name: string;
                image: string | null;
            };
        }>;
    };
    isOwner: boolean;
    isContributor: boolean;
}

export function ApplicationDetailClient({
    application,
    isOwner,
    isContributor,
}: ApplicationDetailClientProps) {
    const locale = useLocale();
    const t = useTranslations("applicationDetail");
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(application.status);

    const handleStatusUpdate = async (newStatus: "ACCEPTED" | "REJECTED") => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/applications/${application.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setCurrentStatus(newStatus);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // `project.owner` is null for EXTERNAL projects. Contributors always exist.
    const otherUser = isOwner
        ? application.contributor
        : application.project.owner ?? { id: "deleted", name: "—", image: null };

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container max-w-5xl mx-auto px-4 py-8">
                {/* Back Link */}
                <Link
                    href={`/${locale}/dashboard/applications`}
                    className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    {t("back")}
                </Link>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content - Chat */}
                    <div className="lg:col-span-2">
                        <div className="h-[600px]">
                            <ChatWindow
                                applicationId={application.id}
                                initialMessages={application.messages}
                                recipientName={otherUser.name}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-xl border border-secondary-100 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-secondary-900">
                                    {t("status")}
                                </h3>
                                <ApplicationStatusBadge status={currentStatus} locale={locale} />
                            </div>

                            {/* Owner Actions */}
                            {isOwner && currentStatus === "PENDING" && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate("ACCEPTED")}
                                        disabled={isUpdating}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        {t("accept")}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate("REJECTED")}
                                        disabled={isUpdating}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <XCircle className="w-4 h-4" />
                                        )}
                                        {t("reject")}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Project Info */}
                        <div className="bg-white rounded-xl border border-secondary-100 p-5">
                            <h3 className="font-medium text-secondary-900 mb-3">
                                {t("project")}
                            </h3>
                            <Link
                                href={`/${locale}/projects/${application.project.slug}`}
                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                                {application.project.title}
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Applicant/Owner Info */}
                        <div className="bg-white rounded-xl border border-secondary-100 p-5">
                            <h3 className="font-medium text-secondary-900 mb-4">
                                {isOwner
                                    ? t("applicant")
                                    : (locale === "ar" ? "صاحب المشروع" : "Project Owner")}
                            </h3>

                            <div className="flex items-center gap-3 mb-4">
                                {otherUser.image ? (
                                    <Image
                                        src={otherUser.image}
                                        alt={otherUser.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-lg font-medium text-primary-700">
                                        {otherUser.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-secondary-900">{otherUser.name}</p>
                                    {isOwner && (
                                        <p className="text-sm text-secondary-500">
                                            {application.contributor.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Application Details */}
                            {application.message && (
                                <div className="mb-4">
                                    <p className="text-xs text-secondary-400 mb-1">
                                        {t("message")}
                                    </p>
                                    <p className="text-sm text-secondary-700">{application.message}</p>
                                </div>
                            )}

                            {application.hoursPerWeek && (
                                <div className="text-sm text-secondary-600">
                                    <span className="text-secondary-400">
                                        {t("hoursPerWeek")}:
                                    </span>{" "}
                                    {application.hoursPerWeek}{t("hWeek")}
                                </div>
                            )}

                            {application.portfolioUrl && (
                                <a
                                    href={application.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {t("portfolio")}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
