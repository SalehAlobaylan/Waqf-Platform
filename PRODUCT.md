# Waqf — Product Positioning

## What we are

Waqf is a contribution platform for developers. We match people who want to contribute their time and skills with project owners who need help — whether the project is open-source, closed-source, or private.

The name "Waqf" — an Arabic word for an enduring charitable endowment — is a metaphor for the kind of impact we want to enable: code that keeps serving people long after the merge.

## What we are not

Waqf is not a religious platform. It is not affiliated with any faith, sect, or community of belief. The product does not assume, signal, or require any particular faith identity from its users.

Waqf is not exclusive to open-source projects. The platform welcomes open, closed, and private projects alike; what matters is that there is real work to be done and willing contributors.

## Audience

- **Contributors** — developers, designers, writers, and other technical contributors looking for meaningful projects to work on.
- **Project owners** — maintainers, teams, and organizations who have projects that need help, of any openness model.

Both sides are joined by a desire to ship software that matters. The conversation is about code, skills, scope, and timing — not doctrine, license, or repository visibility.

## Voice and tone

- **Formal and neutral.** Professional but not stiff.
- **Direct.** State the value, name the action, stop.
- **Plain.** Avoid jargon, slogans, and rhetorical flourishes.
- **Bilingual by default.** English is the source; Arabic is a peer translation, not a transliteration. Idioms, not literals.

## Naming

| In | Out |
| --- | --- |
| Waqf (the platform) | Waqf as a slogan or invocation |
| Tech for Good (hero line) | "Tech for the Ummah" |
| Lasting impact / compounds over time | "Sadaqah Jariyah" / "eternal reward" / "Hereafter" |
| Open-source community | "the Ummah" / "the Muslim developer community" |
| Developer / contributor | "Muslim developer" / "Islamic developer" |
| Project impact | "Sadaqah Jariyah impact" |

## In-scope vocabulary

These words are product-taxonomy terms, not slogans. They describe what kinds of projects can be hosted on the platform. They are not user-facing marketing copy.

- Domain categories: `Quran`, `Prayer`, `Charity`, `Education`, `Community`, `Tools`, `Finance`.
- The platform name: `Waqf` / `وقف`.
- Project openness: `open`, `closed`, `private` — all are valid project states on the platform. Never claim the platform is "open source" as a whole.

## Out-of-scope vocabulary

These words and phrases are excluded from all user-facing copy (EN and AR), metadata, email templates, and design system examples. Keys in `messages/*.json` may still reference them as internal identifiers, but **the rendered values must not contain them**.

- `Sadaqah Jariyah` / `sadaqah jariyah` / `صدقة جارية`
- `Hasanat` / `hasanat` / `حسنات`
- `Ummah` / `ummah` / `الأمة` (when used to mean a community of believers)
- `Muslim` / `Islamic` / `إسلامي` / `مسلمين` (as audience descriptors, not as user-supplied project content)
- `Halal` (in user-facing marketing copy; domain category labels are out of scope)
- `Hereafter` / `الآخرة` (as a marketing hook)
- `Hasanat++` / `buildForUmmah` / `sadaqah` (as code identifiers shown to users in marketing material)
- "Sadaqah Jariyah through Code" / "صدقة جارية من خلال الكود"
- "Tech for the Ummah"
- `open-source` / `open source` / `Open Source` (as a platform-wide descriptor; the platform supports all openness models, not just open source)
- "100% Open Source" (false claim — no longer accurate after the platform opened to closed and private projects)
- "Open Source Community" (as a synonym for "the community" — the community is open to all developers regardless of project license)

## Arabic conventions

- The platform name is `وقف` — keep it untranslated in Arabic copy.
- The hero line "Tech for Good" is the English primary; its Arabic peer is "أوقف خبرتك التقنية" (a wordplay on `وقف`). It is **not** a transliteration.
- Do not transliterate English slogans into Arabic. Translate the meaning, or write an Arabic peer that fits the new positioning.
- Use `مشاريع` (projects) on its own — do not add `مفتوحة المصدر` (open source) as a qualifier when referring to projects in general. Specify the openness only when it is actually a property of the project being discussed.
- Islamic-domain terms used in **user-supplied project content** (e.g. a project description that says "Quran memorization app") are user data and stay as-is. The platform's own copy must not introduce them.

## Review checklist

When reviewing or adding any user-facing string, ask:

1. Does the string position Waqf as an open-source platform, or as a community of believers?
2. Does it promise a particular kind of reward (in this life or the next)?
3. Does it use any of the out-of-scope vocabulary above?
4. Does the string exclude closed or private projects, when it shouldn't?
5. Is the Arabic a peer translation that fits the new positioning — or a transliteration of an old slogan?

If any answer is "yes / it's a transliteration", rewrite it.

## Related docs

- `DESIGN.md` — visual identity, design tokens, voice & tone in the UI.
