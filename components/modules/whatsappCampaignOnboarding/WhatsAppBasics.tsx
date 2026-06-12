"use client";

import useWhatsappCampaignStore from "@/store/whatsappCampaignStore";

const inputCls =
  "h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050";

/**
 * Step 1 — Basics. Campaign name + optional objective tag. WhatsApp has no
 * email subject (the template owns the message), so this is intentionally lean.
 */
const WhatsAppBasics = () => {
  const { campaignName, setCampaignName, objectiveTag, setObjectiveTag } =
    useWhatsappCampaignStore();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-semibold text-owner-fg-1">
          Set up your WhatsApp campaign
        </h1>
        <p className="text-[13px] text-owner-fg-3">
          Give your campaign a name. You&apos;ll pick the approved message
          template and personalise it in the next step.
        </p>
      </div>

      <label className="block">
        <span className="text-[12px] font-semibold text-owner-fg-2">
          Campaign name
        </span>
        <input
          className={`${inputCls} mt-1`}
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="e.g. Neon Nights announcement"
        />
      </label>

      <label className="block">
        <span className="text-[12px] font-semibold text-owner-fg-2">
          Objective tag{" "}
          <span className="font-normal text-owner-fg-4">(optional)</span>
        </span>
        <input
          className={`${inputCls} mt-1`}
          value={objectiveTag}
          onChange={(e) => setObjectiveTag(e.target.value)}
          placeholder="e.g. announcement, reminder, last-chance"
        />
        <span className="mt-1 block text-[11px] text-owner-fg-4">
          A short label for your own reporting. It is not shown to customers.
        </span>
      </label>
    </div>
  );
};

export default WhatsAppBasics;
