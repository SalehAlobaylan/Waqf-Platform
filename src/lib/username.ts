import type { PrismaClient } from "@prisma/client";

const ARABIC_TO_LATIN: Record<string, string> = {
    ا: "a", أ: "a", إ: "i", آ: "a",
    ب: "b", ت: "t", ث: "th",
    ج: "j", ح: "h", خ: "kh",
    د: "d", ذ: "dh",
    ر: "r", ز: "z",
    س: "s", ش: "sh",
    ص: "s", ض: "d",
    ط: "t", ظ: "z",
    ع: "a", غ: "gh",
    ف: "f", ق: "q", ك: "k",
    ل: "l", م: "m", ن: "n",
    ه: "h", و: "w", ي: "y", ى: "a", ة: "h",
    " ": "-", "ـ": "",
};

function transliterate(input: string): string {
    let out = "";
    for (const ch of input) {
        out += ARABIC_TO_LATIN[ch] ?? ch;
    }
    return out;
}

export function slugifyForUsername(input: string): string {
    const transliterated = transliterate(input);
    return transliterated
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-")
        .slice(0, 24);
}

export async function ensureUniqueUsername(
    prisma: PrismaClient,
    base: string,
    excludeUserId?: string
): Promise<string> {
    const seed = slugifyForUsername(base) || "user";
    const candidate = seed.length >= 3 ? seed : `${seed}${"0".repeat(3 - seed.length)}`;

    const exists = async (value: string) => {
        const u = await prisma.user.findUnique({
            where: { username: value },
            select: { id: true },
        });
        return u && u.id !== excludeUserId;
    };

    if (!(await exists(candidate))) return candidate;

    for (let i = 2; i < 1000; i += 1) {
        const next = `${candidate}-${i}`;
        if (!(await exists(next))) return next;
    }

    return `${candidate}-${Math.random().toString(36).slice(2, 8)}`;
}
