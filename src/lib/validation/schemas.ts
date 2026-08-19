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

/**
 * Required free-text field: trims surrounding whitespace and rejects
 * whitespace-only input (trimming collapses it below `min`).
 */
const requiredTrimmedString = (min: number, max: number) =>
    z.preprocess(
        (value) => {
            if (typeof value !== "string") return value;
            return value.trim();
        },
        z.string().min(min, `Must be at least ${min} characters`).max(max)
    );

/**
 * Optional nullable free-text field: trims surrounding whitespace and maps
 * whitespace-only values to `null` so clients can "clear" a field.
 */
const optionalNullableTrimmedString = (max: number) =>
    z.preprocess(
        (value) => {
            if (value === null || value === undefined) return value;
            if (typeof value !== "string") return value;
            const trimmed = value.trim();
            return trimmed.length > 0 ? trimmed : null;
        },
        z.string().max(max).optional().nullable()
    );

/**
 * URL field: trims leading/trailing whitespace before validating so URLs
 * pasted with stray spaces neither fail nor get stored untrimmed.
 */
const urlSchema = z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().url("Must be a valid URL")
);

/** Optional nullable URL field with the same trimming behavior. */
const nullableUrlSchema = z.preprocess(
    (value) => {
        if (value === null || value === undefined) return value;
        return typeof value === "string" ? value.trim() : value;
    },
    z.string().url("Must be a valid URL").optional().nullable()
);

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

/**
 * Admin system-logs list query: extends pagination with optional status/code
 * filters. Values are passed through parseQuery as raw strings, so both sides
 * of the coerce handle the absent case gracefully.
 */
export const systemLogsQuerySchema = pagePaginationSchema.extend({
    status: z.coerce.number().int().min(100).max(599).optional(),
    code: z.string().trim().max(40).optional(),
});

export const sortSchema = z.enum(["recommended", "newest", "oldest"]).default("newest");

export const userRoleSchema = z.enum(["USER", "ADMIN"]);

/**
 * GitHub username: alphanumeric plus inner hyphens, 1-39 chars (GitHub's own
 * naming rules). Trimmed before validation so stray whitespace is forgiven.
 */
export const githubUsernameSchema = z
    .string()
    .trim()
    .min(1, "GitHub username is required")
    .max(39, "GitHub username is too long")
    .regex(
        /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
        "GitHub usernames may only contain letters, numbers, and single hyphens"
    );

/** PATCH /api/contributors/github body. `force` bypasses the fetch cache. */
export const githubUpdateSchema = z.object({
    username: githubUsernameSchema,
    force: z.boolean().optional(),
});

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

export const projectSourceSchema = z.enum(["INTERNAL", "EXTERNAL"]);

export const projectSkillSchema = z.object({
    skillId: z.coerce.number().int().positive(),
    isRequired: z.boolean().optional(),
});

const externalContactSchema = z
    .string()
    .min(2, "Contact is required")
    .max(160)
    .trim()
    .refine(
        (value) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
            /^https?:\/\/.+/.test(value) ||
            /^@\w{2,30}$/.test(value),
        "Contact must be an email, URL, or @handle"
    );

export const projectCurateSchema = z
    .object({
        title: requiredTrimmedString(3, 120),
        customSlug: slugSchema.optional().nullable(),
        description: requiredTrimmedString(20, 5000),
        category: projectCategorySchema,
        language: projectLanguageSchema.optional(),
        impact: optionalNullableTrimmedString(500),
        timeCommitment: optionalNullableTrimmedString(120),
        duration: optionalNullableTrimmedString(120),
        featuredImage: nullableUrlSchema,
        externalUrl: urlSchema,
        externalOwnerName: requiredTrimmedString(2, 80),
        externalOwnerContact: externalContactSchema,
        curatorNotes: optionalNullableTrimmedString(2000),
        status: projectStatusSchema.optional(),
        featured: z.boolean().optional(),
        skills: z.array(projectSkillSchema).max(30).optional(),
    })
    .strip();

export const projectCurateUpdateSchema = z
    .object({
        title: requiredTrimmedString(3, 120).optional(),
        description: requiredTrimmedString(20, 5000).optional(),
        category: projectCategorySchema.optional(),
        language: projectLanguageSchema.optional(),
        impact: optionalNullableTrimmedString(500),
        timeCommitment: optionalNullableTrimmedString(120),
        duration: optionalNullableTrimmedString(120),
        featuredImage: nullableUrlSchema,
        externalUrl: urlSchema.optional(),
        externalOwnerName: requiredTrimmedString(2, 80).optional(),
        externalOwnerContact: externalContactSchema.optional(),
        curatorNotes: optionalNullableTrimmedString(2000),
        status: projectStatusSchema.optional(),
        featured: z.boolean().optional(),
        skills: z.array(projectSkillSchema).max(30).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
        path: ["title"],
    })
    .strip();

export const projectCreateSchema = z
    .object({
        title: requiredTrimmedString(3, 120),
        description: requiredTrimmedString(20, 5000),
        category: projectCategorySchema,
        language: projectLanguageSchema.optional(),
        timeCommitment: optionalNullableTrimmedString(120),
        duration: optionalNullableTrimmedString(120),
        impact: optionalNullableTrimmedString(500),
        githubUrl: nullableUrlSchema,
        featuredImage: nullableUrlSchema,
        organizationId: idSchema.optional().nullable(),
        customSlug: slugSchema.optional().nullable(),
        skills: z.array(projectSkillSchema).max(30).optional(),
        status: z.enum(["PENDING"]).optional(),
    })
    .strip();

export const projectUpdateSchema = z
    .object({
        title: requiredTrimmedString(3, 120).optional(),
        description: requiredTrimmedString(20, 5000).optional(),
        category: projectCategorySchema.optional(),
        language: projectLanguageSchema.optional(),
        timeCommitment: optionalNullableTrimmedString(120),
        duration: optionalNullableTrimmedString(120),
        impact: optionalNullableTrimmedString(500),
        githubUrl: nullableUrlSchema,
        featuredImage: nullableUrlSchema,
        organizationId: idSchema.optional().nullable(),
        slug: slugSchema.optional(),
        skills: z.array(projectSkillSchema).max(30).optional(),
        status: z.enum(["PENDING"]).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
        path: ["title"],
    })
    .strip();

export const campaignStatusSchema = z.enum([
    "DRAFT",
    "PENDING",
    "RECRUITING",
    "READY",
    "COMPLETED",
    "CANCELLED",
]);

export const campaignRoleStatusSchema = z.enum(["OPEN", "FILLED", "CLOSED"]);

export const campaignJoinStatusSchema = z.enum([
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
]);

export const campaignSenioritySchema = z.enum(["JUNIOR", "MID", "SENIOR", "ANY"]);

export const campaignRoleCreateSchema = z
    .object({
        skillId: z.coerce.number().int().positive(),
        title: requiredTrimmedString(1, 120),
        description: optionalNullableTrimmedString(1000),
        count: z.coerce.number().int().min(1).max(50),
        seniority: campaignSenioritySchema.optional(),
        isRequired: z.boolean().optional(),
    })
    .strip();

export const campaignRoleUpdateSchema = z
    .object({
        title: requiredTrimmedString(1, 120).optional(),
        description: optionalNullableTrimmedString(1000),
        count: z.coerce.number().int().min(1).max(50).optional(),
        seniority: campaignSenioritySchema.optional(),
        isRequired: z.boolean().optional(),
        status: campaignRoleStatusSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
        path: ["title"],
    })
    .strip();

export const campaignCreateSchema = z
    .object({
        title: requiredTrimmedString(2, 120),
        pitch: requiredTrimmedString(10, 500),
        problem: requiredTrimmedString(10, 5000),
        outcome: optionalNullableTrimmedString(2000),
        category: projectCategorySchema.optional().nullable(),
        language: projectLanguageSchema.optional(),
        country: optionalNullableTrimmedString(80),
        startsAt: z.coerce.date().optional().nullable(),
        recruitmentDeadline: z.coerce.date().optional().nullable(),
        contactEmail: z.string().trim().email().max(200).optional().nullable(),
        coverImage: nullableUrlSchema,
        organizationId: idSchema.optional().nullable(),
        customSlug: slugSchema.optional().nullable(),
        tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
        roles: z.array(campaignRoleCreateSchema).max(20).optional(),
    })
    .strip()
    .refine((data) => !data.startsAt || data.startsAt.getTime() >= Date.now(), {
        message: "Campaign start date cannot be in the past",
        path: ["startsAt"],
    })
    .refine((data) => !data.recruitmentDeadline || !data.startsAt || data.recruitmentDeadline > data.startsAt, {
        message: "Recruitment deadline must be after the campaign start date",
        path: ["recruitmentDeadline"],
    });

export const campaignUpdateSchema = z
    .object({
        title: requiredTrimmedString(2, 120).optional(),
        pitch: requiredTrimmedString(10, 500).optional(),
        problem: requiredTrimmedString(10, 5000).optional(),
        outcome: optionalNullableTrimmedString(2000),
        category: projectCategorySchema.optional(),
        language: projectLanguageSchema.optional(),
        country: optionalNullableTrimmedString(80),
        startsAt: z.coerce.date().optional().nullable(),
        recruitmentDeadline: z.coerce.date().optional().nullable(),
        contactEmail: z.string().trim().email().max(200).optional().nullable(),
        coverImage: nullableUrlSchema,
        organizationId: idSchema.optional().nullable(),
        slug: slugSchema.optional(),
        tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
        path: ["title"],
    })
    .strip()
    .refine((data) => !data.recruitmentDeadline || !data.startsAt || data.recruitmentDeadline > data.startsAt, {
        message: "Recruitment deadline must be after the campaign start date",
        path: ["recruitmentDeadline"],
    });

export const campaignJoinCreateSchema = z
    .object({
        roleId: idSchema,
        message: optionalNullableTrimmedString(2000),
        portfolioUrl: nullableUrlSchema,
        hoursPerWeek: z.coerce.number().int().min(0).max(168).optional().nullable(),
    })
    .strip();

export const campaignJoinUpdateSchema = z
    .object({
        status: z.enum(["ACCEPTED", "REJECTED", "WITHDRAWN"]),
    })
    .strip();

export const campaignMilestoneCreateSchema = z
    .object({
        title: requiredTrimmedString(1, 160),
        description: optionalNullableTrimmedString(1000),
        order: z.coerce.number().int().min(0).max(100).optional(),
    })
    .strip();

export const campaignMilestoneUpdateSchema = z
    .object({
        title: requiredTrimmedString(1, 160).optional(),
        description: optionalNullableTrimmedString(1000),
        order: z.coerce.number().int().min(0).max(100).optional(),
        isDone: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
        path: ["title"],
    })
    .strip();

export const adminCampaignActionSchema = z
    .object({
        feedback: optionalNullableTrimmedString(1000),
    })
    .strip();

export const campaignsQuerySchema = z
    .object({
        limit: z.coerce.number().int().min(1).max(50).default(20),
        offset: z.coerce.number().int().min(0).default(0),
        category: projectCategorySchema.optional(),
        status: z
            .preprocess(
                (value) => (typeof value === "string" ? value.trim().toUpperCase() : value),
                z.enum(["ALL", "DRAFT", "PENDING", "RECRUITING", "READY", "COMPLETED", "CANCELLED"])
            )
            .optional()
            .default("RECRUITING"),
        search: optionalTrimmedString(undefined, 120).optional(),
        skills: optionalTrimmedString(undefined, 200).optional(),
    })
    .strip();

export const adminCampaignsQuerySchema = z
    .object({
        status: z.enum(["PENDING", "RECRUITING", "READY", "DRAFT"]).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strip();

export const reportCreateSchema = z
    .object({
        targetType: z.enum(["PROJECT", "USER", "APPLICATION"]),
        targetId: idSchema,
        reason: requiredTrimmedString(3, 200),
        details: optionalNullableTrimmedString(1000),
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
        adminFeedback: optionalNullableTrimmedString(1000),
    })
    .strip();

export const notificationPatchSchema = z
    .object({
        notificationIds: z.array(idSchema).max(100).optional(),
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
        feedback: optionalNullableTrimmedString(1000),
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
        featured: z.boolean(),
        featuredUntil: z.coerce.date().optional().nullable(),
    })
    .strip()
    .refine((data) => !data.featured || !data.featuredUntil || data.featuredUntil.getTime() >= Date.now(), {
        message: "Featured expiry date cannot be in the past",
        path: ["featuredUntil"],
    });

export const applicationCreateSchema = z
    .object({
        projectId: idSchema,
        message: optionalNullableTrimmedString(2000),
        portfolioUrl: nullableUrlSchema,
        hoursPerWeek: z.coerce.number().int().min(0).max(168).optional().nullable(),
    })
    .strip();

export const applicationStatusUpdateSchema = z
    .object({
        status: z.enum(["ACCEPTED", "REJECTED"]),
        feedback: optionalNullableTrimmedString(1000),
    })
    .strip();

export const messageCreateSchema = z
    .object({
        applicationId: idSchema,
        content: requiredTrimmedString(1, 2000),
    })
    .strip();

export const onboardingSchema = z
    .object({
        type: z.enum(["CONTRIBUTOR", "CREATOR"]),
        orgName: requiredTrimmedString(2, 120).optional().nullable(),
    })
    .strip()
    .refine((data) => (data.type === "CREATOR" ? !!data.orgName : true), {
        message: "Organization name is required",
        path: ["orgName"],
    });

export const profileUpdateSchema = z
    .object({
        bio: optionalNullableTrimmedString(800),
        intentionStatement: optionalNullableTrimmedString(800),
        discord: optionalNullableTrimmedString(64),
        whatsapp: optionalNullableTrimmedString(32),
        isAvailable: z.boolean().optional(),
        hoursPerWeek: z.coerce.number().int().min(0).max(168).optional().nullable(),
        selectedSkills: z.array(z.coerce.number().int().positive()).max(30).optional(),
    })
    .strip();

export const portfolioCreateSchema = z
    .object({
        title: requiredTrimmedString(1, 120),
        description: optionalNullableTrimmedString(500),
        url: urlSchema,
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
            .min(1)
            .max(50),
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
        skills: z.preprocess(
            (value) => {
                if (typeof value !== "string" || !value.trim()) return undefined;
                return value.split(",").map((s) => s.trim()).filter(Boolean);
            },
            z.array(z.coerce.number().int().positive()).optional()
        ),
        language: projectLanguageSchema.optional(),
        timeCommitment: z.enum(["1-5", "5-10", "10+"]).optional(),
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
