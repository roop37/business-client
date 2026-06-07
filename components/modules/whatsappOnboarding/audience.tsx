"use client";

import { OwnerButton, PageHeader } from "@/components/common/owner";
import {
  CustomCampaignFilter,
  CustomEmailTargetType,
} from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useWhatsAppCampaignStore from "@/store/whatsappCampaignStore";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Step 4 (audience). Reuses the same enums as email so the server-side
 * audience resolver matches behaviour exactly:
 *   - AllAttendees: every paid-attendee/follower across the org
 *   - EventSpecific: scoped to one event (incl. event followers +
 *     lineup-artist followers + collab-host followers)
 *   - CSV: host uploads phone list (post-MVP — file picker stub here)
 *   - CustomCustomer: chip-based segmentation
 *
 * Eligibility filter on the server: phone present + whatsappMarketingOptIn
 * = true. The live count reflects this.
 */
const TARGET_TILES: {
  value: CustomEmailTargetType;
  label: string;
  desc: string;
}[] = [
  {
    value: CustomEmailTargetType.AllAttendees,
    label: "All your audience",
    desc: "Everyone who's bought, followed, or attended any of your events.",
  },
  {
    value: CustomEmailTargetType.EventSpecific,
    label: "An event",
    desc: "Followers + buyers of a specific event, plus its lineup artists' followers.",
  },
  {
    value: CustomEmailTargetType.CustomCustomer,
    label: "Custom segment",
    desc: "Apply behaviour filters — active buyers, top spenders, dormant, by gender.",
  },
];

const FILTER_CHIPS: { value: CustomCampaignFilter; label: string }[] = [
  { value: CustomCampaignFilter.Active, label: "Active (last 30d)" },
  { value: CustomCampaignFilter.Repeat, label: "Repeat buyers" },
  { value: CustomCampaignFilter.TopSpenders, label: "Top spenders" },
  { value: CustomCampaignFilter.Dormant, label: "Dormant (90d+)" },
  { value: CustomCampaignFilter.NewCustomers, label: "New (last 7d)" },
  { value: CustomCampaignFilter.Male, label: "Male" },
  { value: CustomCampaignFilter.Female, label: "Female" },
  { value: CustomCampaignFilter.Other, label: "Other" },
];

const WhatsAppAudience = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const {
    campaignId,
    targetType,
    selectedFilters,
    eventId,
    targetCount,
    setTargetType,
    toggleFilter,
    setEventId,
    setTargetCount,
  } = useWhatsAppCampaignStore();
  const [counting, setCounting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState<
    Array<{ _id: string; title?: string | null }>
  >([]);

  // Live audience count whenever inputs change.
  useEffect(() => {
    if (!targetType || targetType === CustomEmailTargetType.Csv) {
      setTargetCount(0);
      return;
    }
    let cancelled = false;
    (async () => {
      setCounting(true);
      try {
        const res = await sdk.getHostWhatsAppAttendeesTargetCount({
          target: targetType,
          eventId: eventId ?? undefined,
          filters:
            targetType === CustomEmailTargetType.CustomCustomer
              ? selectedFilters
              : undefined,
        });
        if (!cancelled) setTargetCount(res.getHostWhatsAppAttendeesTargetCount ?? 0);
      } catch (error) {
        if (!cancelled) {
          setTargetCount(0);
          setToastData({ type: "error", message: extractErrorMessage(error) });
        }
      } finally {
        if (!cancelled) setCounting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [targetType, eventId, selectedFilters, setTargetCount, setToastData]);

  // Lazy-load the host's events list when needed.
  useEffect(() => {
    if (targetType !== CustomEmailTargetType.EventSpecific) return;
    if (events.length > 0) return;
    (async () => {
      try {
        const res = await (sdk as any).getMyEventsLite?.({});
        const items = res?.getMyEventsLite?.items ?? res?.getMyEvents?.items ?? [];
        setEvents(items.map((e: any) => ({ _id: e._id, title: e.title })));
      } catch {
        // Non-fatal — the field will stay empty and the host can paste an id.
      }
    })();
  }, [targetType, events.length]);

  const canContinue = Boolean(targetType) && targetCount > 0;

  const handleContinue = async () => {
    if (!campaignId || !canContinue) return;
    setSubmitting(true);
    try {
      await sdk.updateHostWhatsAppCampaign({
        input: {
          campaignId,
          target: targetType ?? undefined,
          eventId: eventId ?? undefined,
          filters:
            targetType === CustomEmailTargetType.CustomCustomer
              ? selectedFilters
              : [],
          targetCount,
        },
      });
      router.push("/campaigns/whatsapp/onboarding/schedule");
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 font-owner text-owner-fg-1">
      <PageHeader
        title="Who should get this?"
        subtitle="WhatsApp customers who haven't opted in are automatically excluded — Hoizr handles the compliance for you."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TARGET_TILES.map((tile) => {
          const active = targetType === tile.value;
          return (
            <button
              key={tile.value}
              type="button"
              onClick={() => setTargetType(tile.value)}
              className={`flex flex-col gap-2 rounded-owner-lg border bg-owner-bg p-4 text-left transition ${
                active
                  ? "border-owner-blue-500 ring-2 ring-owner-blue-050 shadow-sm"
                  : "border-owner-border hover:border-owner-blue-200"
              }`}
            >
              <span className="text-[14px] font-semibold text-owner-fg-1">
                {tile.label}
              </span>
              <span className="text-[12.5px] text-owner-fg-3">{tile.desc}</span>
            </button>
          );
        })}
      </div>

      {targetType === CustomEmailTargetType.EventSpecific && (
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-owner-fg-2">
            Event *
          </label>
          {events.length > 0 ? (
            <select
              value={eventId ?? ""}
              onChange={(e) => setEventId(e.target.value || null)}
              className="h-11 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[14px] text-owner-fg-1 outline-none focus:border-owner-blue-500"
            >
              <option value="">— Pick an event —</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title ?? e._id}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={eventId ?? ""}
              onChange={(e) => setEventId(e.target.value || null)}
              placeholder="Event id"
              className="h-11 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[14px] text-owner-fg-1 outline-none focus:border-owner-blue-500"
            />
          )}
        </div>
      )}

      {targetType === CustomEmailTargetType.CustomCustomer && (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-owner-fg-3">
            Pick any combination — recipients matching <strong>any</strong>{" "}
            selected chip are included.
          </p>
          <div className="flex flex-wrap gap-2">
            {FILTER_CHIPS.map((chip) => {
              const active = selectedFilters.includes(chip.value);
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => toggleFilter(chip.value)}
                  className={`rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition ${
                    active
                      ? "border-owner-blue-500 bg-owner-blue-050 text-owner-blue-500"
                      : "border-owner-border bg-owner-bg text-owner-fg-2 hover:border-owner-blue-200"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-owner-md border border-owner-border bg-owner-bg-subtle p-4 text-[13px] text-owner-fg-2">
        {counting ? (
          "Counting your audience…"
        ) : targetType ? (
          <>
            This campaign will send to{" "}
            <strong>{targetCount.toLocaleString("en-IN")}</strong> recipient(s).
            {targetCount === 0 && (
              <span className="ml-2 text-owner-warning-text">
                — no one matches; widen the audience to publish.
              </span>
            )}
          </>
        ) : (
          "Pick an audience type to see the live count."
        )}
      </div>

      <div className="flex justify-between pt-2">
        <OwnerButton
          variant="secondary"
          onClick={() =>
            router.push("/campaigns/whatsapp/onboarding/template-edit")
          }
        >
          Back
        </OwnerButton>
        <OwnerButton
          variant="primary"
          disabled={!canContinue || submitting}
          onClick={handleContinue}
        >
          {submitting ? "Saving…" : "Continue to schedule"}
        </OwnerButton>
      </div>
    </div>
  );
};

export default WhatsAppAudience;
