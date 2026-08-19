import { PlatformStats } from "@/lib/stats";

function formatRange(asOf: Date): string {
    const begin = new Date(asOf);
    begin.setDate(begin.getDate() - 7);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    return `${iso(begin)} to ${iso(asOf)}`;
}

export function buildWeeklyReportSubject(asOf = new Date()): string {
    return `Waqf weekly report — ${formatRange(asOf)}`;
}

export function buildWeeklyReportText(stats: PlatformStats): string {
    const { overview, growth, rates, breakdown } = stats;
    const pad = (label: string) => label.padEnd(28);
    return [
        "Waqf Platform — weekly report",
        "",
        "Overview",
        `  ${pad("Total users")} ${overview.totalUsers}`,
        `  ${pad("Total projects")} ${overview.totalProjects}`,
        `  ${pad("Total applications")} ${overview.totalApplications}`,
        `  ${pad("Pending projects")} ${overview.pendingProjects}`,
        `  ${pad("Active projects")} ${overview.activeProjects}`,
        "",
        "Growth",
        `  ${pad("New users (this month)")} ${growth.newUsersThisMonth}`,
        `  ${pad("New projects (this month)")} ${growth.newProjectsThisMonth}`,
        `  ${pad("New applications (this week)")} ${growth.newApplicationsThisWeek}`,
        "",
        "Rates",
        `  ${pad("Application acceptance")} ${rates.acceptanceRate}%`,
        "",
        "Projects by status",
        `  ${Object.entries(breakdown.projectsByStatus)
            .map(([key, value]) => `${key}: ${value}`)
            .join(" · ")}`,
        "Applications by status",
        `  ${Object.entries(breakdown.applicationsByStatus)
            .map(([key, value]) => `${key}: ${value}`)
            .join(" · ")}`,
        "",
        "Sent automatically by the Waqf Platform.",
    ].join("\n");
}

export function buildWeeklyReportHtml(stats: PlatformStats): string {
    const { overview, growth, rates, breakdown } = stats;
    const p = (label: string, value: string | number) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${label}</td>` +
        `<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${value}</td></tr>`;
    const statuses = (map: Record<string, number>) =>
        Object.entries(map)
            .map(([key, value]) => `${key} ${value}`)
            .join(" · ");

    return [
        `<div style="font-family:Arial,sans-serif;color:#111827;max-width:560px">`,
        `<h2 style="margin:0 0 16px">Waqf Platform — weekly report</h2>`,
        `<table style="border-collapse:collapse;width:100%;font-size:14px">`,
        `<tr><th colspan="2" style="text-align:left;padding:6px 12px;border-bottom:2px solid #111827">Overview</th></tr>`,
        p("Total users", overview.totalUsers),
        p("Total projects", overview.totalProjects),
        p("Total applications", overview.totalApplications),
        p("Pending projects", overview.pendingProjects),
        p("Active projects", overview.activeProjects),
        `<tr><th colspan="2" style="text-align:left;padding:6px 12px;border-bottom:2px solid #111827">Growth</th></tr>`,
        p("New users (this month)", growth.newUsersThisMonth),
        p("New projects (this month)", growth.newProjectsThisMonth),
        p("New applications (this week)", growth.newApplicationsThisWeek),
        `<tr><th colspan="2" style="text-align:left;padding:6px 12px;border-bottom:2px solid #111827">Rates</th></tr>`,
        p("Application acceptance", `${rates.acceptanceRate}%`),
        `</table>`,
        `<p style="font-size:13px;color:#6b7280">Projects: ${statuses(breakdown.projectsByStatus)}<br />` +
            `Applications: ${statuses(breakdown.applicationsByStatus)}</p>`,
        `<p style="font-size:12px;color:#9ca3af">Sent automatically by the Waqf Platform.</p>`,
        `</div>`,
    ].join("");
}