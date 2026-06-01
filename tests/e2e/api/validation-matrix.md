# API Validation Coverage Matrix

This matrix captures negative input coverage for API validation contracts.

Validation contract assertions:
- Status: `400`
- Body shape: `{ error: "Validation failed", details: [{ path, message }] }`
- Path-focused assertions are preferred over exact message matching.

## Public endpoints

| Route | Method | Input | Expected | Path |
| --- | --- | --- | --- | --- |
| `/api/search` | GET | `q=a` | `400` | `q` |
| `/api/search` | GET | `status=invalid` | `400` | `status` |
| `/api/explore` | GET | `limit=999` | `400` | `limit` |
| `/api/projects` | GET | `status=bad-status` | `400` | `status` |
| `/api/projects` | GET | `sortBy=ranked` | `400` | `sortBy` |
| `/api/skills` | GET | `q=<130 chars>` | `400` | `q` |

## Auth/role guardrails

| Route | Method | Input | Expected | Notes |
| --- | --- | --- | --- | --- |
| `/api/applications` | POST | invalid body unauthenticated | `401` | Auth precedence |
| `/api/notifications` | PATCH | invalid body unauthenticated | `401` | Auth precedence |
| `/api/reports` | POST | invalid body unauthenticated | `401` | Auth precedence |
| `/api/messages` | GET | missing query unauthenticated | `401` | Auth precedence |
| `/api/reports` | GET | invalid status unauthenticated | `403` | Role/auth precedence |

## Next expansion targets

- `/api/projects/[id]` (`params`, update payload) ✅ param + auth precedence
- `/api/projects/[id]/status` (transition payload) ✅ auth precedence
- `/api/messages/[id]/read` (`params`) ✅ auth precedence
- `/api/reports/[id]` (`params`, update payload) ✅ auth/role precedence
- `/api/applications/[id]` (`params`) ✅ auth precedence

## Dynamic param routes covered

| Route | Method | Input | Expected | Notes |
| --- | --- | --- | --- | --- |
| `/api/projects/[id]` | GET | `id > 128 chars` | `400` | `id` path validation |
| `/api/projects/[id]/similar` | GET | `id > 128 chars` | `400` | `id` path validation |
| `/api/projects/[id]/view` | POST | `id > 128 chars` | `400` | `id` path validation |
| `/api/contributors/[id]` | GET | `id=%20` | `400` | `id` required after trim |
| `/api/messages/[id]/read` | PATCH | unauthenticated | `401` | auth precedence |
| `/api/applications/[id]` | DELETE | unauthenticated | `401` | auth precedence |

## Route body guardrails covered

| Route | Method | Input | Expected | Notes |
| --- | --- | --- | --- | --- |
| `/api/projects/[id]` | PUT | empty body, unauthenticated | `401` | auth precedence |
| `/api/projects/[id]/status` | PATCH | invalid status, unauthenticated | `401` | auth precedence |
| `/api/reports/[id]` | PATCH | invalid status, unauthenticated | `401/403` | auth/role precedence |
