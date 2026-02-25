"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Calendar, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { ApplicationStatusBadge } from "./ApplicationStatus";
import { ApplicationStatus } from "@prisma/client";

interface ApplicationCardProps {
    application: {
        id: string;
        status: ApplicationStatus;
        message: string | null;
        hoursPerWeek: number | null;
        createdAt: Date | string;
        project: {
            id: string;
            title: string;
            slug: string;
            category?: string;
            owner?: {
                id: string;
                name: string;
                image: string | null;
            };
        };
        contributor?: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
        _count: {
            messages: number;
        };
    };
    variant?: "contributor" | "owner";
}

export function ApplicationCard({ application, variant = "contributor" }: ApplicationCardProps) {
    const locale = useLocale();
    const createdAt = new Date(application.createdAt);

    return (
        <Link
            href={`/${locale}/dashboard/applications/${application.id}`}
            className="block bg-white rounded-xl border border-secondary-100 p-5 
                       hover:border-primary-200 hover:shadow-md transition-all group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Project Title */}
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors truncate">
                        {application.project.title}
                    </h3>

                    {/* Owner or Contributor info */}
                    {variant === "contributor" && application.project.owner && (
                        <div className="flex items-center gap-2 mt-2">
                            {application.project.owner.image ? (
                                <Image
                                    src={application.project.owner.image}
                                    alt={application.project.owner.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-medium text-primary-700">
                                    {application.project.owner.name.charAt(0)}
                                </div>
                            )}
                            <span className="text-sm text-secondary-500">
                                {application.project.owner.name}
                            </span>
                        </div>
                    )}

                    {variant === "owner" && application.contributor && (
                        <div className="flex items-center gap-2 mt-2">
                            {application.contributor.image ? (
                                <Image
                                    src={application.contributor.image}
                                    alt={application.contributor.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-medium text-primary-700">
                                    {application.contributor.name.charAt(0)}
                                </div>
                            )}
                            <span className="text-sm text-secondary-600 font-medium">
                                {application.contributor.name}
                            </span>
                            <span className="text-sm text-secondary-400">
                                {application.contributor.email}
                            </span>
                        </div>
                    )}

                    {/* Message Preview */}
                    {application.message && (
                        <p className="mt-2 text-sm text-secondary-500 line-clamp-2">
                            {application.message}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-secondary-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {createdAt.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                        {application.hoursPerWeek && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {application.hoursPerWeek}h/week
                            </span>
                        )}
                        {application._count.messages > 0 && (
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {application._count.messages} messages
                            </span>
                        )}
                    </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-3">
                    <ApplicationStatusBadge status={application.status} locale={locale} />
                    <ArrowRight className="w-4 h-4 text-secondary-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </Link>
    );
}
