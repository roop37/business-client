"use client";

import { OwnerButton } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import useOriginalWhatsappCampaignStore from "@/store/originalWhatsappCampaignStore";
import useWhatsappCampaignStore from "@/store/whatsappCampaignStore";
import {
  createWhatsAppCampaign,
  fetchWhatsAppCampaignById,
  updateWhatsAppCampaign,
} from "@/utils/whatsappCampaignClient";
import { fetchWhatsAppTemplateById } from "@/utils/whatsappTemplateClient";
import { previewLabelForValue } from "@/utils/whatsappMergeTags";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { WhatsAppTemplatePreview } from "../modules/whatsappCampaign/WhatsAppTemplatePreview";

const STEPS = [
  { id: "basics", title: "Basics" },
  { id: "content", title: "Content" },
  { id: "audience", title: "Audience" },
  { id: "schedule", title: "When to send" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

const WhatsAppCampaignOnboardingLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { setToastData, openTopUpModal } = useGlobalStore();

  const step = (
    typeof router.query.step === "string" ? router.query.step : "basics"
  ) as StepId;
  const editId =
    typeof router.query.editId === "string" ? router.query.editId : undefined;
  const stepIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.id === step)
  );

  const store = useWhatsappCampaignStore();
  const setOriginalCampaign = useOriginalWhatsappCampaignStore(
    (s) => s.setOriginalCampaign
  );

  const [submitting, setSubmitting] = useState<null | "next" | "draft">(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hydratedFor = useRef<string | null>(null);

  // ── Edit / refresh hydration ──────────────────────────────────────
  // The campaign id lives in the URL (`?editId=`) from step 1 onward, so a
  // back/forward navigation or a full page reload rehydrates the journey from
  // the server — state is never lost. Mirrors the email journey.
  useEffect(() => {
    if (!editId || hydratedFor.current === editId) return;
    if (store.campaignId === editId) {
      hydratedFor.current = editId;
      return;
    }
    hydratedFor.current = editId;
    (async () => {
      try {
        const c = await fetchWhatsAppCampaignById(editId);
        if (!c) return;
        setOriginalCampaign(c);
        store.setCampaignId(c._id);
        store.setCampaignName(c.campaignName ?? "");
        store.setObjectiveTag(c.objectiveTag ?? "");
        store.setTemplateVariables(c.templateVariables ?? []);
        store.setHeaderMediaUrl(c.headerMediaUrl ?? "");
        store.setTarget(c.target ?? "AllAttendees");
        store.setEventId(c.eventId ?? "");
        store.setFilters(c.filters ?? []);
        store.setTargetCount(c.targetCount ?? 0);
        store.setScheduleType((c.scheduleType as "Now" | "Later") ?? "Now");
        store.setScheduleDate(c.scheduleTime ? new Date(c.scheduleTime) : null);
        store.setPublicationStatus(
          (c.publicationStatus as "Drafted" | "Active") ?? "Drafted"
        );
        if (c.templateId) {
          const tpl = await fetchWhatsAppTemplateById(c.templateId);
          if (tpl) store.setSelectedTemplate(tpl);
        }
      } catch (err) {
        setToastData({ type: "error", message: extractErrorMessage(err) });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const idForUrl = editId ?? store.campaignId ?? undefined;
  const goTo = (id: StepId) => {
    const q = idForUrl ? `?editId=${encodeURIComponent(idForUrl)}` : "";
    router.push(`/campaigns/whatsapp/onboarding/${id}${q}`);
  };

  const back = () => {
    if (stepIndex === 0) {
      router.push("/campaigns/whatsapp");
      return;
    }
    goTo(STEPS[stepIndex - 1].id);
  };

  const variablesFilled = useMemo(() => {
    const t = store.selectedTemplate;
    if (!t) return false;
    const byPos = new Map(store.templateVariables.map((v) => [v.position, v.value]));
    return (t.variables ?? []).every((v) => (byPos.get(v.position) ?? "").trim());
  }, [store.selectedTemplate, store.templateVariables]);

  // Create the Drafted campaign as soon as it has a name (step 1), so it gets
  // a persisted id immediately and the journey is keyed to a real document.
  const ensureCampaign = useCallback(async (): Promise<string> => {
    if (store.campaignId) return store.campaignId;
    const id = await createWhatsAppCampaign({
      campaignName: store.campaignName.trim(),
      objectiveTag: store.objectiveTag.trim() || undefined,
    });
    store.setCampaignId(id);
    return id;
  }, [store]);

  // Persist whatever the current step owns. Disjoint per step, so we send only
  // that step's fields — no risk of clobbering other steps.
  const saveCurrentStep = useCallback(
    async (id: string): Promise<void> => {
      if (step === "basics") {
        await updateWhatsAppCampaign({
          campaignId: id,
          campaignName: store.campaignName.trim(),
          objectiveTag: store.objectiveTag.trim() || undefined,
          // The Step 1 event drives content prefill + audience targeting; it is
          // owned here, so persist it (or clear it) from this step.
          eventId: store.eventId.trim() || undefined,
        });
      } else if (step === "content") {
        await updateWhatsAppCampaign({
          campaignId: id,
          templateId: store.templateId || undefined,
          templateVariables: store.templateVariables,
          headerMediaUrl: store.headerMediaUrl.trim() || undefined,
        });
      } else if (step === "audience") {
        await updateWhatsAppCampaign({
          campaignId: id,
          target: store.target,
          // eventId is owned by Step 1 — preserve it regardless of target so
          // switching to "All attendees" here doesn't wipe the campaign event.
          // The backend only narrows recipients by it when target is
          // EventSpecific.
          eventId: store.eventId.trim() || undefined,
          filters: store.target === "CustomCustomer" ? store.filters : [],
          targetCount: store.targetCount,
        });
      } else if (step === "schedule") {
        await updateWhatsAppCampaign({
          campaignId: id,
          scheduleType: store.scheduleType,
          scheduleTime:
            store.scheduleType === "Later" && store.scheduleDate
              ? store.scheduleDate.toISOString()
              : undefined,
        });
      }
    },
    [step, store]
  );

  const handleContinue = async () => {
    setSubmitting("next");
    try {
      if (step === "basics") {
        if (!store.campaignName.trim()) {
          setToastData({ type: "error", message: "Name your campaign first." });
          return;
        }
        const id = await ensureCampaign();
        await saveCurrentStep(id);
        // Thread the id into the URL so back/forward/reload rehydrate.
        if (!editId) {
          router.replace(
            `/campaigns/whatsapp/onboarding/content?editId=${encodeURIComponent(id)}`
          );
        } else {
          goTo("content");
        }
        return;
      }

      if (step === "content") {
        if (!store.selectedTemplate) {
          setToastData({ type: "error", message: "Pick a template to continue." });
          return;
        }
        if (!variablesFilled) {
          setToastData({
            type: "error",
            message: "Fill in every template variable before continuing.",
          });
          return;
        }
        const id = await ensureCampaign();
        await saveCurrentStep(id);
        goTo("audience");
        return;
      }

      if (step === "audience") {
        if (store.target === "EventSpecific" && !store.eventId.trim()) {
          setToastData({
            type: "error",
            message: "Pick the event in Step 1 to target its buyers.",
          });
          return;
        }
        const id = await ensureCampaign();
        await saveCurrentStep(id);
        goTo("schedule");
        return;
      }

      if (step === "schedule") {
        if (store.scheduleType === "Later" && !store.scheduleDate) {
          setToastData({
            type: "error",
            message: "Pick a date and time to schedule.",
          });
          return;
        }
        setConfirmOpen(true);
      }
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSubmitting(null);
    }
  };

  const saveDraft = async () => {
    if (!store.campaignName.trim()) {
      setToastData({
        type: "error",
        message: "Add a campaign name before saving a draft.",
      });
      return;
    }
    setSubmitting("draft");
    try {
      const id = await ensureCampaign();
      await saveCurrentStep(id);
      setToastData({ type: "success", message: "Draft saved." });
      store.resetState();
      router.push("/campaigns/whatsapp");
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSubmitting(null);
    }
  };

  const publish = async () => {
    setSubmitting("next");
    try {
      const id = await ensureCampaign();
      await updateWhatsAppCampaign({
        campaignId: id,
        target: store.target,
        eventId: store.eventId.trim() || undefined,
        filters: store.target === "CustomCustomer" ? store.filters : [],
        scheduleType: store.scheduleType,
        scheduleTime:
          store.scheduleType === "Later" && store.scheduleDate
            ? store.scheduleDate.toISOString()
            : undefined,
        publicationStatus: "Active",
      });
      setConfirmOpen(false);
      setToastData({
        type: "success",
        message:
          store.scheduleType === "Now"
            ? "Your WhatsApp campaign is sending."
            : "Your WhatsApp campaign is scheduled.",
      });
      store.resetState();
      router.push("/campaigns/whatsapp");
    } catch (err) {
      const message = extractErrorMessage(err);
      setConfirmOpen(false);
      // Insufficient credit → open the global top-up modal pre-filled with the
      // shortfall the server quoted (the modal is mounted at app root).
      if (/insufficient marketing credit/i.test(message)) {
        const m = message.match(/top up ₹([\d,.]+)\s*more/i);
        const shortfall = m ? Number(m[1].replace(/,/g, "")) : 0;
        openTopUpModal(Math.max(100, Math.ceil(shortfall || 0)));
        setToastData({
          type: "error",
          message:
            "You need more marketing credit to send this. Top up and publish again.",
        });
      } else {
        setToastData({ type: "error", message });
      }
    } finally {
      setSubmitting(null);
    }
  };

  const continueLabel =
    step === "schedule"
      ? store.scheduleType === "Now"
        ? "Review & send"
        : "Review & schedule"
      : "Continue";

  return (
    <div className="flex h-screen flex-col bg-owner-bg-subtle font-owner">
      {/* Header */}
      <div className="shrink-0 border-b border-owner-border bg-owner-bg">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <button
            type="button"
            onClick={back}
            className="flex items-center gap-1 text-[13px] text-owner-fg-3 hover:text-owner-fg-1"
          >
            <LuArrowLeft size={16} /> Back
          </button>
          <div className="ml-2 hidden items-center gap-2 md:flex">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 text-[12.5px] ${
                    i === stepIndex
                      ? "font-semibold text-owner-fg-1"
                      : i < stepIndex
                      ? "text-owner-blue-500"
                      : "text-owner-fg-4"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                      i <= stepIndex
                        ? "bg-owner-blue-500 text-white"
                        : "bg-owner-bg-subtle text-owner-fg-4"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span>{s.title}</span>
                </div>
                {i < STEPS.length - 1 ? (
                  <span className="h-px w-4 bg-owner-border" />
                ) : null}
              </div>
            ))}
          </div>
          <div className="ml-auto text-[12px] text-owner-fg-4">
            Step {stepIndex + 1} of {STEPS.length}
          </div>
        </div>
      </div>

      {/* Body: scrollable form + live preview */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-owner-lg border border-owner-border bg-owner-bg p-5">
            {children}
          </div>
          <div className="lg:sticky lg:top-0 lg:self-start">
            <WhatsAppTemplatePreview
              template={store.selectedTemplate}
              // Show friendly labels for dynamic customer tokens (e.g.
              // "Customer first name") instead of the raw {{...}} token.
              variables={store.templateVariables.map((v) => ({
                ...v,
                value: previewLabelForValue(v.value),
              }))}
              headerMediaUrl={store.headerMediaUrl}
            />
          </div>
        </div>
      </div>

      {/* Footer nav — pinned to the viewport bottom */}
      <div className="shrink-0 border-t border-owner-border bg-owner-bg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-6 py-3">
          <OwnerButton variant="secondary" onClick={back} disabled={!!submitting}>
            {stepIndex === 0 ? "Cancel" : "Back"}
          </OwnerButton>
          <div className="flex items-center gap-2">
            <OwnerButton
              variant="secondary"
              onClick={saveDraft}
              disabled={!!submitting}
            >
              {submitting === "draft" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              Save as draft
            </OwnerButton>
            <OwnerButton
              variant="primary"
              onClick={handleContinue}
              disabled={!!submitting}
            >
              {submitting === "next" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              {continueLabel}
            </OwnerButton>
          </div>
        </div>
      </div>

      {/* Confirm publish modal */}
      {confirmOpen ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-owner-lg bg-owner-bg p-5 shadow-xl">
            <div className="text-[16px] font-semibold text-owner-fg-1">
              {store.scheduleType === "Now"
                ? "Send this campaign now?"
                : "Schedule this campaign?"}
            </div>
            <p className="mt-1 text-[13px] text-owner-fg-3">
              It will go to ≈{" "}
              <strong>{store.targetCount.toLocaleString("en-IN")}</strong>{" "}
              recipient{store.targetCount === 1 ? "" : "s"}. You&apos;re charged
              only for messages WhatsApp accepts.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <OwnerButton
                variant="secondary"
                onClick={() => setConfirmOpen(false)}
                disabled={!!submitting}
              >
                Not yet
              </OwnerButton>
              <OwnerButton
                variant="primary"
                onClick={publish}
                disabled={!!submitting}
              >
                {submitting === "next" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                {store.scheduleType === "Now" ? "Send now" : "Schedule"}
              </OwnerButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WhatsAppCampaignOnboardingLayout;
