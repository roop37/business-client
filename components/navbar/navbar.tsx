"use client";

import useGlobalStore from "@/store/global";
import { Bell, Plus, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";

/**
 * Top bar (Owner design system).
 *
 * Sits at the top of the canvas, inside the rounded white panel. Hosts:
 *   - Mobile sidebar trigger (lg:hidden)
 *   - Notifications bell
 *   - Primary action button — context-aware:
 *       /campaigns/*  → "Add email campaign"
 *       /events sub-routes,/dashboard → "Add event"
 *       elsewhere → hidden
 *
 * Page titles are NOT rendered here — Owner pattern is to render
 * `<PageHeader>` inline within each screen so titles live next to the
 * page-local subtitle and actions. Titles in the top bar are
 * redundant with that pattern.
 */
const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { setToastData } = useGlobalStore();

  const onCampaigns =
    pathname.startsWith("/campaigns/") &&
    !pathname.startsWith("/campaigns/onboarding") &&
    !pathname.startsWith("/campaigns/marketing-credit");
  const onEventsRoot = pathname === "/events" || pathname === "/events/";
  const showPrimary =
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/events") && !onEventsRoot) ||
    onCampaigns;

  const primaryLabel = onCampaigns ? "Add email campaign" : "Add event";
  const primaryHref = onCampaigns
    ? "/campaigns/onboarding/template-select"
    : "/events?create=1";

  return (
    <header className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between gap-3 border-b border-owner-border-soft bg-owner-bg/95 px-4 py-3 backdrop-blur lg:px-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="lg:hidden" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden h-9 w-[280px] items-center md:flex lg:w-[360px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-owner-fg-4"
          />
          <input
            type="text"
            placeholder="Search events, customers, payouts…"
            className="h-9 w-full rounded-owner-md border border-owner-border bg-owner-bg pl-9 pr-3 text-[13px] text-owner-fg-1 outline-none transition focus:border-owner-blue-200 focus:shadow-[0_0_0_3px_var(--owner-blue-050)]"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const value = (event.target as HTMLInputElement).value.trim();
                if (value)
                  router.push(`/customer?q=${encodeURIComponent(value)}`);
              }
            }}
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-owner-md border border-owner-border bg-owner-bg text-owner-fg-2 shadow-owner-sm transition hover:bg-owner-bg-subtle"
          onClick={() =>
            setToastData({
              type: "warning",
              message: "Notifications coming soon.",
            })
          }
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        {showPrimary ? (
          <button
            id={onCampaigns ? "campaign-create-button" : "event-create-button"}
            type="button"
            onClick={() => router.push(primaryHref)}
            className="owner-btn owner-btn--primary !h-9 !rounded-owner-md !px-3 sm:!px-4"
          >
            <Plus size={16} strokeWidth={2.4} />
            <span className="hidden sm:inline">{primaryLabel}</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
