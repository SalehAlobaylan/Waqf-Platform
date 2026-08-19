import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { getPlatformStats } from "@/lib/stats";
import { buildWeeklyReportHtml, buildWeeklyReportSubject, buildWeeklyReportText } from "@/lib/weekly-report";
import { sendEmail } from "@/lib/email";

const CRON_SECRET_HEADER = "x-cron-secret";

function secretsMatch(expected: string, provided: string): boolean {
    if (provided.length !== expected.length || provided.length === 0) return false;
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

/**
 * POST /api/admin/weekly-report
 * Sends the weekly summary email. Invoked by the GitHub Actions schedule
 * workflow (`.github/workflows/weekly-report.yml`), guarded by a header secret
 * instead of a session because no user is signed in. Disabled (404) when
 * `WEEKLY_REPORT_SECRET` is unset so nothing discoverable is ever exposed.
 */
export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.weeklyReport", async () => {
        const expectedSecret = process.env.WEEKLY_REPORT_SECRET;
        if (!expectedSecret) {
            return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
        }

        const provided = (request.headers.get(CRON_SECRET_HEADER) ?? "").trim();
        if (!secretsMatch(expectedSecret, provided)) {
            return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const rate = checkRateLimit(request, "weekly-report", { limit: 5, windowMs: 60_000 });
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const recipient = process.env.WEEKLY_REPORT_TO?.trim();
        if (!recipient) {
            return NextResponse.json({ error: "Not configured", code: "NOT_CONFIGURED" }, { status: 503 });
        }

        const stats = await getPlatformStats();
        const { id } = await sendEmail({
            to: recipient,
            subject: buildWeeklyReportSubject(),
            html: buildWeeklyReportHtml(stats),
            text: buildWeeklyReportText(stats),
        });

        return NextResponse.json({ ok: true, emailId: id });
    }, ctx);
}