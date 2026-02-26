import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProjectForm } from "@/components/projects/ProjectForm";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
    return { title: "Create Project | Waqf" };
}

export default async function NewProjectPage({ params }: Props) {
    const { locale } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }

    // Fetch user's organizations for the dropdown
    const organizations = await prisma.organization.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true },
    });

    return (
        <ProjectForm
            locale={locale}
            mode="create"
            organizations={organizations}
        />
    );
}
