import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageList } from "@/components/chat/MessageList";
import { MessageSquare } from "lucide-react";

interface MessagesPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MessagesPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("dashboardMessages"),
    };
}

export default async function MessagesPage({ params }: MessagesPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "dashboard.messages" });
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }

    const userId = session.user.id;

    const applications = await prisma.application.findMany({
        where: {
            OR: [
                { contributorId: userId },
                { project: { ownerId: userId } },
            ],
        },
        include: {
            project: {
                select: {
                    title: true,
                    slug: true,
                    ownerId: true,
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
            contributor: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
                select: {
                    content: true,
                    createdAt: true,
                    senderId: true,
                    readAt: true,
                },
            },
            _count: {
                select: {
                    messages: {
                        where: {
                            senderId: { not: userId },
                            readAt: null,
                        },
                    },
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    const conversations = applications
        .filter(app => {
            if (app.messages.length === 0 && app.status !== "ACCEPTED") return false;
            const isContributor = app.contributorId === userId;
            const otherUser = isContributor ? app.project.owner : app.contributor;
            return otherUser !== null;
        })
        .map(app => {
            const isContributor = app.contributorId === userId;
            const otherUser = isContributor ? app.project.owner : app.contributor;
            const lastMessage = app.messages[0];

            return {
                applicationId: app.id,
                projectTitle: app.project.title,
                projectSlug: app.project.slug,
                otherUser,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt.toISOString(),
                    isOwn: lastMessage.senderId === userId,
                } : undefined,
                unreadCount: app._count.messages,
            };
        });

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container max-w-2xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-3">
                        <MessageSquare className="w-7 h-7 text-primary-600" />
                        {t("title")}
                    </h1>
                    <p className="text-secondary-500 mt-1">
                        {t("subtitle")}
                    </p>
                </div>

                <MessageList conversations={conversations} />
            </div>
        </div>
    );
}
