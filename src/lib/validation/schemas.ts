import { z } from "zod";

const optionalTrimmedString = (min?: number, max?: number) => {
    let base = z.string();
    if (typeof min === "number") base = base.min(min);
    if (typeof max === "number") base = base.max(max);
    return z.preprocess(
        (value) => {
            if (typeof value !== "string") return value;
            const trimmed = value.trim();
            return trimmed.length > 0 ? trimmed : undefined;
        },
        base
    );
};

const projectListStatusSchema = z.preprocess(
    (value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        if (trimmed.toLowerCase() === "all") return "all";
        return trimmed.toUpperCase();
    },
    z.enum(["all", "DRAFT", "PENDING", "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
);

export const idSchema = z
    .string()
    .max(128, "ID is too long")
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "ID is required");
export const routeIdParamSchema = z.object({ id: idSchema });
export const slugSchema = z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphenated");

export const paginationSchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export const pagePaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const sortSchema = z.enum(["newest", "oldest"]).default("newest");

export const userRoleSchema = z.enum(["USER", "ADMIN"]);

export const projectStatusSchema = z.enum([
    "DRAFT",
    "PENDING",
    "OPEN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
]);

export const applicationStatusSchema = z.enum([
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
]);

export const reportStatusSchema = z.enum(["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"]);

export const projectCategorySchema = z.enum([
    "QURAN",
    "PRAYER",
    "CHARITY",
    "EDUCATION",
    "COMMUNITY",
    "TOOLS",
]);

export const projectLanguageSchema = z.enum(["ARABIC", "ENGLISH", "BOTH"]);

export const projectSkillSchema = z.object({
    skillId: z.coerce.number().int().positive(),
    isRequired: z.boolean().optional(),
});

export const projectCreateSchema = z
    .object({
        title: z.string().min(3).max(120),
        description: z.string().min(20).max(5000),
        category: projectCategorySchema,
        language: projectLanguageSchema.optional(),
        timeCommitment: z.string().max(120).optional().nullable(),
        duration: z.string().max(120).optional().nullable(),
        impact: z.string().max(500).optional().nullable(),
        githubUrl: z.string().url().optional().nullable(),
        featuredImage: z.string().url().optional().nullable(),
        organizationId: idSchema.optional().nullable(),
        customSlug: slugSchema.optional().nullable(),
        skills: z.array(projectSkillSchema).optional(),
    })
    .strip();

export const projectUpdateSchema = z
    .object({
        title: z.string().min(3).max(120).optional(),
        description: z.string().min(20).max(5000).optional(),
        category: projectCategorySchema.optional(),
        language: projectLanguageSchema.optional(),
        timeCommitment: z.string().max(120).optional().nullable(),
        duration: z.string().max(120).optional().nullable(),
        impact: z.string().max(500).optional().nullable(),
        githubUrl: z.string().url().optional().nullable(),
        featuredImage: z.string().url().optional().nullable(),
        organizationId: idSchema.optional().nullable(),
        slug: slugSchema.optional(),
        skills: z.array(projectSkillSchema).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
        path: ["title"],
    })
    .strip();

export const reportCreateSchema = z
    .object({
        targetType: z.enum(["PROJECT", "USER", "APPLICATION"]),
        targetId: idSchema,
        reason: z.string().min(3).max(200),
        details: z.string().max(1000).optional().nullable(),
    })
    .strip();

export const reportUpdateSchema = z
    .object({
        status: z.enum(["REVIEWED", "RESOLVED", "DISMISSED"]),
    })
    .strip();

export const projectStatusUpdateSchema = z
    .object({
        status: projectStatusSchema,
        adminFeedback: z.string().max(1000).optional().nullable(),
    })
    .strip();

export const notificationPatchSchema = z
    .object({
        notificationIds: z.array(idSchema).optional(),
        markAllRead: z.boolean().optional(),
    })
    .strip()
    .refine((data) => data.markAllRead || (data.notificationIds && data.notificationIds.length > 0), {
        message: "Provide notificationIds or markAllRead",
        path: ["notificationIds"],
    });

export const adminProjectActionSchema = z
    .object({
        action: z.enum(["approve", "reject", "feature", "unfeature"]).optional(),
        feedback: z.string().max(1000).optional().nullable(),
        featured: z.boolean().optional(),
    })
    .strip()
    .refine((data) => data.action || typeof data.featured === "boolean", {
        message: "Action or featured flag is required",
        path: ["action"],
    });

export const adminFeaturedUpdateSchema = z
    .object({
        projectId: idSchema,
        featured: z.boolean().optional(),
        featuredUntil: z.coerce.date().optional().nullable(),
    })
    .strip();

export const applicationCreateSchema = z
    .object({
        projectId: idSchema,
        message: z.string().max(2000).optional().nullable(),
        portfolioUrl: z.string().url().optional().nullable(),
        hoursPerWeek: z.coerce.number().int().min(0).max(168).optional().nullable(),
    })
    .strip();

export const applicationStatusUpdateSchema = z
    .object({
        status: z.enum(["ACCEPTED", "REJECTED"]),
        feedback: z.string().max(1000).optional().nullable(),
    })
    .strip();

export const messageCreateSchema = z
    .object({
        applicationId: idSchema,
        content: z
            .string()
            .max(2000)
            .refine((value) => value.trim().length > 0, "Content is required"),
    })
    .strip();

export const onboardingSchema = z
    .object({
        type: z.enum(["CONTRIBUTOR", "CREATOR"]),
        orgName: z.string().min(2).max(120).optional().nullable(),
    })
    .strip()
    .refine((data) => (data.type === "CREATOR" ? !!data.orgName : true), {
        message: "Organization name is required",
        path: ["orgName"],
    });

export const profileUpdateSchema = z
    .object({
        bio: z.string().max(800).optional().nullable(),
        intentionStatement: z.string().max(800).optional().nullable(),
        discord: z.string().max(64).optional().nullable(),
        whatsapp: z.string().max(32).optional().nullable(),
        isAvailable: z.boolean().optional(),
        hoursPerWeek: z.coerce.number().int().min(0).max(168).optional().nullable(),
        selectedSkills: z.array(z.coerce.number().int().positive()).optional(),
    })
    .strip();

export const portfolioCreateSchema = z
    .object({
        title: z.string().min(1).max(120),
        description: z.string().max(500).optional().nullable(),
        url: z.string().url(),
        contributorId: idSchema,
        order: z.coerce.number().int().min(0).optional(),
    })
    .strip();

export const portfolioDeleteSchema = z.object({
    id: idSchema,
});

export const portfolioReorderSchema = z
    .object({
        items: z
            .array(
                z.object({
                    id: idSchema,
                    order: z.coerce.number().int().min(0),
                })
            )
            .min(1),
    })
    .strip();

export const searchQuerySchema = z
    .object({
        q: optionalTrimmedString(2, 120).optional(),
        category: projectCategorySchema.optional(),
        status: z
            .preprocess(
                (value) => (typeof value === "string" ? value.trim().toUpperCase() : value),
                z.enum(["ALL", "OPEN", "IN_PROGRESS", "COMPLETED"])
            )
            .optional(),
        limit: z.coerce.number().int().min(1).max(50).default(20),
        offset: z.coerce.number().int().min(0).default(0),
    })
    .strip();

export const exploreQuerySchema = z
    .object({
        limit: z.coerce.number().int().min(1).max(50).default(20),
        page: z.coerce.number().int().min(1).default(1),
        category: projectCategorySchema.optional(),
        search: optionalTrimmedString(undefined, 120).optional(),
        skills: optionalTrimmedString(undefined, 200).optional(),
        language: projectLanguageSchema.optional(),
    })
    .strip();

export const skillsQuerySchema = z
    .object({
        q: optionalTrimmedString(undefined, 120).optional(),
        search: optionalTrimmedString(undefined, 120).optional(),
    })
    .strip();

export const messagesQuerySchema = z.object({
    applicationId: idSchema,
});

export const notificationsQuerySchema = z
    .object({
        unread: z.enum(["true", "false"]).optional(),
        limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strip();


export const adminProjectsQuerySchema = z
    .object({
        status: z.enum(["PENDING", "OPEN", "DRAFT"]).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strip();

export const adminUsersQuerySchema = z
    .object({
        search: optionalTrimmedString(undefined, 120).optional(),
        role: z.enum(["USER", "ADMIN", "all"]).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strip();

export const adminUserUpdateSchema = z
    .object({
        role: userRoleSchema.optional(),
    })
    .refine((data) => typeof data.role !== "undefined", {
        message: "Role is required",
        path: ["role"],
    })
    .strip();

export const applicationsQuerySchema = z
    .object({
        type: z.enum(["mine", "incoming"]).default("mine"),
        status: applicationStatusSchema.optional(),
        projectId: idSchema.optional(),
    })
    .strip();

export const projectsQuerySchema = z
    .object({
        limit: z.coerce.number().int().min(1).max(50).default(12),
        offset: z.coerce.number().int().min(0).default(0),
        category: projectCategorySchema.optional(),
        status: projectListStatusSchema.optional().default("OPEN"),
        search: optionalTrimmedString(undefined, 120).optional(),
        sortBy: sortSchema.optional(),
    })
    .strip();

export const recommendedProjectsQuerySchema = z
    .object({
        limit: z.coerce.number().int().min(1).max(50).default(10),
        offset: z.coerce.number().int().min(0).default(0),
        category: projectCategorySchema.optional(),
    })
    .strip();

export const reportsQuerySchema = z
    .object({
        status: reportStatusSchema.optional(),
    })
    .strip();
