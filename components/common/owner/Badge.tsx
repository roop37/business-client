"use client";

import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-owner-success-bg text-owner-success-text",
  warning: "bg-owner-warning-bg text-owner-warning-text",
  danger: "bg-owner-danger-bg text-owner-danger-text",
  info: "bg-owner-info-bg text-owner-info-text",
  neutral: "bg-owner-neutralPill-bg text-owner-neutralPill-text",
};

/**
 * Owner badge — inline rounded pill. Use for status / count chips.
 */
export const Badge = ({
  tone = "neutral",
  icon,
  children,
  className = "",
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-owner-sm px-3 py-1 text-[13px] font-medium leading-snug ${TONE_CLASSES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
};

export default Badge;
