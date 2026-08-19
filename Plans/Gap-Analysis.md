# Waqf Platform — Post-Hardening Gap Analysis

> **Purpose**: Deep-dive analysis of the gaps identified after the error-handling /
> input-validation hardening, with *simple* solutions for each. Written for the
> current `main` (commit `41399c6`).
>
> **Scope**: Production-readiness of an app that already has broad feature
> coverage, solid CI, rate limiting, CSRF checks, and centralized error handling.
> This document is analysis + recommendations — not an implementation plan.

---

## 1. Summary

| # | Gap | Severity | Effort | Recommendation (simplest) |
|---|-----|----------|--------|---------------------------|
| 1 | Production error monitoring | High | S | Add Sentry; wire into `withApiHandler` + `global-error.tsx` |
| 2 | Security headers / CSP | High | S–M | Add `headers()` in `next.config.ts`; CSP report-only first |
| 3 | Rate-limit store is in-memory | Medium | M | Swap `Map` for Upstash/Vercel Redis behind the same API |
| 4 | No unit tests for pure logic | Medium | M | Add Vitest; test matching engine, username slugify, schemas |
| 5 | GitHub integration (PRD §6) | Medium | L | Reuse existing GitHub OAuth; fetch profile + top languages |
| 6 | Product/traffic analytics | Low | S–M | First-party page views or self-hosted Umami + a GitHub Actions weekly report |
| 7 | Developer-onboarding README | Low | S | Replace boilerplate README with real setup/run/test docs |

**Recommended order**: 1 → 2 → 3 → 4 first (protects what exists), then 5–7.

---

## 2. Gap 1 — Production error monitoring

### The gap

The app standardizes error **shape** (`AppError`, `toErrorResponse` in `src/lib/api/handler.ts`)
and logs structured JSON via `src/lib/logger.ts`, but there is **no error-tracking
service**. A grep across the repo finds no Sentry/Bugsnag/PostHog at all.

In production the only place those structured logs land is stdout (Vercel
function logs), and `logger.ts` deliberately swallows the underlying error
message for security:

- `src/lib/api/handler.ts:120-137` — the catch maps to a generic `{ error, code }`
  body; the real stack goes only to `log.error(...)`.
- `src/lib/logger.ts:3` — `isProd` gates nothing except `debug`, but nothing
  watches the output.

Consequence: a 500 in prod is invisible until a user reports it, and the
server-rendered error boundary (`src/app/global-error.tsx`) has no reporter hook.

### Simple solution

Add `@sentry/nextjs` (Vercel's own monitoring, zero infra):

1. `npm install @sentry/nextjs`.
2. In `sentry.client.config.ts` / `sentry.server.config.ts`: `Sentry.init({ dsn, tracesSampleRate: 0.2 })`, gated on `process.env.SENTRY_DSN` so local dev is silent.
3. In `next.config.ts`, wrap the config with `withSentryConfig(...)`.
4. In `src/lib/api/handler.ts` catch block, add `Sentry.captureException(error, { extra: { scope, method, path, userId } })` — one line in the single choke point where every API error already flows.
5. In `src/app/global-error.tsx`, call `Sentry.captureException(error)`.

### Why it's the highest leverage

Every API error already passes through exactly one function. Instrumenting it
gives you stack traces + source maps (Sentry uploads sourcemaps automatically)
for the whole API in one edit.

**Verification**: cause a deliberate 500 in a dev/staging build with `SENTRY_DSN`
set; confirm the issue appears in the Sentry dashboard with `scope`/`path`
context. Confirm a build without `SENTRY_DSN` stays silent.

**Effort**: S. **Risk**: low — Sentry is additive; misconfigured DSN just drops events.

---

## 3. Gap 2 — Security headers / CSP

### The gap

`next.config.ts` defines **no `headers()`** — the entire file is
`reactCompiler`, `serverExternalPackages`, `output`, and `images`
(`next.config.ts:6-34`). There is no HSTS, `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or CSP.

For an app with cookie sessions, OAuth, uploads (uploadthing `utfs.io`), and
user HTML content this is the classic "works, but not hardened for prod" gap.
A single XSS (e.g. in a project description rendered somewhere without escaping)
would be much harder to exploit with a restrictive CSP in place.

### Simple solution

Add a `headers()` async function to `next.config.ts`:

```ts
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ],
  }];
}
```

Then add a CSP **in `Content-Security-Policy-Report-Only` mode first** and
collect violations before enforcing. Required allowances for this app:

- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (Next dev/next-intl inline
  bootstrap; tighten after measuring)
- `img-src 'self' data: https://avatars.githubusercontent.com https://github.com https://utfs.io https://*.ufs.sh`
- `connect-src 'self' https://*.pusher.com wss://*.pusher.com` (real-time
  messaging, `src/lib/pusher.ts`)
- `frame-ancestors 'none'`

### Why worth it

It's the cheapest defense-in-depth available and complements the CSRF origin
check added in `withApiHandler` (`src/lib/api/handler.ts:64-92`).

**Verification**: `curl -I https://<prod-url>` shows the headers; a browser run
with the report-only CSP logs no unexpected violations in dev tools / the report
endpoint.

**Effort**: S–M. **Risk**: low-medium — a CSP that's too tight breaks scripts;
start report-only, iterate, then enforce.

---

## 4. Gap 3 — Rate-limit store is in-memory

### The gap (corrected framing)

Rate limiting itself is **already thorough**: every mutating route uses
`checkRateLimit` (`src/lib/rate-limit.ts`) and the better-auth catch-all is
wrapped with `rateLimit(...)` — `POST /api/auth/*` capped at 15/min in prod,
100/min in dev (`src/app/api/auth/[...all]/route.ts:11-12`). So the earlier
"auth is unprotected" concern is **not** accurate; it's covered.

The real gap is **storage**: `const buckets = new Map<string, Bucket>()`
(`src/lib/rate-limit.ts:24`). The file's own comment says it:
"per-instance state — correct for a single-instance deployment" and notes it
must become a shared store before scaling horizontally.

On Vercel (serverless) there is no single instance: each function invocation
may run on a different isolate, so the counter resets per isolate. An attacker
can therefore exceed limits by spreading requests across warm isolates, and
legit bursts may be limited inconsistently. The map also grows until the
5-minute cleanup sweep.

### Simple solution

Swap the backing store for Redis **behind the same API** — no route changes:

1. `npm install @upstash/ratelimit @upstash/redis` (or `@vercel/kv` — same shape).
2. Rewrite `checkRateLimit` internals (and the `rateLimit` wrapper) to call
   Upstash's fixed-window limiter with a `CONSTANT` refill, keyed exactly as
   today: `` `${scope}:${ip}:${suffix}` ``.
3. Add `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` to `.env.example`
   and the CI workflow (`test.yml`), falling back to the in-memory `Map` when
   unset so local dev and CI keep working without an account.

### Why worth it

Keeps all the deliberate per-route limit values; makes them actually
enforceable in production. Also unblocks horizontal scaling.

**Verification**: with the env vars set, fire N+1 rapid requests to a route and
confirm the 429 arrives at the same point as today; without env vars, the
existing e2e suites still pass (fallback path).

**Effort**: M (dependency + store swap + fallback). **Risk**: low — API is
unchanged, only the store is swapped.

---

## 5. Gap 4 — No unit tests for pure business logic

### The gap

Test coverage is **all end-to-end** (Playwright, `tests/e2e/`). There is no
Vitest/Jest config. The most algorithmic, deterministic, and high-risk logic
is only exercised through slow browser tests:

- `calculateMatchScore` and `scoreProjects` — `src/lib/matching/engine.ts:22-203`
  (the PRD §3.5 algorithm; skill levels, weights, normalization, decay).
- `slugifyForUsername` / `ensureUniqueUsername` — `src/lib/username.ts:27-60`
  (Arabic→Latin transliteration, dedupe-with-suffix).
- The validation schemas written during hardening — `src/lib/validation/schemas.ts`
  (trim/whitespace rules, date ordering, URL handling).
- `assertSkillsExist` — `src/lib/validation/skills.ts`.
- Helpers like `parse.ts` `readBodyText` (1 MB cap behavior).

A regression in the matching score silently changes the "Recommended" sort for
every user, and is currently caught only if an e2e test happens to assert it.

### Simple solution

1. `npm install -D vitest`.
2. Add `vitest.config.ts` with a `src/**/*.test.ts` include.
3. Write a small, focused test file per module:
   - `src/lib/matching/engine.test.ts` — perfect match = 100, empty skills = 0,
     required > optional weighting, level multipliers, recency decay boundaries
     (7 / 30 days), `scoreProjects` sort order.
   - `src/lib/username.test.ts` — Arabic transliteration, whitespace collapse,
     max length 24, dedupe `-2`, `-3` suffixes.
   - `src/lib/validation/schemas.test.ts` — whitespace-only rejection, date
     ordering, nullable-URL trimming.
4. Add `"test:unit": "vitest run"` to `package.json` and a step in
   `.github/workflows/test.yml` (cheap, runs in seconds).

These are pure functions with explicit specs in their comments — ideal first
unit tests and a template for future logic.

**Verification**: `npm run test:unit` green; `npm run type-check` and
`npm run lint` still clean.

**Effort**: M. **Risk**: none to the app — additive tests only.

---

## 6. Gap 5 — GitHub integration (PRD §6)

### The gap

PRD §6 (OAuth `read:user` / `public_repo`, imported profile stats, top-languages
→ skills auto-map, contribution graph) is the one major PRD feature never built.
There is no `githubSynced`/`githubUsername` on the contributor profile
(`prisma/schema.prisma`), and no API route for it.

The **enabling infra already exists**: GitHub is configured as a better-auth
social provider (`src/lib/auth.ts:17-21`) and account linking is enabled
(`accountLinking.enabled`, `src/lib/auth.ts:26-29`). So users can already sign in
with GitHub and get linked accounts — the missing piece is *fetching and
displaying* GitHub data.

### Simple solution (MVP — no new scopes)

1. Add `githubUsername` (nullable) to the contributor profile in the schema + migration.
2. New route `PATCH /api/contributors/github` — auth-guarded, rate-limited,
   accepts `{ username }` (validated with `slugSchema`-style rules), stores it.
3. Server-side fetch of the public profile via GitHub's unauthenticated REST API
   (`GET /api/users/{username}`) with a short cache — returns name, avatar,
   bio, public repos, followers.
4. On the contributor profile page, show the GitHub card and a "Refresh" button
   hitting the same route. Unauthenticated API is rate-limited (60 req/hr/IP),
   so add the existing `checkRateLimit` with a generous window.

Options if you want more: exchange the existing OAuth token (linked account) for
a `GET /user/repos?visibility=public` call to auto-import top languages and map
them onto the `Skill` taxonomy (`src/lib/validation/skills.ts` + `Skill` table).

### Why worth it

It's the "skills verification" value prop from the PRD and the natural
differentiator for a developer-contribution platform. The MVP avoids OAuth token
handling entirely and is a clean vertical slice.

**Verification**: sign in as a seeded user, set a GitHub username, confirm the
profile card renders fetched data; confirm a bogus username returns a clean 400.

**Effort**: L for the MVP (schema, route, UI, tests). **Risk**: low-medium —
unauthenticated GitHub API has rate limits; cache and rate-limit accordingly.

> Status note: implemented as the **MVP** — `PATCH /api/contributors/github`
> (auth + rate-limited) validates and stores a `githubUsername`, fetches the
> public profile over the unauthenticated API (`src/lib/github.ts`, 10-min
> in-process cache, `force` bypass), and persists it in `githubData`. The
> profile settings page renders the GitHub card (`GitHubCard.tsx`) with
> update/refresh actions. No new dependency, no OAuth token exchange.

---

## 7. Gap 6 — Product/traffic analytics

### The gap

The PRD's measurement model (§9.1–9.3 — contribution-acceptance rate, activation,
retention) has no implementation. There is no web analytics and no scheduled
reporting. Note: the admin **product metrics** dashboard already exists
(`src/app/[locale]/admin/analytics/page.tsx` + `src/app/api/admin/stats/route.ts`),
so the missing piece is *traffic/user-journey* data and *scheduled* reports.

### Simple solutions (independent, small)

Constraint: **no Vercel-only tooling** — the app may move off Vercel to another
PaaS, so both pieces must run on any host.

- **Traffic** (decision deferred — both are provider-agnostic):
  - **First-party Postgres** — a small `PageView` table + `POST
    /api/analytics/ingest` route (no cookies, hashed IP / no PII), plus a
    `<script>` or fetch tag in the root layout. Zero new infra or vendors; it is
    "just your own Postgres", so it runs anywhere and the admin stats route can
    read the same DB.
  - **Self-hosted Umami** — run Umami (open-source, GDPR-friendly) as its own
    instance on whatever PaaS you choose; richer dashboard, but one extra
    service to deploy/configure.
- **Weekly report**: add a **GitHub Actions `schedule:` workflow** (reliably
  host-independent — GitHub is already the repo home) that hits a small route
  (e.g. `POST /api/admin/weekly-report`, admin-guarded via a secret header)
  reusing `src/app/api/admin/stats/route.ts` queries and emailing the numbers
  via the existing `sendEmail` (`src/lib/email.ts`).

### Why worth it

You cannot tune onboarding or measure the north-star metric without *some*
signal. These two give coverage with almost no code and no vendor lock-in.

**Verification**: with the first-party option, confirm page views land in the
`PageView` table and show on the admin stats page after real traffic; with Umami,
view its dashboard. Confirm the GitHub Actions `schedule` run fires (Actions log)
and the email arrives.

**Effort**: S–M. **Risk**: low.

> Status note: direction agreed — weekly-report **cron will be a GitHub
> Actions `schedule:` workflow**, not a Vercel Cron. Traffic-analytics provider
> (first-party Postgres vs self-hosted Umami) is **deferred**; both remain
> PaaS-agnostic. CSP stays report-only until the choice is made.
>
> Status note: the weekly report is **implemented** — `POST
> /api/admin/weekly-report` (`src/app/api/admin/weekly-report/route.ts`),
> guarded by a timing-safe `x-cron-secret` header (`WEEKLY_REPORT_SECRET`, 404
> when unset), rate-limited, and emailed via the existing `sendEmail`. Stats are
> shared with the admin page through `getPlatformStats` (`src/lib/stats.ts`).
> The cron lives in `.github/workflows/weekly-report.yml` (`schedule:` Monday
> 06:00 UTC + `workflow_dispatch`), so it runs from GitHub regardless of the
> app host. Wire the Actions secrets `WEEKLY_REPORT_URL` + `WEEKLY_REPORT_SECRET`.

---

## 8. Gap 7 — Developer-onboarding README

### The gap

`README.md` is still the `create-next-app` boilerplate ("Open
[http://localhost:3000](http://localhost:3000) with your browser"). Meanwhile
the repo holds substantial knowledge in `context/PRD.md`, `PRODUCT.md`,
`DESIGN.md`, and `Plans/` that has no on-ramp. There's a real workflow an
incoming dev must reconstruct: `.env` from `.env.example`, `db:push`, `db:seed`,
`npm run dev`, the dev sign-in helper (`/api/dev/sign-in-as`, `ENABLE_DEV_LOGIN`),
`npm run test:validation` vs `npm test`, and the CI scripts.

### Simple solution

Rewrite `README.md` to a concise on-ramp:

1. Project blurb (point at `PRODUCT.md` + `context/PRD.md`).
2. Prerequisites (Node, PostgreSQL/Neon).
3. Setup: `cp .env.example .env` → fill → `npm ci` → `npm run db:push` → `npm run db:seed` → `npm run dev`.
4. Dev auth: the `sign-in-as` helper and its env flags.
5. Verification commands table: `lint`, `type-check`, `test:validation`, `test`, `audit:check`, `i18n:check`.
6. Link to `DESIGN.md`, `PRODUCT.md`, `Plans/`, and the e2e notes in `tests/e2e/README.md`.

**Verification**: an engineer with zero repo context can go from clone to a
running seeded app in the steps listed.

**Effort**: S. **Risk**: none.

---

## 9. Cross-cutting notes & dependencies

- **Gap 3 depends on nothing; Gap 4 should land before Gap 5** — unit tests make
  the matching engine safe to touch while building GitHub feature work.
- Gaps 1 and 2 are both "one file + config" changes and can be done in the same
  working session with no interference.
- Gap 2's CSP must be reconciled with Gap 6 later: first-party analytics needs
  no new CSP directives (same origin), while self-hosted Umami would need its
  host in `script-src`/`connect-src`. Keep the CSP report-only until the choice
  is made.
- The in-memory rate-limit fallback (Gap 3) keeps local dev and CI free of
  external accounts — important because the Playwright suite bursts through
  `/api/auth/*`.

## 10. Recommended execution order

```
1. Sentry (Gap 1)          — one edit at the single API choke point
2. Headers + CSP (Gap 2)   — one config file, report-only first
3. Redis rate limits (Gap 3) — store swap, fallback to Map
4. Vitest + unit tests (Gap 4) — protects engine/schemas before more features
5. GitHub integration (Gap 5) — biggest feature; comes after the safety net
6. GitHub Actions weekly-report cron (Gap 6) — then choose the analytics provider
7. README on-ramp (Gap 7)
```

## 11. Database schema drift & full-text search index (resolved)

The dev database had drifted from both the schema and the migration history:

- `User.role` existed as `text` (migrations declare the `UserRole` enum) — `prisma db push` refused to proceed because it would have dropped and recreated the column, losing every role.
- `Message_applicationId_idx` / `Message_senderId_idx` were missing (they are declared in the schema).
- `project_search_idx` exists on the live DB and is **permanently unmappable**: Prisma cannot model a GIN index over an `Unsupported("tsvector")` column nor the trigger-managed function that fills it (created by migration `0002`).

Resolution:

- New migration `0003_fix_schema_drift` promotes `role` to the enum with a data-preserving `USING` cast (the `'USER'::text` default is dropped first), recreates the message indexes idempotently, and re-ensures the search index.
- `npm run db:push` now runs `prisma migrate deploy` (additive-only sync). Running `prisma db push` directly will silently drop `project_search_idx` and break full-text search.
- CI `db-check` was using Prisma-6 flags (`--from-url`, `--to-schema-datamodel`) that Prisma 7 removed, so it was passing on error text rather than an empty diff. It now uses `--from-config-datasource` / `--to-schema` and tolerates exactly the single migration-managed `project_search_idx` statement, failing on any other drift.
- Optional: set `datasource.shadowDatabaseUrl` in `prisma.config.ts` to a disposable Neon branch if you want `migrate dev` / `migrate diff --from-migrations` to replay the chain locally.

> Status note on Gap 1: implemented as a **self-contained system error log** (Option B — Prisma `SystemErrorLog` table + admin UI), not Sentry, per product decision.
