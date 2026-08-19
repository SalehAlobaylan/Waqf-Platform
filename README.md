# Waqf Platform

A bilingual (Arabic/English) open-source contribution platform where developers
find projects, apply with skills, and build verified public profiles. For the
product vision and detailed requirements see [PRODUCT.md](./PRODUCT.md) and
[context/PRD.md](./context/PRD.md); design decisions live in
[DESIGN.md](./DESIGN.md); production-readiness analysis and the execution plan
are in [Plans/Gap-Analysis.md](./Plans/Gap-Analysis.md).

## Prerequisites

- Node.js 20+
- PostgreSQL (local Postgres or a hosted provider such as Neon)
- npm 10+

## Setup

```bash
# 1. Environment: copy the template and fill in the values
cp .env.example .env

# 2. Install dependencies (runs `prisma generate` via postinstall)
npm ci

# 3. Apply database migrations
npm run db:push

# 4. Seed the database (admin + regular demo users, sample projects)
npm run db:seed

# 5. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Required env vars are `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`,
and `NEXT_PUBLIC_APP_URL`. All other vars in `.env.example` are optional and
gate their feature (GitHub/Google OAuth, UploadThing, Resend email, Pusher
messaging, dev login, weekly report).

> Do not use `prisma db push` directly — `npm run db:push` runs
> `prisma migrate deploy`, and raw `db push` would silently drop the
> migration-managed full-text search index. Local schema changes go through
> `npm run db:migrate:dev`.

## Dev sign-in

For local work and tests, mint a session for any seeded user without email
delivery. In `.env` set **both**:

```bash
ENABLE_DEV_LOGIN="true"
NEXT_PUBLIC_ENABLE_DEV_LOGIN="true"
```

Then use the quick sign-in panel on the login page (or hit
`POST /api/dev/sign-in-as`). Seeded accounts are listed in `prisma/seed.ts`.
Keep these flags off in preview, staging, and production.

## Verification commands

| Purpose | Command |
| --- | --- |
| Lint | `npm run lint` |
| Type check | `npm run type-check` |
| Unit tests (Vitest) | `npm run test:unit` |
| API contract tests (Playwright) | `npm run test:validation` |
| Full e2e tests (Playwright) | `npm test` |
| Dependency audit | `npm run audit:check` |
| i18n key parity (en/ar) | `npm run i18n:check` |
| Database schema in sync with migrations | see the `db-check` job in `.github/workflows/test.yml` |

E2E details, seeded users, and conventions are documented in
[tests/e2e/README.md](./tests/e2e/README.md).

## CI

`.github/workflows/test.yml` runs lint, type-check, build, dependency audit,
i18n parity, unit tests, API contract tests, full e2e tests, and a database
schema-drift check on push/PR to `main` and `develop`. `.github/workflows/weekly-report.yml`
sends the weekly admin summary email on a schedule (host-independent; not tied
to a specific PaaS).