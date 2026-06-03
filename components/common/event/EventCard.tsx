"use client";

import { CalendarDaysIcon } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

export type EventCardProps = {
  flyer?: string;
  dateLabel: string;
  title: string;
  city?: string;
  priceLabel?: string;
  topLeftBadge?: ReactNode;
  topRightBadge?: ReactNode;
  note?: ReactNode;
  actions?: ReactNode;
  placeholderIcon?: ReactNode;
  variant?: "default" | "collaborator";
  className?: string;
  onClick?: () => void;
};

const EventCard = ({
  flyer,
  dateLabel,
  title,
  city,
  priceLabel,
  topLeftBadge,
  topRightBadge,
  note,
  actions,
  placeholderIcon,
  variant = "default",
  className = "",
  onClick,
}: EventCardProps) => {
  const interactive = Boolean(onClick);
  const borderClass =
    variant === "collaborator"
      ? "border-[#7E2BD6]/40 hover:border-[#7E2BD6]/70 focus-visible:ring-[#7E2BD6]/20"
      : "border-owner-border hover:border-owner-blue-200 focus-visible:ring-owner-blue-050";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`group relative overflow-hidden rounded-owner-lg border bg-owner-bg shadow-owner-sm transition focus-visible:outline-none focus-visible:ring-4 ${
        interactive ? "cursor-pointer" : ""
      } ${borderClass} ${className}`}
    >
      <div
        className="relative flex aspect-[4/5] items-center justify-center bg-owner-bg-subtle bg-cover bg-center"
        style={flyer ? { backgroundImage: `url(${flyer})` } : undefined}
      >
        {!flyer ? (
          placeholderIcon ?? (
            <CalendarDaysIcon
              size={36}
              className="text-owner-fg-4 opacity-60"
            />
          )
        ) : null}

        {topLeftBadge ? (
          <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
            {topLeftBadge}
          </span>
        ) : null}
        {topRightBadge ? (
          <span className="absolute right-2.5 top-2.5 z-10">
            {topRightBadge}
          </span>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-owner-bg/85 to-transparent" />
      </div>

      <div className="space-y-2 px-4 pb-4 pt-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-owner-blue-500">
          {dateLabel || "Date pending"}
        </p>
        <h3 className="line-clamp-2 text-[16px] font-semibold leading-tight text-owner-fg-1">
          {title || "Untitled Event"}
        </h3>
        {city ? (
          <p className="line-clamp-1 text-[13px] font-medium text-owner-fg-3">
            {city}
          </p>
        ) : null}
        {note ? <div>{note}</div> : null}
        {priceLabel ? (
          <p className="text-[13.5px] font-semibold tabular-nums text-owner-fg-1">
            {priceLabel}
          </p>
        ) : null}

        {actions ? (
          <div className="max-h-0 overflow-hidden transition-all duration-200 group-hover:max-h-72 group-focus-within:max-h-72">
            <div className="border-t border-dashed border-owner-border-soft pt-3">
              {actions}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EventCard;
