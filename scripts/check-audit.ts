import { execSync } from "node:child_process";

// Known advisories that cannot be fixed via normal upgrade paths.
// effect is pinned internally by uploadthing (no patched release of the
// 7.x line exists); the advisory (GHSA-38f7-945m-qr2g) concerns library
// internals (AsyncLocalStorage under RPC load), not our usage surface.
// GHSA-ggr8-5vv4-36mx: deepmerge-ts stack exhaustion, reached only through
// @prisma/config (the Prisma CLI — a dev tool, never bundled into runtime).
// No patched release on the 7.x line exists yet.
const ALLOWLIST = new Set(["GHSA-38f7-945m-qr2g", "GHSA-ggr8-5vv4-36mx"]);

function evaluate(raw: string): boolean {
  const report = JSON.parse(raw);
  const advisories = Object.values(report.vulnerabilities ?? {}).flatMap(
    (v: unknown) => {
      const via = (v as { via?: unknown[] }).via ?? [];
      return via as Array<{ severity: string; url?: string; source?: string }>;
    },
  );
  const blockers = advisories.filter(
    (a) =>
      !ALLOWLIST.has(String(a.url ?? a.source ?? "").replace("https://github.com/advisories/", "")) &&
      (a.severity === "high" || a.severity === "critical"),
  );
  if (blockers.length > 0) {
    console.error(
      `Audit failed: ${blockers.length} unallowed high/critical advisory(ies):`,
      blockers.map((b) => b.url ?? b.source),
    );
    return false;
  }
  console.log(
    `Audit OK — no unallowed high/critical advisories (${ALLOWLIST.size} known advisory allowlisted)`,
  );
  return true;
}

try {
  const raw = execSync("npm audit --json", {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  process.exit(evaluate(raw) ? 0 : 1);
} catch (err) {
  const e = err as { stdout?: string; stderr?: string; message?: string };
  const raw = (e.stdout ?? "") as string;
  if (raw.trim().startsWith("{")) {
    process.exit(evaluate(raw) ? 0 : 1);
  }
  console.error("Audit check error:", e.stderr ?? e.message);
  process.exit(1);
}
