"use client";

import { OwnerButton } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  createMyWhatsAppTemplate,
  submitMyWhatsAppTemplateForReview,
  type CreateMyWhatsAppTemplateInput,
  type CreateMyWhatsAppTemplateVariableInput,
  type WhatsAppTemplateButtonType,
  type WhatsAppTemplateCategory,
  type WhatsAppTemplateHeaderType,
} from "@/utils/whatsappTemplateClient";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import WhatsAppMediaUpload from "./WhatsAppMediaUpload";

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

type VarRow = CreateMyWhatsAppTemplateVariableInput;

/**
 * "Create your own" — the host authors a full WhatsApp template. On submit it
 * is created (DRAFT) then submitted for internal review (PENDING_REVIEW); a
 * Hoizr admin approves + forwards it to Meta before it becomes sendable.
 */
const WhatsAppTemplateAuthorForm = ({
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
  const [headerType, setHeaderType] =
    useState<WhatsAppTemplateHeaderType>("NONE");
  const [headerText, setHeaderText] = useState("");
  const [headerSampleMediaUrl, setHeaderSampleMediaUrl] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [buttonType, setButtonType] = useState<WhatsAppTemplateButtonType>("NONE");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [buttonPhone, setButtonPhone] = useState("");
  const [variables, setVariables] = useState<VarRow[]>([]);

  const addVar = () =>
    setVariables((prev) => [
      ...prev,
      { position: prev.length + 1, label: "", hint: "", example: "" },
    ]);
  const updateVar = (i: number, patch: Partial<VarRow>) =>
    setVariables((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v))
    );
  const removeVar = (i: number) =>
    setVariables((prev) =>
      prev
        .filter((_, idx) => idx !== i)
        .map((v, idx) => ({ ...v, position: idx + 1 }))
    );

  const submit = async () => {
    if (!name.trim()) {
      setToastData({ type: "error", message: "Give your template a name." });
      return;
    }
    if (!bodyText.trim()) {
      setToastData({ type: "error", message: "The message body is required." });
      return;
    }
    setSubmitting(true);
    try {
      const input: CreateMyWhatsAppTemplateInput = {
        name: name.trim(),
        category,
        language: "en",
        headerType,
        headerText: headerType === "TEXT" ? headerText.trim() : undefined,
        headerSampleMediaUrl:
          headerType === "IMAGE" ||
          headerType === "VIDEO" ||
          headerType === "DOCUMENT"
            ? headerSampleMediaUrl.trim() || undefined
            : undefined,
        bodyText: bodyText.trim(),
        footerText: footerText.trim() || undefined,
        buttonType,
        buttonUrl: buttonType === "URL" ? buttonUrl.trim() || undefined : undefined,
        buttonLabel:
          buttonType !== "NONE" ? buttonLabel.trim() || undefined : undefined,
        buttonPhone:
          buttonType === "PHONE" ? buttonPhone.trim() || undefined : undefined,
        variables: variables
          .filter((v) => v.label.trim())
          .map((v) => ({
            position: v.position,
            label: v.label.trim(),
            hint: v.hint?.trim() || undefined,
            example: v.example?.trim() || undefined,
          })),
      };
      const created = await createMyWhatsAppTemplate(input);
      await submitMyWhatsAppTemplateForReview(created._id);
      setToastData({
        type: "success",
        message:
          "Template submitted for review. We'll approve it and send it to WhatsApp — it'll appear under “My templates” once it's live.",
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
            Create your own template
          </div>
          <div className="text-[12px] text-owner-fg-3">
            Hosts share Hoizr&apos;s WhatsApp number, so our team reviews new
            templates before sending them to WhatsApp for approval.
          </div>
        </div>
        <OwnerButton variant="secondary" size="sm" onClick={onCancel}>
          Back to templates
        </OwnerButton>
      </div>

      <Field label="Template name">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekend lineup announcement"
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

      <Field label="Header">
        <select
          className={inputCls}
          value={headerType}
          onChange={(e) =>
            setHeaderType(e.target.value as WhatsAppTemplateHeaderType)
          }
        >
          <option value="NONE">No header</option>
          <option value="TEXT">Text</option>
          <option value="IMAGE">Image</option>
          <option value="VIDEO">Video</option>
          <option value="DOCUMENT">Document</option>
        </select>
      </Field>
      {headerType === "TEXT" ? (
        <Field label="Header text">
          <input
            className={inputCls}
            value={headerText}
            onChange={(e) => setHeaderText(e.target.value)}
            placeholder="Short header line"
          />
        </Field>
      ) : null}
      {headerType === "IMAGE" ? (
        <WhatsAppMediaUpload
          value={headerSampleMediaUrl}
          onChange={setHeaderSampleMediaUrl}
          label="Sample header image"
          hint="A sample image so reviewers can see the header."
        />
      ) : null}
      {headerType === "VIDEO" || headerType === "DOCUMENT" ? (
        <Field
          label={`Sample ${headerType.toLowerCase()} URL`}
          hint="A public HTTPS sample so reviewers can see the media."
        >
          <input
            className={inputCls}
            value={headerSampleMediaUrl}
            onChange={(e) => setHeaderSampleMediaUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>
      ) : null}

      <Field
        label="Message body"
        hint="Use {{1}}, {{2}}… for variables you'll fill per campaign."
      >
        <textarea
          className={`${inputCls} h-28 py-2`}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Hi {{1}}, {{2}} is happening soon — grab your tickets!"
        />
      </Field>

      <div className="flex flex-col gap-2 rounded-owner-md border border-owner-border-soft bg-owner-bg-subtle p-3">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-semibold text-owner-fg-2">
            Variables
          </div>
          <OwnerButton
            variant="secondary"
            size="sm"
            leadingIcon={<Plus size={12} />}
            onClick={addVar}
          >
            Add variable
          </OwnerButton>
        </div>
        {variables.length === 0 ? (
          <div className="text-[12px] text-owner-fg-4">
            No variables yet. Add one for each {`{{n}}`} placeholder in the body.
          </div>
        ) : null}
        {variables.map((v, i) => (
          <div key={i} className="grid grid-cols-[40px_1fr_1fr_28px] gap-2">
            <div className="flex h-10 items-center justify-center rounded-owner-md bg-owner-bg text-[12px] font-semibold text-owner-fg-3">
              {`{{${v.position}}}`}
            </div>
            <input
              className={inputCls}
              value={v.label}
              onChange={(e) => updateVar(i, { label: e.target.value })}
              placeholder="Label (e.g. First name)"
            />
            <input
              className={inputCls}
              value={v.example ?? ""}
              onChange={(e) => updateVar(i, { example: e.target.value })}
              placeholder="Example (e.g. Aanya)"
            />
            <button
              type="button"
              onClick={() => removeVar(i)}
              className="flex h-10 items-center justify-center text-owner-fg-4 hover:text-owner-danger-text"
              aria-label="Remove variable"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <Field label="Footer (optional)">
        <input
          className={inputCls}
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          placeholder="e.g. Reply STOP to opt out"
        />
      </Field>

      <Field label="Button">
        <select
          className={inputCls}
          value={buttonType}
          onChange={(e) =>
            setButtonType(e.target.value as WhatsAppTemplateButtonType)
          }
        >
          <option value="NONE">No button</option>
          <option value="URL">Visit a link</option>
          <option value="PHONE">Call a number</option>
          <option value="QUICK_REPLY">Quick reply</option>
        </select>
      </Field>
      {buttonType !== "NONE" ? (
        <Field label="Button label">
          <input
            className={inputCls}
            value={buttonLabel}
            onChange={(e) => setButtonLabel(e.target.value)}
            placeholder={buttonType === "URL" ? "Get tickets" : "Call us"}
          />
        </Field>
      ) : null}
      {buttonType === "URL" ? (
        <Field label="Button URL" hint="Use {{1}} for a per-message link.">
          <input
            className={inputCls}
            value={buttonUrl}
            onChange={(e) => setButtonUrl(e.target.value)}
            placeholder="https://hoizr.com/events/…"
          />
        </Field>
      ) : null}
      {buttonType === "PHONE" ? (
        <Field label="Phone number">
          <input
            className={inputCls}
            value={buttonPhone}
            onChange={(e) => setButtonPhone(e.target.value)}
            placeholder="+91…"
          />
        </Field>
      ) : null}

      <div className="flex justify-end">
        <OwnerButton variant="primary" disabled={submitting} onClick={submit}>
          {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
          Submit for review
        </OwnerButton>
      </div>
    </div>
  );
};

export default WhatsAppTemplateAuthorForm;
