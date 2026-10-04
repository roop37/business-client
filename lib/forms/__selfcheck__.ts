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
// fixFirst/eventScale included because they're required fields on the
// partner schema — validateAnswers checks the whole schema, not just
// the keys under test here.
const partnerRequired = { fixFirst: "Lower commission", eventScale: "Under 100" };
assert.equal(validateAnswers("partner", { ...partnerRequired, name: "A", email: "a@b.co" }).ok, false, "partner requires name>=2");
assert.equal(validateAnswers("partner", { ...partnerRequired, name: "Aanya", email: "bad" }).ok, false);
assert.equal(validateAnswers("partner", { ...partnerRequired, name: "Aanya", email: "a@b.co" }).ok, true);

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
