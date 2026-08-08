# Waqf Design System

> **Tech for Good — أوقف خبرتك التقنية**

Design system for the **Waqf Platform**, a contribution platform that matches developers with projects that need their skills — open, closed, or private. The name is a metaphor for code that keeps serving people long after the merge.

## Sources

This system reflects the canonical Waqf source repository:

- **`src/app/globals.css`** — Tailwind v4 `@theme` block, all design tokens
- **`src/components/landing/LandingPage.tsx`** — hero, stats, categories, dual path, voices, CTA
- **`src/components/layout/Navbar.tsx`** — header / logo / nav
- **`Plans/Waqf Platform Figma/`** — exported Figma-to-code reference (shadcn UI primitives)
- **`messages/en.json` + `messages/ar.json`** — full bilingual copy in `next-intl` format
- **`Plans/Implementation_Roadmap.md`** — product scope + PRD anchors

---

## What is Waqf?

Waqf is a contribution platform for developers. Developers and project owners meet on a single surface, share work, and ship software that keeps being useful. The name borrows from the Arabic word for an enduring charitable endowment — a metaphor for code that compounds in value over time.

**Two roles:**
- **Contributor** (مساهم) — finds projects matching their skills, applies, contributes code.
- **Creator** (منشئ) — lists projects, recruits volunteers, manages applications.

**Core surfaces:**
- Landing → Explore → Project Detail → Apply Modal → Dashboard → Messages → Profile → Admin

---

## Visual identity at a glance

| | |
|---|---|
| **Primary** | `#1f705d` — Waqf Green. Calm, deep teal-green. Used on logo, primary CTAs, links, all "trust" surfaces. |
| **Accent**  | `#d4a056` — Accent Gold. Reserved for **reward**, **featured**, **beta**, and ratings — never structural. |
| **Surface** | `#f9fbfb` app background on `#e9f1ef` mint-tinted borders. Subtle, paper-like. |
| **Type**    | Inter (LTR) + Noto Sans Arabic (RTL). Headlines run *very* heavy — `font-weight: 900` with tight tracking `-0.033em`. |
| **Shape**   | Generous radii — buttons `rounded-xl` (16px), cards `rounded-2xl` (24px), CTA section `rounded-3xl` (32px). |
| **Logo**    | Material shield silhouette (protection / guardianship metaphor) in a 10% green tile. The wordmark is `Waqf` / `وقف` only — no eyebrow. |

---

## Color tokens

All design tokens live in `src/app/globals.css` as Tailwind v4 `@theme` CSS variables.

### Primary (Waqf Green)
`primary-50` `#e6f5f1` → `primary-950` `#082520` · brand step is `primary-600` `#1f705d` · hover is `primary-700` `#195c4c`

### Accent (Gold)
`accent-50` `#fdf8ef` → `accent-950` `#3d2a13` · brand step is `accent-500` `#d4a056` · used **only** for:
- Featured badges (`Beta Available`, `Reward`)
- Star ratings
- The 3rd "Build Lasting Impact" step in How-It-Works
- Hover ambient glow on accent CTAs

### Secondary (Slate)
Tailwind's slate scale, 50 → 950. Used for body text, borders, neutrals.

### Waqf-specific tokens
- `--waqf-bg: #f9fbfb` — app background, slightly warmer than pure white
- `--waqf-border: #e9f1ef` — *the* default border colour. Used everywhere — cards, dividers, inputs.
- `--waqf-muted: #588d81` — desaturated teal for secondary text on green-tinted sections

### Category accents (Explore page tints)
Quran & Sunnah uses primary; Charity & Zakat uses accent; Education Tech uses blue-600; Finance & Tools uses emerald-600. All at ~10% background + matching ~600 text.

---

## Typography

- **Hero**: `text-4xl md:text-5xl lg:text-6xl`, `font-black` (900), `tracking-[-0.033em]`, `leading-[1.1]`. The English line is followed by an Arabic line in `Noto Sans Arabic`.
- **Section heads**: `text-3xl`/`text-4xl`, `font-bold` or `font-black`, `tracking-tight`.
- **Card titles**: `text-lg`, `font-bold`.
- **Body**: `text-base` or `text-lg`, normal weight, `text-gray-600`, `leading-relaxed`.
- **Eyebrows**: `text-xs`, `font-bold`, `uppercase`, `tracking-widest`. Always coloured primary or accent — never grey.
- **Stat numbers**: `text-3xl`, `font-black`, `tracking-tight`, *near-black ink*. Often paired with a tiny Lucide icon inline.

Fonts are loaded from Google Fonts CDN at runtime (Inter + Noto Sans Arabic + JetBrains Mono).

---

## Spacing & layout

- Container is **`max-w-[1280px]`** everywhere. Don't grow wider.
- Page horizontal padding: `px-4` mobile → `px-10` desktop.
- Section vertical rhythm: `py-16 md:py-24` for marketing sections, `py-8` for utility strips (stats).
- Grids: marketing uses 1/2/3/4-column responsive grids with `gap-6` to `gap-12`.

---

## Backgrounds & textures

- **App background**: flat `#f9fbfb` — *not* white.
- **Hero**: same flat colour + a CSS texture overlay — `transparenttextures.com/patterns/clean-gray-paper.png` (very subtle paper grain).
- **"How it works" section**: `bg-[#1f705d]/5` with two **giant blurred orbs** in corners — `w-96 h-96 bg-[#1f705d]/5 rounded-full blur-3xl`. This is the signature ambient-light treatment.
- **Final CTA block**: solid `#1f705d` with a `radial-gradient(#fff 1px, transparent 1px)` dot pattern at 10% opacity on a 20px grid. The dot pattern is the brand's only repeating texture.
- **Featured project cards**: gradient placeholder `from-[#1f705d]/10 to-[#d4a056]/10` with a giant initial letter at `text-6xl font-black text-[#1f705d]/20` when no image.

---

## Animation

Restrained. Three motion families:

1. **Hover lift** — buttons: `hover:translate-y-[-1px]`, cards: `hover:shadow-md` from `shadow-sm`.
2. **Icon micro-interactions** — `group-hover:scale-110` on category-tile icons; `transition-transform`.
3. **Decorative pulse / float** — none. No `animate-pulse` or floating elements. Motion only on hover / press.

Default transition is `transition-all duration-300` or `transition-colors` — no bouncy springs, no rotates.

---

## Hover & press states

- **Primary button** (`bg-[#1f705d]`) → `hover:bg-[#195c4c]` (darker green) + 1px lift.
- **Secondary button** (`bg-white border border-gray-200`) → `hover:bg-gray-50`.
- **Ghost button / link** → `hover:text-[#1f705d]` from `text-[#101917]`.
- **Card** → `hover:shadow-lg` and `hover:border-[#1f705d]/50` (border tint becomes more primary).
- **Icon button** → `hover:bg-gray-100 rounded-lg` (subtle slate fill).

---

## Borders, shadows, radii

- **Default border**: `1px solid #e9f1ef` (use `border-waqf-border` Tailwind token). Universal card outline.
- **Strong border** (rarely): `border-gray-200` (≈ slate-200).
- **Radii**: never sharp. Smallest is `rounded-md` (10px) on inputs; cards are `rounded-xl` (16px) or `rounded-2xl` (24px); the final CTA block is `rounded-3xl` (32px).
- **Shadows**: soft 3-tier system (`sm` / `md` / `lg` / `xl`) using slate-tinted alpha. Primary CTAs additionally carry a coloured glow — `shadow-lg shadow-[#1f705d]/25`. This is the **signature shadow** — green-tinted, never black.

---

## Cards

The canonical card:
```tsx
className="bg-white p-6 rounded-2xl border border-waqf-border
           hover:border-[#1f705d]/50 hover:shadow-lg
           transition-all duration-300"
```

Image-topped cards use `rounded-xl overflow-hidden` with image area `h-48` and body `p-6`.

---

## Iconography

**Lucide React** is the canonical icon family across the entire production codebase.

- Default stroke width: Lucide's default (~2px).
- Default size: `w-4 h-4` for inline text, `w-5 h-5` for buttons, `w-6 h-6` for category tiles, `w-10 h-10` for big How-It-Works circles.
- Filled variants used on **stars** (`fill="currentColor"` in gold) and the **Heart** in step-3 of How-It-Works.

### Key icons in use
| Icon | Where |
|---|---|
| `Shield` | Logo mark, Built by Developers trust strip |
| `Code` | "Start Contributing" CTA, code-snippet card |
| `Heart` | Lasting Impact, "Made with care for the developer community" |
| `Search` | Search bars, "Discover" step |
| `BookOpen` | Quran & Sunnah category |
| `HandHeart` | Charity & Zakat category |
| `GraduationCap` | Education Tech category |
| `PiggyBank` | Finance & Tools category |
| `Globe` | Language switcher, Global Community |
| `Folder`, `Users`, `GitCommit` | Stat row |
| `ArrowRight`, `ChevronLeft`, `ChevronRight` | Navigation affordances |
| `CheckCircle` | Verified organisation badge |
| `Star` (filled) | Testimonial ratings |
| `Bookmark` | Save-project action on cards |
| `Sparkles` | Ticker accent |

**Emoji rule:** A single ❤️ in the footer signoff (now "Made with care for the developer community"). **No other emoji as iconography.**

---

## Landing page structure

The landing page in `src/components/landing/LandingPage.tsx` is composed of these sections, in order:

1. **Hero** — bilingual headline (EN + AR), beta badge, two CTAs (Start Contributing / List a Project), social proof avatars, code-snippet visual.
2. **Ticker** — scrolling marquee of stats: commits this month, active projects, contributors, countries, languages, 0% platform fees.
3. **Stats** — 4-cell grid: Active Projects · Contributors · Contributions · Zero Platform Fees.
4. **Categories (Explore Domains)** — 4 tiles with per-category accent tints.
5. **How It Works** — 3 steps (Discover → Contribute → Build Lasting Impact), the last step rewarded in gold with floating orbs.
6. **Featured Projects** — 3 project cards with gradient placeholders and "applicants" badge.
7. **Dual Path** — Contributor vs Creator two-card comparison (smart matching, mentors, contribution ledger vs verified listing, quality applicants, infra credits).
8. **Voices** — 3 testimonials with star ratings and per-card accent colors.
9. **Trust strip** — Built by Developers · Global Community · Lasting Impact.
10. **CTA block** — `rounded-3xl` solid green with dot pattern, two final CTAs.

---

## Voice & tone

Formal, neutral, and direct. The product is bilingual at its core — every string ships in English and Arabic. The platform is not a community of believers; it is a place where developers ship software. The copy says what the product does, who it serves, and what to do next. Nothing more.

- **Sentence case** for body copy and most UI strings.
- **Title Case** for navigation, buttons, section headers (`Start Contributing`, `Explore Domains`, `Featured Projects`).
- **UPPERCASE** sparingly — only on eyebrow labels (`BETA AVAILABLE`, `REWARD`) with very wide tracking.
- **You/your** when addressing the contributor.
- **No exclamation marks** except in success toasts.

### Hero line
- English: "Tech for Good"
- Arabic: "أوقف خبرتك التقنية" *(a peer translation, not a transliteration)*

### Trust-strip labels
- Built by Developers · Global Community · Lasting Impact

### Arabic copy
- The platform name `وقف` is kept untranslated in Arabic copy.
- Arabic strings are **peer translations** of the English meaning, not transliterations of the English words. If a phrase only works in English, write the Arabic peer that fits the new positioning.
- Domain vocabulary (Quran, Prayer, Charity, Education, etc.) is allowed in **user-supplied project content** (project titles, descriptions, skills). It is **not** allowed in platform marketing copy.

For the full positioning rules, see `PRODUCT.md`.

---

## Don'ts

- ❌ **Don't introduce new emoji** as iconography. Stick to Lucide. The only emoji in the brand is ❤️ in the footer signoff.
- ❌ **Don't use gold (`#d4a056`) as structure.** It's reward-coded — featured badges, ratings, the "Lasting Impact" step. Never a primary CTA.
- ❌ **Don't draw new logo marks.** Use the inline shield path in `Navbar.tsx`.
- ❌ **Don't shorten radii.** Buttons are 12px, cards 16–24px, the final CTA block 32px. The brand reads soft.
- ❌ **Don't transliterate English slogans into Arabic.** Translate the meaning, or write an Arabic peer that fits the new positioning. Slang-to-slang translations are not acceptable.
- ❌ **Don't add faith-coded language to platform copy.** No "the Ummah", "sadaqah", "hasanat", "Islamic" — these belong in user content, not in the platform's voice.
- ❌ **Don't position Waqf as an open-source-only platform.** The platform welcomes open, closed, and private projects; copy must not exclude any openness model.
- ❌ **Don't mix Latin headlines with Arabic body text in the same run** — stack them as two distinct elements, each in their native font.
- ❌ **Don't add fake "live" status indicators** — no pulsing dots with "Updated just now", no fabricated "X min ago" timestamps on hardcoded content, no `animate-pulse` used as a stand-in for real-time data. If the page is not actually live, do not pretend it is. Static labels only.

---

## See also

- `PRODUCT.md` — formal positioning rules, in/out vocabulary, Arabic conventions
- `src/app/globals.css` — Tailwind v4 design tokens
- `src/components/landing/LandingPage.tsx` — production landing page
- `src/components/layout/Navbar.tsx` — header
- `Plans/Waqf Platform Figma/` — Figma-exported UI primitives
- `Plans/Implementation_Roadmap.md` — product roadmap
