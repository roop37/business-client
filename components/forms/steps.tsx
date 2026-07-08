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
