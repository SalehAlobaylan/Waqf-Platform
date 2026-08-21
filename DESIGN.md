# Waqf Design System

> **Tech for Good — أوقف خبرتك التقنية**

Design system for the **Waqf Platform**, a contribution platform that matches developers with projects that need their skills — open, closed, or private. The name is a metaphor for code that keeps serving people long after the merge.

## Sources

This system reflects the canonical Waqf source repository:

- **`src/app/globals.css`** — Tailwind v4 `@theme` block, all design tokens + motion keyframes (`rise`, `reveal`, `menu-in`, `draw`)
- **`src/components/ui/`** — the primitive kit: `Button`, `Input`/`Textarea`/`Select`, `Badge`/`StatusBadge`, `Card`/`SectionHeading`/`Skeleton`
- **`src/lib/categories.ts`** — single source of truth for category labels + tints
- **`src/components/landing/LandingPage.tsx`** — hero, stats, domains index, how-it-works, featured projects, principles, CTA
- **`src/components/landing/CountUp.tsx`** — animated stat numerals
- **`src/app/[locale]/(auth)/layout.tsx`** — split auth shell (green brand panel + form column)
- **`src/components/layout/Navbar.tsx`** — header (scroll-aware, active-link gold underline)
- **`src/components/layout/Footer.tsx`** — deep-green bookend plane with lattice
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
| **Primary** | `#1f705d` — Waqf Green. Calm, deep teal-green. Links, accents, trust surfaces. The deepest step `primary-950 #082520` is the **hero plane** — edge-to-edge, not a card. |
| **Accent**  | `#d4a056` — Accent Gold. Reward-coded: the brand mark, the enduring-work phrase, featured/reward badges, ratings. On the dark hero plane only, it is also the single solid CTA — one accent surface per viewport. |
| **Surface** | `#f9fbfb` app background on `#e9f1ef` mint-tinted borders. Subtle, paper-like. |
| **Type**    | Inter (LTR) + Noto Sans Arabic (RTL). Headlines run `font-bold` with tight `tracking-tight`. Expressiveness comes from scale contrast (giant wordmark vs. body) and ghost numerals, not heavier weights. |
| **Shape**   | Restrained radii — controls and cards are `rounded-md` / `rounded-lg`. The brand reads precise, not bubbly. |
| **Texture** | Eight-point star (**khatam**) lattice — inline SVG data-URI, white strokes at 5–6% opacity on deep-green planes. The brand's only repeating texture. |
| **Logo**    | Material shield silhouette (protection / guardianship metaphor) in a 10% green tile. The wordmark is `Waqf` / `وقف` only — no eyebrow. |

---

## Color tokens

All design tokens live in `src/app/globals.css` as Tailwind v4 `@theme` CSS variables.

### Primary (Waqf Green)
`primary-50` `#e6f5f1` → `primary-950` `#082520` · brand step is `primary-600` `#1f705d` · the hero and final CTA use the deep end of the scale (`primary-900`/`primary-950`) as **full-bleed planes**, never as inset rounded boxes.

### Accent (Gold)
`accent-50` `#fdf8ef` → `accent-950` `#3d2a13` · brand step is `accent-500` `#d4a056` · used **only** for:
- The `وقف` wordmark and the accent phrase inside the hero headline (+ its drawn underline)
- The hero's primary CTA (solid gold button — the one accent surface on the dark plane)
- Featured badges (`Reward`) and star ratings
- Small tick marks above stat numerals and the CTA-band divider

On light backgrounds gold is always a detail (tick, badge, text). It becomes a filled surface only once per page, on the dark hero plane.

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

- **Brand mark (hero)**: the Arabic word `وقف`, `text-6xl md:text-8xl`, gold, `Noto Sans Arabic`, paired with a thin gold hairline. This is the dominant visual anchor of the first viewport.
- **Hero headline**: `text-4xl md:text-6xl`, `font-bold`, `tracking-tight`, `leading-[1.08]`, `text-balance`. One accent phrase in gold with an SVG underline that draws itself in.
- **Section heads**: `text-3xl`/`text-4xl`, `font-bold`, `tracking-tight`.
- **Stat numbers**: `text-4xl md:text-5xl`, `font-bold`, `tracking-tight`, `tabular-nums`, near-black ink. Animated with `CountUp`; each column carries a small gold tick above.
- **Ghost numerals**: oversized step numbers (`text-[88px]`, `primary-50`) sitting behind How-It-Works content — depth through scale, not boxes.
- **Body**: `text-base` or `text-lg`, normal weight, `text-secondary-500/600`, `leading-relaxed`.
- **No eyebrows**: no uppercase pre-headings, no decorative labels above headlines.

Fonts are loaded from Google Fonts CDN at runtime (Inter + Noto Sans Arabic).

---

## Spacing & layout

- Container is **`max-w-[1280px]`** everywhere. Don't grow wider.
- Page horizontal padding: `px-4`.
- Section vertical rhythm: `py-16 md:py-24` for marketing sections; the stats strip sits tighter (`py-10 md:py-12`).
- Hero and final CTA are **edge-to-edge planes** — their content still lives in the container, the colour bleeds past it.
- Grids: marketing uses responsive grids with `gap-6` to `gap-10`.

---

## Backgrounds & textures

- **App background**: flat `#f9fbfb` — *not* white. Alternating sections use pure `bg-white` with `border-y border-waqf-border`.
- **Hero**: full-bleed `primary-950` plane with two layers:
  1. **Khatam lattice** — inline SVG data-URI (two overlapping squares forming an eight-point star, white stroke at 55%), tiled at 72px, layer opacity ~6%.
  2. **Radial vignette** — `radial-gradient(ellipse 90% 70% at 50% 0%, transparent 40%, rgba(8,37,32,0.55) 100%)`.
- **Final CTA**: full-bleed `primary-900` band with the same lattice at ~5%. A short gold rule sits above the heading. No rounded container, no dot grid.
- **How it works**: plain `bg-white` strip between hairlines. Depth comes from ghost numerals, not ambient orbs. No blurred gradient blobs anywhere.

---

## Animation

Purposeful, three families plus data:

1. **Load-in (`rise`)** — hero elements fade up 16px with a 120ms stagger (`cubic-bezier(0.22,1,.36,1)`). Defined once in `globals.css`.
2. **Scroll reveal (`reveal`)** — CSS-only via `animation-timeline: view()` (guarded by `@supports`; browsers without it simply render static). Applied to section content and grids.
3. **Hover feedback** — links slide/arrows translate 4px, domain rows tint `primary-50/50` with a scaling edge bar, project cards lift `-translate-y-1` with a soft directional shadow and a gold top bar that scales in from the start edge. No bouncy springs, no rotates, no pulse gimmicks.
4. **Data motion** — stat numerals count up once on first intersection (`CountUp.tsx`, eased cubic-out, IntersectionObserver); the hero accent underline draws itself once (SVG `stroke-dashoffset`).

Every animation has a `prefers-reduced-motion` off-switch.

---

## Hover & press states

- **Primary button (light bg)** — `bg-primary-600` → `hover:bg-primary-700`, `transition-colors`.
- **Primary button (dark plane)** — solid `bg-accent-500 text-primary-950` → `hover:bg-accent-400`.
- **Secondary button** — transparent with `border-white/30` on dark planes, or bordered slate on light; fills `white/10` or tints on hover.
- **List rows (domains)** — background tint + left edge bar scales in + title translates toward the arrow.
- **Card** — `hover:border-primary-300` + lift + soft shadow (`0 12px 32px -16px rgba(8,37,32,0.25)` — green-tinted, never black).
- **Links** — `underline-offset-4` underlines; arrow icons shift on `group-hover`.

RTL: all directional hovers mirror with `rtl:` variants; arrows flip with `-scale-x-100`.

---

## Borders, shadows, radii

- **Default border**: `1px solid #e9f1ef` (`border-waqf-border`). Universal outline; also used as full-width section hairlines.
- **Accent rules**: `border-t-2 border-primary-600` opens each How-It-Works column; small gold ticks (`w-6 h-0.5 bg-accent-500`) open stat cells.
- **Radii**: `rounded-md` on buttons/inputs, `rounded-lg` on cards. Full-bleed planes have none. Never sharp, never balloon-round.
- **Shadows**: rare. Cards sit flat until hovered; the hover shadow is directional and green-tinted.

---

## Cards

Cards exist only where they are interaction containers. The canonical card:
```tsx
className="group relative flex flex-col rounded-lg border border-waqf-border bg-white p-6
           transition-all duration-300 hover:-translate-y-1 hover:border-primary-300
           hover:shadow-[0_12px_32px_-16px_rgba(8,37,32,0.25)]"
```
With an optional top accent bar: `absolute inset-x-6 top-0 h-0.5 bg-accent-500 scale-x-0 group-hover:scale-x-100 origin-left rtl:origin-right`.

Everything else on the landing page is typographic: hairline-ruled lists and open columns — not repeated rounded rectangles.

---

## Iconography

**Lucide React** is the canonical icon family across the entire production codebase.

- Default stroke width: Lucide's default (~2px).
- Default size: `w-4 h-4` for inline text, `w-5 h-5` for buttons and affordances.
- Icons are functional (arrows, status) — **not decorative tiles**. No icon-in-rounded-square patterns.

### Key icons in use
| Icon | Where |
|---|---|
| `Shield` | Logo mark |
| `ArrowRight` | List-row and card affordances (flipped in RTL) |
| `Search` | Search bars |
| `BookOpen`, `HandHeart`, `GraduationCap`, `PiggyBank` | Explore-page category markers |
| `Globe` | Language switcher |
| `CheckCircle` | Verified organisation badge |
| `Star` (filled) | Ratings |
| `Bookmark` | Save-project action on cards |

**Emoji rule:** A single ❤️ in the footer signoff. **No other emoji as iconography.**

---

## Landing page structure

The landing page in `src/components/landing/LandingPage.tsx` is composed of these sections, in order:

1. **Hero** — full-bleed `primary-950` plane (lattice + vignette): giant gold `وقف` mark with hairline, one bilingual headline with a self-drawing gold underline, one supporting sentence, two CTAs (gold solid / ghost). Staggered `rise` load-in. Nothing else in the first viewport.
2. **Stats** — quiet white strip: four columns (Active Projects · Contributors · Contributions · Zero Platform Fees). Big tabular numerals with `CountUp`, gold ticks above, hairline dividers. No icons.
3. **Domains (Explore Domains)** — editorial index: hairline-ruled full-width rows (numbered 01–04), title + description + arrow. Hover tint, edge bar, sliding title. Not cards.
4. **How It Works** — three open columns opened by a green top rule, ghost numerals behind, small green step number. Discover → Contribute → Lasting impact.
5. **Featured Projects** — up to 3 interaction cards: status/applicant meta row, title, clamped description, skills joined by `·`, View link. Lift + gold bar on hover.
6. **Principles** — two-column statement ("Built on waqf principles"): heading left, two paragraphs right. Explains the endowment metaphor in plain words. No icon tiles.
7. **CTA band** — full-bleed `primary-900` with lattice: gold rule, centered heading, sentence, two CTAs.

## App-wide patterns

The same language applies to every surface:

- **Auth**: split layout — deep-green brand panel (lattice, gold mark, hero line) beside a form column on `waqf-bg`. No gradient washes.
- **Explore**: filter sidebar + card grid; controls use primitives; counts are plain text; category tints come from `src/lib/categories.ts`.
- **Project & campaign detail**: editorial header (status row → title → meta) separated by hairlines; impact statement on the lattice plane; no fake roadmap or activity modules.
- **Dashboard & profile**: stat treatment = gold tick + big tabular numeral + muted label; every number is a real Prisma count. Heatmap/timeline render only from real data and hide when empty.
- **Admin**: token-based surfaces; chart palettes mirror CSS variables; one shared status badge.
- **Footer**: deep-green bookend plane with lattice on all public pages.

**Never re-implement these by hand** — use the primitives (`Button`, `Input`, `StatusBadge`, `Card`, `Skeleton`) and `src/lib/categories.ts`. Hand-styled copies are how the old rainbow drifted in.

---

## Voice & tone

Formal, neutral, and direct. The product is bilingual at its core — every string ships in English and Arabic. The platform is not a community of believers; it is a place where developers ship software. The copy says what the product does, who it serves, and what to do next. Nothing more.

- **Sentence case** everywhere — body copy, buttons, section headers (`Start contributing`, `Explore domains`, `Featured projects`).
- **UPPERCASE** almost never — there are no eyebrow labels in the system.
- **You/your** when addressing the contributor.
- **No exclamation marks** except in success toasts.

### Hero line
- English: "Tech for good — work that endures"
- Arabic: "أوقف خبرتك التقنية — عمل يبقى" *(peer translation, not transliteration)*

### Arabic copy
- The platform name `وقف` is kept untranslated in Arabic copy.
- Arabic strings are **peer translations** of the English meaning, not transliterations of the English words. If a phrase only works in English, write the Arabic peer that fits the new positioning.
- Domain vocabulary (Quran, Prayer, Charity, Education, etc.) is allowed in **user-supplied project content** (project titles, descriptions, skills). It is **not** allowed in platform marketing copy.
- Never mix Latin headlines with Arabic body text in the same run — stack them as distinct elements, each in their native font.

For the full positioning rules, see `PRODUCT.md`.

---

## Don'ts

- ❌ **Don't introduce new emoji** as iconography. Stick to Lucide. The only emoji in the brand is ❤️ in the footer signoff.
- ❌ **Don't use gold (`#d4a056`) as everyday structure.** It's reward-coded and reserved for the brand mark, the enduring-work phrase, ticks/badges/ratings — and exactly one filled surface per page (the hero CTA on the dark plane).
- ❌ **Don't draw new logo marks.** Use the inline shield path in `Navbar.tsx`.
- ❌ **Don't balloon the radii.** Buttons are `rounded-md`, cards `rounded-lg`. Full-bleed planes carry no radius. The brand reads precise.
- ❌ **Don't transliterate English slogans into Arabic.** Translate the meaning, or write an Arabic peer that fits the new positioning.
- ❌ **Don't add faith-coded language to platform copy.** No "the Ummah", "sadaqah", "hasanat", "Islamic" — these belong in user content, not in the platform's voice. Explaining what a waqf *is* (the Principles section) is fine; preaching is not.
- ❌ **Don't position Waqf as an open-source-only platform.** The platform welcomes open, closed, and private projects; copy must not exclude any openness model.
- ❌ **Don't put cards where typography works.** Lists, indexes, and step columns are hairline-ruled text, not repeated rounded rectangles. A card must be an interaction container.
- ❌ **Don't fake data.** No fabricated metrics, no fake testimonials or avatars, no pulsing "live" indicators, no `animate-pulse` as a stand-in for real-time data. If the page doesn't know it, it doesn't show it.
- ❌ **Don't decorate the hero.** No floating badges, glass panels, code-window props, or sticker chips on the hero media/plane. Brand mark, headline, sentence, CTAs — done.

---

## See also

- `PRODUCT.md` — formal positioning rules, in/out vocabulary, Arabic conventions
- `src/app/globals.css` — Tailwind v4 design tokens + motion keyframes
- `src/components/landing/LandingPage.tsx` — production landing page
- `src/components/landing/CountUp.tsx` — stat numeral animation
- `src/components/layout/Navbar.tsx` — header
- `Plans/Waqf Platform Figma/` — Figma-exported UI primitives
- `Plans/Implementation_Roadmap.md` — product roadmap
