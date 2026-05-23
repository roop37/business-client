"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";

export type StatDelta = {
  value: string;
  direction?: "up" | "down" | "flat";
  tone?: "positive" | "negative" | "neutral";
};

const TONE_PILL: Record<NonNullable<StatDelta["tone"]>, string> = {
  positive: "bg-owner-success-bg text-owner-success-text",
  negative: "bg-owner-danger-bg text-owner-danger-text",
  neutral: "bg-owner-neutralPill-bg text-owner-neutralPill-text",
};

/**
 * Owner KPI tile — used in the dashboard hero and in 4-up KPI rows on
 * tickets/customers/payments/etc. screens.
 *
 *   <StatTile label="Tickets sold" value="12,532" delta={{ value: "+18.7%", direction: "up", tone: "positive" }} />
 */
export const StatTile = ({
  label,
  value,
  delta,
  hint,
  size = "default",
  className = "",
}: {
  label: ReactNode;
  value: ReactNode;
  delta?: StatDelta;
  hint?: ReactNode;
  size?: "default" | "lg";
  className?: string;
}) => {
  const valueClass =
    size === "lg"
      ? "owner-stat mt-2"
      : "mt-2 text-[26px] font-semibold tracking-[-0.015em] text-owner-fg-1 tabular-nums";
  return (
    <div
      className={`rounded-owner-lg border border-owner-border bg-owner-bg p-5 ${className}`}
    >
      <div className="text-[13px] font-medium text-owner-fg-3">{label}</div>
      <div className={valueClass}>{value}</div>
      {delta || hint ? (
        <div className="mt-3 flex items-center gap-2">
          {delta ? (
            <span
              className={`inline-flex items-center gap-0.5 rounded-owner-sm px-1.5 py-0.5 text-[12px] font-semibold ${
                TONE_PILL[delta.tone ?? "neutral"]
              }`}
            >
              {delta.direction === "up" ? (
                <ArrowUp size={11} strokeWidth={2.4} />
              ) : delta.direction === "down" ? (
                <ArrowDown size={11} strokeWidth={2.4} />
              ) : null}
              {delta.value}
            </span>
          ) : null}
          {hint ? (
            <span className="text-[12px] text-owner-fg-4">{hint}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default StatTile;
