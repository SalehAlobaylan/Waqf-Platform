import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LOCALES = ["ar", "en"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const [projects, campaigns, profiles] = await Promise.all([
        prisma.project.findMany({
            where: { status: "OPEN" },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: "desc" },
            take: 1000,
        }),
        prisma.campaign.findMany({
            where: { status: { in: ["RECRUITING", "READY", "COMPLETED"] } },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: "desc" },
            take: 1000,
        }),
        prisma.user.findMany({
            where: { username: { not: null } },
            select: { username: true, updatedAt: true },
            orderBy: { updatedAt: "desc" },
            take: 1000,
        }),
    ]);

    const entries: MetadataRoute.Sitemap = [];

    for (const locale of LOCALES) {
        const staticRoutes = [
            "",
            "/explore",
            "/campaigns",
            "/search",
            "/privacy",
            "/terms",
            "/contact",
        ];
        for (const route of staticRoutes) {
            entries.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: route === "" ? "weekly" : "monthly",
                priority: route === "" ? 1 : 0.6,
            });
        }

        for (const project of projects) {
            entries.push({
                url: `${baseUrl}/${locale}/projects/${project.slug}`,
                lastModified: project.updatedAt,
                changeFrequency: "weekly",
                priority: 0.8,
            });
        }

        for (const campaign of campaigns) {
            entries.push({
                url: `${baseUrl}/${locale}/campaigns/${campaign.slug}`,
                lastModified: campaign.updatedAt,
                changeFrequency: "weekly",
                priority: 0.7,
            });
        }

        for (const profile of profiles) {
            entries.push({
                url: `${baseUrl}/${locale}/profile/${profile.username}`,
                lastModified: profile.updatedAt,
                changeFrequency: "monthly",
                priority: 0.4,
            });
        }
    }

    return entries;
}
