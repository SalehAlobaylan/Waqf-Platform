
# **Waqf Platform Open source - Product Requirements Document (PRD)**

**Platform Name**: Waqf (وقف)

***

## 1. Overview

### 1.1 Vision

Waqf is a bilingual (Arabic-first) platform connecting volunteer developers with Islamic open-source projects. Inspired by the Islamic concept of *waqf* (endowment/sadaqah jariyah), anyone can contribute their skills as an ongoing charity, and anyone can create projects that serve the Muslim ummah.

### 1.2 Core Value Proposition

- **For Developers**: Contribute skills as *sadaqah jariyah* — continuous charity through code
- **For Creators**: Build Islamic tech with support from the global Muslim developer community
- **For the Ummah**: Accelerate development of ethical, open-source Islamic tools that benefit generations


### 1.3 Success Definition

A successful match = Developer application is **accepted** by project owner, beginning their contribution as digital waqf.

***

## 2. User Types \& Permissions

| User Type | Can Apply | Can Create Project | Can Have Org Profile |
| :-- | :-- | :-- | :-- |
| **Developer** | ✅ | ✅ | Optional |
| **Organization** | ✅ | ✅ | Required |
| **Admin** | ✅ | ✅ (Moderated) | N/A |

### 2.1 User Identity Model

- Single account can be **both** contributor (waqif) and project creator (mutawalli)
- Users toggle between "modes" via context switcher
- Organization profile is optional layer on top of user account

***

## 3. Core Features

### 3.1 Landing Page

**Purpose**: Convert visitors to users, showcase active opportunities for digital waqf

**Components**:

- Hero section with platform value prop and Islamic ethos
- **Featured Projects** (horizontal scroll, 6 max) — highlighted waqf opportunities
- Platform stats (active projects, contributors, total waqf hours)
- How it works (3 steps): Discover → Contribute → Earn Hasanat
- Category grid (Quran, Prayer, Charity, Education, Community, Tools)
- CTA footer with sadaqah jariyah messaging

**Featured Project Logic**:

- Admin manually curates from published projects
- Shows: title, org/personal badge, category, 3 key skills, contributor count


### 3.2 Authentication \& Onboarding

#### Signup Flow

```
Landing → Choose Path → Account Details → Profile Setup → Dashboard
         /            \              /
   Contributor        Creator
   (Waqif)            (Mutawalli)
```


#### Onboarding Steps

**Contributor (Waqif) Path**:

1. **Account**: Email, password, name
2. **Profile**: Bio, avatar, location, timezone
3. **Skills**: Tech stack selection (taxonomy-based + custom)
4. **Availability**: Hours/week, preferred project types
5. **GitHub**: OAuth connection (optional but recommended)

**Creator (Mutawalli) Path**:

1. **Account**: Same as above
2. **Identity**: "Personal Project" or "Organization"
    - If Org: Org name, description, logo, website
3. **First Project**: Create initial project (can skip)

### 3.3 Developer Profile (Waqif Profile)

**Public Profile Sections**:

- **Header**: Name, avatar, location, timezone, availability badge, "Available for Waqf" status
- **About**: Bio (Markdown support), intention statement
- **Skills Matrix**: Grouped by category with proficiency levels
    - Frontend, Backend, Mobile, DevOps, Design, Other
    - Level: Beginner | Intermediate | Advanced | Expert
    - Years experience per skill (optional)
- **Custom Skills**: Free-text for niche tools
- **Portfolio**: Links to GitHub repos, live projects, case studies
- **GitHub Stats**: Auto-imported languages, contribution graph
- **Waqf History**: Past projects contributed to, hours volunteered
- **Contact**: Platform messaging + optional external links

**Edit Profile**:

- All fields editable
- Skills selector with search + category filter
- Drag-drop reorder for portfolio items


### 3.4 Project System (Waqf Opportunities)

#### Project Creation

**Fields**:

- Title (required)
- Slug (auto-generated, editable)
- Category (required): Quran, Prayer, Charity, Education, Community, Tools
- Description (Markdown, required)
- Impact statement (optional): How this project serves the Ummah
- Required skills (multi-select from taxonomy)
- Time commitment (optional): "5-10 hours/week"
- Duration estimate (optional): "3 months"
- Project type: Personal | Organization
- Language: Arabic | English | Both
- Country/Region (optional): SA, EG, UAE, Global, etc.
- GitHub repo URL (optional)
- Featured image/logo (optional)

**Publishing Flow**:

1. User fills form → Saves as Draft
2. Submit for review → Status: Pending
3. Admin approves → Status: Open (published)
4. OR Admin rejects → Back to draft with feedback

#### Project Statuses

- **Draft**: Editing, not visible
- **Pending**: Awaiting admin review
- **Open**: Accepting contributors (waqifs)
- **In Progress**: Team formed, development started
- **Completed**: Project delivered
- **Cancelled**: Archived, no longer active


#### Project Display

- Card view: Title, owner (personal/org badge), category, 3 key skills, contributor count, posted date
- Detail view: Full description, all skills, impact statement, owner full profile, "Contribute" button


### 3.5 Discovery \& Matching

#### Explore Page Layout

```
[Sidebar Filters] | [Results Grid]
                  |
                  |  [Sort: Relevance | Newest | Most Active]
                  |  [Active Filters: X Quran X React]
                  |
                  |  [Project Card] [Project Card] [Project Card]
                  |  [Project Card] [Project Card] [Project Card]
                  |
                  |  [Load More]
```


#### Filters

| Filter | Type | Options |
| :-- | :-- | :-- |
| Status | Toggle | Open only (default) / All |
| Category | Multi-select | Quran, Prayer, Charity, Education, Community, Tools |
| Skills | Multi-select | Taxonomy-based, searchable |
| Project Type | Single | All / Personal / Organization |
| Language | Multi-select | Arabic, English |
| Country/Region | Single | Saudi Arabia, Egypt, UAE, Global, etc. |
| Time Commitment | Range | 1-5, 5-10, 10-20, 20+ hrs/week |

#### Personalized Discovery Algorithm (MVP)

**Phase 1: Simple Scoring**

```typescript
// calculateMatchScore(contributor, project)
score = 0

// 1. Skills Match (70% weight)
requiredSkills = project.skills
contributorSkills = contributor.skills

matchedSkills = intersection(requiredSkills, contributorSkills)
skillScore = (matchedSkills.length / requiredSkills.length) * 70

// 2. Category Interest (15% weight)
if contributor.preferredCategories includes project.category:
  categoryScore = 15

// 3. Language Match (10% weight)
if contributor.languages includes project.language:
  languageScore = 10

// 4. Recency (5% weight)
daysSincePosted = today - project.createdAt
recencyScore = max(0, 5 - (daysSincePosted / 7)) // 5 points for week 1, decays

totalScore = skillScore + categoryScore + languageScore + recencyScore
```

**Phase 2: Enhanced (Post-MVP)**

- Add availability matching (hours/week alignment)
- Add timezone overlap scoring
- Add past contribution quality (GitHub analysis)
- Collaborative filtering (contributors like you joined...)


#### Sort Options

- **Recommended** (default): Personalized score desc
- **Newest**: createdAt desc
- **Most Active**: contributorCount desc
- **Closing Soon**: deadline asc (if deadline exists)


### 3.6 Contribution System (Application)

#### Contributor Application Flow

1. Click "Contribute" on project page
2. Modal opens with:
    - Pre-filled message: "As-salamu alaykum, I'm interested in contributing to this waqf project"
    - Optional: Cover letter textarea
    - Optional: Link to portfolio/GitHub repo
    - Hours/week availability confirmation
3. Submit application
4. Status: Pending → Awaiting project owner response

#### Application States

- **Pending**: Submitted, awaiting review
- **Accepted**: Owner approved, contribution begins (match successful)
- **Rejected**: Owner declined
- **Withdrawn**: Contributor cancelled


#### Project Owner View

**Incoming Applications Page**:

- List view: Applicant avatar, name, match score, applied date, status
- Filter by: Pending, Accepted, Rejected, All
- Sort by: Newest, Match Score

**Applicant Detail View**:

- Full contributor profile (read-only)
- Match score breakdown
- Application message
- Portfolio links
- GitHub contribution graph
- **Actions**: Accept, Reject, Message


### 3.7 Messaging System

#### In-Platform Messaging

**Scope**: Post-application communication only

**Flow**:

1. Contributor applies → Can message project owner
2. Owner can reply → Thread created
3. Conversation scoped to specific application

**Features**:

- Real-time messaging (WebSocket or polling)
- Read receipts
- Message history persists
- Email notification for new messages (optional)


#### External Contact

- After connection established, either party can share:
    - Email
    - Discord
    - GitHub
    - WhatsApp (popular in MENA)
- Optional field in profile: "Preferred external contact"


### 3.8 Notifications

**In-App Notification Types**:


| Event | Recipient | Content |
| :-- | :-- | :-- |
| Application received | Project owner | "[Name] wants to contribute to [Project]" |
| Application accepted | Contributor | "Your contribution to [Project] was accepted" |
| Application rejected | Contributor | "Your application to [Project] was declined" |
| New message | Both | "New message from [Name]" |
| Project approved | Creator | "Your waqf project [Title] is now live" |
| Project featured | Creator | "Your project was featured on the homepage" |

**UI**: Bell icon in header with red badge count, dropdown panel with recent notifications, "Mark all read" button.

***

## 4. Admin Features

### 4.1 Moderation Dashboard

**Project Review Queue**:

- Table: Project title, creator, category, submitted date, actions
- Actions: Approve, Reject (with reason), Request changes
- Bulk actions for trusted creators

**Content Moderation**:

- Reported projects list
- Reported users list
- Ban/suspend user functionality


### 4.2 Analytics Dashboard

**Key Metrics**:

- Total users (contributors, creators, orgs)
- Active projects (open, in-progress)
- Total applications (pending, accepted, rejected)
- Match success rate (accepted / total applications)
- Top categories by project count
- Top skills in demand
- Featured project performance (views, applications)

**Visualizations**:

- Line chart: New users/projects over time
- Bar chart: Projects by category
- Pie chart: Applications by status
- Table: Most active projects


### 4.3 Featured Curation

- Search/filter all approved projects
- Select up to 6 for homepage rotation
- Set featured expiration date
- Track featured project performance

***

## 5. Internationalization (i18n)

### 5.1 Language Strategy

- **Primary**: Arabic (RTL)
- **Secondary**: English (LTR)
- **Future**: Expand based on user demand


### 5.2 Implementation

```typescript
// next-intl configuration
locales: ['ar', 'en']
defaultLocale: 'ar'
```


### 5.3 Content Filtering

**Project Language Field**:

- Arabic only
- English only
- Arabic + English (bilingual)

**User Preference**:

- Interface language (independent from project language)
- Preferred project languages (filter)


### 5.4 Regional Support

**Country/Region Field** (optional on projects):

- Helps users find local or culturally relevant projects
- Examples: Saudi Arabia, Egypt, UAE, Global/Universal

**Timezone Display**:

- All times shown in user's local timezone
- Availability hours converted automatically


### 5.5 RTL Considerations

- Full RTL layout for Arabic
- Shadcn/ui components support RTL
- Icons may need mirroring (arrows, navigation)
- Text alignment: right for Arabic, left for English

***

## 6. GitHub Integration

### 6.1 OAuth Scopes

- `read:user` - Basic profile
- `read:email` - Email address
- `public_repo` - Access public repositories (for contribution analysis)


### 6.2 Imported Data

**Profile Section**:

- Username, bio, avatar
- Public repository count
- Followers/following counts

**Skills Verification**:

- Top languages by repository (auto-mapped to skills)
- Pinned repositories (links added to portfolio)
- Contribution graph (last 1 year)
- Total commits (public repos only)

**Optional Sync**:

- Button: "Sync GitHub Data" (manual refresh)
- Background sync on login (weekly)

***

## 7. Technical Specifications

### 7.1 Tech Stack

| Layer | Technology |
| :-- | :-- |
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| State (Client) | Zustand |
| State (Server) | TanStack Query |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (GitHub OAuth + Credentials) |
| File Uploads | UploadThing |
| Email | Resend |
| Search | PostgreSQL Full-Text (Algolia for v2) |

### 7.2 Database Schema (Key Entities)

```prisma
// Users & Profiles
User
- id, email, name, avatar, emailVerified, createdAt

ContributorProfile (formerly DeveloperProfile)
- id, userId, bio, timezone, hoursPerWeek, isAvailable
- skills: ContributorSkill[]
- languages: String[]
- githubSynced: Boolean, githubUsername: String?

Organization
- id, userId, name, slug, description, logo, website, verified

// Skills
Skill
- id, name, category, aliases

ContributorSkill
- id, contributorId, skillId, level (Beginner|Intermediate|Advanced|Expert), yearsExperience

// Projects (Waqf Opportunities)
Project
- id, ownerId, organizationId?, title, slug, description, impact
- category, language, country?, status (Draft|Pending|Open|InProgress|Completed|Cancelled)
- timeCommitment, duration, githubUrl, featured, featuredUntil, createdAt

ProjectSkill
- id, projectId, skillId, isRequired

// Applications (Contributions)
Application
- id, projectId, contributorId, status, message, portfolioUrl?, hoursPerWeek, createdAt

// Messages
Message
- id, applicationId, senderId, content, readAt, createdAt

// Notifications
Notification
- id, userId, type, title, content, read, link, createdAt
```


### 7.3 API Routes

**Auth**:

- POST /api/auth/register
- POST /api/auth/login
- GET/POST /api/auth/[...nextauth]

**Projects**:

- GET /api/projects (list with filters)
- POST /api/projects (create)
- GET /api/projects/[slug] (detail)
- PATCH /api/projects/[slug] (update)
- POST /api/projects/[slug]/apply (apply)

**Contributors**:

- GET /api/contributors (list)
- GET /api/contributors/[id] (profile)
- PATCH /api/contributors/profile (update)
- POST /api/contributors/skills (add skill)
- DELETE /api/contributors/skills/[id] (remove skill)

**Applications**:

- GET /api/applications (my applications)
- GET /api/applications/incoming (received applications)
- PATCH /api/applications/[id] (accept/reject)

**Messages**:

- GET /api/applications/[id]/messages
- POST /api/applications/[id]/messages

**Admin**:

- GET /api/admin/projects/pending
- PATCH /api/admin/projects/[id]/approve
- GET /api/admin/analytics

***

## 8. UI/UX Guidelines

### 8.1 Design System

- **Primary Color**: Islamic green (\#1E6F5C) or teal
- **Secondary**: Sand/gold accents
- **Background**: White/light gray (clean, modern)
- **Cards**: Subtle shadows, rounded corners (lg)
- **Typography**: Inter (EN) + Noto Sans Arabic (AR)


### 8.2 Key Patterns

- **Mobile-first**: All layouts responsive
- **Loading states**: Skeleton screens for lists
- **Empty states**: Illustration + CTA for no results
- **Error states**: Clear messages with recovery actions
- **Success states**: Toast notifications for actions


### 8.3 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Focus indicators

***

## 9. Success Metrics \& KPIs

### 9.1 North Star

**Contribution Acceptance Rate** = Accepted Applications / Total Applications

Target: >40% (industry standard for volunteer platforms)

### 9.2 Secondary Metrics

- **User Activation**: % completing profile within 24h of signup
- **Project Publish Rate**: Projects reaching Open status
- **Time to First Contribution**: Days from signup to accepted application
- **Retention**: 30-day return rate for contributors
- **Featured Project Engagement**: Applications per featured project vs. organic


### 9.3 Tracking

- Mixpanel/Amplitude for user journeys
- PostgreSQL analytics views for admin dashboard
- Weekly reporting email to admin
