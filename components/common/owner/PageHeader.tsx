"use client";

import type { ReactNode } from "react";

/**
 * Owner page header — the per-screen title block. Use at the top of
 * every screen, NOT inside a card. Replicates the Owner spec:
 *
 *   <h1 class="owner-page-title">Customers</h1>
 *   <p class="owner-body mt-1">Subtitle…</p>
 *   <div class="ml-auto">{actions}</div>
 *
 * Spacing: 32px bottom margin (separates header from page body).
 */
export const PageHeader = ({
  title,
  subtitle,
  actions,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) => {
  return (
    <header
      className={`mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        <h1 className="owner-page-title">{title}</h1>
        {subtitle ? (
          <p className="owner-body mt-1 max-w-2xl">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {actions}
        </div>
      ) : null}
    </header>
  );
};

export default PageHeader;
