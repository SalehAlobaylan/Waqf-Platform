---
name: compatibility-check
description: Validates that recent code changes are compatible with the existing app flow and e2e tests. Use this after adding a new feature, route, component, schema change, or any significant code change. Also trigger when the user says things like "check compatibility", "does this break anything", "validate the flow", "run checks", or "test this".
---

# Compatibility Check

After code changes, do a quick sanity check across three layers. Don't overthink it — just catch the obvious breaks.

## What to check

### 1. Schema & Data (only if prisma/schema.prisma changed)

- Read the schema diff (`git diff prisma/schema.prisma`)
- Check if new/renamed fields are referenced correctly in the codebase
- If a model changed, grep for usages in `src/` and flag any that look stale
- Check if `npx prisma validate` passes

### 2. Route & Flow Compatibility

- If new pages were added under `src/app/`, check they follow the existing `[locale]` pattern
- If auth-protected routes were added, verify they have session checks (look at sibling pages for the pattern)
- If new API routes were added under `src/app/api/`, check they export the right HTTP methods and follow existing patterns
- Quick grep: does any component import something that was renamed or moved?

### 3. E2E Test Coverage

- Look at what changed: `git diff --name-only`
- Cross-reference with existing tests in `tests/e2e/` to see if any test might break
- If a new user-facing page or flow was added and no test covers it, write a minimal test following the existing patterns in `tests/e2e/`
- Test fixtures are in `tests/fixtures/user.ts` — use those

## How to run

1. Start with the code analysis (steps 1 & 2). This is fast and catches most issues.
2. If something looks off, or if schema/routes changed, run `npx playwright test --reporter=list` to verify.
3. If tests fail, read the failure output and fix the issue.
4. If new e2e tests were written, run only those: `npx playwright test tests/e2e/<new-file>.spec.ts`

## Output

Keep it short. Report:
- What you checked
- Any issues found (and fixes applied)
- Whether tests pass
- Any new tests written

Don't list things that are fine — only mention problems or new additions.

## Things to skip

- Don't run tests if only styles/CSS changed
- Don't rewrite existing tests unless they actually break
- Don't add tests for admin-only internal pages unless asked
- Don't run the full suite if the change is small — just run the relevant spec file
