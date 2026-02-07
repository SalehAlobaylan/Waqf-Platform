import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageList } from "@/components/chat/MessageList";
import { MessageSquare } from "lucide-react";

interface MessagesPageProps {
    params: Promise<{ locale: string }>;
}

export const metadata = {
    title: "Messages | Waqf",
    description: "View your conversations with project owners and contributors",
};

export default async function MessagesPage({ params }: MessagesPageProps) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const userId = session.user.id;
    const { locale } = await params;

    // Get user's applications with messages
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
                            avatar: true,
                        },
                    },
                },
            },
            contributor: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
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

    // Transform to conversation format
    const conversations = applications
        .filter(app => app.messages.length > 0 || app.status === "ACCEPTED")
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-3">
                        <MessageSquare className="w-7 h-7 text-primary-600" />
                        {locale === "ar" ? "الرسائل" : "Messages"}
                    </h1>
                    <p className="text-secondary-500 mt-1">
                        {locale === "ar"
                            ? "تواصل مع أصحاب المشاريع والمساهمين"
                            : "Communicate with project owners and contributors"}
                    </p>
                </div>

                <MessageList conversations={conversations} />
            </div>
        </div>
    );
}
