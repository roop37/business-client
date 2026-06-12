"use client";

import { OwnerButton } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  requestWhatsAppTemplate,
  type WhatsAppTemplateCategory,
} from "@/utils/whatsappTemplateClient";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const inputCls =
  "h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050";

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="text-[12px] font-semibold text-owner-fg-2">{label}</span>
    <div className="mt-1">{children}</div>
    {hint ? (
      <span className="mt-1 block text-[11px] text-owner-fg-4">{hint}</span>
    ) : null}
  </label>
);

/**
 * "Request a template" — the host describes what they want and Hoizr's team
 * builds + submits it. Lands directly in the admin review queue.
 */
const WhatsAppTemplateRequestForm = ({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
}) => {
  const { setToastData } = useGlobalStore();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<WhatsAppTemplateCategory>("MARKETING");
  const [requestNote, setRequestNote] = useState("");
  const [bodyText, setBodyText] = useState("");

  const submit = async () => {
    if (!name.trim()) {
      setToastData({ type: "error", message: "Give your request a name." });
      return;
    }
    if (!requestNote.trim()) {
      setToastData({
        type: "error",
        message: "Tell us what you'd like the message to say.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await requestWhatsAppTemplate({
        name: name.trim(),
        category,
        requestNote: requestNote.trim(),
        bodyText: bodyText.trim() || undefined,
      });
      setToastData({
        type: "success",
        message:
          "Request sent. Our team will build your template and send it for WhatsApp approval.",
      });
      onDone();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[15px] font-semibold text-owner-fg-1">
            Request a template
          </div>
          <div className="text-[12px] text-owner-fg-3">
            Not sure how to phrase it? Describe what you want and we&apos;ll
            build a compliant template for you.
          </div>
        </div>
        <OwnerButton variant="secondary" size="sm" onClick={onCancel}>
          Back to templates
        </OwnerButton>
      </div>

      <Field label="Give it a name">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Early-bird reminder"
        />
      </Field>

      <Field label="Category">
        <select
          className={inputCls}
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as WhatsAppTemplateCategory)
          }
        >
          <option value="MARKETING">Marketing</option>
          <option value="UTILITY">Utility</option>
        </select>
      </Field>

      <Field
        label="What should it say?"
        hint="Describe the message, the tone, and any details to include."
      >
        <textarea
          className={`${inputCls} h-28 py-2`}
          value={requestNote}
          onChange={(e) => setRequestNote(e.target.value)}
          placeholder="A friendly nudge to people who viewed but didn't buy, mentioning early-bird pricing ends Friday…"
        />
      </Field>

      <Field label="Rough draft (optional)">
        <textarea
          className={`${inputCls} h-20 py-2`}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Hi {{1}}, early-bird tickets for {{2}} end Friday…"
        />
      </Field>

      <div className="flex justify-end">
        <OwnerButton variant="primary" disabled={submitting} onClick={submit}>
          {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
          Send request
        </OwnerButton>
      </div>
    </div>
  );
};

export default WhatsAppTemplateRequestForm;
