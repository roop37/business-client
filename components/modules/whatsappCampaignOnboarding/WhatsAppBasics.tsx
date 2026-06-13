"use client";

import useGlobalStore from "@/store/global";
import useWhatsappCampaignStore from "@/store/whatsappCampaignStore";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  fetchMyPublishedEvents,
  type WhatsAppPrefillEvent,
} from "@/utils/whatsappTemplateClient";
import { useEffect, useState } from "react";

const inputCls =
  "h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050";

/**
 * Step 1 — Basics. Campaign name, the event this campaign is about, and an
 * optional objective tag. Picking the event here lets later steps prefill
 * event-based message variables (name, date, link…) and target that event's
 * buyers without re-entering anything. WhatsApp has no email subject (the
 * template owns the message), so this is otherwise lean.
 */
const WhatsAppBasics = () => {
  const { setToastData } = useGlobalStore();
  const {
    campaignName,
    setCampaignName,
    objectiveTag,
    setObjectiveTag,
    eventId,
    setEventId,
  } = useWhatsappCampaignStore();

  const [events, setEvents] = useState<WhatsAppPrefillEvent[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setEvents(await fetchMyPublishedEvents());
      } catch (err) {
        setToastData({ type: "error", message: extractErrorMessage(err) });
      }
    })();
  }, [setToastData]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-semibold text-owner-fg-1">
          Set up your WhatsApp campaign
        </h1>
        <p className="text-[13px] text-owner-fg-3">
          Name your campaign and pick the event it&apos;s about. You&apos;ll
          choose the approved message template and personalise it next.
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
          Event{" "}
          <span className="font-normal text-owner-fg-4">(optional)</span>
        </span>
        <select
          className={`${inputCls} mt-1`}
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">No specific event</option>
          {events.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-[11px] text-owner-fg-4">
          Pick the event this campaign is about — we&apos;ll prefill its name,
          date and link into your message variables and CTA, and let you target
          its buyers.
        </span>
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
