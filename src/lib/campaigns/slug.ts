import { prisma } from "@/lib/prisma";

export function slugifyCampaign(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export async function ensureUniqueCampaignSlug(base: string, excludeId?: string): Promise<string> {
    let slug = base;
    let counter = 0;
    while (true) {
        const existing = await prisma.campaign.findUnique({ where: { slug } });
        if (!existing || existing.id === excludeId) return slug;
        counter += 1;
        slug = `${base}-${counter}`;
        if (counter > 50) {
            throw new Error("Could not generate unique slug");
        }
    }
}

export async function ensureUniqueProjectSlug(base: string): Promise<string> {
    let slug = base;
    let counter = 0;
    while (true) {
        const existing = await prisma.project.findUnique({ where: { slug } });
        if (!existing) return slug;
        counter += 1;
        slug = `${base}-${counter}`;
        if (counter > 50) {
            throw new Error("Could not generate unique project slug");
        }
    }
}

export function buildCampaignSlug(title: string): string {
    return slugifyCampaign(title);
}
