"use client";

import useWhatsappCampaignStore from "@/store/whatsappCampaignStore";
import { fetchWhatsAppTargetCount } from "@/utils/whatsappCampaignClient";
import { useCallback, useEffect } from "react";

const inputCls =
  "h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050";

const TARGETS = [
  { value: "AllAttendees", label: "All attendees & followers" },
  { value: "EventSpecific", label: "A specific event's buyers" },
  { value: "CustomCustomer", label: "Custom audience (filters)" },
] as const;

// Mirrors HostCampaignAudienceFilter (shared).
const FILTERS = [
  { value: "Active", label: "Active (ordered in last 30d)" },
  { value: "Dormant", label: "Dormant (no order in 90d)" },
  { value: "NewCustomers", label: "New (signed up in last 7d)" },
  { value: "Repeat", label: "Repeat (2+ paid orders)" },
  { value: "TopSpenders", label: "Top spenders (₹2000+ in 30d)" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other gender" },
] as const;

const WhatsAppAudience = () => {
  const {
    target,
    setTarget,
    eventId,
    setEventId,
    filters,
    setFilters,
    targetCount,
    setTargetCount,
  } = useWhatsappCampaignStore();

  const refreshCount = useCallback(async () => {
    try {
      const n = await fetchWhatsAppTargetCount({
        target,
        eventId: target === "EventSpecific" ? eventId || undefined : undefined,
        filters:
          target === "CustomCustomer" && filters.length ? filters : undefined,
      });
      setTargetCount(n);
    } catch {
      setTargetCount(0);
    }
  }, [target, eventId, filters, setTargetCount]);

  useEffect(() => {
    if (target === "EventSpecific" && !eventId) {
      setTargetCount(0);
      return;
    }
    const t = setTimeout(refreshCount, 350);
    return () => clearTimeout(t);
  }, [target, eventId, filters, refreshCount, setTargetCount]);

  const toggleFilter = (value: string) =>
    setFilters(
      filters.includes(value)
        ? filters.filter((f) => f !== value)
        : [...filters, value]
    );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-semibold text-owner-fg-1">
          Who should receive it?
        </h1>
        <p className="text-[13px] text-owner-fg-3">
          We only message opted-in customers with a valid WhatsApp number.
        </p>
      </div>

      <label className="block">
        <span className="text-[12px] font-semibold text-owner-fg-2">Send to</span>
        <select
          className={`${inputCls} mt-1`}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        >
          {TARGETS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {target === "EventSpecific" ? (
        <label className="block">
          <span className="text-[12px] font-semibold text-owner-fg-2">
            Event ID
          </span>
          <input
            className={`${inputCls} mt-1`}
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Paste the event id"
          />
        </label>
      ) : null}

      {target === "CustomCustomer" ? (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold text-owner-fg-2">
            Filters
          </span>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const on = filters.includes(f.value);
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => toggleFilter(f.value)}
                  className={
                    on
                      ? "rounded-full border border-owner-blue-500 bg-owner-blue-050 px-3 py-1 text-[12px] font-medium text-owner-blue-500"
                      : "rounded-full border border-owner-border px-3 py-1 text-[12px] text-owner-fg-3 hover:border-owner-fg-3"
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] text-owner-fg-4">
            Customers matching ANY selected filter are included.
          </span>
        </div>
      ) : null}

      <div className="rounded-owner-md border border-owner-border-soft bg-owner-bg-subtle p-3 text-[13px] text-owner-fg-2">
        ≈ <strong>{targetCount.toLocaleString("en-IN")}</strong> reachable
        recipient{targetCount === 1 ? "" : "s"}{" "}
        <span className="text-owner-fg-4">
          (opted-in, valid WhatsApp number)
        </span>
      </div>
    </div>
  );
};

export default WhatsAppAudience;
