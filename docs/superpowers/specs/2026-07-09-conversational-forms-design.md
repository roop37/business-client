# Premium Conversational Forms — Design Spec

**Date:** 2026-07-09
**Project:** `business-client` (business.hoizr.com marketing site, App Router)
**Status:** Approved for planning

---

## 1. Goal

Build Typeform-style conversational forms for Meta ad landing pages. One
question per screen, **single-page / non-scrollable**, dark nightlife
aesthetic (per the attached design MD). Two concrete forms for launch:

1. **Organizer onboarding** (`/get-started`) — lead qualification.
2. **Partner / contact** (`/partner`) — demo/partnership lead capture.

Both are **ad-only** dark routes. The existing light `/contact` page stays
untouched.

## 2. Scope

**In scope:** a reusable config-driven engine + the two journeys above +
one generic email-delivery API route + dark theme tokens + conversion
tracking hooks + bot defense.

**Out of scope (YAGNI):** the other 5 MD journeys (event creation,
guestlist, checkout, etc.), a branching-graph engine, database persistence,
`react-hook-form`, `zod`, a component-library abstraction beyond what these
two forms use.

## 3. Decisions (locked)

| Question | Decision |
|---|---|
| Which forms | Onboarding + Contact (+ reusable engine) |
| Theme | Dark, per MD (`#050506` bg, glass surfaces, `#D6FF3F` accent) |
| Lead delivery | Email via Resend (no DB) — mirrors existing `/api/contact` |
| Existing `/contact` | Kept as-is; `/partner` is a new dark ad-only route alongside it |
| Routes | `/get-started`, `/partner` |

## 4. Architecture

Config-driven engine + two journey configs. Rejected: hardcoding each form
(they share ~90% behaviour — nav, validation, progress, transitions,
submit). Not using RHF/zod — a one-field-per-screen wizard wants its own
tiny step state machine, and the existing route already validates with
plain regex.

### Files

```
business-client/
  app/(forms)/layout.tsx              # dark .pcf-root scope, no nav/footer, noindex
  app/(forms)/get-started/page.tsx    # organizer onboarding (ad landing)
  app/(forms)/partner/page.tsx        # partner / contact (ad landing)
  app/api/forms/route.ts              # ONE generic Resend route: {formType, answers, meta}
  components/forms/ConversationalForm.tsx  # engine + shell + progress + keyboard + submit
  components/forms/steps.tsx               # step renderers + ChoiceCard/PremiumInput/ContinueBar
  lib/forms/schema.ts                 # PLAIN-TS field metadata (NO React) — shared client + API
  lib/forms/journeys.ts               # the two step arrays + all copy
  lib/forms/engine.ts                 # pure nav/validation helpers (unit-testable)
  styles/forms-tokens.css             # dark tokens scoped under .pcf-root
```

## 5. The engine

- **State:** `useReducer` holding `{ answers, stepIndex }`.
- **Steps:** an ordered array. A step may declare `visible(answers): boolean`.
  Hidden steps are skipped in navigation **and** in progress counts. This
  gives conditional questions (e.g. crowd size → success copy variant)
  without a branching graph.
  `// ponytail: linear + visible() predicate; add a next()-graph only if a real fork appears.`
- **Step types (only what the two forms use):** `welcome`, `single-choice`,
  `multi-choice`, `text`, `textarea`, `multi-question`, `statement`,
  `review`, `success`.
- **Transitions:** `framer-motion` `AnimatePresence` with the MD's
  enter/exit curves. `useReducedMotion()` disables them.
- **Interaction:** `Enter` = continue / select active option; per-step inline
  validation (error text below field + shake, never a toast); quiet back
  button; thin progress line showing `NN / MM` (visible-step count).

### Step object model

```ts
type StepType =
  | 'welcome' | 'single-choice' | 'multi-choice' | 'text'
  | 'textarea' | 'multi-question' | 'statement' | 'review' | 'success';

type FormStep = {
  id: string;
  section?: string;         // eyebrow label e.g. "Identity"
  type: StepType;
  eyebrow?: string;
  question?: string;
  hint?: string;
  fieldKey?: string;        // for single-field steps; maps into answers
  options?: { label: string; value: string; description?: string }[];
  fields?: string[];        // for multi-question: schema field keys
  cta?: string;             // continue-button label override
  visible?: (answers: FormAnswers) => boolean;
};

type FormAnswers = Record<string, string | string[]>;
```

### Pure engine helpers (`lib/forms/engine.ts`)

```ts
nextVisibleIndex(steps, answers, from): number
prevVisibleIndex(steps, answers, from): number
visibleSteps(steps, answers): FormStep[]      // for progress denominator
validateStep(step, answers): string | null    // returns error message or null
```

These are pure and get the one runnable assert self-check.

## 6. The two journeys (`lib/forms/journeys.ts`)

### Onboarding `/get-started` (~9 visible screens)

1. `welcome` — "Run your events like a real nightlife brand." → `[Start]`
2. `single-choice` **who are you** — Organizer / Venue / Promoter / Artist / Agency / College·IP / Other
3. `single-choice` **what you create** — Club nights / Concerts / Comedy / Pop-ups / Private invite / College / Festival-scale
4. `text` **city** — "Which city do most of your nights run in?"
5. `single-choice` **how often** — Weekly / Monthly / A few times a year / One-offs
6. `single-choice` **usual crowd size** — Under 100 / 100–300 / 300–700 / 700+
7. `single-choice` **biggest pain** — Ticketing commission / Guestlist chaos / No repeat audience / Promoter tracking / Slow settlements / Door check-in / Marketing
8. `multi-question` **contact** — name*, email*, phone, instagram
9. `review` → `success`

**`visible()` / branching rule:** crowd size `700+` swaps the **success**
copy to a sales-assist variant ("our team will reach out"). Implemented by
two `success` steps, each gated on a `visible()` predicate — no separate
flow.

### Partner / Contact `/partner` (~6 visible screens)

1. `welcome` — "Let's see how Hoizr can support your next drop." → `[Start]`
2. `single-choice` **what to fix first** — Lower commission / Faster settlements / Own customer data / Guestlist / Promoter tracking / Door ops / Marketing
3. `single-choice` **event scale** — Under 100 / 100–300 / 300–700 / 700+
4. `multi-question` **contact** — name*, email*, phone, brand/company
5. `textarea` **one-line message** (optional)
6. `review` → `success` (with WhatsApp / Call CTA, mirroring existing contact success copy)

All copy follows the MD's conversational tone and the brand contact canon
(`contact@hoizr.com`, `+91 83695 72945`, WhatsApp `wa.me/918369572945`).

## 7. Theme (`styles/forms-tokens.css`)

New dark tokens scoped under `.pcf-root` (separate from `.hoizr-marketing`
so no collision). Palette exactly per MD:

```
--pcf-bg: #050506;
--pcf-surface: rgba(255,255,255,0.055);
--pcf-surface-strong: rgba(255,255,255,0.09);
--pcf-border: rgba(255,255,255,0.12);
--pcf-border-active: rgba(214,255,63,0.75);
--pcf-text-1: #F5F5F0;
--pcf-text-2: rgba(245,245,240,0.68);
--pcf-text-muted: rgba(245,245,240,0.42);
--pcf-accent: #D6FF3F;
--pcf-accent-soft: rgba(214,255,63,0.16);
--pcf-danger: #FF5C7A;
--pcf-success: #B7FF8A;
```

- **Font:** reuse `--font-manrope` (already loaded on `<body>`). No new font.
- Layered radial + linear background gradient + subtle grain, per MD §5.2.
- The `(forms)` route group **skips `MarketingShell`**, so pages are
  full-bleed dark with no light nav/footer. Root `layout.tsx` chrome is
  already empty apart from `AppGlobals`, so this is automatic.

## 8. Backend + validation (trust boundary)

`lib/forms/schema.ts` is the **single source of truth** — a plain-TS module
with **no React imports**:

```ts
type FieldMeta = {
  key: string;
  label: string;                 // human-readable, used in email Q→A table
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'choice' | 'multi-choice';
  required?: boolean;
};

export const FORM_SCHEMAS: Record<'onboarding' | 'partner', FieldMeta[]> = { ... };
```

- **Client** engine imports it to know field types (wraps with icons/motion).
- **API route** imports the *same* module to (a) validate required / email /
  phone server-side — **never trusting the client's answer shape** — and (b)
  render the internal email's human-readable Q→A table.

`/api/forms/route.ts` reuses the existing `/api/contact` helpers
(`normalize`, `escape`, Resend dual-send: internal notify + lead
confirmation). Same 400 / 500 / 502 semantics. Request body:
`{ formType, answers, meta: { utm, fbclid, elapsedMs, honeypot } }`.

## 9. Conversion tracking (this is why it's an *ad* form)

- **utm_* + fbclid:** captured from the URL on mount, carried in `meta`,
  shown in the internal lead email → attribution per ad. Near-free.
- **PostHog:** fire `lead_submitted` on success (PostHog already mounted via
  `AppGlobals`).
- **Meta Pixel:** out of scope (per Roop, 2026-07-09). No `fbq` call, no
  Pixel snippet. `fbclid` is still captured as a plain URL param for email
  attribution — that is not the Pixel.

## 10. Full-screen without breaking (Meta in-app webview)

- Shell is `100dvh`, content vertically centered, body never scrolls.
- Only an overflowing step (review) scrolls **inside its own container**.
- Sticky bottom `ContinueBar` uses a `VisualViewport`-aware offset so the
  mobile keyboard doesn't cover it in the Instagram/Facebook in-app browser.
- **No `overflow:hidden` on body** — pinch-zoom stays intact (root layout
  deliberately preserves WCAG 1.4.4).
- **Must be verified in the IG/FB in-app webview** before "done" — this is
  the classic Typeform-clone breakage point.

## 11. Bot defense (new — paid traffic draws bots)

API route adds a **honeypot field** (hidden input; non-empty = reject) + a
**submit-timing check** (reject sub-2s submissions). Cheap; the existing
routes have none.

## 12. Accessibility

Semantic `<label>`s; keyboard-selectable choices with visible focus rings;
`aria-live` errors programmatically tied to fields; `useReducedMotion()`
honored; contrast not reliant on the neon accent alone.

## 13. Testing

`lib/forms/engine.ts` (pure: `nextVisibleIndex`, `prevVisibleIndex`,
`validateStep`, `visibleSteps`) gets **one runnable assert-based
self-check**. Rendering/motion not unit-tested. No frameworks/fixtures.

## 14. Non-goals / deliberate simplifications

- Linear step array + `visible()` predicate, not a branching graph.
- No autosave / draft persistence (short forms, single session).
- No DB — email only.
- No sound.
- Only the MD step types the two forms use are implemented.
