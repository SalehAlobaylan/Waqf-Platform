# E2E Tests for Waqf Platform

This directory contains end-to-end (E2E) tests using Playwright to test all user flows in the Waqf Platform application.

## Setup

1. Install dependencies (already installed):
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

## Running Tests

### Run all tests
```bash
npm test
```

### Run API validation contract tests
```bash
npm run test:validation
```

### Run API validation tests in headed mode
```bash
npm run test:validation:headed
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests in headed mode
```bash
npm run test:headed
```

### View test report
```bash
npm run test:report
```

## Test Structure

### Test Files

- `auth.spec.ts` - Authentication flow tests
  - User registration (signup)
  - User login
  - GitHub OAuth
  - Locale switching
  - Password validation
  - Form validation

- `projects.spec.ts` - Projects flow tests
  - Explore page
  - Project details
  - Category filtering
  - Search functionality
  - Project application

- `applications.spec.ts` - Applications flow tests
  - View my applications
  - Application details
  - Application status
  - Access control

- `messages.spec.ts` - Messages flow tests
  - Messages page
  - Chat interface
  - Access control

- `profile.spec.ts` - Profile flow tests
  - View own profile
  - View other profiles
  - Edit profile
  - Skills display

- `navigation.spec.ts` - Navigation flow tests
  - Header navigation
  - Dashboard navigation
  - Locale switching
  - Footer
  - Breadcrumbs

- `admin.spec.ts` - Admin flow tests
  - Admin dashboard access
  - Projects management
  - Users management
  - Analytics

- `search.spec.ts` - Search flow tests
  - Search page
  - Search filters
  - Search results

- `notifications.spec.ts` - Notifications flow tests
  - Notification bell
  - Notification types
  - Notification actions
  - Access control

### Fixtures

- `fixtures/user.ts` - Test user fixtures and helper functions

## Test Coverage

The E2E tests cover:

✅ Authentication
  - Signup with form validation
  - Login with credentials
  - GitHub OAuth
  - Password requirements
  - Error handling

✅ Projects
  - Browse explore page
  - View project details
  - Filter by category
  - Search projects
  - Apply to projects

✅ Applications
  - View my applications
  - Application details
  - Status tracking (pending/accepted)
  - Access control

✅ Messages
  - View conversations
  - Chat interface
  - Send messages
  - Access control

✅ Profile
  - View own profile
  - View other profiles
  - Skills display
  - Contribution stats

✅ Navigation
  - Main navigation
  - Dashboard navigation
  - Locale switching (en/ar)
  - Footer links

✅ Admin
  - Admin dashboard
  - Projects management
  - Users management
  - Analytics

✅ Search
  - Search page
  - Filters (category, skills)
  - Results display

✅ Notifications
  - Notification bell
  - Unread count
  - Mark as read
  - Notification types

## Notes

- Tests are configured to run against `http://localhost:3000`
- The dev server is automatically started by Playwright
- Some tests may require existing data (users, projects) in the database
- Tests include fallback logic for conditional elements
- Screenshots are taken on test failures

## Validation Contract

All API validation failures should return:

- `400` status
- JSON payload:
  - `error: "Validation failed"`
  - `details: Array<{ path: string; message: string }>`

Guardrail behavior:

- `401/403` auth and permission failures keep their own shape
- validation contract tests assert paths, not exact message copy
- see `tests/e2e/api/validation-matrix.md` for coverage targets
