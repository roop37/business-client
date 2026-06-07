"use client";

import { OwnerButton, PageHeader } from "@/components/common/owner";
import useWhatsAppCampaignStore from "@/store/whatsappCampaignStore";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { useRouter } from "next/router";
import { useState } from "react";

const OBJECTIVE_PRESETS = [
  { value: "event-promo", label: "Event promo" },
  { value: "early-bird", label: "Early-bird offer" },
  { value: "lineup", label: "Lineup reveal" },
  { value: "reminder", label: "Reminder" },
  { value: "re-engagement", label: "Re-engagement" },
  { value: "utility", label: "Utility / confirmation" },
];

/**
 * Step 1 — capture campaign name + objective tag and persist a draft to
 * the server. The draft id round-trips via the wizard store so later
 * steps update the same record. If the user lands here with a `?id=`
 * query param (e.g. duplicate flow), we skip the create.
 */
const WhatsAppBasicDetails = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const {
    campaignId,
    campaignName,
    objectiveTag,
    templateId,
    setCampaignId,
    setCampaignName,
    setObjectiveTag,
  } = useWhatsAppCampaignStore();
  const [submitting, setSubmitting] = useState(false);

  const canContinue = campaignName.trim().length >= 2;

  const handleContinue = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    try {
      // If we already have a draft id, just persist edits and move on.
      if (campaignId) {
        await sdk.updateHostWhatsAppCampaign({
          input: {
            campaignId,
            campaignName: campaignName.trim(),
            objectiveTag: objectiveTag.trim() || undefined,
          },
        });
        router.push("/campaigns/whatsapp/onboarding/template-select");
        return;
      }

      // Fresh draft — create needs a templateId. If none yet, route to
      // the template picker first; we'll come back to set the name.
      if (!templateId) {
        router.push("/campaigns/whatsapp/onboarding/template-select");
        return;
      }

      const res = await sdk.createHostWhatsAppCampaign({
        input: {
          campaignName: campaignName.trim(),
          templateId,
          templateVariables: [],
          objectiveTag: objectiveTag.trim() || undefined,
        },
      });
      const newId = res.createHostWhatsAppCampaign;
      setCampaignId(newId);
      router.push("/campaigns/whatsapp/onboarding/template-select");
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 font-owner text-owner-fg-1">
      <PageHeader
        title="Name your campaign"
        subtitle="Pick a name that'll help you find this campaign later. The name shows up on your dashboard and inside Hoizr's UTM attribution chain."
      />

      <div className="flex flex-col gap-3">
        <label className="text-[13px] font-medium text-owner-fg-2">
          Campaign name *
        </label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="e.g. Sunburn Goa — early bird"
          maxLength={120}
          className="h-12 rounded-owner-md border border-owner-border bg-owner-bg px-4 text-[15px] font-medium text-owner-fg-1 outline-none focus:border-owner-blue-500"
        />
        <p className="text-[12px] text-owner-fg-4">
          This is what shows up in your analytics — keep it descriptive.
          Customers don&apos;t see this.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[13px] font-medium text-owner-fg-2">
          What&apos;s this campaign for? <span className="text-owner-fg-4">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {OBJECTIVE_PRESETS.map((preset) => {
            const active = objectiveTag === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setObjectiveTag(active ? "" : preset.value)}
                className={`rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition ${
                  active
                    ? "border-owner-blue-500 bg-owner-blue-050 text-owner-blue-500"
                    : "border-owner-border bg-owner-bg text-owner-fg-2 hover:border-owner-blue-200"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <OwnerButton
          variant="primary"
          disabled={!canContinue || submitting}
          onClick={handleContinue}
        >
          {submitting ? "Saving…" : "Continue"}
        </OwnerButton>
      </div>
    </div>
  );
};

export default WhatsAppBasicDetails;
