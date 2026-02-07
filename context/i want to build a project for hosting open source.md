<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# i want to build a project for hosting open source project and connect them with volunteering developers for islamic projects and apps

-users have profiles to show their skills and tech stacks and contact info

- organizations can publish a request to accept volunteers for thier project,
you know the idea right?
i just want it for islamic software projects

next.js zutsand shadcn monolithic prisma, DATABASE_URL

help me build the idea

This is a solid idea with real demand—Muslim tech communities are actively seeking ethical open-source alternatives and skilled contributors to projects like Qur'an apps, prayer time APIs, and Islamic content platforms. Let me help you architect this properly.[^1_1][^1_2]

## Project Overview: **UmmahDevs** (suggested name)

A platform connecting Islamic open-source projects with volunteering developers. Two-sided marketplace:

- **Developers**: Create profiles showcasing skills, tech stacks, availability, and portfolio
- **Organizations**: Publish volunteer requests with required skills, time commitment, and project details


## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  DEVELOPER
  ORGANIZATION
  ADMIN
}

enum ProjectStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
  WITHDRAWN
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String?   // null for OAuth users
  role          UserRole  @default(DEVELOPER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Profile
  name          String
  avatar        String?
  bio           String?   @db.Text
  location      String?
  website       String?
  githubUrl     String?
  linkedinUrl   String?
  twitterUrl    String?
  
  // Relations
  developerProfile DeveloperProfile?
  organization     Organization?
  applications     Application[]
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  notifications    Notification[]
  
  @@map("users")
}

model DeveloperProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Skills & Tech Stack
  skills          DeveloperSkill[]
  languages       String[] // Programming languages
  frameworks      String[] // React, Next.js, etc.
  tools           String[] // Docker, Git, etc.
  
  // Availability
  timeZone        String
  hoursPerWeek    Int?
  availableFrom   DateTime?
  isAvailable     Boolean  @default(true)
  
  // Experience
  yearsExperience Int?
  portfolioUrl    String?
  
  // Projects
  contributions   Contribution[]
  
  @@map("developer_profiles")
}

model Skill {
  id          String   @id @default(cuid())
  name        String   @unique
  category    String   // frontend, backend, mobile, design, devops, etc.
  iconUrl     String?
  
  developers  DeveloperSkill[]
  projects    ProjectSkill[]
  
  @@map("skills")
}

model DeveloperSkill {
  id              String   @id @default(cuid())
  developerId     String
  developer       DeveloperProfile @relation(fields: [developerId], references: [id], onDelete: Cascade)
  skillId         String
  skill           Skill    @relation(fields: [skillId], references: [id], onDelete: Cascade)
  level           SkillLevel @default(INTERMEDIATE)
  
  @@unique([developerId, skillId])
  @@map("developer_skills")
}

model Organization {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name        String
  slug        String   @unique
  description String   @db.Text
  logo        String?
  website     String?
  githubOrg   String?
  verified    Boolean  @default(false)
  
  projects    Project[]
  
  @@map("organizations")
}

model Project {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  title           String
  slug            String   @unique
  description     String   @db.Text
  readme          String?  @db.Text // Markdown content
  status          ProjectStatus @default(OPEN)
  
  // GitHub/Repo info
  repoUrl         String?
  isOpenSource    Boolean  @default(true)
  license         String?
  
  // Islamic context
  category        String   // quran, prayer, charity, education, community, etc.
  impact          String?  @db.Text // How this helps the Ummah
  
  // Requirements
  skills          ProjectSkill[]
  timeCommitment  String?  // e.g., "5-10 hours/week"
  duration        String?  // e.g., "3 months"
  deadline        DateTime?
  
  // Settings
  remoteOnly      Boolean  @default(true)
  arabicRequired  Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  applications    Application[]
  
  @@map("projects")
}

model ProjectSkill {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  skillId     String
  skill       Skill    @relation(fields: [skillId], references: [id], onDelete: Cascade)
  isRequired  Boolean  @default(true)
  
  @@unique([projectId, skillId])
  @@map("project_skills")
}

model Application {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  developerId     String
  developer       User     @relation(fields: [developerId], references: [id], onDelete: Cascade)
  
  status          ApplicationStatus @default(PENDING)
  coverLetter     String?  @db.Text
  proposedHours   Int?     // Hours per week they can commit
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  messages        Message[]
  
  @@unique([projectId, developerId])
  @@map("applications")
}

model Contribution {
  id              String   @id @default(cuid())
  developerId     String
  developer       DeveloperProfile @relation(fields: [developerId], references: [id], onDelete: Cascade)
  
  projectName     String
  projectUrl      String?
  description     String   @db.Text
  skillsUsed      String[]
  startDate       DateTime
  endDate         DateTime?
  
  @@map("contributions")
}

model Message {
  id              String   @id @default(cuid())
  applicationId   String
  application     Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  senderId        String
  sender          User     @relation("SentMessages", fields: [senderId], references: [id])
  recipientId     String
  recipient       User     @relation("ReceivedMessages", fields: [recipientId], references: [id])
  content         String   @db.Text
  readAt          DateTime?
  createdAt       DateTime @default(now())
  
  @@map("messages")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // application_received, application_accepted, new_message, etc.
  title     String
  content   String
  read      Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())
  
  @@map("notifications")
}
```


## Core Features

### For Developers

- **Profile Builder**: Skills matrix with proficiency levels, tech stack tags, GitHub integration
- **Project Discovery**: Filter by skills needed, time commitment, Islamic category (Qur'an apps, prayer tools, charity platforms)
- **One-Click Apply**: Submit interest with cover letter and availability
- **Messaging**: Direct communication with project maintainers
- **Portfolio**: Track contributions and impact metrics


### For Organizations

- **Project Posting**: Rich markdown editor, skill requirements, time expectations
- **Applicant Review**: View developer profiles, skills match percentage, portfolio
- **Application Management**: Accept/reject with automated notifications
- **Organization Profile**: Verified badges, project history, impact stats


### Matching Algorithm (MVP)

```typescript
// Simple skill-based matching score
function calculateMatchScore(
  developerSkills: DeveloperSkill[],
  projectSkills: ProjectSkill[]
): number {
  const requiredSkills = projectSkills.filter(ps => ps.isRequired);
  const totalWeight = projectSkills.length;
  
  let matchedWeight = 0;
  
  for (const ps of projectSkills) {
    const ds = developerSkills.find(d => d.skillId === ps.skillId);
    if (ds) {
      const levelMultiplier = {
        BEGINNER: 0.5,
        INTERMEDIATE: 1,
        ADVANCED: 1.5,
        EXPERT: 2
      }[ds.level];
      matchedWeight += levelMultiplier;
    }
  }
  
  // Bonus for matching all required skills
  const allRequiredMatched = requiredSkills.every(rs => 
    developerSkills.some(ds => ds.skillId === rs.skillId)
  );
  
  return Math.round((matchedWeight / totalWeight) * 100) + (allRequiredMatched ? 10 : 0);
}
```


## Technical Architecture

### Frontend Stack

- **Next.js 14+** (App Router): Server components for SEO, ISR for project listings
- **Zustand**: Global state for auth, notifications, theme
- **Shadcn/ui**: Component library with custom Islamic-themed palette
- **TanStack Query**: Server state management, caching, optimistic updates
- **React Hook Form + Zod**: Type-safe forms


### Backend (Monolithic)

- **Next.js API Routes** (`/app/api`): Keep it simple, extract to services if needed
- **Prisma ORM**: Type-safe database access
- **NextAuth.js**: Credential + GitHub OAuth for developers
- **UploadThing**: Image uploads for avatars/logos
- **Resend**: Email notifications


### Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── developers/
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── [slug]/
│   │   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── applications/
│   │   └── profile/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── projects/
│   │   ├── applications/
│   │   └── webhooks/
│   └── layout.tsx
├── components/
│   ├── ui/           # shadcn components
│   ├── projects/     # project-specific components
│   ├── developers/   # developer profile components
│   └── forms/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── stores/
│   └── auth-store.ts # Zustand store
├── types/
│   └── index.ts
└── hooks/
    └── use-projects.ts
```


## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

1. Scaffold Next.js project with shadcn
2. Setup Prisma schema and PostgreSQL
3. Configure NextAuth with GitHub OAuth
4. Build basic layout and navigation

### Phase 2: Profiles (Week 3)

1. Developer profile creation/editing
2. Skills selector with autocomplete
3. Organization profile setup
4. GitHub profile sync (optional)

### Phase 3: Projects (Week 4)

1. Project CRUD for organizations
2. Project listing with filters
3. Project detail page
4. Markdown rendering for descriptions

### Phase 4: Matching (Week 5)

1. Application system (apply, review, accept)
2. Basic matching algorithm
3. Email notifications (Resend)
4. Application dashboard

### Phase 5: Communication (Week 6)

1. Messaging system between applicants and orgs
2. Real-time notifications
3. Message thread UI

### Phase 6: Polish (Week 7-8)

1. Search functionality (full-text on projects)
2. Arabic RTL support (critical for your market)
3. SEO optimization
4. Performance tuning

## Key Design Decisions

| Aspect | Decision | Rationale |
| :-- | :-- | :-- |
| **Monolithic vs Microservices** | Monolithic | Faster MVP, single deploy, simpler auth |
| **GitHub OAuth** | Required for devs | Immediate credibility, auto-fetch repos/contributions |
| **Skill System** | Predefined taxonomy | Better matching than free-text tags |
| **Arabic Support** | RTL from day one | Significant portion of your user base |

## Environment Setup

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@localhost:5432/ummahdevs"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="xxx"
GITHUB_CLIENT_SECRET="xxx"
UPLOADTHING_TOKEN="xxx"
RESEND_API_KEY="xxx"
```


## Next Steps

1. **Initialize the repo** with `npx shadcn@latest init`
2. **Seed the database** with Islamic tech skills (Qur'an APIs, Prayer calculation, Arabic NLP, Islamic finance, etc.)
3. **Build the auth flow** first—everything else depends on it
4. **Consider** adding a "Project Impact" metric—developers want to know how their contributions help the Ummah

Want me to dive deeper into any specific part—like the matching algorithm, the messaging system, or the project discovery filters?
<span style="display:none">[^1_10][^1_11][^1_12][^1_13][^1_14][^1_15][^1_16][^1_17][^1_18][^1_19][^1_20][^1_21][^1_22][^1_23][^1_24][^1_25][^1_26][^1_27][^1_28][^1_29][^1_3][^1_30][^1_4][^1_5][^1_6][^1_7][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: https://www.reddit.com/r/muslimtechnet/comments/1l1mz5x/seeking_volunteers_to_build_ethical_opensource/

[^1_2]: https://www.reddit.com/r/MuslimLounge/comments/1qfelv6/building_opensource_digital_infrastructure_for/

[^1_3]: https://emizentech.ae/islamic-charity-app-development.html

[^1_4]: https://github.com/tarekeldeeb/awesome-islamic-open-source-apps

[^1_5]: https://riseuplabs.com/islamic-app-development/

[^1_6]: https://fekracomputers.github.io/blog/open-source-islamic-list

[^1_7]: https://github.com/aerogear/OpenVolunteerPlatform

[^1_8]: https://www.maix.io/public/projects

[^1_9]: https://dotdigital.com/blog/charity-tech-stack/

[^1_10]: https://www.thirdsector.co.uk/muslim-tech-company-launches-donation-platform-muslimgiving/article/1460106

[^1_11]: https://presensi.perpusnas.go.id/press/1lgbhzh/perpusnas-iosci-quran-indonesia-project-a-deep-dive-1767647649

[^1_12]: https://www.maxiomtech.com/backend-tech-stacks-empower-nonprofit-solutions/

[^1_13]: https://mtc.so

[^1_14]: https://www.linkedin.com/posts/mrayyan15_ramzan-techforgood-islamictech-activity-7299094901449797632-bmI3

[^1_15]: https://internews.org/blog/leveraging-volunteer-contributions-for-sustainability/

[^1_16]: https://www.volunteerlocal.com/features/volunteer-database/

[^1_17]: https://databasesample.com/database/volunteer-management-platform-database

[^1_18]: https://valkyrie.ai/client-work/optimizing-volunteer-matching-services/

[^1_19]: https://developers.volunteermatch.org/api-docs

[^1_20]: https://www.reddit.com/r/webdev/comments/1pvz7uw/building_a_volunteer_matching_hub_as_a_new_teen/

[^1_21]: https://openpledge.io/

[^1_22]: https://recruiter.daily.dev/resources/top-platforms-hiring-software-developers/

[^1_23]: https://www.volgistics.com/healthcare-database-management.htm

[^1_24]: https://dev.to/opensauced/how-to-find-open-source-projects-to-contribute-to-5eho

[^1_25]: https://upstaff.com/tools/devmatch-linkedin-profile-scanner/

[^1_26]: https://volunteerhub.com/platform/volunteer-database

[^1_27]: https://opensource.guide/how-to-contribute/

[^1_28]: https://proxify.io/knowledge-base/technology-software-development/what-platforms-are-best-for-hiring-developers-with-specific-skills

[^1_29]: https://pdfs.semanticscholar.org/58a3/6f37b8fb79f8e096d7ffad1588446d3c4aec.pdf

[^1_30]: https://www.mtechzilla.com/blogs/open-source-contribution-guide


---

# List open source tools for matching developers to projects

Here are the main open-source tools and platforms for matching developers to projects:

## Full-Stack Matching Platforms

| Tool | Description | Stack | Best For |
| :-- | :-- | :-- | :-- |
| **OpenVolunteerPlatform** [^2_1] | End-to-end volunteer management platform with GraphQL API, offline support, and scheduling | TypeScript, GraphQL, Ionic, Keycloak | Large-scale volunteer operations with field coordination |
| **VolunteerCore** [^2_2] | Flask/React webapp for matching volunteers with opportunities | Python (Flask), React, PostgreSQL | Community-based volunteer matching |
| **TalentMatch** [^2_3] | NLP-powered resume-to-job matching platform | Python (Flask), MongoDB, SpaCy | Automated skill-based matching with NLP |

## Technical Assessment \& Matching

| Tool | Description | Stack | Use Case |
| :-- | :-- | :-- | :-- |
| **OpenRank** [^2_4] | Self-hosted coding challenge platform for evaluating candidates | Python, Vue.js, Docker | Technical screening for interviews |
| **SpotAxis** [^2_5] | Open source Applicant Tracking System (ATS) | Python/Django | Recruitment pipeline management |
| **OpenCATS** [^2_6] | Full-featured ATS for tracking applicants | PHP, MySQL | Traditional hiring workflows |

## GitHub-Based Discovery

| Tool | Approach | Best For |
| :-- | :-- | :-- |
| **GitHub Help Wanted** [^2_7] | Aggregates GitHub issues labeled "help wanted" | Finding beginner-friendly open-source contributions |
| **GitMatcher** [^2_8] | Analyzes GitHub activity (repos, commits, languages) | Finding developers based on actual coding patterns |
| **AlgoSource** [^2_9] | Matches developers to programs like GSoC, LFX, Outreachy | Open-source program participation |

## Key Components You Can Reuse

### 1. Matching Algorithm Libraries

- **Zingg**: ML-based entity resolution for matching records at scale[^2_10]
- **RLTK (Record Linkage Toolkit)**: Python toolkit for probabilistic record matching[^2_10]
- **FuzzyMatcher**: Pandas-based fuzzy matching for dataframes[^2_10]


### 2. APIs for Integration

- **Idealist/VolunteerMatch API**: Access to 100,000+ volunteer opportunities[^2_11]
- **GitHub Search API**: Search users by language, location, repo activity[^2_12]


### 3. Profile Parsing

- **SpaCy**: NLP for extracting skills from text (resumes, bios)[^2_3]
- **GitHub GraphQL API**: Fetch user contributions, language stats, repo activity


## Recommendations for Your Islamic Dev Platform

1. **VolunteerCore**  is the closest reference architecture—it's a monolithic Flask/React app with volunteer-opportunity matching, but you'd want to modernize to your Next.js/Prisma stack.[^2_2]
2. **Use OpenVolunteerPlatform**  as inspiration for advanced features like offline support and GraphQL subscriptions if you scale beyond MVP.[^2_1]
3. **Implement GitHub OAuth + GitHub API**  to auto-import developer skills from their repos—this is critical for reducing onboarding friction.[^2_8]
4. **Skip the ATS tools** (OpenCATS, SpotAxis)—they're too recruitment-focused. Instead, study **AlgoSource**  for program-based matching UX patterns.[^2_9]

Want me to analyze any of these in detail for integration into your UmmahDevs platform?
<span style="display:none">[^2_13][^2_14][^2_15][^2_16][^2_17][^2_18][^2_19][^2_20][^2_21][^2_22][^2_23][^2_24][^2_25][^2_26][^2_27][^2_28][^2_29][^2_30][^2_31]</span>

<div align="center">⁂</div>

[^2_1]: https://github.com/aerogear/OpenVolunteerPlatform

[^2_2]: https://emizentech.ae/islamic-charity-app-development.html

[^2_3]: https://github.com/Prateek-27/TalentMatch

[^2_4]: https://github.com/MrPeker/OpenRank

[^2_5]: https://github.com/Assystant/SpotAxis

[^2_6]: https://github.com/opencats/OpenCATS

[^2_7]: https://www.reddit.com/r/javascript/comments/7ckujr/github_help_wanted_connecting_developers_with/

[^2_8]: https://www.reddit.com/r/datasets/comments/1jv9ion/i_built_an_api_that_helps_find_developers_based/

[^2_9]: https://www.algosource.in

[^2_10]: https://github.com/J535D165/data-matching-software

[^2_11]: https://www.idealist.org/en/open-network-api

[^2_12]: https://www.kula.ai/blog/github-beginners-guide-source-candidates

[^2_13]: https://dev.to/anthonymax/12-open-source-tools-every-developer-should-know-pn2

[^2_14]: https://www.appsmith.com

[^2_15]: https://www.port.io/blog/top-platform-engineering-tools

[^2_16]: https://developer.android.com/tools/releases/platform-tools

[^2_17]: https://jellyfish.co/library/platform-engineering/tools/

[^2_18]: https://github.com/CodeForFoco/volunteercore

[^2_19]: https://github.com/topics/api-projects

[^2_20]: https://platformengineering.org/platform-tooling

[^2_21]: https://www.instrumentl.com/blog/best-volunteer-recruitment-platforms-for-nonprofits

[^2_22]: https://github.com/topics/recruitment-platform

[^2_23]: https://github.com/topics/hiring-platform

[^2_24]: https://alternativeto.net/software/coderbyte/?license=free

[^2_25]: https://explore.hireez.com/blog/how-to-source-candidates-on-github/

[^2_26]: https://www.testtrick.com/blogs/top-coderbyte-alternatives

[^2_27]: https://geektastic.com/alternative-to-hackerrank

[^2_28]: https://www.reddit.com/r/learnprogramming/comments/4yzjju/alternatives_to_coderbyte/

[^2_29]: https://www.hackerrank.com/challenges/alternative-matching/problem

[^2_30]: https://github.com/topics/recruitment-software

[^2_31]: https://www.codesubmit.io/coderbyte-alternative


---

# we don't need tests for developers just want them to be able to present their skills and stack, somewhere in their profile

Got it—self-reported profiles with skill presentation, no testing layer. This simplifies the architecture significantly and reduces friction for developers joining the platform.

## Simplified Skill Presentation Approach

### Profile Skill Section Options

| Approach | Implementation | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **Tag-based** | Free-input with autocomplete (like Stack Overflow) | Flexible, easy to add new skills | Inconsistent naming, duplicates |
| **Taxonomy-based** | Predefined categories (Frontend, Backend, Mobile) with specific skills | Clean data, better matching | Requires maintenance, rigid |
| **Hybrid** | Curated taxonomy + "Other" free input | Best of both worlds | More complex UI |

### Recommended: Hybrid Approach

```typescript
// Store - predefined skills for matching
interface Skill {
  id: string;
  name: string;           // "React"
  category: string;       // "Frontend"
  aliases: string[];      // ["react.js", "reactjs"]
}

// User profile - what they select
interface DeveloperProfile {
  skills: {
    skillId: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    yearsExperience?: number;
  }[];
  customSkills: string[];  // Free input for niche tools
}
```


## Profile Sections for Skill Display

### 1. Tech Stack Cards

Visual badges grouped by category:

- **Frontend**: React, Next.js, Vue, Tailwind
- **Backend**: Node.js, Go, Python, PostgreSQL
- **Mobile**: React Native, Flutter, Swift
- **DevOps**: Docker, AWS, CI/CD
- **Other**: Arabic NLP, Islamic Finance APIs


### 2. GitHub Integration (Optional Verification)

- Import top languages from GitHub repos
- Display contribution graph
- Link to pinned repositories
- Shows *actual* activity alongside self-reported skills


### 3. Portfolio Projects

Free-form section for developers to showcase:

- Live project URLs
- GitHub repositories
- "I built this" case studies with tech used


### 4. Availability \& Preferences

- Hours per week available
- Time zone
- Preferred project types (Quran apps, prayer tools, etc.)
- Remote/in-person preference


## UI Component Sketch (Shadcn)

```tsx
// components/developers/skill-matrix.tsx
export function SkillMatrix({ skills }: { skills: DeveloperSkill[] }) {
  const grouped = groupBy(skills, 'category');
  
  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {items.map((skill) => (
              <Badge 
                key={skill.id} 
                variant={getLevelVariant(skill.level)}
                className="gap-1"
              >
                {skill.name}
                {skill.yearsExperience && (
                  <span className="opacity-70">· {skill.yearsExperience}y</span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```


## Profile Edit Flow

1. **Basic Info**: Name, bio, location, avatar
2. **Skills**: Multi-select from taxonomy + proficiency level
3. **Links**: GitHub, LinkedIn, personal website, portfolio
4. **Availability**: Time zone, hours/week, current status (available/busy)

This keeps onboarding to under 5 minutes while still giving organizations enough signal to evaluate fit. Want me to refine the skill taxonomy specifically for Islamic tech projects (Quran APIs, prayer calculation libraries, etc.)?

---

# the stack i will use to build the project is: next,js zutsand shadcn tanstack...

Perfect stack for this project—Next.js App Router with Zustand for client state, TanStack Query for server state, and shadcn/ui for components. Here's how to structure it:

## Project Architecture

### Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── developers/
│   │   │   ├── page.tsx          # Browse developers
│   │   │   └── [id]/page.tsx     # Developer profile
│   │   ├── projects/
│   │   │   ├── page.tsx          # Browse projects
│   │   │   ├── new/page.tsx      # Create project
│   │   │   └── [slug]/page.tsx   # Project detail
│   │   ├── applications/page.tsx # My applications
│   │   ├── profile/page.tsx      # Edit my profile
│   │   └── layout.tsx            # Dashboard layout with nav
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── developers/route.ts
│   │   ├── projects/route.ts
│   │   └── applications/route.ts
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn components (auto-generated)
│   ├── developers/               # Developer-specific components
│   │   ├── skill-matrix.tsx
│   │   ├── profile-card.tsx
│   │   └── profile-form.tsx
│   ├── projects/                 # Project-specific components
│   │   ├── project-card.tsx
│   │   ├── project-form.tsx
│   │   └── application-button.tsx
│   ├── forms/                    # Shared form components
│   └── layout/                   # Layout components
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   └── utils.ts
├── stores/                       # Zustand stores
│   ├── auth-store.ts
│   └── ui-store.ts
├── hooks/                        # TanStack Query hooks
│   ├── use-developers.ts
│   ├── use-projects.ts
│   └── use-applications.ts
├── types/
│   └── index.ts
└── lib/
    └── validations/              # Zod schemas
```


## State Management Split

| Type | Tool | Use Case |
| :-- | :-- | :-- |
| **Server State** | TanStack Query | Projects, developers, applications (fetching, caching, mutations) |
| **Client State** | Zustand | Auth state, UI state (sidebar open, theme, filters) |
| **Form State** | React Hook Form | Profile forms, project creation, application forms |

## Zustand Store Pattern

```typescript
// stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  role: 'developer' | 'organization' | null;
  setUser: (user: User | null) => void;
  setRole: (role: 'developer' | 'organization' | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// stores/ui-store.ts
interface UIState {
  sidebarOpen: boolean;
  activeFilters: ProjectFilters;
  toggleSidebar: () => void;
  setFilters: (filters: ProjectFilters) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  activeFilters: {},
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setFilters: (filters) => set({ activeFilters: filters }),
}));
```


## TanStack Query Hooks Pattern

```typescript
// hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PROJECTS_KEY = 'projects';

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: [PROJECTS_KEY, filters],
    queryFn: () => fetchProjects(filters),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: [PROJECTS_KEY, slug],
    queryFn: () => fetchProject(slug),
    enabled: !!slug,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  });
}

export function useApplyToProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: applyToProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [PROJECTS_KEY, variables.projectSlug] 
      });
    },
  });
}
```


## API Layer Pattern

```typescript
// lib/api/projects.ts
export async function fetchProjects(filters?: ProjectFilters): Promise<Project[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.skill) params.set('skill', filters.skill);
  
  const res = await fetch(`/api/projects?${params}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function fetchProject(slug: string): Promise<Project> {
  const res = await fetch(`/api/projects/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function createProject(data: CreateProjectInput): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}
```


## Component Pattern with Shadcn

```typescript
// components/projects/project-card.tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkillBadge } from '@/components/developers/skill-badge';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{project.title}</h3>
            <p className="text-sm text-muted-foreground">
              {project.organization.name}
            </p>
          </div>
          <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-1 mt-4">
          {project.skills.map((skill) => (
            <SkillBadge key={skill.id} skill={skill} size="sm" />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/projects/${project.slug}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```


## Providers Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```


## Key Libraries to Install

```bash
# State management
npm install zustand

# Server state
npm install @tanstack/react-query

# Forms
npm install react-hook-form @hookform/resolvers zod

# shadcn components (as needed)
npx shadcn add button card badge input textarea select dialog
npx shadcn add avatar dropdown-menu sheet
```

This setup gives you:

- **Clean separation** between server data (TanStack Query) and UI state (Zustand)
- **Type-safe API layer** with proper error handling
- **Reusable hooks** for data fetching and mutations
- **Optimistic updates** for better UX (instant UI updates, sync with server)

Want me to scaffold a specific feature like the developer profile form or project creation flow with this stack?

---

# so in the landing page there is some featured project the accept volunteers and other stuff, and there is a page to explore all projects and filter them, and you can sign as a developer or as an organization that have a project, even developer can create a project and request volunteers to help them,

Clear picture now—it's a flexible model where anyone can create projects and request volunteers, not just organizations. Here's how to architect this:

## Updated Data Model

The key insight: **Users create projects**. Organizations are optional profiles that add credibility.

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  avatar      String?
  role        UserRole @default(DEVELOPER) // For onboarding flow only
  
  // Any user can be both
  developerProfile DeveloperProfile?
  organization     Organization?
  
  // Projects they own/create
  ownedProjects    Project[]
  
  // Applications they made to other projects
  applications     Application[]
  
  @@map("users")
}

enum UserRole {
  DEVELOPER
  ORGANIZATION
}

model Organization {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  name        String
  slug        String   @unique
  description String   @db.Text
  logo        String?
  website     String?
  verified    Boolean  @default(false)
  
  // Org-owned projects
  projects    Project[]
  
  @@map("organizations")
}

model Project {
  id          String   @id @default(cuid())
  
  // Creator is always a user
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], name: "ownedProjects")
  
  // Optional: If created on behalf of an org
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  title       String
  slug        String   @unique
  description String   @db.Text
  status      ProjectStatus @default(OPEN)
  
  // Is this an individual or org project?
  isPersonal  Boolean  @default(true) // true = individual developer
  
  category    String   // quran, prayer, charity, education, tools
  impact      String?  @db.Text
  
  skills      ProjectSkill[]
  applications Application[]
  
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  @@map("projects")
}
```


## Landing Page Structure

```
/app/page.tsx
├── Hero Section
│   ├── Headline: "Build Islamic Tech for the Ummah"
│   ├── CTA Buttons: "Find Projects" | "Post a Project"
│   └── Stats: X projects, Y developers, Z contributions
├── Featured Projects (horizontal scroll)
│   ├── "Featured Opportunities" header
│   ├── 4-6 cards with featured=true
│   └── "View All" link to /projects
├── How It Works (3 steps)
│   ├── 1. Create your profile
│   ├── 2. Discover or post projects
│   └── 3. Collaborate & contribute
├── Categories Grid
│   ├── Quran Apps | Prayer Tools | Education | Charity | Community
└── CTA Footer
    └── "Join 500+ developers building for the Ummah"
```


## Projects Explore Page

```typescript
// app/(dashboard)/projects/page.tsx
'use client';

import { useProjects } from '@/hooks/use-projects';
import { useUIStore } from '@/stores/ui-store';

export default function ProjectsPage() {
  const { activeFilters, setFilters } = useUIStore();
  const { data: projects, isLoading } = useProjects(activeFilters);

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-6">
          <ProjectFilters 
            filters={activeFilters} 
            onChange={setFilters} 
          />
        </aside>

        {/* Results */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Explore Projects</h1>
            <span className="text-muted-foreground">
              {projects?.length} projects found
            </span>
          </div>

          {isLoading ? (
            <ProjectsGridSkeleton />
          ) : (
            <ProjectsGrid projects={projects} />
          )}
        </main>
      </div>
    </div>
  );
}
```


### Filter Options

| Filter | Type | Options |
| :-- | :-- | :-- |
| **Category** | Multi-select | Quran, Prayer, Charity, Education, Community, Tools |
| **Skills** | Multi-select | React, Node.js, Go, Flutter, etc. |
| **Time Commitment** | Range | 1-5 hrs/week, 5-10, 10-20, 20+ |
| **Project Type** | Toggle | Individual, Organization, Both |
| **Status** | Single | Open, In Progress, All |

## User Flow: Sign Up \& Onboarding

### Step 1: Choose Path

```
/signup
├── "How would you like to participate?"
├── Card 1: "I'm a Developer" → /onboarding/developer
│   └── Build profile, find projects, contribute
└── Card 2: "I Have a Project" → /onboarding/creator
    └── Post projects, find volunteers
```


### Step 2A: Developer Onboarding

```typescript
// app/onboarding/developer/page.tsx
const steps = [
  'profile',      // Name, bio, avatar
  'skills',       // Tech stack selection
  'availability', // Hours/week, timezone
  'complete'      // Done
];
```


### Step 2B: Creator Onboarding

```typescript
// app/onboarding/creator/page.tsx
const steps = [
  'account-type', // Personal project or Organization?
  'profile',      // If org: org name, description, logo
  'first-project', // Create first project
  'complete'
];
```


### Flexible Account Type

Users can toggle their "creator mode" anytime:

```typescript
// stores/auth-store.ts
interface UserCapabilities {
  canApply: boolean;      // Always true for all users
  canCreateProject: boolean; // Enable after profile completion
  hasOrganization: boolean;  // If they created an org profile
}

// User can be BOTH applicant and creator
const userCapabilities: UserCapabilities = {
  canApply: true,
  canCreateProject: true, // After onboarding
  hasOrganization: false, // Optional
};
```


## Project Creation Flow

### Route: `/projects/new`

```typescript
// app/(dashboard)/projects/new/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '@/lib/validations/project';

export default function NewProjectPage() {
  const { user } = useAuthStore();
  const createProject = useCreateProject();
  
  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      isPersonal: !user?.organization, // Default based on profile
      organizationId: user?.organization?.id,
    },
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create a Project</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Owner Selector (if user has org) */}
          {user?.organization && (
            <FormField
              control={form.control}
              name="isPersonal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posting as</FormLabel>
                  <Select 
                    onValueChange={(v) => field.onChange(v === 'personal')}
                    defaultValue={field.value ? 'personal' : 'organization'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">
                        Personal Project (as {user.name})
                      </SelectItem>
                      <SelectItem value="organization">
                        {user.organization.name}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Title</FormLabel>
                <FormInput placeholder="Quran Memorization App" {...field} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quran">Quran & Tafsir</SelectItem>
                    <SelectItem value="prayer">Prayer & Athan</SelectItem>
                    <SelectItem value="charity">Charity & Zakat</SelectItem>
                    <SelectItem value="education">Islamic Education</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="tools">Developer Tools</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormTextarea 
                  placeholder="Describe your project, its goals, and impact..."
                  rows={5}
                  {...field} 
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <SkillsMultiSelect 
                  selected={field.value} 
                  onChange={field.onChange} 
                />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Publish Project
          </Button>
        </form>
      </Form>
    </div>
  );
}
```


## Navigation Structure

```typescript
// components/layout/dashboard-nav.tsx
const developerLinks = [
  { href: '/projects', label: 'Explore Projects', icon: Search },
  { href: '/applications', label: 'My Applications', icon: FileText },
  { href: '/profile', label: 'Profile', icon: User },
];

const creatorLinks = [
  { href: '/projects/new', label: 'Post Project', icon: PlusCircle },
  { href: '/projects/owned', label: 'My Projects', icon: Folder },
  { href: '/applications/incoming', label: 'Applications', icon: Inbox },
];

// Combined nav for users who are both
const navLinks = [
  ...developerLinks,
  { separator: true, label: 'Creator' },
  ...creatorLinks,
];
```


## API Routes

```typescript
// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET /api/projects?category=&skill=&isPersonal=
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const category = searchParams.get('category');
  const skill = searchParams.get('skill');
  const isPersonal = searchParams.get('isPersonal');
  const featured = searchParams.get('featured');

  const projects = await prisma.project.findMany({
    where: {
      status: 'OPEN',
      ...(category && { category }),
      ...(isPersonal !== null && { isPersonal: isPersonal === 'true' }),
      ...(featured !== null && { featured: featured === 'true' }),
      ...(skill && {
        skills: {
          some: {
            skill: { name: skill }
          }
        }
      }),
    },
    include: {
      owner: { select: { name: true, avatar: true } },
      organization: { select: { name: true, logo: true } },
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(projects);
}

// POST /api/projects
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  
  const project = await prisma.project.create({
    data: {
      ...data,
      ownerId: session.user.id,
      slug: generateSlug(data.title),
    },
  });

  return NextResponse.json(project);
}
```

This architecture supports:

- **Any user can create projects** (personal or org-backed)
- **Featured projects** on landing page
- **Rich filtering** on explore page
- **Flexible identity** (developer vs creator vs both)

Want me to detail the application flow (developer applying to project) or the incoming applications dashboard for project owners?

---

## Summary

**Project**: UmmahDevs — A platform connecting Islamic open-source projects with volunteer developers.

**Stack**: Next.js (App Router) + Zustand + shadcn/ui + TanStack Query + Prisma + PostgreSQL

**Key Architecture Decisions**:

- **Flexible user model**: Any user can be a developer, project creator, or both
- **Self-reported skills**: No testing layer — developers showcase skills via profile tags + optional GitHub import
- **Optional organizations**: Users can create projects personally or under an org profile for credibility
- **Featured projects**: Highlighted on landing page, full filtering on explore page
- **Categories**: Quran, Prayer, Charity, Education, Community, Developer Tools

**Core Flows Defined**:

1. Landing page → Featured projects + CTAs
2. Project explore → Filter by category, skills, project type, availability
3. Developer profile → Skills matrix, portfolio, availability
4. Project creation → Personal or org-backed, skill requirements, description
5. Application flow → (TBD based on your answers below)

***

## Open Questions

### 1. Application Process

When a developer finds a project they like, how do they apply?

- **Simple**: One-click "I'm interested" button with optional message?
- **Structured**: Cover letter + availability + skills match check?
- **Portfolio**: Require linking to GitHub repos or past work?


### 2. Communication

How do matched parties communicate?

- **In-platform messaging**: Build a message thread system?
- **External**: Share contact info (email/Discord/GitHub) after match?
- **Hybrid**: Initial contact in-app, then move to external?


### 3. Verification \& Trust

How to ensure projects are legitimately "Islamic" and not spam?

- **Manual review**: Admin approves projects before publishing?
- **Community**: Report button + community moderation?
- **Self-declaration**: Trust-based, focus on post-publish reporting?
- **Org verification**: Verified badge for established orgs?


### 4. Application Management

For project owners reviewing applicants:

- **Simple list**: View applicants with accept/reject buttons?
- **Detailed view**: Full profile preview before decision?
- **Status tracking**: Open → Accepted → In Progress → Completed?


### 5. Notifications

How do users get notified?

- **Email**: New applications, application status changes, messages?
- **In-app**: Notification bell with unread count?
- **Digest**: Weekly summary of new matching projects?


### 6. GitHub Integration Depth

- **Basic**: OAuth login + link to GitHub profile?
- **Medium**: Auto-import language stats + pinned repos?
- **Deep**: Fetch contribution graph, analyze repo activity for skill verification?


### 7. Arabic \& RTL

Priority level for Arabic support?

- **Phase 1**: Full RTL support from day one?
- **Phase 2**: English first, add Arabic later?
- **Content**: Will projects have Arabic descriptions or English only?


### 8. Admin Requirements

What admin capabilities do you need?

- **Moderation**: Approve/reject projects, ban users?
- **Analytics**: View platform stats, active users, match success?
- **Featured control**: Manually curate featured projects?


### 9. Discovery Algorithm

How should projects surface to developers?

- **Simple**: Newest first + basic filtering?
- **Matching**: Score-based on skills overlap?
- **Personalized**: "Projects for you" based on profile?


### 10. Success Metrics

What defines a successful match?

- **Application accepted**: Good enough?
- **Project completed**: Track actual contributions?
- **Follow-up**: Post-project feedback/ratings?

***

Which of these should we nail down first? The application flow and communication model would unblock the project creation and matching implementation.

---

# 1. simple one click but optionally portfolio

2. In-platform messaging, and optionally external
3. manual review and Community
4. Detailed view
5. In-app
6. Deep
7. the Website will be arabic first, and support i18n (we can make filters for that by language and by country and that optionally because it can be general/universal)
8. Moderation + Analytics
9. Personalized
10. Application accepted
--
most important thing is Discovery Algorithm but which one to start you decide based on the usual requirements

i want to build a descriptive File like PRD to explain all that so i can start design the UIs

I'll create a comprehensive PRD that captures all your decisions. This will serve as your single source of truth for UI design and implementation.

***

# **UmmahDevs Platform - Product Requirements Document (PRD)**

**Version**: 1.0
**Date**: February 2026
**Status**: Design Phase

***

## 1. Overview

### 1.1 Vision

UmmahDevs is a bilingual (Arabic-first) platform connecting volunteer developers with Islamic open-source projects. Anyone can contribute skills, anyone can create projects—building tech that serves the Muslim ummah.

### 1.2 Core Value Proposition

- For Developers: Discover meaningful projects aligned with Islamic values
- For Creators: Find skilled volunteers to bring Islamic tech ideas to life
- For the Ummah: Accelerate development of ethical, open-source Islamic tools


### 1.3 Success Definition

A successful match = Developer application is **accepted** by project owner.

***

## 2. User Types \& Permissions

| User Type | Can Apply | Can Create Project | Can Have Org Profile |
| :-- | :-- | :-- | :-- |
| **Developer** | ✅ | ✅ | Optional |
| **Organization** | ✅ | ✅ | Required |
| **Admin** | ✅ | ✅ (Moderated) | N/A |

### 2.1 User Identity Model

- Single account can be **both** applicant and creator
- Users toggle between "modes" via context switcher
- Organization profile is optional layer on top of user account

***

## 3. Core Features

### 3.1 Landing Page

**Purpose**: Convert visitors to users, showcase active opportunities

**Components**:

- Hero section with platform value prop
- **Featured Projects** (horizontal scroll, 6 max)
- Platform stats (projects, developers, contributions)
- How it works (3 steps)
- Category grid (Quran, Prayer, Charity, Education, Community, Tools)
- CTA footer

**Featured Project Logic**:

- Admin manually curates from published projects
- Shows: title, org/personal badge, category, 3 key skills, applicant count


### 3.2 Authentication \& Onboarding

#### Signup Flow

```
Landing → Choose Path → Account Details → Profile Setup → Dashboard
         /            \              /
   Developer          Creator
   (Apply to projects) (Post projects)
```


#### Onboarding Steps

**Developer Path**:

1. Account: Email, password, name
2. Profile: Bio, avatar, location, timezone
3. Skills: Tech stack selection (taxonomy-based + custom)
4. Availability: Hours/week, preferred project types
5. GitHub: OAuth connection (optional but recommended)

**Creator Path**:

1. Account: Same as above
2. Identity: "Personal Project" or "Organization"
    - If Org: Org name, description, logo, website
3. First Project: Create initial project (can skip)

### 3.3 Developer Profile

**Public Profile Sections**:

- **Header**: Name, avatar, location, timezone, availability badge
- **About**: Bio (Markdown support)
- **Skills Matrix**: Grouped by category with proficiency levels
    - Frontend, Backend, Mobile, DevOps, Design, Other
    - Level: Beginner | Intermediate | Advanced | Expert
    - Years experience per skill (optional)
- **Custom Skills**: Free-text for niche tools
- **Portfolio**: Links to GitHub repos, live projects, case studies
- **GitHub Stats**: Auto-imported languages, contribution graph
- **Contact**: Platform messaging + optional external links

**Edit Profile**:

- All fields editable
- Skills selector with search + category filter
- Drag-drop reorder for portfolio items


### 3.4 Project System

#### Project Creation

**Fields**:

- Title (required)
- Slug (auto-generated, editable)
- Category (required): Quran, Prayer, Charity, Education, Community, Tools
- Description (Markdown, required)
- Impact statement (optional)
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
- **Open**: Accepting applications
- **In Progress**: Team formed, development started
- **Completed**: Project delivered
- **Cancelled**: Archived, no longer active


#### Project Display

- Card view: Title, owner (personal/org badge), category, 3 key skills, applicant count, posted date
- Detail view: Full description, all skills, impact statement, owner full profile, apply button


### 3.5 Discovery \& Matching

#### Explore Page Layout

```
[Sidebar Filters] | [Results Grid]
                  |
                  |  [Sort: Relevance | Newest | Most Applicants]
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
// calculateMatchScore(developer, project)
score = 0

// 1. Skills Match (70% weight)
requiredSkills = project.skills
developerSkills = developer.skills

matchedSkills = intersection(requiredSkills, developerSkills)
skillScore = (matchedSkills.length / requiredSkills.length) * 70

// 2. Category Interest (15% weight)
if developer.preferredCategories includes project.category:
  categoryScore = 15

// 3. Language Match (10% weight)
if developer.languages includes project.language:
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
- Collaborative filtering (users like you applied to...)


#### Sort Options

- **Recommended** (default): Personalized score desc
- **Newest**: createdAt desc
- **Most Popular**: applicationCount desc
- **Closing Soon**: deadline asc (if deadline exists)


### 3.6 Application System

#### Developer Apply Flow

1. Click "Apply" on project page
2. Modal opens with:
    - Pre-filled message: "Hi, I'm interested in contributing to [project]"
    - Optional: Cover letter textarea
    - Optional: Link to portfolio/GitHub repo
    - Hours/week availability confirmation
3. Submit application
4. Status: Pending → Awaiting owner response

#### Application States

- **Pending**: Submitted, awaiting review
- **Accepted**: Owner approved, match successful
- **Rejected**: Owner declined
- **Withdrawn**: Developer cancelled


#### Project Owner View

**Incoming Applications Page**:

- List view: Applicant avatar, name, match score, applied date, status
- Filter by: Pending, Accepted, Rejected, All
- Sort by: Newest, Match Score

**Applicant Detail View**:

- Full developer profile (read-only)
- Match score breakdown
- Application message
- Portfolio links
- GitHub contribution graph
- **Actions**: Accept, Reject, Message


### 3.7 Messaging System

#### In-Platform Messaging

**Scope**: Post-application communication only

**Flow**:

1. Developer applies → Can message project owner
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
| Application received | Project owner | "[Name] applied to [Project]" |
| Application accepted | Developer | "Your application to [Project] was accepted" |
| Application rejected | Developer | "Your application to [Project] was declined" |
| New message | Both | "New message from [Name]" |
| Project approved | Creator | "Your project [Title] is now live" |
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

- Total users (developers, creators, orgs)
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

DeveloperProfile
- id, userId, bio, timezone, hoursPerWeek, isAvailable
- skills: DeveloperSkill[]
- languages: String[]
- githubSynced: Boolean, githubUsername: String?

Organization
- id, userId, name, slug, description, logo, website, verified

// Skills
Skill
- id, name, category, aliases

DeveloperSkill
- id, developerId, skillId, level (Beginner|Intermediate|Advanced|Expert), yearsExperience

// Projects
Project
- id, ownerId, organizationId?, title, slug, description, impact
- category, language, country?, status (Draft|Pending|Open|InProgress|Completed|Cancelled)
- timeCommitment, duration, githubUrl, featured, featuredUntil, createdAt

ProjectSkill
- id, projectId, skillId, isRequired

// Applications
Application
- id, projectId, developerId, status, message, portfolioUrl?, hoursPerWeek, createdAt

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

**Developers**:

- GET /api/developers (list)
- GET /api/developers/[id] (profile)
- PATCH /api/developers/profile (update)
- POST /api/developers/skills (add skill)
- DELETE /api/developers/skills/[id] (remove skill)

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

**Match Acceptance Rate** = Accepted Applications / Total Applications

Target: >40% (industry standard for volunteer platforms)

### 9.2 Secondary Metrics

- **User Activation**: % completing profile within 24h of signup
- **Project Publish Rate**: Projects reaching Open status
- **Time to First Match**: Days from signup to accepted application
- **Retention**: 30-day return rate for developers
- **Featured Project Engagement**: Applications per featured project vs. organic


### 9.3 Tracking

- Mixpanel/Amplitude for user journeys
- PostgreSQL analytics views for admin dashboard
- Weekly reporting email to admin

***

## 10. Roadmap

### Phase 1: MVP (Weeks 1-6)

- Auth \& onboarding
- Developer profiles with skills
- Basic project creation (manual admin approval)
- Application system (one-click)
- Project discovery with filters
- In-app notifications


### Phase 2: Matching (Weeks 7-8)

- Personalized scoring algorithm
- GitHub integration
- In-platform messaging


### Phase 3: Polish (Weeks 9-10)

- Admin analytics dashboard
- Featured project curation
- Performance optimization
- SEO \& meta tags


### Phase 4: Scale (


---

# **Waqf Platform - Product Requirements Document (PRD)**

**Platform Name**: Waqf (وقف)
**Tagline**: "Tech for the Ummah — Sadaqah Jariyah through Code"
**Version**: 1.0
**Date**: February 2026
**Status**: Design Phase

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

***

## 10. Roadmap

### Phase 1: MVP (Weeks 1-6)

- Auth \& onboarding
- Contributor profiles with skills
- Basic project

