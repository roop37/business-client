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
