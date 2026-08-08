import { test as base } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "../e2e/auth-helpers";

export type TestUser = {
    id: string;
    email: string;
    name: string;
};

export const testUsers: TestUser[] = [
    {
        id: "seed-omar",
        email: SEEDED_USERS.omar,
        name: "Omar Alfarsi",
    },
    {
        id: "seed-fatima",
        email: SEEDED_USERS.fatima,
        name: "Fatima Hassan",
    },
    {
        id: "seed-admin",
        email: SEEDED_USERS.admin,
        name: "System Admin",
    },
];

export const testUser = testUsers[0];
export const contributorUser = testUsers[1];
export const adminUser = testUsers[2];

export const test = base.extend<{
    testUser: TestUser;
    contributorUser: TestUser;
    adminUser: TestUser;
    login: (email: string) => Promise<void>;
    logout: () => Promise<void>;
}>({
    testUser: async ({}, applyFixture) => {
        await applyFixture(testUsers[0]);
    },
    contributorUser: async ({}, applyFixture) => {
        await applyFixture(testUsers[1]);
    },
    adminUser: async ({}, applyFixture) => {
        await applyFixture(testUsers[2]);
    },
    login: async ({ page }, applyFixture) => {
        await applyFixture(async (email: string) => {
            await signInAs(page, email);
        });
    },
    logout: async ({ page }, applyFixture) => {
        await applyFixture(async () => {
            await page.context().clearCookies();
        });
    },
});
