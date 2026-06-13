"use client";

import { Card, OwnerButton } from "@/components/common/owner";
import MarketingCreditWarning from "@/components/modules/campaign/MarketingCreditWarning";
import { sdk } from "@/utils/graphqlClient";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  createWhatsAppCampaign,
  fetchApprovedWhatsAppTemplates,
  fetchWhatsAppTargetCount,
  updateWhatsAppCampaign,
  type WhatsAppCampaignVariable,
  type WhatsAppTemplate,
} from "@/utils/whatsappCampaignClient";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WhatsAppTemplatePreview } from "./WhatsAppTemplatePreview";

// Mirrors HostEmailTargetType (shared) — the audience kinds WhatsApp reuses.
const TARGETS = [
  { value: "AllAttendees", label: "All attendees & followers" },
  { value: "EventSpecific", label: "A specific event's buyers" },
] as const;

const inputCls =
  "h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050";

export const WhatsAppCampaignBuilder = ({
  onDone,
}: {
  onDone?: () => void;
}) => {
  const { setToastData } = useGlobalStore();

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const [campaignName, setCampaignName] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [varValues, setVarValues] = useState<Record<number, string>>({});
  const [headerMediaUrl, setHeaderMediaUrl] = useState("");

  const [target, setTarget] = useState<string>("AllAttendees");
  const [eventId, setEventId] = useState("");
  const [targetCount, setTargetCount] = useState<number | null>(null);

  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduleTime, setScheduleTime] = useState("");

  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);

  // WhatsApp marketing-credit rate (₹/delivered message). Fetched so the
  // insufficient-credit warning can estimate cost; falls back to the same
  // 0.5 default the MarketingCredit page uses if pricing can't be loaded.
  const [whatsappRate, setWhatsappRate] = useState(0.5);

  useEffect(() => {
    (async () => {
      try {
        setTemplates(await fetchApprovedWhatsAppTemplates());
      } catch (err) {
        setToastData({ type: "error", message: extractErrorMessage(err) });
      } finally {
        setLoadingTemplates(false);
      }
    })();
  }, [setToastData]);

  useEffect(() => {
    sdk
      .GetMarketingPricing()
      .then((res) => {
        const rate = Number(res?.getMarketingPricing?.whatsappRate);
        if (Number.isFinite(rate) && rate > 0) setWhatsappRate(rate);
      })
      .catch(() => {
        // Best-effort — fallback rate already in state.
      });
  }, []);

  const template = useMemo(
    () => templates.find((t) => t._id === templateId) ?? null,
    [templates, templateId]
  );

  // Reset variable values when the template changes.
  useEffect(() => {
    setVarValues({});
    setHeaderMediaUrl("");
  }, [templateId]);

  const variables: WhatsAppCampaignVariable[] = useMemo(
    () =>
      (template?.variables ?? []).map((v) => ({
        position: v.position,
        value: varValues[v.position] ?? "",
      })),
    [template, varValues]
  );

  const refreshTargetCount = useCallback(async () => {
    try {
      const n = await fetchWhatsAppTargetCount({
        target,
        eventId: target === "EventSpecific" ? eventId || undefined : undefined,
      });
      setTargetCount(n);
    } catch {
      setTargetCount(null);
    }
  }, [target, eventId]);

  useEffect(() => {
    if (target === "EventSpecific" && !eventId) {
      setTargetCount(null);
      return;
    }
    refreshTargetCount();
  }, [target, eventId, refreshTargetCount]);

  const allVarsFilled =
    !!template &&
    (template.variables ?? []).every((v) => (varValues[v.position] ?? "").trim());

  // Estimated WhatsApp marketing-credit cost = recipients × per-message rate.
  // Drives the insufficient-credit warning (which auto-clears after a
  // top-up via the shared marketingCreditVersion signal).
  const estimatedWhatsAppCost = useMemo(
    () =>
      targetCount && targetCount > 0
        ? Math.ceil(targetCount * whatsappRate)
        : 0,
    [targetCount, whatsappRate]
  );

  const canSubmit =
    !!campaignName.trim() &&
    !!template &&
    allVarsFilled &&
    (target !== "EventSpecific" || !!eventId.trim()) &&
    (scheduleType !== "later" || !!scheduleTime);

  const submit = async (mode: "draft" | "publish") => {
    if (!template) return;
    setSubmitting(mode);
    try {
      const campaignId = await createWhatsAppCampaign({
        campaignName: campaignName.trim(),
        templateId: template._id,
        templateVariables: variables,
        headerMediaUrl: headerMediaUrl.trim() || undefined,
      });

      await updateWhatsAppCampaign({
        campaignId,
        target,
        eventId: target === "EventSpecific" ? eventId.trim() : undefined,
        scheduleType,
        scheduleTime:
          scheduleType === "later" && scheduleTime
            ? new Date(scheduleTime).toISOString()
            : undefined,
        // Publishing flips publication to Active (the server runs its
        // verify + credit + reputation gates, then enqueues the send).
        ...(mode === "publish" ? { publicationStatus: "Active" } : {}),
      });

      setToastData({
        type: "success",
        message:
          mode === "publish"
            ? scheduleType === "now"
              ? "WhatsApp campaign is sending."
              : "WhatsApp campaign scheduled."
            : "Saved as draft.",
      });
      onDone?.();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* ── Left: form ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 font-owner">
        <Card padding={16} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-owner-success-text" />
            <div className="text-[14px] font-semibold text-owner-fg-1">
              Message
            </div>
          </div>

          <Field label="Campaign name">
            <input
              className={inputCls}
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. Neon Nights announcement"
            />
          </Field>

          <Field
            label="Template"
            hint="Only Meta-approved templates can be sent as marketing messages."
          >
            <select
              className={inputCls}
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={loadingTemplates}
            >
              <option value="">
                {loadingTemplates
                  ? "Loading templates…"
                  : templates.length
                  ? "Select a template"
                  : "No approved templates yet"}
              </option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.category.toLowerCase()})
                </option>
              ))}
            </select>
          </Field>

          {template &&
          (template.headerType === "IMAGE" ||
            template.headerType === "VIDEO") ? (
            <Field
              label={`Header ${template.headerType.toLowerCase()} URL`}
              hint="Shown at the top of the message."
            >
              <input
                className={inputCls}
                value={headerMediaUrl}
                onChange={(e) => setHeaderMediaUrl(e.target.value)}
                placeholder="https://…"
              />
            </Field>
          ) : null}

          {template && (template.variables ?? []).length > 0 ? (
            <div className="flex flex-col gap-3 rounded-owner-md border border-owner-border-soft bg-owner-bg-subtle p-3">
              <div className="text-[12px] font-semibold text-owner-fg-2">
                Fill the template variables
              </div>
              {(template.variables ?? [])
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((v) => (
                  <Field
                    key={v.position}
                    label={`{{${v.position}}} ${v.label ?? ""}`.trim()}
                    hint={v.hint ?? undefined}
                  >
                    <input
                      className={inputCls}
                      value={varValues[v.position] ?? ""}
                      onChange={(e) =>
                        setVarValues((prev) => ({
                          ...prev,
                          [v.position]: e.target.value,
                        }))
                      }
                      placeholder={v.example ?? `Value for {{${v.position}}}`}
                    />
                  </Field>
                ))}
            </div>
          ) : null}
        </Card>

        <Card padding={16} className="flex flex-col gap-4">
          <div className="text-[14px] font-semibold text-owner-fg-1">
            Audience
          </div>
          <Field label="Send to">
            <select
              className={inputCls}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          {target === "EventSpecific" ? (
            <Field label="Event ID">
              <input
                className={inputCls}
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Paste the event id"
              />
            </Field>
          ) : null}
          <div className="text-[12.5px] text-owner-fg-3">
            {targetCount === null
              ? "Estimating reachable WhatsApp recipients…"
              : `≈ ${targetCount.toLocaleString("en-IN")} reachable recipients (opted-in, valid number).`}
          </div>
        </Card>

        <Card padding={16} className="flex flex-col gap-4">
          <div className="text-[14px] font-semibold text-owner-fg-1">
            When to send
          </div>
          <div className="flex gap-2">
            {(["now", "later"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setScheduleType(opt)}
                className={
                  scheduleType === opt
                    ? "rounded-owner-md border border-owner-blue-500 bg-owner-blue-050 px-3 py-1.5 text-[13px] font-semibold text-owner-blue-500"
                    : "rounded-owner-md border border-owner-border px-3 py-1.5 text-[13px] text-owner-fg-3"
                }
              >
                {opt === "now" ? "Send now" : "Schedule"}
              </button>
            ))}
          </div>
          {scheduleType === "later" ? (
            <Field label="Send at">
              <input
                type="datetime-local"
                className={inputCls}
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </Field>
          ) : null}
        </Card>

        {estimatedWhatsAppCost > 0 ? (
          <MarketingCreditWarning
            estimatedCost={estimatedWhatsAppCost}
            label="this WhatsApp campaign"
          />
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <OwnerButton
            variant="secondary"
            disabled={!canSubmit || submitting !== null}
            onClick={() => submit("draft")}
          >
            {submitting === "draft" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : null}
            Save draft
          </OwnerButton>
          <OwnerButton
            variant="primary"
            leadingIcon={<Send size={14} />}
            disabled={!canSubmit || submitting !== null}
            onClick={() => submit("publish")}
          >
            {submitting === "publish" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : null}
            {scheduleType === "now" ? "Send now" : "Schedule"}
          </OwnerButton>
        </div>
      </div>

      {/* ── Right: live preview ──────────────────────────────────── */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <WhatsAppTemplatePreview
          template={template}
          variables={variables}
          headerMediaUrl={headerMediaUrl}
        />
      </div>
    </div>
  );
};

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

export default WhatsAppCampaignBuilder;
