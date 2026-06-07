"use client";

import { OwnerButton, PageHeader } from "@/components/common/owner";
import {
  EmailCampaignPublicationStatus,
  EmailCampaignScheduleTypes,
} from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useWhatsAppCampaignStore from "@/store/whatsappCampaignStore";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { CalendarClock, Send } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

/**
 * Step 5 — schedule. Publish-click flips publicationStatus to Active,
 * which triggers all pre-publish server guards (verified host, audience
 * non-empty, credit sufficient, tier within cap). Errors surface inline
 * so the host can fix and retry without losing draft state.
 */
const WhatsAppSchedule = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const {
    campaignId,
    scheduleType,
    scheduleDate,
    targetCount,
    setScheduleType,
    setScheduleDate,
    reset,
  } = useWhatsAppCampaignStore();
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!campaignId) return;
    if (scheduleType === EmailCampaignScheduleTypes.Later && !scheduleDate) {
      setToastData({
        type: "error",
        message: "Pick a future date and time to schedule.",
      });
      return;
    }
    setPublishing(true);
    try {
      await sdk.updateHostWhatsAppCampaign({
        input: {
          campaignId,
          scheduleType,
          scheduleTime:
            scheduleType === EmailCampaignScheduleTypes.Later
              ? scheduleDate
              : undefined,
          publicationStatus: EmailCampaignPublicationStatus.Active as any,
        },
      });
      setToastData({
        type: "success",
        message:
          scheduleType === EmailCampaignScheduleTypes.Now
            ? "Campaign is sending now."
            : "Campaign scheduled.",
      });
      reset();
      router.push("/campaigns/whatsapp");
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 font-owner text-owner-fg-1">
      <PageHeader
        title="When should we send this?"
        subtitle="Sending starts immediately or at the time you pick below. You'll see live stats on your campaign card right after."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setScheduleType(EmailCampaignScheduleTypes.Now)}
          className={`flex flex-col gap-2 rounded-owner-lg border bg-owner-bg p-5 text-left transition ${
            scheduleType === EmailCampaignScheduleTypes.Now
              ? "border-owner-blue-500 ring-2 ring-owner-blue-050 shadow-sm"
              : "border-owner-border hover:border-owner-blue-200"
          }`}
        >
          <span className="grid h-10 w-10 place-items-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
            <Send size={18} />
          </span>
          <span className="text-[14px] font-semibold">Send now</span>
          <span className="text-[12.5px] text-owner-fg-3">
            Worker picks this up within a few seconds.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setScheduleType(EmailCampaignScheduleTypes.Later)}
          className={`flex flex-col gap-2 rounded-owner-lg border bg-owner-bg p-5 text-left transition ${
            scheduleType === EmailCampaignScheduleTypes.Later
              ? "border-owner-blue-500 ring-2 ring-owner-blue-050 shadow-sm"
              : "border-owner-border hover:border-owner-blue-200"
          }`}
        >
          <span className="grid h-10 w-10 place-items-center rounded-owner-md bg-owner-success-bg text-owner-success-text">
            <CalendarClock size={18} />
          </span>
          <span className="text-[14px] font-semibold">Schedule for later</span>
          <span className="text-[12.5px] text-owner-fg-3">
            Pick a date and time — Hoizr fires the job at that moment.
          </span>
        </button>
      </div>

      {scheduleType === EmailCampaignScheduleTypes.Later && (
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-owner-fg-2">
            Date and time *
          </label>
          <input
            type="datetime-local"
            value={
              scheduleDate
                ? new Date(
                    scheduleDate.getTime() - scheduleDate.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .slice(0, 16)
                : ""
            }
            onChange={(e) => {
              const v = e.target.value;
              setScheduleDate(v ? new Date(v) : null);
            }}
            className="h-11 max-w-xs rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[14px] text-owner-fg-1 outline-none focus:border-owner-blue-500"
          />
        </div>
      )}

      <div className="rounded-owner-md border border-owner-border bg-owner-bg-subtle p-4 text-[13px] text-owner-fg-2">
        <strong>{targetCount.toLocaleString("en-IN")}</strong> recipient(s) will
        get this WhatsApp message. Each accepted send debits your marketing
        credit at the current rate.
      </div>

      <div className="flex justify-between pt-2">
        <OwnerButton
          variant="secondary"
          onClick={() =>
            router.push("/campaigns/whatsapp/onboarding/template-target")
          }
        >
          Back
        </OwnerButton>
        <OwnerButton
          variant="primary"
          disabled={publishing || targetCount === 0}
          onClick={handlePublish}
        >
          {publishing
            ? "Publishing…"
            : scheduleType === EmailCampaignScheduleTypes.Now
            ? "Send now"
            : "Schedule campaign"}
        </OwnerButton>
      </div>
    </div>
  );
};

export default WhatsAppSchedule;
