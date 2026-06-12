"use client";

import useWhatsappCampaignStore from "@/store/whatsappCampaignStore";

const inputCls =
  "h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050";

// Date <-> value for <input type="datetime-local"> (local time, no seconds).
const toLocalInput = (d: Date | null): string => {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const WhatsAppSchedule = () => {
  const {
    scheduleType,
    setScheduleType,
    scheduleDate,
    setScheduleDate,
    targetCount,
  } = useWhatsappCampaignStore();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-semibold text-owner-fg-1">
          When should it go out?
        </h1>
        <p className="text-[13px] text-owner-fg-3">
          Send now, or schedule it for later. Sending is debited from your
          marketing credit per delivered message.
        </p>
      </div>

      <div className="flex gap-2">
        {(
          [
            { id: "Now", label: "Send now" },
            { id: "Later", label: "Schedule for later" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              setScheduleType(opt.id);
              if (opt.id === "Now") setScheduleDate(null);
            }}
            className={
              scheduleType === opt.id
                ? "rounded-owner-md border border-owner-blue-500 bg-owner-blue-050 px-4 py-2 text-[13px] font-semibold text-owner-blue-500"
                : "rounded-owner-md border border-owner-border px-4 py-2 text-[13px] text-owner-fg-3"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {scheduleType === "Later" ? (
        <label className="block max-w-xs">
          <span className="text-[12px] font-semibold text-owner-fg-2">
            Send at
          </span>
          <input
            type="datetime-local"
            className={`${inputCls} mt-1`}
            value={toLocalInput(scheduleDate)}
            onChange={(e) =>
              setScheduleDate(e.target.value ? new Date(e.target.value) : null)
            }
          />
        </label>
      ) : null}

      <div className="rounded-owner-md border border-owner-border-soft bg-owner-bg-subtle p-3 text-[12.5px] text-owner-fg-3">
        This will send to ≈{" "}
        <strong className="text-owner-fg-1">
          {targetCount.toLocaleString("en-IN")}
        </strong>{" "}
        recipient{targetCount === 1 ? "" : "s"}. We&apos;ll only charge for
        messages WhatsApp accepts.
      </div>
    </div>
  );
};

export default WhatsAppSchedule;
