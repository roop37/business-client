# Premium Conversational Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two Typeform-style, single-screen, dark conversational lead forms (`/get-started` onboarding, `/partner` contact) for Meta ad landing pages in `business-client`.

**Architecture:** One config-driven engine (`useReducer`, linear step array with `visible()` predicates) renders both journeys. All non-trivial logic lives in a pure, React-free module (`lib/forms/*`) so it is unit-testable with `npx tsx` and importable by both the client engine and the server API route. Leads are delivered by one generic Resend route mirroring the existing `/api/contact` pattern (no DB). Dark theme is scoped under `.pcf-root`; the `(forms)` route group skips `MarketingShell` for a full-bleed dark surface.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5, framer-motion 11, lucide-react, Resend, PostHog (already mounted). No new dependencies.

## Global Constraints

- **No new npm dependencies.** `zod`, `react-hook-form`, `tsx`, jest, vitest are NOT installed and must NOT be added. Self-checks run via `npx tsx` (fetched on demand, not saved to `package.json`).
- **Pure module has zero React/Next/Resend imports.** `lib/forms/schema.ts`, `lib/forms/engine.ts`, `lib/forms/journeys.ts` use only relative imports among themselves and plain TS. This is what makes them `tsx`-runnable and safe to import server-side.
- **Trust boundary:** the API route MUST re-validate every field server-side via the shared schema. Never trust the client's answer shape.
- **Theme tokens:** dark palette exactly per spec §7, scoped under `.pcf-root`. Accent `#D6FF3F`. Font: reuse `--font-manrope` (already on `<body>`) — no new font.
- **Full-screen rule:** shell is `100dvh`, body never scrolls; only the review step scrolls inside its own container. NO `overflow:hidden` on `body`/`html` beyond what globals already set (pinch-zoom must survive — WCAG 1.4.4).
- **noindex** on both form pages (`robots: { index: false, follow: false }`).
- **Brand contact canon:** `contact@hoizr.com`, phone `+91 83695 72945` (`tel:+918369572945`), WhatsApp `https://wa.me/918369572945`. Legal link `https://business.hoizr.com/legal/privacy`.
- **Meta Pixel is OUT of scope.** No `fbq`. `fbclid` is captured only as a plain URL param for email attribution.
- Commit after each task. Branch is `dev` (do not create a new branch unless asked).

---

### Task 1: Pure forms module (schema + engine + journeys) with self-check

The tested core. No React. This is the only task with an assert-based test.

**Files:**
- Create: `business-client/lib/forms/schema.ts`
- Create: `business-client/lib/forms/engine.ts`
- Create: `business-client/lib/forms/journeys.ts`
- Test: `business-client/lib/forms/__selfcheck__.ts`

**Interfaces:**
- Produces (consumed by Tasks 2, 4, 5, 6):
  - `type FormType = 'onboarding' | 'partner'`
  - `type FieldMeta = { key: string; label: string; type: 'text'|'email'|'tel'|'url'|'textarea'|'choice'|'multi-choice'; required?: boolean }`
  - `type FormAnswers = Record<string, string | string[]>`
  - `FORM_SCHEMAS: Record<FormType, FieldMeta[]>`
  - `getField(formType: FormType, key: string): FieldMeta | undefined`
  - `validateField(meta: FieldMeta, value: unknown): string | null`
  - `validateAnswers(formType: FormType, answers: FormAnswers): { ok: boolean; error?: string }`
  - `type FormStep` (see code)
  - `JOURNEYS: Record<FormType, FormStep[]>`
  - `visibleSteps(steps, answers): FormStep[]`
  - `nextVisibleIndex(steps, answers, from): number`
  - `prevVisibleIndex(steps, answers, from): number`
  - `validateStep(formType, step, answers): string | null`

- [ ] **Step 1: Write the failing self-check**

Create `business-client/lib/forms/__selfcheck__.ts`:

```ts
import assert from "node:assert/strict";
import { FORM_SCHEMAS, getField, validateField, validateAnswers } from "./schema";
import { JOURNEYS, visibleSteps, nextVisibleIndex, prevVisibleIndex, validateStep } from "./engine";
import type { FormAnswers } from "./schema";

// --- validateField ---
assert.equal(validateField({ key: "email", label: "Email", type: "email", required: true }, ""), "Add your email so we can reach you.");
assert.equal(validateField({ key: "email", label: "Email", type: "email", required: true }, "nope"), "That email doesn't look right.");
assert.equal(validateField({ key: "email", label: "Email", type: "email", required: true }, "a@b.co"), null);
assert.equal(validateField({ key: "phone", label: "Phone", type: "tel" }, ""), null, "optional phone empty is ok");
assert.equal(validateField({ key: "phone", label: "Phone", type: "tel" }, "123"), "That phone number doesn't look right.");
assert.equal(validateField({ key: "phone", label: "Phone", type: "tel" }, "+91 9876543210"), null);

// --- validateAnswers (server trust boundary) ---
assert.equal(validateAnswers("partner", { name: "A", email: "a@b.co" }).ok, false, "partner requires name>=2");
assert.equal(validateAnswers("partner", { name: "Aanya", email: "bad" }).ok, false);
assert.equal(validateAnswers("partner", { name: "Aanya", email: "a@b.co" }).ok, true);

// --- schema/journey integrity: every step fieldKey/fields exists in schema ---
for (const formType of ["onboarding", "partner"] as const) {
  const keys = new Set(FORM_SCHEMAS[formType].map((f) => f.key));
  for (const step of JOURNEYS[formType]) {
    if (step.fieldKey) assert.ok(keys.has(step.fieldKey), `${formType}/${step.id}: unknown fieldKey ${step.fieldKey}`);
    for (const k of step.fields ?? []) assert.ok(keys.has(k), `${formType}/${step.id}: unknown field ${k}`);
    if (step.type === "single-choice" || step.type === "multi-choice") {
      assert.ok((step.options?.length ?? 0) > 0, `${formType}/${step.id}: choice step needs options`);
    }
  }
}

// --- navigation skips hidden steps ---
const steps = JOURNEYS.onboarding;
const smallCrowd: FormAnswers = { crowdSize: "Under 100" };
const bigCrowd: FormAnswers = { crowdSize: "700+" };
// exactly one success step is visible for each crowd branch
const vSmall = visibleSteps(steps, smallCrowd).filter((s) => s.type === "success");
const vBig = visibleSteps(steps, bigCrowd).filter((s) => s.type === "success");
assert.equal(vSmall.length, 1, "one success visible for small crowd");
assert.equal(vBig.length, 1, "one success visible for big crowd");
assert.notEqual(vSmall[0].id, vBig[0].id, "the two crowd branches show different success screens");

// nextVisibleIndex never lands on a hidden step
const idx0 = 0;
const n = nextVisibleIndex(steps, bigCrowd, idx0);
assert.ok(n > idx0 && (steps[n].visible?.(bigCrowd) ?? true), "next lands on a visible step");
assert.equal(prevVisibleIndex(steps, bigCrowd, n), idx0, "prev returns to start");

// --- validateStep gates required choice ---
const whoStep = steps.find((s) => s.id === "who")!;
assert.ok(validateStep("onboarding", whoStep, {}), "unanswered required choice blocks");
assert.equal(validateStep("onboarding", whoStep, { role: "Organizer" }), null, "answered choice passes");

console.log("forms selfcheck OK");
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd business-client && npx --yes tsx lib/forms/__selfcheck__.ts`
Expected: FAIL — `Cannot find module './schema'` (files don't exist yet).

- [ ] **Step 3: Write `lib/forms/schema.ts`**

```ts
// Pure, React-free. Single source of truth for field metadata +
// validation. Imported by the client engine AND the server API route.

export type FormType = "onboarding" | "partner";

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "choice"
  | "multi-choice";

export type FieldMeta = {
  key: string;
  label: string; // human-readable — also used in the internal email Q→A table
  type: FieldType;
  required?: boolean;
};

export type FormAnswers = Record<string, string | string[]>;

// Mirrors the regexes in app/api/contact/route.ts so behaviour matches.
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RX = /^[+\d][\d\s().-]{6,}$/;
const URL_RX = /^https?:\/\/.+|^[\w-]+\.[\w.-]+/;

export const FORM_SCHEMAS: Record<FormType, FieldMeta[]> = {
  onboarding: [
    { key: "role", label: "Who they are", type: "choice", required: true },
    { key: "createsWhat", label: "What they create", type: "choice", required: true },
    { key: "city", label: "City", type: "text", required: true },
    { key: "frequency", label: "How often they host", type: "choice", required: true },
    { key: "crowdSize", label: "Usual crowd size", type: "choice", required: true },
    { key: "pain", label: "Biggest pain", type: "choice", required: true },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "instagram", label: "Instagram", type: "text" },
  ],
  partner: [
    { key: "fixFirst", label: "What they want to fix first", type: "choice", required: true },
    { key: "eventScale", label: "Event scale", type: "choice", required: true },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "company", label: "Brand / company", type: "text" },
    { key: "message", label: "Message", type: "textarea" },
  ],
};

export const getField = (formType: FormType, key: string): FieldMeta | undefined =>
  FORM_SCHEMAS[formType].find((f) => f.key === key);

const asString = (value: unknown): string =>
  Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value.trim() : "";

// Returns an error message, or null when valid.
export const validateField = (meta: FieldMeta, value: unknown): string | null => {
  const v = asString(value);
  if (!v) {
    if (!meta.required) return null;
    if (meta.type === "email") return "Add your email so we can reach you.";
    if (meta.type === "choice" || meta.type === "multi-choice") return "Pick an option to continue.";
    return `Add your ${meta.label.toLowerCase()} to continue.`;
  }
  if (meta.type === "email" && !EMAIL_RX.test(v)) return "That email doesn't look right.";
  if (meta.type === "tel" && !PHONE_RX.test(v)) return "That phone number doesn't look right.";
  if (meta.type === "url" && !URL_RX.test(v)) return "That link doesn't look right.";
  if (meta.key === "name" && v.length < 2) return "Please share your name.";
  return null;
};

// Server-side trust boundary: validate the entire submitted answer set
// against the schema, independent of whatever the client sent.
export const validateAnswers = (
  formType: FormType,
  answers: FormAnswers,
): { ok: boolean; error?: string } => {
  for (const meta of FORM_SCHEMAS[formType]) {
    const err = validateField(meta, answers[meta.key]);
    if (err) return { ok: false, error: err };
  }
  return { ok: true };
};
```

- [ ] **Step 4: Write `lib/forms/engine.ts`**

```ts
// Pure navigation + per-step validation over a linear step array with
// visible() predicates. No React.
import {
  type FormAnswers,
  type FormType,
  getField,
  validateField,
} from "./schema";
import { JOURNEYS } from "./journeys";

export { JOURNEYS };
export type { FormStep } from "./journeys";

import type { FormStep } from "./journeys";

const isVisible = (step: FormStep, answers: FormAnswers): boolean =>
  step.visible ? step.visible(answers) : true;

export const visibleSteps = (steps: FormStep[], answers: FormAnswers): FormStep[] =>
  steps.filter((s) => isVisible(s, answers));

export const nextVisibleIndex = (
  steps: FormStep[],
  answers: FormAnswers,
  from: number,
): number => {
  for (let i = from + 1; i < steps.length; i++) {
    if (isVisible(steps[i], answers)) return i;
  }
  return from; // already at last visible step
};

export const prevVisibleIndex = (
  steps: FormStep[],
  answers: FormAnswers,
  from: number,
): number => {
  for (let i = from - 1; i >= 0; i--) {
    if (isVisible(steps[i], answers)) return i;
  }
  return from;
};

// Returns first validation error for the step, or null when the step
// may advance. welcome/statement/review/success never block.
export const validateStep = (
  formType: FormType,
  step: FormStep,
  answers: FormAnswers,
): string | null => {
  if (step.type === "single-choice" || step.type === "multi-choice") {
    if (step.optional) return null;
    const meta = step.fieldKey ? getField(formType, step.fieldKey) : undefined;
    const value = step.fieldKey ? answers[step.fieldKey] : undefined;
    return meta ? validateField(meta, value) : (value ? null : "Pick an option to continue.");
  }
  if (step.type === "text" || step.type === "textarea") {
    if (!step.fieldKey) return null;
    const meta = getField(formType, step.fieldKey);
    return meta ? validateField(meta, answers[step.fieldKey]) : null;
  }
  if (step.type === "multi-question") {
    for (const key of step.fields ?? []) {
      const meta = getField(formType, key);
      if (!meta) continue;
      const err = validateField(meta, answers[key]);
      if (err) return err;
    }
    return null;
  }
  return null; // welcome, statement, review, success
};
```

- [ ] **Step 5: Write `lib/forms/journeys.ts`**

```ts
// Pure data + visible() predicates. No React. Copy follows the design
// MD's conversational tone + Hoizr brand contact canon.
import type { FormAnswers } from "./schema";

export type StepType =
  | "welcome"
  | "single-choice"
  | "multi-choice"
  | "text"
  | "textarea"
  | "multi-question"
  | "statement"
  | "review"
  | "success";

export type StepOption = { label: string; value: string; description?: string };

export type FormStep = {
  id: string;
  type: StepType;
  section?: string; // eyebrow
  question?: string;
  hint?: string;
  fieldKey?: string; // single-field steps
  fields?: string[]; // multi-question: schema keys
  options?: StepOption[];
  placeholder?: string;
  cta?: string; // continue-button label override
  optional?: boolean; // choice/text steps that may be skipped
  // success-step copy:
  successTitle?: string;
  successBody?: string;
  visible?: (answers: FormAnswers) => boolean;
};

const opts = (...labels: string[]): StepOption[] =>
  labels.map((label) => ({ label, value: label }));

const bigCrowd = (a: FormAnswers) => a.crowdSize === "700+";
const smallCrowd = (a: FormAnswers) => a.crowdSize !== "700+";

export const JOURNEYS: Record<"onboarding" | "partner", FormStep[]> = {
  onboarding: [
    {
      id: "welcome",
      type: "welcome",
      section: "Hoizr for organizers",
      question: "Run your events like a real nightlife brand.",
      hint: "Tell us what you're building. We'll shape the right Hoizr setup around it — under a minute.",
      cta: "Start",
    },
    {
      id: "who",
      type: "single-choice",
      section: "Identity",
      question: "Who are you building for?",
      fieldKey: "role",
      options: opts("Organizer", "Venue", "Promoter", "Artist", "Agency", "College / IP", "Other"),
    },
    {
      id: "creates",
      type: "single-choice",
      section: "Identity",
      question: "What kind of experiences do you usually create?",
      fieldKey: "createsWhat",
      options: opts("Club nights", "Concerts", "Comedy shows", "Pop-ups", "Private invite-only", "College events", "Festival-scale"),
    },
    {
      id: "city",
      type: "text",
      section: "Reach",
      question: "Which city do most of your nights run in?",
      hint: "Example: Mumbai, Pune, Bangalore.",
      fieldKey: "city",
      placeholder: "Mumbai",
    },
    {
      id: "frequency",
      type: "single-choice",
      section: "Reach",
      question: "How often do you put on events?",
      fieldKey: "frequency",
      options: opts("Every week", "A few times a month", "Monthly", "A few times a year", "One-offs"),
    },
    {
      id: "crowd",
      type: "single-choice",
      section: "Reach",
      question: "What's your usual crowd size?",
      fieldKey: "crowdSize",
      options: opts("Under 100", "100–300", "300–700", "700+"),
    },
    {
      id: "pain",
      type: "single-choice",
      section: "The problem",
      question: "What's your biggest pain right now?",
      hint: "Pick the one that stings most.",
      fieldKey: "pain",
      options: opts("Ticketing commission", "Guestlist chaos", "No repeat audience", "Promoter tracking", "Slow settlements", "Door check-in", "Marketing"),
    },
    {
      id: "contact",
      type: "multi-question",
      section: "You",
      question: "Where should we reach you?",
      hint: "A real human follows up within one working day.",
      fields: ["name", "email", "phone", "instagram"],
    },
    { id: "review", type: "review", section: "Review", question: "Look right?" },
    {
      id: "success-self",
      type: "success",
      successTitle: "You're on the list.",
      successBody: "We've got your details. A real human will reach out within one working day with the fastest path onto Hoizr.",
      visible: smallCrowd,
    },
    {
      id: "success-sales",
      type: "success",
      successTitle: "Let's talk properly.",
      successBody: "Events at your scale get white-glove onboarding. Our team will reach out personally within one working day to set you up.",
      visible: bigCrowd,
    },
  ],
  partner: [
    {
      id: "welcome",
      type: "welcome",
      section: "Partner with Hoizr",
      question: "Let's see how Hoizr can support your next drop.",
      hint: "This takes less than a minute.",
      cta: "Start",
    },
    {
      id: "fix",
      type: "single-choice",
      section: "The problem",
      question: "What are you trying to fix first?",
      fieldKey: "fixFirst",
      options: opts("Lower commission", "Faster settlements", "Own customer data", "Guestlist", "Promoter tracking", "Door ops", "Marketing"),
    },
    {
      id: "scale",
      type: "single-choice",
      section: "Scale",
      question: "How big is your usual event?",
      fieldKey: "eventScale",
      options: opts("Under 100", "100–300", "300–700", "700+"),
    },
    {
      id: "contact",
      type: "multi-question",
      section: "You",
      question: "Where should we reach you?",
      fields: ["name", "email", "phone", "company"],
    },
    {
      id: "message",
      type: "textarea",
      section: "You",
      question: "Anything you want us to know?",
      hint: "One line is enough. Optional.",
      fieldKey: "message",
      placeholder: "We run 4 club nights a month across Mumbai and Pune…",
      optional: true,
    },
    { id: "review", type: "review", section: "Review", question: "Look right?" },
    {
      id: "success",
      type: "success",
      successTitle: "Got it — we'll be in touch.",
      successBody: "A real human will follow up within one working day. Need us sooner? Reach out below.",
    },
  ],
};
```

- [ ] **Step 6: Run the self-check to verify it passes**

Run: `cd business-client && npx --yes tsx lib/forms/__selfcheck__.ts`
Expected: prints `forms selfcheck OK`, exit 0.

- [ ] **Step 7: Typecheck the module compiles under the project tsconfig**

Run: `cd business-client && npx tsc --noEmit`
Expected: no errors introduced by the new files (pre-existing errors, if any, unchanged).

- [ ] **Step 8: Commit**

```bash
cd business-client
git add lib/forms/schema.ts lib/forms/engine.ts lib/forms/journeys.ts lib/forms/__selfcheck__.ts
git commit -m "feat(forms): pure conversational-form schema, engine & journeys + selfcheck"
```

---

### Task 2: Generic lead-delivery API route

Thin glue: parse → honeypot/timing → `validateAnswers` → Resend dual-send. Verified by build + a manual curl, not a unit test (all logic is in Task 1's pure module).

**Files:**
- Create: `business-client/app/api/forms/route.ts`
- Reference: `business-client/app/api/contact/route.ts` (helper patterns to mirror)

**Interfaces:**
- Consumes: `validateAnswers`, `FORM_SCHEMAS`, `getField`, `FormType`, `FormAnswers` from `lib/forms/schema`.
- Accepts POST body: `{ formType: FormType; answers: FormAnswers; meta?: { utm?: Record<string,string>; fbclid?: string; elapsedMs?: number; honeypot?: string } }`
- Returns: `{ ok: true }` (200) | `{ ok: false, error }` (400/500/502).

- [ ] **Step 1: Write the route**

Create `business-client/app/api/forms/route.ts`:

```ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  FORM_SCHEMAS,
  getField,
  validateAnswers,
  type FormAnswers,
  type FormType,
} from "@/lib/forms/schema";

export const runtime = "nodejs";

const FROM_ADDRESS = "Sanbedan Paul <contact@hoizr.com>";
const REPLY_TO = "contact@hoizr.com";
const DEFAULT_NOTIFY_TO = "tech@hoizr.com,contact@hoizr.com";
const NOTIFY_TO = (
  process.env.CONTACT_NOTIFY_EMAIL ??
  process.env.WAITLIST_NOTIFY_EMAIL ??
  DEFAULT_NOTIFY_TO
)
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://business.hoizr.com";
const LOGO_URL = `${SITE_URL}/logo/logoDark.png`;
const MIN_ELAPSED_MS = 2000;

const FORM_LABELS: Record<FormType, string> = {
  onboarding: "Organizer onboarding",
  partner: "Partner enquiry",
};

type FormMeta = {
  utm?: Record<string, string>;
  fbclid?: string;
  elapsedMs?: number;
  honeypot?: string;
};

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const asString = (v: unknown): string =>
  Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v.trim() : "";

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Email service is not configured." }, { status: 500 });
  }

  let body: { formType?: string; answers?: FormAnswers; meta?: FormMeta };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const formType = body.formType as FormType;
  if (formType !== "onboarding" && formType !== "partner") {
    return NextResponse.json({ ok: false, error: "Unknown form." }, { status: 400 });
  }

  const meta = body.meta ?? {};
  // Bot defense: honeypot must be empty; humans take >2s to fill a form.
  if (meta.honeypot) return NextResponse.json({ ok: true }); // silently accept-and-drop bots
  if (typeof meta.elapsedMs === "number" && meta.elapsedMs < MIN_ELAPSED_MS) {
    return NextResponse.json({ ok: true });
  }

  const answers = (body.answers ?? {}) as FormAnswers;
  const check = validateAnswers(formType, answers);
  if (!check.ok) {
    return NextResponse.json({ ok: false, error: check.error }, { status: 400 });
  }

  const name = asString(answers.name) || "Someone";
  const email = asString(answers.email).toLowerCase();
  const resend = new Resend(apiKey);

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        replyTo: REPLY_TO,
        subject: "We received your Hoizr enquiry",
        html: renderUserEmail(name),
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: NOTIFY_TO,
        replyTo: email,
        subject: `New Hoizr ${FORM_LABELS[formType]} — ${name}`,
        html: renderInternalEmail(formType, answers, meta),
      }),
    ]);
  } catch (err) {
    console.error("[forms] resend send failed", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't send that right now. Try emailing contact@hoizr.com directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function renderUserEmail(name: string) {
  const firstName = (name.split(" ")[0] ?? name).trim() || name;
  return `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:48px 16px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f;">
    <tr><td align="center"><table role="presentation" width="100%" style="max-width:560px;">
      <tr><td style="padding-bottom:36px;"><img src="${LOGO_URL}" alt="Hoizr" width="92" height="28" style="display:block;height:28px;width:auto;border:0;" /></td></tr>
      <tr><td style="font-size:17px;line-height:1.55;color:#1d1d1f;">
        <p style="margin:0 0 18px;">Hey ${escape(firstName)},</p>
        <p style="margin:0 0 18px;">Thanks for reaching out to Hoizr. I&rsquo;ve received your details and will review the event context personally.</p>
        <p style="margin:0 0 28px;">&mdash; Sanbedan</p>
      </td></tr>
      <tr><td style="font-size:13px;line-height:1.6;color:#86868b;padding-top:18px;border-top:1px solid #e5e5e7;">
        <p style="margin:0 0 4px;font-weight:600;color:#1d1d1f;">Sanbedan Paul</p>
        <p style="margin:0 0 10px;">Founder &amp; CEO · Hoizr Technologies Pvt. Ltd.</p>
        <p style="margin:0;"><a href="mailto:contact@hoizr.com" style="color:#1d1d1f;">contact@hoizr.com</a> · <a href="https://business.hoizr.com" style="color:#1d1d1f;">business.hoizr.com</a></p>
      </td></tr>
    </table></td></tr>
  </table></body></html>`;
}

function renderInternalEmail(formType: FormType, answers: FormAnswers, meta: FormMeta) {
  const rows = FORM_SCHEMAS[formType]
    .map((f) => [f.label, asString(answers[f.key])] as [string, string])
    .filter(([, v]) => Boolean(v));

  const utmPairs = Object.entries(meta.utm ?? {}).filter(([, v]) => Boolean(v));
  if (meta.fbclid) utmPairs.push(["fbclid", meta.fbclid]);
  const attribution = utmPairs.length
    ? `<p style="margin:16px 0 0;font-size:12px;color:#7a7e75;">Attribution: ${utmPairs.map(([k, v]) => `${escape(k)}=${escape(v)}`).join(" · ")}</p>`
    : "";

  return `<!doctype html><html><body style="margin:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0e0f0c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:14px;border:1px solid #ececea;"><tr><td style="padding:24px 28px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5a5e55;">${escape(FORM_LABELS[formType])}</div>
      <h1 style="margin:6px 0 18px;font-size:20px;font-weight:700;">${escape(asString(answers.name) || "New lead")}</h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #ececea;">
        ${rows
          .map(
            ([label, value], i) => `<tr>
          <td style="padding:10px 0;width:140px;color:#7a7e75;${i ? "border-top:1px solid #f1f1ee;" : ""}vertical-align:top;">${escape(label)}</td>
          <td style="padding:10px 0;${i ? "border-top:1px solid #f1f1ee;" : ""}white-space:pre-wrap;">${
            label === "Email" ? `<a href="mailto:${escape(value)}" style="color:#0e0f0c;">${escape(value)}</a>` : escape(value)
          }</td></tr>`,
          )
          .join("")}
      </table>
      ${attribution}
    </td></tr></table>
  </td></tr></table></body></html>`;
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `cd business-client && npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Manual sanity — validation rejects bad input without email keys set**

Run:
```bash
cd business-client && yarn dev  # in one terminal
# in another:
curl -s -XPOST localhost:3000/api/forms -H 'content-type: application/json' \
  -d '{"formType":"partner","answers":{"name":"A"}}' | cat
```
Expected: `{"ok":false,"error":"That email doesn't look right."}` (name<2 or missing email → 400). Confirms the trust boundary rejects before touching Resend. (If `RESEND_API_KEY` is unset you'll get the 500 config message first — that's also acceptable proof the route is wired.)

- [ ] **Step 4: Commit**

```bash
cd business-client
git add app/api/forms/route.ts
git commit -m "feat(forms): generic Resend lead route with server validation, honeypot & attribution"
```

---

### Task 3: Dark theme tokens + `(forms)` route-group layout

**Files:**
- Create: `business-client/styles/forms-tokens.css`
- Modify: `business-client/styles/globals.css:2` (add one `@import`)
- Create: `business-client/app/(forms)/layout.tsx`

**Interfaces:**
- Produces: `.pcf-root` scope with the dark token set + `hm`-style helper classes reused by Tasks 4–6 (`pcf-btn`, `pcf-choice`, `pcf-input`, `pcf-progress`, etc.).

- [ ] **Step 1: Write `styles/forms-tokens.css`**

```css
/* =============================================================
   Premium Conversational Forms — dark tokens (ad landing pages).
   Scoped under `.pcf-root` so it never touches the light marketing
   site (.hoizr-marketing) or the dashboard. Palette per design MD.
   ============================================================= */
.pcf-root {
  --pcf-bg: #050506;
  --pcf-surface: rgba(255, 255, 255, 0.055);
  --pcf-surface-strong: rgba(255, 255, 255, 0.09);
  --pcf-border: rgba(255, 255, 255, 0.12);
  --pcf-border-active: rgba(214, 255, 63, 0.75);
  --pcf-text-1: #f5f5f0;
  --pcf-text-2: rgba(245, 245, 240, 0.68);
  --pcf-text-muted: rgba(245, 245, 240, 0.42);
  --pcf-accent: #d6ff3f;
  --pcf-accent-soft: rgba(214, 255, 63, 0.16);
  --pcf-danger: #ff5c7a;
  --pcf-success: #b7ff8a;

  --pcf-font: var(--font-manrope), -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  --pcf-q-desktop: clamp(2rem, 4vw, 3.6rem);
  --pcf-q-mobile: clamp(1.6rem, 8vw, 2.6rem);

  position: fixed;
  inset: 0;
  min-height: 100dvh;
  color: var(--pcf-text-1);
  font-family: var(--pcf-font);
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.01em;
  background:
    radial-gradient(circle at 20% 10%, rgba(214, 255, 63, 0.12), transparent 24%),
    radial-gradient(circle at 80% 80%, rgba(122, 167, 255, 0.1), transparent 28%),
    linear-gradient(180deg, #09090a 0%, #050506 100%);
}
.pcf-root * { box-sizing: border-box; }

/* Shell — vertically centered, body never scrolls. */
.pcf-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 24px;
}
.pcf-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}
/* Only the review step may scroll, inside itself. */
.pcf-scroll { max-height: 60dvh; overflow-y: auto; }

.pcf-eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--pcf-text-muted);
}
.pcf-question {
  font-family: var(--pcf-font);
  font-weight: 700;
  font-size: var(--pcf-q-desktop);
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--pcf-text-1);
  text-wrap: balance;
}
@media (max-width: 640px) {
  .pcf-question { font-size: var(--pcf-q-mobile); }
  .pcf-shell { padding: 20px; }
}
.pcf-hint { margin-top: 14px; font-size: 15px; line-height: 1.5; color: var(--pcf-text-2); }

/* Choice card */
.pcf-choice {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid var(--pcf-border);
  background: var(--pcf-surface);
  color: var(--pcf-text-1);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
}
.pcf-choice:hover { transform: translateY(-3px); border-color: rgba(255, 255, 255, 0.28); background: var(--pcf-surface-strong); }
.pcf-choice[data-selected="true"] {
  border-color: var(--pcf-border-active);
  background: var(--pcf-accent-soft);
  box-shadow: 0 0 0 1px var(--pcf-border-active);
}
.pcf-choice__key {
  flex-shrink: 0;
  width: 26px; height: 26px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 7px;
  border: 1px solid var(--pcf-border);
  font-size: 12px; font-weight: 700;
  color: var(--pcf-text-2);
}
.pcf-choice[data-selected="true"] .pcf-choice__key {
  background: var(--pcf-accent); color: #0a0a06; border-color: var(--pcf-accent);
}

/* Input */
.pcf-input {
  width: 100%;
  background: transparent;
  border: 0;
  border-bottom: 2px solid var(--pcf-border);
  padding: 12px 2px;
  font-family: var(--pcf-font);
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  color: var(--pcf-text-1);
  outline: none;
  transition: border-color 160ms ease;
}
.pcf-input::placeholder { color: var(--pcf-text-muted); }
.pcf-input:focus { border-color: var(--pcf-border-active); }
.pcf-input--glass {
  border: 1px solid var(--pcf-border);
  border-radius: 12px;
  background: var(--pcf-surface);
  padding: 14px 16px;
  font-size: 16px;
}
.pcf-input--glass:focus { border-color: var(--pcf-border-active); }
.pcf-label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--pcf-text-muted); margin-bottom: 8px; }
.pcf-error { margin-top: 10px; font-size: 13.5px; color: var(--pcf-danger); }

/* Continue bar */
.pcf-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding-top: 20px;
}
.pcf-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 22px; border-radius: 999px; border: 0;
  font-family: var(--pcf-font); font-size: 15px; font-weight: 600; cursor: pointer;
  transition: transform 140ms ease, background 160ms ease, opacity 160ms ease;
}
.pcf-btn:active { transform: translateY(1px); }
.pcf-btn--primary { background: var(--pcf-accent); color: #0a0a06; box-shadow: 0 12px 32px rgba(214, 255, 63, 0.28); }
.pcf-btn--primary:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
.pcf-btn--ghost { background: transparent; color: var(--pcf-text-2); }
.pcf-btn--ghost:hover { color: var(--pcf-text-1); }

/* Progress line */
.pcf-progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: rgba(255, 255, 255, 0.08); z-index: 5; }
.pcf-progress__fill { height: 100%; background: var(--pcf-accent); transition: width 320ms cubic-bezier(0.22, 1, 0.36, 1); }
.pcf-progress__count { position: fixed; top: 16px; left: 24px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; color: var(--pcf-text-muted); z-index: 5; }

/* Honeypot — visually hidden, still in the a11y tree off-screen */
.pcf-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

@media (prefers-reduced-motion: reduce) {
  .pcf-root *, .pcf-root *::before, .pcf-root *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Import the tokens in `styles/globals.css`**

Modify `business-client/styles/globals.css` — add the import right after the marketing one (line 2):

```css
@import "./owner-tokens.css";
@import "./marketing-tokens.css";
@import "./forms-tokens.css";
```

- [ ] **Step 3: Write `app/(forms)/layout.tsx`**

```tsx
import type { ReactNode } from "react";

// The (forms) route group deliberately skips MarketingShell so the
// conversational forms render full-bleed dark with no light nav/footer.
// The root layout (app/layout.tsx) already provides <html>/<body> +
// AppGlobals, so this layout only adds the dark scope wrapper.
export default function FormsLayout({ children }: { children: ReactNode }) {
  return <div className="pcf-root">{children}</div>;
}
```

- [ ] **Step 4: Verify build passes**

Run: `cd business-client && yarn build`
Expected: build succeeds (route group compiles; the two pages don't exist yet, so nothing renders it — that's fine).

- [ ] **Step 5: Commit**

```bash
cd business-client
git add styles/forms-tokens.css styles/globals.css "app/(forms)/layout.tsx"
git commit -m "feat(forms): dark .pcf-root theme tokens + full-bleed (forms) route group layout"
```

---

### Task 4: Leaf UI components + step renderers (`steps.tsx`)

Presentational only. No state ownership — all values/handlers come from props.

**Files:**
- Create: `business-client/components/forms/steps.tsx`

**Interfaces:**
- Consumes: `FormStep`, `StepOption` from `@/lib/forms/journeys`; `FieldMeta`, `getField`, `FormType`, `FormAnswers` from `@/lib/forms/schema`.
- Produces (consumed by Task 5):
  - `ChoiceCard({ option, index, selected, onSelect })`
  - `PremiumInput({ meta, value, error, autoFocus, onChange, onEnter })`
  - `ContinueBar({ canContinue, primaryLabel, onContinue, onBack, showBack, submitting })`
  - `StepView({ formType, step, answers, errors, onChange, onSelect, onContinue })` — renders a single step's body by `step.type` (everything above the ContinueBar).

- [ ] **Step 1: Write the components**

Create `business-client/components/forms/steps.tsx`:

```tsx
"use client";

import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import {
  getField,
  type FieldMeta,
  type FormAnswers,
  type FormType,
} from "@/lib/forms/schema";
import type { FormStep, StepOption } from "@/lib/forms/journeys";

const KEYS = "ABCDEFGHIJ";

export const ChoiceCard = ({
  option,
  index,
  selected,
  onSelect,
}: {
  option: StepOption;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    className="pcf-choice"
    data-selected={selected}
    onClick={onSelect}
    aria-pressed={selected}
  >
    <span className="pcf-choice__key" aria-hidden>
      {selected ? <Check size={14} strokeWidth={3} /> : KEYS[index] ?? "•"}
    </span>
    <span>
      {option.label}
      {option.description ? (
        <span style={{ display: "block", fontSize: 13, color: "var(--pcf-text-muted)", marginTop: 2 }}>
          {option.description}
        </span>
      ) : null}
    </span>
  </button>
);

export const PremiumInput = ({
  meta,
  value,
  error,
  autoFocus,
  glass,
  onChange,
  onEnter,
}: {
  meta: FieldMeta;
  value: string;
  error?: string;
  autoFocus?: boolean;
  glass?: boolean;
  onChange: (v: string) => void;
  onEnter?: () => void;
}) => {
  const inputType = meta.type === "email" ? "email" : meta.type === "tel" ? "tel" : meta.type === "url" ? "url" : "text";
  const id = `pcf-${meta.key}`;
  return (
    <div>
      {glass ? <label className="pcf-label" htmlFor={id}>{meta.label}{meta.required ? " *" : ""}</label> : null}
      {meta.type === "textarea" ? (
        <textarea
          id={id}
          className="pcf-input pcf-input--glass"
          rows={3}
          value={value}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type={inputType}
          className={glass ? "pcf-input pcf-input--glass" : "pcf-input"}
          value={value}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter?.();
            }
          }}
        />
      )}
      {error ? <div className="pcf-error" id={`${id}-err`} role="alert">{error}</div> : null}
    </div>
  );
};

export const ContinueBar = ({
  canContinue,
  primaryLabel = "Continue",
  onContinue,
  onBack,
  showBack,
  submitting,
}: {
  canContinue: boolean;
  primaryLabel?: string;
  onContinue: () => void;
  onBack?: () => void;
  showBack?: boolean;
  submitting?: boolean;
}) => (
  <div className="pcf-bar">
    {showBack ? (
      <button type="button" className="pcf-btn pcf-btn--ghost" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>
    ) : (
      <span />
    )}
    <button type="button" className="pcf-btn pcf-btn--primary" onClick={onContinue} disabled={!canContinue || submitting}>
      {submitting ? <Loader2 size={16} className="animate-spin" /> : <>{primaryLabel} <ArrowRight size={16} /></>}
    </button>
  </div>
);

// Renders the body of a single step (above the ContinueBar).
export const StepView = ({
  formType,
  step,
  answers,
  errors,
  onChange,
  onSelect,
  onContinue,
}: {
  formType: FormType;
  step: FormStep;
  answers: FormAnswers;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSelect: (fieldKey: string, value: string) => void;
  onContinue: () => void;
}) => {
  const eyebrow = step.section ? <div className="pcf-eyebrow">{step.section}</div> : null;
  const heading = step.question ? <h1 className="pcf-question" style={{ marginTop: 12 }}>{step.question}</h1> : null;
  const hint = step.hint ? <p className="pcf-hint">{step.hint}</p> : null;

  switch (step.type) {
    case "welcome":
    case "statement":
      return <div>{eyebrow}{heading}{hint}</div>;

    case "single-choice": {
      const current = (answers[step.fieldKey!] as string) ?? "";
      return (
        <div>
          {eyebrow}{heading}{hint}
          <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
            {step.options!.map((opt, i) => (
              <ChoiceCard
                key={opt.value}
                option={opt}
                index={i}
                selected={current === opt.value}
                onSelect={() => onSelect(step.fieldKey!, opt.value)}
              />
            ))}
          </div>
          {errors[step.fieldKey!] ? <div className="pcf-error" role="alert">{errors[step.fieldKey!]}</div> : null}
        </div>
      );
    }

    case "text":
    case "textarea": {
      const meta = getField(formType, step.fieldKey!)!;
      return (
        <div>
          {eyebrow}{heading}{hint}
          <div style={{ marginTop: 24 }}>
            <PremiumInput
              meta={meta}
              value={(answers[step.fieldKey!] as string) ?? ""}
              error={errors[step.fieldKey!]}
              autoFocus
              onChange={(v) => onChange(step.fieldKey!, v)}
              onEnter={onContinue}
            />
          </div>
        </div>
      );
    }

    case "multi-question":
      return (
        <div>
          {eyebrow}{heading}{hint}
          <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
            {step.fields!.map((key, i) => {
              const meta = getField(formType, key)!;
              return (
                <PremiumInput
                  key={key}
                  meta={meta}
                  glass
                  autoFocus={i === 0}
                  value={(answers[key] as string) ?? ""}
                  error={errors[key]}
                  onChange={(v) => onChange(key, v)}
                />
              );
            })}
          </div>
        </div>
      );

    case "review":
      return null; // rendered by ConversationalForm (needs the visible-field list)

    case "success":
      return null; // rendered by ConversationalForm (needs CTAs)

    default:
      return null;
  }
};
```

- [ ] **Step 2: Verify it typechecks**

Run: `cd business-client && npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd business-client
git add components/forms/steps.tsx
git commit -m "feat(forms): choice/input/continue-bar leaf components + step renderer"
```

---

### Task 5: `ConversationalForm` orchestrator

Owns state, navigation, transitions, keyboard, submit, tracking, and the review/success renders.

**Files:**
- Create: `business-client/components/forms/ConversationalForm.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1 & 4; `posthog-js`, `framer-motion`.
- Produces (consumed by Task 6): default export `ConversationalForm({ formType }: { formType: FormType })`.

- [ ] **Step 1: Write the orchestrator**

Create `business-client/components/forms/ConversationalForm.tsx`:

```tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, MessageCircle, PhoneCall } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  JOURNEYS,
  nextVisibleIndex,
  prevVisibleIndex,
  validateStep,
  visibleSteps,
} from "@/lib/forms/engine";
import {
  FORM_SCHEMAS,
  getField,
  type FormAnswers,
  type FormType,
} from "@/lib/forms/schema";
import { ContinueBar, StepView } from "./steps";

const CONTACT_PHONE = "tel:+918369572945";
const CONTACT_WA = "https://wa.me/918369572945";
const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

type State = { stepIndex: number; answers: FormAnswers };
type Action =
  | { type: "set"; key: string; value: string }
  | { type: "goto"; index: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "set":
      return { ...state, answers: { ...state.answers, [action.key]: action.value } };
    case "goto":
      return { ...state, stepIndex: action.index };
  }
};

export default function ConversationalForm({ formType }: { formType: FormType }) {
  const steps = JOURNEYS[formType];
  const reduce = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, { stepIndex: 0, answers: {} });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const honeypot = useRef("");
  const metaRef = useRef<{ utm: Record<string, string>; fbclid?: string }>({ utm: {} });

  // Capture attribution params once on mount.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
      const v = q.get(k);
      if (v) utm[k] = v;
    });
    metaRef.current = { utm, fbclid: q.get("fbclid") ?? undefined };
  }, []);

  const step = steps[state.stepIndex];
  const vSteps = useMemo(() => visibleSteps(steps, state.answers), [steps, state.answers]);
  const position = Math.max(0, vSteps.findIndex((s) => s.id === step.id));
  const total = vSteps.length;
  const isFirst = position === 0;

  const setValue = (key: string, value: string) => {
    dispatch({ type: "set", key, value });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const goNext = () => {
    const err = validateStep(formType, step, state.answers);
    if (err) {
      // attach the error to the offending field where possible
      const key = step.fieldKey ?? step.fields?.find((k) => validateStep(formType, { ...step, fields: [k] }, state.answers)) ?? "_";
      setErrors((e) => ({ ...e, [key]: err }));
      return;
    }
    dispatch({ type: "goto", index: nextVisibleIndex(steps, state.answers, state.stepIndex) });
  };

  const goBack = () => dispatch({ type: "goto", index: prevVisibleIndex(steps, state.answers, state.stepIndex) });

  // Auto-advance on single-choice selection (Typeform feel).
  const selectChoice = (fieldKey: string, value: string) => {
    dispatch({ type: "set", key: fieldKey, value });
    setErrors((e) => ({ ...e, [fieldKey]: "" }));
    setTimeout(() => {
      dispatch({ type: "goto", index: nextVisibleIndex(steps, { ...state.answers, [fieldKey]: value }, state.stepIndex) });
    }, 180);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType,
          answers: state.answers,
          meta: {
            ...metaRef.current,
            elapsedMs: Date.now() - startedAt.current,
            honeypot: honeypot.current,
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Unable to submit right now.");
      try { posthog.capture("lead_submitted", { form: formType, ...metaRef.current.utm }); } catch {}
      dispatch({ type: "goto", index: nextVisibleIndex(steps, state.answers, state.stepIndex) }); // → success
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const enterVariant = reduce
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 16, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: ENTER_EASE } },
        exit: { opacity: 0, y: -12, scale: 0.992, transition: { duration: 0.22 } },
      };

  return (
    <div className="pcf-shell">
      {step.type !== "welcome" && step.type !== "success" ? (
        <>
          <div className="pcf-progress"><div className="pcf-progress__fill" style={{ width: `${((position + 1) / total) * 100}%` }} /></div>
          <div className="pcf-progress__count">{String(position + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
        </>
      ) : null}

      {/* Honeypot: bots fill hidden fields; humans never see it. */}
      <input
        className="pcf-hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        onChange={(e) => { honeypot.current = e.target.value; }}
      />

      <div className="pcf-stage">
        <AnimatePresence mode="wait">
          <motion.div key={step.id} {...enterVariant}>
            {step.type === "review" ? (
              <ReviewStep formType={formType} answers={state.answers} onEdit={(id) => dispatch({ type: "goto", index: steps.findIndex((s) => s.id === id) })} />
            ) : step.type === "success" ? (
              <SuccessStep step={step} />
            ) : (
              <StepView
                formType={formType}
                step={step}
                answers={state.answers}
                errors={errors}
                onChange={setValue}
                onSelect={selectChoice}
                onContinue={goNext}
              />
            )}

            {submitError ? <div className="pcf-error" role="alert" style={{ marginTop: 16 }}>{submitError}</div> : null}

            {step.type !== "success" && step.type !== "single-choice" ? (
              <ContinueBar
                canContinue
                submitting={submitting}
                showBack={!isFirst}
                primaryLabel={step.type === "review" ? "Submit" : step.cta ?? "Continue"}
                onBack={goBack}
                onContinue={step.type === "review" ? submit : goNext}
              />
            ) : step.type === "single-choice" && !isFirst ? (
              <div className="pcf-bar"><button type="button" className="pcf-btn pcf-btn--ghost" onClick={goBack}>Back</button><span /></div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const ReviewStep = ({ formType, answers, onEdit }: { formType: FormType; answers: FormAnswers; onEdit: (id: string) => void }) => {
  const rows = FORM_SCHEMAS[formType]
    .map((f) => ({ label: f.label, value: Array.isArray(answers[f.key]) ? (answers[f.key] as string[]).join(", ") : (answers[f.key] as string) ?? "" }))
    .filter((r) => r.value);
  return (
    <div>
      <div className="pcf-eyebrow">Review</div>
      <h1 className="pcf-question" style={{ marginTop: 12 }}>Look right before we send?</h1>
      <div className="pcf-scroll" style={{ marginTop: 24, display: "grid", gap: 10 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 16px", borderRadius: 12, background: "var(--pcf-surface)", border: "1px solid var(--pcf-border)" }}>
            <span style={{ color: "var(--pcf-text-muted)", fontSize: 13 }}>{r.label}</span>
            <span style={{ textAlign: "right", fontSize: 14 }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SuccessStep = ({ step }: { step: { successTitle?: string; successBody?: string } }) => (
  <div>
    <div style={{ display: "inline-flex", height: 52, width: 52, alignItems: "center", justifyContent: "center", borderRadius: 16, background: "var(--pcf-accent)", color: "#0a0a06" }}>
      <CheckCircle2 size={26} strokeWidth={2} />
    </div>
    <h1 className="pcf-question" style={{ marginTop: 20 }}>{step.successTitle ?? "You're in."}</h1>
    <p className="pcf-hint" style={{ maxWidth: 460 }}>{step.successBody}</p>
    <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
      <a href={CONTACT_WA} target="_blank" rel="noreferrer" className="pcf-btn pcf-btn--primary"><MessageCircle size={16} /> WhatsApp us</a>
      <a href={CONTACT_PHONE} className="pcf-btn pcf-btn--ghost"><PhoneCall size={16} /> Call</a>
    </div>
  </div>
);
```

- [ ] **Step 2: Verify it typechecks**

Run: `cd business-client && npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd business-client
git add components/forms/ConversationalForm.tsx
git commit -m "feat(forms): ConversationalForm orchestrator — nav, transitions, submit, tracking, review/success"
```

---

### Task 6: The two ad landing pages

**Files:**
- Create: `business-client/app/(forms)/get-started/page.tsx`
- Create: `business-client/app/(forms)/partner/page.tsx`

**Interfaces:**
- Consumes: default export `ConversationalForm` from `@/components/forms/ConversationalForm`.

- [ ] **Step 1: Write `app/(forms)/get-started/page.tsx`**

```tsx
import type { Metadata } from "next";
import ConversationalForm from "@/components/forms/ConversationalForm";

export const metadata: Metadata = {
  title: { absolute: "Get started with Hoizr" },
  description: "Tell us what you're building. We'll shape the right Hoizr setup for your events.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/get-started" },
};

export default function GetStartedPage() {
  return <ConversationalForm formType="onboarding" />;
}
```

- [ ] **Step 2: Write `app/(forms)/partner/page.tsx`**

```tsx
import type { Metadata } from "next";
import ConversationalForm from "@/components/forms/ConversationalForm";

export const metadata: Metadata = {
  title: { absolute: "Partner with Hoizr" },
  description: "See how Hoizr can support your next drop — ticketing, fan CRM, guestlists, and the door.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/partner" },
};

export default function PartnerPage() {
  return <ConversationalForm formType="partner" />;
}
```

- [ ] **Step 3: Build + lint**

Run: `cd business-client && yarn build && yarn lint`
Expected: both succeed; `/get-started` and `/partner` appear in the route manifest.

- [ ] **Step 4: Commit**

```bash
cd business-client
git add "app/(forms)/get-started/page.tsx" "app/(forms)/partner/page.tsx"
git commit -m "feat(forms): /get-started (onboarding) & /partner (contact) ad landing pages"
```

---

### Task 7: End-to-end verification (browser + in-app webview)

No code — this is the mandatory manual verification the spec flags (§10). Do NOT claim done before this passes.

- [ ] **Step 1: Desktop flow.** `yarn dev`, open `http://localhost:3000/get-started?utm_source=test&utm_campaign=demo&fbclid=xyz`. Walk the full journey: choices auto-advance, `Enter` advances text steps, Back works, progress count is correct, review lists answers, submit shows success. Repeat `/partner`.

- [ ] **Step 2: Attribution check.** Confirm the internal email (or, if Resend keys are absent, add a temporary `console.log` of the `meta` in the route and confirm) carries `utm_source=test`, `utm_campaign=demo`, `fbclid=xyz`.

- [ ] **Step 3: Choose crowd `700+` on `/get-started`** → confirm the sales-assist success copy shows; any other size → the self-serve copy.

- [ ] **Step 4: Mobile / in-app webview (the risk).** Open on a phone via LAN IP (or ngrok) inside the **Instagram or Facebook in-app browser**. Verify: (a) the page fills the screen with no body scroll, (b) tapping an input does NOT let the keyboard hide the primary button / the layout stays usable, (c) pinch-zoom still works. If the keyboard covers the CTA, add a `VisualViewport` resize listener that sets a bottom offset on `.pcf-shell` and re-verify.

- [ ] **Step 5: Reduced motion.** Enable OS "reduce motion" → transitions are instant, no layout jumps.

- [ ] **Step 6: Bot defense smoke.** `curl` the route with `"meta":{"honeypot":"x"}` → `{"ok":true}` but no email sent; with `"elapsedMs":100` → same silent drop.

---

## Self-Review

**Spec coverage:**
- §4 engine → Tasks 1, 5 ✓
- §5 step types → Tasks 4, 5 (welcome/single-choice/text/textarea/multi-question/statement/review/success all rendered; multi-choice type defined in schema/engine, not used by either journey — acceptable, no journey needs it) ✓
- §6 journeys incl. 700+ branch → Task 1 (`journeys.ts`), verified Task 7 ✓
- §7 theme → Task 3 ✓
- §8 backend + shared schema trust boundary → Tasks 1, 2 ✓
- §9 utm/fbclid + PostHog, no Pixel → Task 5 (capture + capture call), Task 2 (email attribution) ✓
- §10 full-screen / webview → Task 3 (CSS), Task 7 (verify) ✓
- §11 honeypot + timing → Task 2, verified Task 7 ✓
- §12 a11y → Task 4 (labels, aria-invalid, role=alert, focus), Task 3 (reduced-motion) ✓
- §13 one assert self-check on pure logic → Task 1 ✓

**Placeholder scan:** no TBD/TODO; all code steps carry full code; commands have expected output. ✓

**Type consistency:** `validateStep(formType, step, answers)` signature identical across engine, self-check, steps consumer, orchestrator. `ConversationalForm({ formType })` default export matches page imports. `StepView`/`ChoiceCard`/`PremiumInput`/`ContinueBar` prop shapes match between Task 4 definition and Task 5 usage. `getField`/`validateField`/`validateAnswers`/`FORM_SCHEMAS` names consistent across Tasks 1, 2, 4, 5. ✓

**Note on `goNext` multi-question error mapping:** the `.find()` fallback in Task 5 re-runs `validateStep` with a single-field slice to locate the offending key; if it can't, it falls back to `"_"`. Acceptable — inline field errors in multi-question also render on the specific field via the `errors` map keyed by field. Not a blocker.
