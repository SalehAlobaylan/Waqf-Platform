// Mock data for development until database is fixed
// This bypasses the Prisma connection issues

export const mockProjects = [
    {
        id: "1",
        title: "Islamic Prayer Times App",
        slug: "islamic-prayer-times-app",
        description: "A modern prayer times application with accurate calculations",
        impact: "Helping 10,000+ Muslims pray on time daily",
        category: "MOBILE_DEVELOPMENT",
        status: "OPEN",
        featured: true,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        owner: {
            id: "user1",
            name: "Ahmed Hassan",
            email: "ahmed@example.com",
            avatar: null,
        },
        skills: [
            { skill: { name: "React Native" } },
            { skill: { name: "TypeScript" } },
        ],
        _count: { applications: 5 },
    },
    {
        id: "2",
        title: "Quran Learning Platform",
        slug: "quran-learning-platform",
        description: "Interactive platform for learning Quran with tajweed",
        impact: "Educating 5,000+ students worldwide",
        category: "EDUCATION",
        status: "OPEN",
        featured: true,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
        owner: {
            id: "user2",
            name: "Fatima Ali",
            email: "fatima@example.com",
            avatar: null,
        },
        skills: [
            { skill: { name: "Next.js" } },
            { skill: { name: "PostgreSQL" } },
        ],
        _count: { applications: 8 },
    },
    {
        id: "3",
        title: "Zakat Calculator",
        slug: "zakat-calculator",
        description: "Comprehensive zakat calculation tool with multiple currencies",
        impact: "Processed $1M+ in zakat calculations",
        category: "CHARITY",
        status: "OPEN",
        featured: false,
        createdAt: new Date("2024-01-05"),
        updatedAt: new Date("2024-01-05"),
        owner: {
            id: "user3",
            name: "Omar Ibrahim",
            email: "omar@example.com",
            avatar: null,
        },
        skills: [
            { skill: { name: "Vue.js" } },
            { skill: { name: "Node.js" } },
        ],
        _count: { applications: 3 },
    },
];

export const mockStats = {
    totalProjects: 156,
    totalContributors: 1247,
    totalContributions: 3891,
};

export const mockAdminStats = {
    overview: {
        totalUsers: 1247,
        totalProjects: 156,
        totalApplications: 423,
        pendingProjects: 12,
        activeProjects: 89,
    },
    growth: {
        newUsersThisMonth: 47,
        newProjectsThisMonth: 15,
        newApplicationsThisWeek: 23,
    },
    rates: {
        acceptanceRate: 68,
    },
    breakdown: {
        projectsByStatus: {
            DRAFT: 15,
            PENDING: 12,
            OPEN: 89,
            IN_PROGRESS: 25,
            COMPLETED: 10,
            CANCELLED: 5,
        },
        applicationsByStatus: {
            PENDING: 87,
            ACCEPTED: 289,
            REJECTED: 35,
            WITHDRAWN: 12,
        },
    },
    recent: {
        projects: mockProjects.slice(0, 5).map(p => ({
            ...p,
            owner: { name: p.owner.name, avatar: p.owner.avatar },
        })),
        topContributors: [
            {
                id: "c1",
                name: "Ahmed Hassan",
                avatar: null,
                _count: { applications: 15 },
            },
            {
                id: "c2",
                name: "Fatima Ali",
                avatar: null,
                _count: { applications: 12 },
            },
            {
                id: "c3",
                name: "Omar Ibrahim",
                avatar: null,
                _count: { applications: 10 },
            },
        ],
    },
};

export const mockUser = {
    id: "admin1",
    name: "Admin User",
    email: "admin@waqf.com",
    role: "ADMIN",
};
