"use client";

/**
 * Additional Details — 4-card grid + 4 modals for the host EventJourney
 * step 6 (zero-indexed step === 5). All sections are OPTIONAL: nothing
 * here gates publish. Each section corresponds to a sub-spec in
 * docs/EVENT_FIELDS_SPEC.md §4.
 *
 *  1. Event Guide  — languages + 6 enum dropdowns + gates-open switch
 *                    + lead time + event-level YouTube link
 *  2. FAQs         — Q&A pairs, 5 suggested templates pre-loaded
 *  3. Instructions — bulleted instruction lines
 *  4. Prohibited   — multi-select from master + free-text custom items
 *
 * Renders inline `ReusableModal`s. Save buttons mutate a parent-owned
 * state slice; the parent (EventJourney) is responsible for persisting
 * via the existing `updateEventStep` mutation.
 */

import ReusableModal from "@/components/common/modal/modal";
import useGlobalStore from "@/store/global"; // toast access
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  Ban,
  ClipboardList,
  Compass,
  MessageCircleQuestion,
  Plus,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

// Locally-typed sub-shapes (mirror hoizr-shared EventGuide + EventFAQ).
// Once codegen has run after the user runs `yarn codegen` against a
// rebuilt main-server, replace these with the SDK-generated types.
export type EventGuideValue = {
  languageIds?: string[];
  minimumEntryAge?: string;
  paidEntryAge?: string;
  venueLayout?: string;
  seatingArrangement?: string;
  kidFriendly?: string;
  petFriendly?: string;
  gatesOpenBeforeEvent?: boolean;
  gatesOpenLeadHours?: number;
  gatesOpenLeadMinutes?: number;
  youtubeLink?: string;
};

export type EventFAQValue = { question: string; answer: string };

export type AdditionalDetailsState = {
  eventGuide: EventGuideValue;
  faqs: EventFAQValue[];
  eventInstructions: string[];
  prohibitedItems: string[];
};

type LanguageOption = {
  _id: string;
  code: string;
  value: string;
  nativeName?: string | null;
  isIndian: boolean;
};

type ProhibitedItemOption = {
  _id: string;
  slug: string;
  value: string;
  description?: string | null;
};

type Props = {
  value: AdditionalDetailsState;
  onChange: (next: AdditionalDetailsState) => void;
  /** Fires when the host clicks "Save" inside any of the 4 modals. */
  onPersist: (next: AdditionalDetailsState) => Promise<void> | void;
  /** Disables the Save button while a network call is in flight. */
  saving?: boolean;
};

type ModalKey = "guide" | "faqs" | "instructions" | "prohibited" | null;

const ENTRY_AGE_OPTIONS = [
  { value: "ALL_AGES", label: "All ages" },
  { value: "AGE_13_PLUS", label: "13+" },
  { value: "AGE_16_PLUS", label: "16+" },
  { value: "AGE_18_PLUS", label: "18+" },
  { value: "AGE_21_PLUS", label: "21+" },
  { value: "AGE_25_PLUS", label: "25+" },
] as const;

const VENUE_LAYOUT_OPTIONS = [
  { value: "INDOOR", label: "Indoor" },
  { value: "OUTDOOR", label: "Outdoor" },
  { value: "MIXED", label: "Indoor & outdoor" },
] as const;

const SEATING_OPTIONS = [
  { value: "SEATED", label: "Seated" },
  { value: "STANDING", label: "Standing" },
  { value: "SEATED_AND_STANDING", label: "Seated & standing" },
] as const;

const KID_OPTIONS = [
  { value: "KIDS_WELCOME", label: "Kids welcome" },
  { value: "KIDS_NOT_ALLOWED", label: "Kids not allowed" },
  { value: "KIDS_WITH_GUARDIAN", label: "Kids with guardian" },
] as const;

const PET_OPTIONS = [
  { value: "PETS_WELCOME", label: "Pets welcome" },
  { value: "PETS_NOT_ALLOWED", label: "Pets not allowed" },
  { value: "SERVICE_ANIMALS_ONLY", label: "Service animals only" },
] as const;

const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,…,55

const FAQ_TEMPLATES: EventFAQValue[] = [
  {
    question: "Is there an age restriction for the event?",
    answer: "",
  },
  {
    question: "Is there parking available?",
    answer: "",
  },
  {
    question: "Can I get a refund if I can't attend the event?",
    answer: "",
  },
  {
    question: "Are there accommodations for individuals with disabilities?",
    answer: "",
  },
  {
    question: "What is the dress code for the event?",
    answer: "",
  },
];

const isEventGuideSet = (g: EventGuideValue): boolean =>
  Boolean(
    (g.languageIds?.length ?? 0) > 0 ||
      g.minimumEntryAge ||
      g.paidEntryAge ||
      g.venueLayout ||
      g.seatingArrangement ||
      g.kidFriendly ||
      g.petFriendly ||
      g.gatesOpenBeforeEvent ||
      (g.youtubeLink && g.youtubeLink.trim())
  );

const badgeText = (count: number, suffix: string) =>
  count === 0 ? "Not set" : `${count} ${suffix}`;

export const AdditionalDetailsCards = ({
  value,
  onChange,
  onPersist,
  saving = false,
}: Props) => {
  const setToastData = useGlobalStore((s) => s.setToastData);
  const [modal, setModal] = useState<ModalKey>(null);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [prohibitedOptions, setProhibitedOptions] = useState<
    ProhibitedItemOption[]
  >([]);
  const [draftValue, setDraftValue] = useState<AdditionalDetailsState>(value);

  // Re-seed the modal draft from the latest committed value whenever a
  // modal opens. Lets the host close-without-saving and reopen to the
  // last persisted state.
  useEffect(() => {
    if (modal !== null) setDraftValue(value);
  }, [modal, value]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lang, proh] = await Promise.all([
          sdk.getActiveLanguages(),
          sdk.getActiveProhibitedItems(),
        ]);
        if (cancelled) return;
        setLanguages(
          (lang?.getActiveLanguages ?? []) as LanguageOption[],
        );
        setProhibitedOptions(
          (proh?.getActiveProhibitedItems ?? []) as ProhibitedItemOption[],
        );
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setToastData]);

  const guideCount = useMemo(() => {
    let c = 0;
    if ((value.eventGuide.languageIds?.length ?? 0) > 0) c += 1;
    if (value.eventGuide.minimumEntryAge) c += 1;
    if (value.eventGuide.paidEntryAge) c += 1;
    if (value.eventGuide.venueLayout) c += 1;
    if (value.eventGuide.seatingArrangement) c += 1;
    if (value.eventGuide.kidFriendly) c += 1;
    if (value.eventGuide.petFriendly) c += 1;
    if (value.eventGuide.gatesOpenBeforeEvent) c += 1;
    if (value.eventGuide.youtubeLink?.trim()) c += 1;
    return c;
  }, [value.eventGuide]);

  const handleSave = async () => {
    try {
      await onPersist(draftValue);
      onChange(draftValue);
      setModal(null);
    } catch {
      // Parent owns the toast; keep the modal open so the host can retry.
    }
  };

  return (
    <section className="rounded-xl border border-[var(--owner-border)] bg-white p-5">
      <header className="mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--owner-fg-3)]">
          All optional
        </div>
        <h3 className="mt-1.5 text-base font-semibold text-[var(--owner-fg-1)]">
          Tell customers what to expect
        </h3>
        <p className="mt-1 text-xs leading-5 text-[var(--owner-fg-3)]">
          Add the bits a customer scans before tapping book — language,
          age policy, venue layout, FAQs, instructions, what they
          can&apos;t bring in. Anything you skip simply won&apos;t show
          on the event page.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <AdditionalCard
          icon={<Compass size={18} />}
          title="Event guide"
          subtitle="Languages, ages, layout, gates open."
          badge={badgeText(
            guideCount,
            guideCount === 1 ? "detail" : "details",
          )}
          highlight={isEventGuideSet(value.eventGuide)}
          onClick={() => setModal("guide")}
        />
        <AdditionalCard
          icon={<MessageCircleQuestion size={18} />}
          title="FAQs"
          subtitle="Answer the common questions up front."
          badge={badgeText(
            value.faqs.filter((f) => f.answer.trim()).length,
            "answered",
          )}
          highlight={value.faqs.some((f) => f.answer.trim())}
          onClick={() => setModal("faqs")}
        />
        <AdditionalCard
          icon={<ClipboardList size={18} />}
          title="Event instructions"
          subtitle="Pickup, parking, last entry — short lines."
          badge={badgeText(
            value.eventInstructions.filter((l) => l.trim()).length,
            value.eventInstructions.length === 1 ? "line" : "lines",
          )}
          highlight={value.eventInstructions.some((l) => l.trim())}
          onClick={() => setModal("instructions")}
        />
        <AdditionalCard
          icon={<Ban size={18} />}
          title="Prohibited items"
          subtitle="What customers shouldn't bring to the venue."
          badge={badgeText(
            value.prohibitedItems.length,
            value.prohibitedItems.length === 1 ? "item" : "items",
          )}
          highlight={value.prohibitedItems.length > 0}
          onClick={() => setModal("prohibited")}
        />
      </div>

      {modal === "guide" ? (
        <EventGuideModal
          value={draftValue.eventGuide}
          languages={languages}
          onChange={(eventGuide) =>
            setDraftValue((d) => ({ ...d, eventGuide }))
          }
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      ) : null}

      {modal === "faqs" ? (
        <FaqsModal
          value={draftValue.faqs}
          onChange={(faqs) => setDraftValue((d) => ({ ...d, faqs }))}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      ) : null}

      {modal === "instructions" ? (
        <InstructionsModal
          value={draftValue.eventInstructions}
          onChange={(eventInstructions) =>
            setDraftValue((d) => ({ ...d, eventInstructions }))
          }
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      ) : null}

      {modal === "prohibited" ? (
        <ProhibitedModal
          value={draftValue.prohibitedItems}
          options={prohibitedOptions}
          onChange={(prohibitedItems) =>
            setDraftValue((d) => ({ ...d, prohibitedItems }))
          }
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      ) : null}
    </section>
  );
};

/* ---------------------------------------------------------------------------
 * Card
 * ------------------------------------------------------------------------- */

const AdditionalCard = ({
  icon,
  title,
  subtitle,
  badge,
  highlight,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  highlight: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-start gap-3 rounded-xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--owner-blue-500)] hover:shadow-[0_8px_20px_rgba(43,35,25,0.06)] ${
      highlight
        ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)]"
        : "border-[var(--owner-border)]"
    }`}
  >
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        highlight
          ? "bg-white text-[var(--owner-blue-500)]"
          : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-3)]"
      }`}
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[14px] font-semibold text-[var(--owner-fg-1)]">
        {title}
      </span>
      <span className="mt-0.5 block text-[11.5px] leading-snug text-[var(--owner-fg-3)]">
        {subtitle}
      </span>
      <span
        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${
          highlight
            ? "bg-[var(--owner-blue-500)] text-white"
            : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-3)]"
        }`}
      >
        {badge}
      </span>
    </span>
  </button>
);

/* ---------------------------------------------------------------------------
 * Event Guide modal
 * ------------------------------------------------------------------------- */

const EventGuideModal = ({
  value,
  languages,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: EventGuideValue;
  languages: LanguageOption[];
  onChange: (next: EventGuideValue) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) => {
  const set = <K extends keyof EventGuideValue>(
    key: K,
    next: EventGuideValue[K],
  ) => onChange({ ...value, [key]: next });

  const selectedLangIds = new Set(value.languageIds ?? []);
  const toggleLang = (id: string) => {
    const next = new Set(selectedLangIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set("languageIds", Array.from(next));
  };

  return (
    <ReusableModal
      isOpen
      onClose={onClose}
      title="Event guide"
      width="lg"
    >
      <div className="space-y-5">
        <p className="text-[12.5px] text-[var(--owner-fg-3)]">
          Set the right expectations. Anything you leave blank stays
          hidden on the event page.
        </p>

        <Field label="Languages">
          <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-[var(--owner-border)] bg-white p-2">
            {languages.map((lang) => {
              const selected = selectedLangIds.has(lang._id);
              return (
                <button
                  key={lang._id}
                  type="button"
                  onClick={() => toggleLang(lang._id)}
                  className={`rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition ${
                    selected
                      ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-500)] text-white"
                      : "border-[var(--owner-border)] bg-white text-[var(--owner-fg-2)] hover:border-[var(--owner-blue-500)]"
                  }`}
                >
                  {lang.value}
                  {lang.nativeName ? (
                    <span className="ml-1 opacity-70">{lang.nativeName}</span>
                  ) : null}
                </button>
              );
            })}
            {languages.length === 0 ? (
              <span className="px-2 py-1 text-[11.5px] text-[var(--owner-fg-4)]">
                Loading languages…
              </span>
            ) : null}
          </div>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Dropdown
            label="Minimum entry age"
            value={value.minimumEntryAge}
            onChange={(v) => set("minimumEntryAge", v)}
            options={ENTRY_AGE_OPTIONS}
            placeholder="Select"
          />
          <Dropdown
            label="Paid-entry age (ticket required)"
            value={value.paidEntryAge}
            onChange={(v) => set("paidEntryAge", v)}
            options={ENTRY_AGE_OPTIONS}
            placeholder="Select"
          />
          <Dropdown
            label="Venue layout"
            value={value.venueLayout}
            onChange={(v) => set("venueLayout", v)}
            options={VENUE_LAYOUT_OPTIONS}
            placeholder="Indoor / Outdoor"
          />
          <Dropdown
            label="Seating arrangement"
            value={value.seatingArrangement}
            onChange={(v) => set("seatingArrangement", v)}
            options={SEATING_OPTIONS}
            placeholder="Seated / Standing"
          />
          <Dropdown
            label="Kid-friendly"
            value={value.kidFriendly}
            onChange={(v) => set("kidFriendly", v)}
            options={KID_OPTIONS}
            placeholder="Select"
          />
          <Dropdown
            label="Pet-friendly"
            value={value.petFriendly}
            onChange={(v) => set("petFriendly", v)}
            options={PET_OPTIONS}
            placeholder="Select"
          />
        </div>

        <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-3">
          <label className="flex items-center gap-3 text-[13px] font-medium text-[var(--owner-fg-1)]">
            <input
              type="checkbox"
              checked={Boolean(value.gatesOpenBeforeEvent)}
              onChange={(e) =>
                set("gatesOpenBeforeEvent", e.target.checked)
              }
              className="h-4 w-4 accent-[var(--owner-blue-500)]"
            />
            Do gates open before the event start time?
          </label>
          {value.gatesOpenBeforeEvent ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Gates open before — hours">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={
                    value.gatesOpenLeadHours !== undefined
                      ? value.gatesOpenLeadHours
                      : ""
                  }
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    set(
                      "gatesOpenLeadHours",
                      isNaN(n)
                        ? undefined
                        : Math.max(0, Math.min(23, n)),
                    );
                  }}
                  className="input input-primary"
                />
              </Field>
              <Dropdown
                label="Gates open before — minutes"
                value={
                  value.gatesOpenLeadMinutes !== undefined
                    ? String(value.gatesOpenLeadMinutes)
                    : undefined
                }
                onChange={(v) =>
                  set(
                    "gatesOpenLeadMinutes",
                    v === undefined ? undefined : Number(v),
                  )
                }
                options={MINUTE_OPTIONS.map((m) => ({
                  value: String(m),
                  label: `${m} min`,
                }))}
                placeholder="0 min"
              />
            </div>
          ) : null}
        </div>

        <Field label="YouTube link (event-level hype reel, optional)">
          <input
            type="url"
            value={value.youtubeLink ?? ""}
            onChange={(e) => set("youtubeLink", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="input input-primary"
          />
        </Field>

        <ModalFooter onClose={onClose} onSave={onSave} saving={saving} />
      </div>
    </ReusableModal>
  );
};

/* ---------------------------------------------------------------------------
 * FAQs modal
 * ------------------------------------------------------------------------- */

const FaqsModal = ({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: EventFAQValue[];
  onChange: (next: EventFAQValue[]) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) => {
  const items = value.length > 0 ? value : FAQ_TEMPLATES;
  const updateAt = (i: number, patch: Partial<EventFAQValue>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { question: "", answer: "" }]);

  return (
    <ReusableModal isOpen onClose={onClose} title="FAQs" width="lg">
      <div className="space-y-4">
        <p className="text-[12.5px] text-[var(--owner-fg-3)]">
          Drop in the questions customers ask. Suggested templates are
          pre-loaded — overwrite, delete, or add your own.
        </p>

        <div className="space-y-3">
          {items.map((faq, i) => (
            <div
              key={i}
              className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-3"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <input
                    value={faq.question}
                    onChange={(e) => updateAt(i, { question: e.target.value })}
                    placeholder="Question"
                    className="input input-primary"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateAt(i, { answer: e.target.value })}
                    placeholder="Answer (leave empty to hide this FAQ from customers)"
                    rows={2}
                    className="input input-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="mt-1 rounded-md p-2 text-[var(--owner-fg-4)] hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove FAQ"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--owner-border)] px-3 py-2 text-xs font-semibold text-[var(--owner-fg-2)] hover:border-[var(--owner-blue-500)] hover:text-[var(--owner-blue-500)]"
        >
          <Plus size={14} />
          Add another question
        </button>

        <ModalFooter onClose={onClose} onSave={onSave} saving={saving} />
      </div>
    </ReusableModal>
  );
};

/* ---------------------------------------------------------------------------
 * Event Instructions modal
 * ------------------------------------------------------------------------- */

const InstructionsModal = ({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) => {
  const items = value.length > 0 ? value : [""];
  const updateAt = (i: number, next: string) =>
    onChange(items.map((it, idx) => (idx === i ? next : it)));
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);

  return (
    <ReusableModal
      isOpen
      onClose={onClose}
      title="Event instructions"
      width="lg"
    >
      <div className="space-y-4">
        <p className="text-[12.5px] text-[var(--owner-fg-3)]">
          Short, scannable lines for the customer detail page — pick-up
          points, parking, last-entry, venue rules. Empty rows are
          ignored on save.
        </p>

        <div className="space-y-2">
          {items.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={line}
                onChange={(e) => updateAt(i, e.target.value)}
                placeholder={`Instruction ${i + 1}`}
                className="input input-primary flex-1"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="rounded-md p-2 text-[var(--owner-fg-4)] hover:bg-red-50 hover:text-red-600"
                aria-label="Remove instruction"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--owner-border)] px-3 py-2 text-xs font-semibold text-[var(--owner-fg-2)] hover:border-[var(--owner-blue-500)] hover:text-[var(--owner-blue-500)]"
        >
          <Plus size={14} />
          Add instruction
        </button>

        <ModalFooter onClose={onClose} onSave={onSave} saving={saving} />
      </div>
    </ReusableModal>
  );
};

/* ---------------------------------------------------------------------------
 * Prohibited Items modal
 * ------------------------------------------------------------------------- */

const ProhibitedModal = ({
  value,
  options,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: string[];
  options: ProhibitedItemOption[];
  onChange: (next: string[]) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) => {
  const [customDraft, setCustomDraft] = useState("");

  const masterSlugs = new Set(options.map((o) => o.slug));
  const selected = new Set(value);
  const customItems = value.filter((v) => !masterSlugs.has(v));

  const toggleMaster = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange(Array.from(next));
  };

  // Select all / clear all act on the MASTER items only — any custom
  // free-text items the host added stay untouched.
  const masterSelectedCount = options.filter((o) =>
    selected.has(o.slug)
  ).length;
  const selectAllMaster = () =>
    onChange([...options.map((o) => o.slug), ...customItems]);
  const clearAllMaster = () => onChange(customItems);

  const addCustom = () => {
    const trimmed = customDraft.trim();
    if (!trimmed || selected.has(trimmed)) return;
    onChange([...value, trimmed]);
    setCustomDraft("");
  };

  const removeCustom = (label: string) =>
    onChange(value.filter((v) => v !== label));

  return (
    <ReusableModal
      isOpen
      onClose={onClose}
      title="Prohibited items"
      width="lg"
    >
      <div className="space-y-4">
        <p className="text-[12.5px] text-[var(--owner-fg-3)]">
          Pick what isn&apos;t allowed at the gate. Anything you tick
          will appear on the event page so customers know before they
          arrive.
        </p>

        {options.length > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] text-[var(--owner-fg-4)]">
              {masterSelectedCount} of {options.length} selected
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={selectAllMaster}
                disabled={masterSelectedCount === options.length}
                className="text-[12px] font-semibold text-[var(--owner-blue-500)] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearAllMaster}
                disabled={masterSelectedCount === 0}
                className="text-[12px] font-semibold text-[var(--owner-fg-3)] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear all
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => {
            const isOn = selected.has(opt.slug);
            return (
              <button
                key={opt._id}
                type="button"
                onClick={() => toggleMaster(opt.slug)}
                title={opt.description ?? undefined}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                  isOn
                    ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-500)] text-white"
                    : "border-[var(--owner-border)] bg-white text-[var(--owner-fg-2)] hover:border-[var(--owner-blue-500)]"
                }`}
              >
                {opt.value}
              </button>
            );
          })}
          {options.length === 0 ? (
            <span className="px-2 py-1 text-[11.5px] text-[var(--owner-fg-4)]">
              Loading items…
            </span>
          ) : null}
        </div>

        <div className="rounded-lg border border-dashed border-[var(--owner-border)] bg-[var(--owner-bg)] p-3">
          <div className="flex items-center gap-2">
            <input
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Add a custom item (e.g. Hookahs, Glow sticks)"
              className="input input-primary flex-1"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!customDraft.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--owner-fg-1)] px-3 py-2 text-xs font-semibold text-[var(--owner-bg)] disabled:opacity-50"
            >
              <Plus size={13} />
              Add
            </button>
          </div>

          {customItems.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {customItems.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--owner-border)] bg-white px-2.5 py-1 text-[11.5px] font-medium text-[var(--owner-fg-1)]"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeCustom(label)}
                    aria-label={`Remove ${label}`}
                    className="text-[var(--owner-fg-4)] hover:text-red-600"
                  >
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <ModalFooter onClose={onClose} onSave={onSave} saving={saving} />
      </div>
    </ReusableModal>
  );
};

/* ---------------------------------------------------------------------------
 * Reusable bits
 * ------------------------------------------------------------------------- */

const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--owner-fg-3)]">
      {label}
    </span>
    {children}
  </label>
);

const Dropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
}) => (
  <Field label={label}>
    <select
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? undefined : e.target.value)
      }
      className="input input-primary"
    >
      <option value="">{placeholder ?? "Select"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </Field>
);

const ModalFooter = ({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) => (
  <div className="flex justify-end gap-2 border-t border-[var(--owner-border)] pt-4">
    <button
      type="button"
      onClick={onClose}
      className="rounded-lg border border-[var(--owner-border)] px-4 py-2 text-sm font-semibold text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)]"
    >
      Close
    </button>
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="rounded-lg bg-[var(--owner-fg-1)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)] disabled:opacity-60"
    >
      {saving ? "Saving…" : "Save"}
    </button>
  </div>
);

export default AdditionalDetailsCards;
