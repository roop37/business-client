import { LucideIcon, TrendingUp } from "lucide-react";
import React from "react";

/**
 * Legacy "warm cream" surface primitives.
 *
 * Re-skinned to the Owner palette so any screen still importing
 * <HoizrSurface>/<HoizrMetricCard>/<HoizrStatusPill>/<HoizrTable>
 * automatically renders in the new design language. New code should
 * prefer the dedicated Owner primitives at
 * `components/common/owner/` (Card, StatTile, Badge, OwnerTable).
 */

type SurfaceProps = {
  children: React.ReactNode;
  className?: string;
  soft?: boolean;
} & React.HTMLAttributes<HTMLElement>;

export const HoizrSurface = ({
  children,
  className = "",
  soft,
  ...props
}: SurfaceProps) => (
  <section
    {...props}
    className={`min-w-0 rounded-owner-lg border border-owner-border ${
      soft ? "bg-owner-bg-subtle" : "bg-owner-bg"
    } ${className}`}
  >
    {children}
  </section>
);

type MetricCardProps = {
  label: string;
  value: string;
  delta: string;
  Icon: LucideIcon;
};

export const HoizrMetricCard = ({
  label,
  value,
  delta,
  Icon,
}: MetricCardProps) => (
  <HoizrSurface className="p-5 transition duration-200 hover:bg-owner-bg-subtle/40">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-owner-fg-3">{label}</p>
        <p className="mt-2 text-[26px] font-semibold tracking-[-0.015em] tabular-nums text-owner-fg-1">
          {value}
        </p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
        <Icon size={18} strokeWidth={1.8} />
      </div>
    </div>
    <div className="mt-3 flex items-center gap-2 text-[12px]">
      <span className="inline-flex items-center gap-1 rounded-owner-sm bg-owner-success-bg px-2 py-0.5 font-semibold text-owner-success-text">
        <TrendingUp size={11} strokeWidth={2.2} /> {delta}
      </span>
      <span className="text-owner-fg-4">vs. last 30 days</span>
    </div>
  </HoizrSurface>
);

export const HoizrStatusPill = ({ status }: { status: string }) => {
  const displayStatus = status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const normalized = status.toLowerCase();
  const danger =
    normalized.includes("cancel") ||
    normalized.includes("fail") ||
    normalized.includes("blocked");
  const scheduled =
    normalized.includes("pending") ||
    normalized.includes("scheduled") ||
    normalized.includes("draft");
  const completed =
    normalized.includes("completed") ||
    normalized.includes("published") ||
    normalized.includes("success") ||
    normalized.includes("active") ||
    normalized.includes("live");

  const tone = danger
    ? "bg-owner-danger-bg text-owner-danger-text"
    : completed
    ? "bg-owner-success-bg text-owner-success-text"
    : scheduled
    ? "bg-owner-warning-bg text-owner-warning-text"
    : "bg-owner-neutralPill-bg text-owner-neutralPill-text";

  return (
    <span
      className={`inline-flex min-w-[86px] justify-center rounded-owner-sm px-3 py-1 text-[13px] font-medium ${tone}`}
    >
      {displayStatus}
    </span>
  );
};

type TableProps = {
  headers: string[];
  children: React.ReactNode;
  minWidth?: string;
  wrapperClassName?: string;
  tableClassName?: string;
};

export const HoizrTable = ({
  headers,
  children,
  minWidth = "720px",
  wrapperClassName = "",
  tableClassName = "",
}: TableProps) => (
  <div className={`min-w-0 max-w-full overflow-auto ${wrapperClassName}`}>
    <table
      className={`owner-table w-full text-left ${tableClassName}`}
      style={{ minWidth }}
    >
      <thead>
        <tr>
          {headers.map((heading) => (
            <th key={heading}>{heading}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);
