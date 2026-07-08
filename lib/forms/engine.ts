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
