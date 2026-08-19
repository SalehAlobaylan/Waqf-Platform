import { describe, expect, it, vi } from "vitest";
import { slugifyForUsername, ensureUniqueUsername } from "@/lib/username";
import type { PrismaClient } from "@prisma/client";

describe("slugifyForUsername", () => {
    it("slugs plain ASCII names", () => {
        expect(slugifyForUsername("Omar Al-Ahmad")).toBe("omar-al-ahmad");
    });

    it("transliterates Arabic to Latin", () => {
        expect(slugifyForUsername("عبد الله")).toBe("abd-allh");
        expect(slugifyForUsername("محمد")).toBe("mhmd");
    });

    it("removes punctuation and collapses separators", () => {
        expect(slugifyForUsername("Hello, World!")).toBe("hello-world");
        expect(slugifyForUsername("a--b   c")).toBe("a-b-c");
    });

    it("trims leading and trailing separators", () => {
        expect(slugifyForUsername("  foo  ")).toBe("foo");
        expect(slugifyForUsername("-foo-")).toBe("foo");
    });

    it("caps the result at 24 characters", () => {
        expect(slugifyForUsername("a".repeat(60))).toHaveLength(24);
        expect(slugifyForUsername("abcdefghijklmnopqrstuvwxyz0123456789").length).toBeLessThanOrEqual(24);
    });

    it("returns an empty string for symbols-only input", () => {
        expect(slugifyForUsername("!!!")).toBe("");
    });
});

function mockPrisma(usernames: Map<string, string | null>) {
    return {
        user: {
            findUnique: vi.fn(async ({ where }: { where: { username: string } }) => {
                const ownerId = usernames.get(where.username);
                return ownerId === undefined ? null : { id: ownerId };
            }),
        },
    } as unknown as PrismaClient;
}

describe("ensureUniqueUsername", () => {
    it("returns the base slug when it is free", async () => {
        const prisma = mockPrisma(new Map());
        await expect(ensureUniqueUsername(prisma, "Omar Ali")).resolves.toBe("omar-ali");
    });

    it("appends a numeric suffix when the base is taken", async () => {
        const prisma = mockPrisma(new Map([["omar-ali", "user-1"]]));
        await expect(ensureUniqueUsername(prisma, "Omar Ali")).resolves.toBe("omar-ali-2");
    });

    it("keeps incrementing until it finds a free suffix", async () => {
        const taken = new Map([
            ["omar-ali", "user-1"],
            ["omar-ali-2", "user-2"],
            ["omar-ali-3", "user-3"],
        ]);
        const prisma = mockPrisma(taken);
        await expect(ensureUniqueUsername(prisma, "Omar Ali")).resolves.toBe("omar-ali-4");
    });

    it("treats a username owned by the excluded user as free", async () => {
        const prisma = mockPrisma(new Map([["omar-ali", "user-1"]]));
        await expect(ensureUniqueUsername(prisma, "Omar Ali", "user-1")).resolves.toBe("omar-ali");
    });

    it("falls back to 'user' when the slug is empty", async () => {
        const prisma = mockPrisma(new Map());
        await expect(ensureUniqueUsername(prisma, "!!!")).resolves.toBe("user");
    });

    it("pads short slugs to at least three characters", async () => {
        const prisma = mockPrisma(new Map());
        await expect(ensureUniqueUsername(prisma, "a")).resolves.toBe("a00");
    });
});