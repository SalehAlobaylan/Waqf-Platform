import { Page, expect } from "@playwright/test";

export { SEEDED_USERS } from "../../src/lib/dev/seeded-users";

export async function signInAs(page: Page, email: string): Promise<void> {
    const response = await page.request.post("/api/dev/sign-in-as", {
        data: { email },
    });
    expect(response.ok(), `dev sign-in failed for ${email}: ${response.status()}`).toBeTruthy();
}

export async function signOut(page: Page): Promise<void> {
    await page.context().clearCookies();
}
