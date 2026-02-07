# Waqf Platform - Implementation Roadmap

> **Goal**: Complete all remaining PRD features to reach production-ready status.
> **Baseline**: Phase 1 infrastructure + Matching Engine are complete (~15%).

---

## Phase 2: Core Features (Weeks 1-3)

### 2.1 Authentication System
**Timeline**: 2-3 days | **PRD**: §3.2

| Task | Priority | Effort |
|------|----------|--------|
| Install NextAuth.js + Prisma adapter | P0 | 1hr |
| GitHub OAuth provider setup | P0 | 2hr |
| Email/password credentials provider | P0 | 3hr |
| Signup page (`/signup`) | P0 | 3hr |
| Login page (`/login`) | P0 | 2hr |
| Protected routes middleware | P0 | 2hr |
| Session context provider | P0 | 1hr |
| User role selection (Waqif/Mutawalli) | P1 | 2hr |

**Files to Create**:
```
src/app/api/auth/[...nextauth]/route.ts
src/lib/auth.ts
src/app/[locale]/(auth)/login/page.tsx
src/app/[locale]/(auth)/signup/page.tsx
src/components/auth/LoginForm.tsx
src/components/auth/SignupForm.tsx
src/middleware.ts (update)
```

---

### 2.2 User Profiles
**Timeline**: 3-4 days | **PRD**: §3.3

| Task | Priority | Effort |
|------|----------|--------|
| Profile page (`/profile/[id]`) | P0 | 4hr |
| Edit profile page (`/settings/profile`) | P0 | 4hr |
| Skills matrix component | P0 | 3hr |
| Availability toggle | P1 | 1hr |
| Portfolio section | P1 | 3hr |
| GitHub sync (OAuth + stats) | P2 | 4hr |
| Contributor API endpoints | P0 | 3hr |

**Files to Create**:
```
src/app/[locale]/profile/[id]/page.tsx
src/app/[locale]/settings/profile/page.tsx
src/components/profile/ProfileHeader.tsx
src/components/profile/SkillsMatrix.tsx
src/components/profile/PortfolioGrid.tsx
src/components/profile/EditProfileForm.tsx
src/app/api/users/[id]/route.ts
src/app/api/contributors/[id]/route.ts
```

---

### 2.3 Project System
**Timeline**: 4-5 days | **PRD**: §3.4

| Task | Priority | Effort |
|------|----------|--------|
| Create project form (`/projects/new`) | P0 | 5hr |
| Project detail page (`/projects/[slug]`) | P0 | 4hr |
| Edit project page | P0 | 3hr |
| Project status workflow (Draft→Open) | P0 | 3hr |
| Organization profile page | P1 | 4hr |
| Project API CRUD endpoints | P0 | 4hr |
| Image upload (UploadThing) | P2 | 3hr |

**Files to Create**:
```
src/app/[locale]/projects/new/page.tsx
src/app/[locale]/projects/[slug]/page.tsx
src/app/[locale]/projects/[slug]/edit/page.tsx
src/components/projects/CreateProjectForm.tsx
src/components/projects/ProjectCard.tsx
src/components/projects/ProjectDetail.tsx
src/app/api/projects/route.ts (POST)
src/app/api/projects/[id]/route.ts (GET, PUT, DELETE)
```

---

## Phase 3: Discovery & Matching (Week 2)

### 3.1 Explore Page
**Timeline**: 2-3 days | **PRD**: §3.5

| Task | Priority | Effort |
|------|----------|--------|
| Explore page layout (`/explore`) | P0 | 4hr |
| Filter sidebar component | P0 | 4hr |
| Project grid with cards | P0 | 3hr |
| Sort dropdown (Recommended, Newest) | P1 | 2hr |
| Infinite scroll / pagination | P1 | 2hr |
| Active filter chips | P1 | 1hr |

**Adapt from Figma**: `Plans/Waqf Platform Figma/src/components/ExplorePage.tsx`

---

### 3.2 Advanced Search
**Timeline**: 1-2 days | **PRD**: §3.5

| Task | Priority | Effort |
|------|----------|--------|
| PostgreSQL Full-Text Search (tsvector) | P1 | 3hr |
| Search API (`GET /api/search`) | P1 | 2hr |
| Search bar component | P1 | 2hr |
| Search results page | P2 | 2hr |

**Database Migration**:
```sql
ALTER TABLE "Project" ADD COLUMN "search_vector" tsvector;
CREATE INDEX project_search_idx ON "Project" USING GIN(search_vector);
```

---

## Phase 4: Contribution Flow (Week 3)

### 4.1 Application System
**Timeline**: 3-4 days | **PRD**: §3.6

| Task | Priority | Effort |
|------|----------|--------|
| Apply modal component | P0 | 3hr |
| Application API (`POST /api/applications`) | P0 | 2hr |
| My applications page (`/dashboard/applications`) | P0 | 3hr |
| Incoming applications for project owner | P0 | 4hr |
| Accept/Reject workflow | P0 | 3hr |
| Match score display in applicant view | P1 | 2hr |

**Files to Create**:
```
src/components/applications/ApplyModal.tsx
src/components/applications/ApplicationCard.tsx
src/app/[locale]/dashboard/applications/page.tsx
src/app/[locale]/projects/[slug]/applications/page.tsx
src/app/api/applications/route.ts
src/app/api/applications/[id]/route.ts
```

---

### 4.2 Messaging System
**Timeline**: 2-3 days | **PRD**: §3.7

| Task | Priority | Effort |
|------|----------|--------|
| Install Pusher (pusher + pusher-js) | P0 | 1hr |
| Message API with Pusher events | P0 | 3hr |
| ChatWindow component | P0 | 4hr |
| Read receipts | P1 | 2hr |
| Message list in dashboard | P1 | 2hr |

**Files to Create**:
```
src/lib/pusher.ts (server + client)
src/components/chat/ChatWindow.tsx
src/components/chat/MessageBubble.tsx
src/app/api/messages/route.ts
src/app/api/messages/[id]/read/route.ts
```

---

## Phase 5: Notifications & Polish (Week 4)

### 5.1 Notification System
**Timeline**: 1-2 days | **PRD**: §3.8

| Task | Priority | Effort |
|------|----------|--------|
| Notification creation service | P0 | 2hr |
| Bell icon with badge in header | P0 | 2hr |
| Notification dropdown panel | P0 | 3hr |
| Mark as read functionality | P1 | 1hr |
| Email notifications (Resend) | P2 | 3hr |

---

### 5.2 Landing Page
**Timeline**: 1 day | **PRD**: §3.1

| Task | Priority | Effort |
|------|----------|--------|
| Port Figma LandingPage component | P0 | 4hr |
| Featured projects carousel | P1 | 2hr |
| Platform stats (live from DB) | P1 | 2hr |
| Category grid | P1 | 1hr |

**Adapt from Figma**: `Plans/Waqf Platform Figma/src/components/LandingPage.tsx`

---

## Phase 6: Admin Dashboard (Week 4-5)

### 6.1 Moderation
**Timeline**: 2 days | **PRD**: §4.1

| Task | Priority | Effort |
|------|----------|--------|
| Admin layout + route guards | P0 | 2hr |
| Project review queue | P0 | 4hr |
| Approve/Reject with feedback | P0 | 2hr |
| User management table | P2 | 3hr |

---

### 6.2 Analytics
**Timeline**: 2 days | **PRD**: §4.2

| Task | Priority | Effort |
|------|----------|--------|
| Stats aggregation queries | P1 | 3hr |
| Dashboard with Recharts | P1 | 4hr |
| Featured project curation | P2 | 3hr |

---

## Summary Timeline

| Phase | Focus | Duration |
|-------|-------|----------|
| **Phase 2** | Auth + Profiles + Projects | Week 1-2 |
| **Phase 3** | Explore + Search | Week 2 |
| **Phase 4** | Applications + Messaging | Week 3 |
| **Phase 5** | Notifications + Landing | Week 4 |
| **Phase 6** | Admin Dashboard | Week 4-5 |

**Total Estimated Time**: 4-5 weeks for full feature parity with PRD.

---

## Dependencies to Install

```bash
# Authentication
npm install next-auth @next-auth/prisma-adapter

# Real-time Messaging
npm install pusher pusher-js

# Charts
npm install recharts

# File Upload
npm install uploadthing @uploadthing/react

# Email
npm install resend

# Date utilities
npm install date-fns
```

---

## Quick Start Command

After installing dependencies:
```bash
npm run dev                  # Start dev server
docker-compose up -d db      # Start PostgreSQL
npm run db:push              # Apply schema
npm run db:seed              # Seed skills
```
