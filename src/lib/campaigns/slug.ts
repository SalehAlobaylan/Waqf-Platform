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

/**
 * Normalize a project slug source: lowercase, collapse runs of
 * non-alphanumerics into single hyphens, trim leading/trailing hyphens.
 * Custom slugs keep their author-supplied hyphens; title-derived slugs
 * collapse those too.
 */
export function normalizeProjectSlug(text: string, preserveHyphens: boolean): string {
    const pattern = preserveHyphens ? /[^a-z0-9-]+/g : /[^a-z0-9]+/g;
    return text.toLowerCase().replace(pattern, "-").replace(/^-|-$/g, "");
}

/**
 * Resolve a unique project slug from an optional custom slug or the title.
 * Throws when uniqueness cannot be reached within 50 attempts.
 */
export async function resolveProjectSlug(title: string, customSlug?: string): Promise<string> {
    const base = customSlug
        ? normalizeProjectSlug(customSlug, true)
        : normalizeProjectSlug(title, false);
    return ensureUniqueProjectSlug(base);
}

export function buildCampaignSlug(title: string): string {
    return slugifyCampaign(title);
}
