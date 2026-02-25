# Waqf Platform GitHub Actions Workflow

This directory contains GitHub Actions workflows for CI/CD.

## Workflows

### test.yml
Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**

1. **test** - Runs E2E tests with Playwright
   - Installs dependencies
   - Generates Prisma client
   - Installs Playwright browsers
   - Runs all 91 E2E tests
   - Uploads test results and screenshots on failure

2. **lint** - Runs linting and type checking
   - ESLint validation
   - Next.js build

3. **db-check** - Validates database schema
   - Prisma generate
   - Schema validation
   - Migration diff check

## Required Secrets

Add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth secret key |
| `BETTER_AUTH_URL` | Production URL |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

## Setup

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the required secrets

## Running Locally

Before pushing, test locally:

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# View report
npm run test:report
```
