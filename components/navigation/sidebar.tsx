"use client";

/**
 * AppSidebar — Hoizr Admin (Owner design system).
 *
 * Layout: 280px floating glass panel containing
 *   1. Workspace switcher pill (white, with dropdown for business switching)
 *   2. Nav list (single + collapsible groups, blue-050 active pill)
 *   3. Referral promo card pinned to bottom
 *
 * Mobile: collapses into the existing shadcn SidebarProvider drawer
 * (`useSidebar()` from `@/components/ui/sidebar`) so the Navbar
 * hamburger keeps working without an interface change.
 */
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  Check,
  ChevronDown,
  ChevronRight,
  LogOut,
  MapPin,
  Plus,
  UserCircle2,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import hoizrBrandMark from "@/assets/logo/logoDark.png";
import { getSidebarList, TSidebarItem } from "./common/sidebar-data";

type HostOption = {
  _id: string;
  name?: string | null;
  locationLabel?: string | null;
  logo?: string | null;
};

const initialsOf = (name?: string | null) => {
  if (!name) return "HZ";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Stable colour pair derived from id so each business keeps a consistent
// brand-mark gradient across re-renders.
const gradientFor = (id: string): [string, string] => {
  const palette: Array<[string, string]> = [
    ["#7C2D8F", "#D946B0"],
    ["#0F172A", "#F59E0B"],
    ["#0E4429", "#22C55E"],
    ["#7F1D1D", "#F97316"],
    ["#1E3A8A", "#3F7CF2"],
    ["#9D174D", "#F472B6"],
  ];
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
};

const compactLocation = (address?: {
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
} | null) => {
  const parts = [address?.city, address?.state].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return address?.pincode || null;
};

const BrandMark = ({
  host,
  size = 36,
  radius = 10,
}: {
  host: HostOption;
  size?: number;
  radius?: number;
}) => {
  // Fallback chain (resolved in this order):
  //   1. host.logo  — the business's own Cloudinary logo
  //   2. Hoizr brand mark — for businesses who haven't uploaded a logo yet
  //   3. Initials gradient — only if the brand mark image fails to load
  const [imageBroken, setImageBroken] = useState(false);
  const trimmedLogo = host.logo?.trim();
  const showHostLogo = Boolean(trimmedLogo) && !imageBroken;
  const showBrandMark = !showHostLogo && !imageBroken;

  if (showHostLogo) {
    return (
      <div
        style={{ width: size, height: size, borderRadius: radius }}
        className="relative flex shrink-0 items-center justify-center overflow-hidden bg-white"
      >
        <Image
          src={trimmedLogo!}
          alt={host.name ?? "Business logo"}
          width={size}
          height={size}
          // `object-contain` (not `cover`) — many hosts upload wide
          // wordmark lockups; `cover` was cropping the sides off so the
          // brand was unrecognisable in the sidebar. The white wrapper
          // already gives the logo a clean frame when the aspect ratio
          // doesn't match the square slot.
          className="h-full w-full object-contain"
          onError={() => setImageBroken(true)}
          unoptimized
        />
      </div>
    );
  }

  if (showBrandMark) {
    return (
      <div
        style={{ width: size, height: size, borderRadius: radius }}
        className="flex shrink-0 items-center justify-center overflow-hidden bg-[var(--owner-fg-1,#0f0f0f)]"
      >
        <Image
          src={hoizrBrandMark}
          alt="Hoizr"
          width={size}
          height={size}
          className="h-[80%] w-[80%] object-contain"
          onError={() => setImageBroken(true)}
        />
      </div>
    );
  }

  const [a, b] = gradientFor(host._id);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
        fontSize: size * 0.4,
        boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.12)",
      }}
      className="flex shrink-0 items-center justify-center font-bold tracking-tight text-white"
    >
      {initialsOf(host.name).slice(0, 2)}
    </div>
  );
};

const WorkspaceSwitcher = ({
  hosts,
  activeHostId,
  onSwitch,
  onAddHost,
  onAccount,
  onLogout,
}: {
  hosts: HostOption[];
  activeHostId: string | null;
  onSwitch: (id: string) => void;
  onAddHost: () => void;
  onAccount: () => void;
  onLogout: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const active =
    hosts.find((h) => h._id === activeHostId) ?? hosts[0] ?? null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-owner-lg border border-owner-border bg-owner-bg px-3 py-2.5 text-left shadow-owner-sm transition hover:bg-owner-bg-subtle"
      >
        {active ? (
          <BrandMark host={active} />
        ) : (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-owner-bg-subtle text-owner-fg-4">
            <UserCircle2 size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-owner-fg-1">
            {active?.name ?? "Select business"}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[12px] text-owner-fg-4">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">
              {active?.locationLabel ?? "Location not set"}
            </span>
          </div>
        </div>
        <ChevronDown size={16} className="shrink-0 text-owner-fg-4" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-[14px] border border-owner-border bg-[#FFFFFF] shadow-owner-dropdown">
          {hosts.length > 1 ? (
            <>
              <div className="px-3.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-owner-fg-4">
                Switch business
              </div>
              <div className="max-h-[260px] overflow-y-auto px-1.5 pb-1.5">
                {hosts.map((host) => {
                  const isActive = host._id === activeHostId;
                  return (
                    <button
                      key={host._id}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        if (!isActive) onSwitch(host._id);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left transition ${
                        isActive
                          ? "bg-owner-blue-050"
                          : "hover:bg-owner-bg-subtle"
                      }`}
                    >
                      <BrandMark host={host} size={28} radius={8} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-medium text-owner-fg-1">
                          {host.name || "Untitled business"}
                        </div>
                        <div className="truncate text-[11.5px] text-owner-fg-4">
                          {host.locationLabel ?? "Location not set"}
                        </div>
                      </div>
                      {isActive ? (
                        <Check size={16} className="shrink-0 text-owner-blue-500" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-owner-border-soft" />
            </>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAccount();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] text-owner-fg-1 hover:bg-owner-bg-subtle"
          >
            <UserCircle2 size={16} className="text-owner-fg-3" />
            Account details
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAddHost();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] text-owner-fg-1 hover:bg-owner-bg-subtle"
          >
            <Plus size={16} className="text-owner-fg-3" />
            Add a new venue
          </button>
          <div className="border-t border-owner-border-soft" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] text-owner-danger-text hover:bg-owner-danger-bg"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
};

const NavItem = ({
  item,
  active,
  expanded,
  onClick,
  pathname,
  onChildClick,
}: {
  item: TSidebarItem;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
  pathname: string;
  onChildClick: (href: string) => void;
}) => {
  const hasChildren = (item.subItems ?? []).length > 0;
  const isComingSoon = Boolean(item.comingSoon);
  // A "Coming soon" parent with sub-items still expands so the user can
  // see what's planned underneath. Only no-children items get the
  // hard-disabled treatment.
  const hardDisabled = isComingSoon && !hasChildren;
  return (
    <li>
      <button
        type="button"
        id={item.id}
        disabled={hardDisabled}
        onClick={() => {
          if (!hardDisabled) onClick();
        }}
        title={isComingSoon ? "Coming soon" : undefined}
        className={`flex w-full items-center gap-2.5 rounded-[14px] border px-3 py-2.5 text-[14px] font-medium transition ${
          hardDisabled
            ? "cursor-not-allowed border-transparent text-owner-fg-4"
            : active
            ? "border-owner-blue-100 bg-owner-blue-050 text-owner-fg-1"
            : "border-transparent text-owner-fg-2 hover:bg-black/[.035]"
        }`}
      >
        <item.icon size={18} className="shrink-0" />
        <span className="flex-1 truncate text-left">{item.title}</span>
        {isComingSoon ? (
          <span className="shrink-0 rounded-full bg-owner-warning-bg px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-owner-warning-text">
            Soon
          </span>
        ) : null}
        {hasChildren ? (
          expanded ? (
            <ChevronDown size={15} className="text-owner-fg-4" />
          ) : (
            <ChevronRight size={15} className="text-owner-fg-4" />
          )
        ) : null}
      </button>
      {hasChildren && expanded ? (
        <ul className="ml-3 mt-1 border-l border-owner-border-soft pl-2.5">
          {(item.subItems ?? []).map((sub) => {
            const subActive = pathname === sub.href;
            const isComingSoon = Boolean(sub.comingSoon);
            return (
              <li key={sub.title}>
                <button
                  type="button"
                  disabled={isComingSoon}
                  onClick={() => {
                    if (!isComingSoon) onChildClick(sub.href);
                  }}
                  title={isComingSoon ? "Coming soon" : undefined}
                  className={`flex w-full items-center justify-between gap-2 rounded-[12px] px-3 py-1.5 text-[13.5px] font-medium transition ${
                    isComingSoon
                      ? "cursor-not-allowed text-owner-fg-4 hover:bg-transparent"
                      : subActive
                      ? "bg-owner-blue-050 text-owner-blue-500"
                      : "text-owner-fg-3 hover:bg-black/[.035] hover:text-owner-fg-1"
                  }`}
                >
                  <span className="truncate">{sub.title}</span>
                  {isComingSoon ? (
                    <span className="ml-1 shrink-0 rounded-full bg-owner-warning-bg px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-owner-warning-text">
                      Soon
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
};

const isActiveFor = (pathname: string, item: TSidebarItem) => {
  if (item.title === "Dashboard") return pathname === "/dashboard";
  // Teams must NOT light up on /teams/activity-log — that's a sibling nav
  // item, and the generic startsWith fallback would match both. Exact match.
  if (item.title === "Teams") return pathname === "/teams";
  if (item.title === "Campaigns") return pathname.startsWith("/campaigns");
  if (item.title === "Rewards & Loyalties")
    return pathname.startsWith("/rewards") || pathname.startsWith("/coupons");
  if (item.title === "Payment") return pathname.startsWith("/payment");
  return item.href !== "" && pathname.startsWith(item.href);
};

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { isMobile, toggleSidebar } = useSidebar();
  const { setSelectedSideBarMenu, setToastData, openSettingsModal } =
    useGlobalStore();
  const { selectedHostId } = useHostsStore();

  const items = useMemo(() => getSidebarList(), []);

  // Auto-expand the group that owns the current route.
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    const active = items.find((it) => isActiveFor(pathname, it));
    return active && active.subItems ? active.title : null;
  });

  useEffect(() => {
    const active = items.find((it) => isActiveFor(pathname, it));
    if (active && active.subItems) {
      setExpandedId((current) => current ?? active.title);
    }
  }, [pathname, items]);

  const [hosts, setHosts] = useState<HostOption[]>([]);
  const [hostsLoading, setHostsLoading] = useState(true);

  useEffect(() => {
    const loadHosts = async () => {
      try {
        const response = await sdk.getHostsByBusiness();
        const list: HostOption[] = (response?.getHostsByBusiness ?? []).map(
          (h: any) => ({
            _id: h._id,
            name: h.name,
            locationLabel: compactLocation(h.address),
            logo: h.logo,
          })
        );
        setHosts(list);
      } catch (error) {
        setToastData({
          type: "error",
          message: extractErrorMessage(error),
        });
      } finally {
        setHostsLoading(false);
      }
    };
    loadHosts();
  }, [setToastData]);

  const navigate = useCallback(
    (href: string, title?: string) => {
      if (title) setSelectedSideBarMenu(title);
      if (isMobile) toggleSidebar();
      router.push(href);
    },
    [isMobile, router, setSelectedSideBarMenu, toggleSidebar]
  );

  const [switchingTo, setSwitchingTo] = useState<HostOption | null>(null);

  const switchHost = useCallback(
    async (hostId: string) => {
      const target = hosts.find((h) => h._id === hostId);
      if (!target) return;
      setSwitchingTo(target);
      try {
        await sdk.SetHostIdAsCookie({ hostId });
        // Hard-navigate to the dashboard rather than reloading the
        // current path — the page the user is on may depend on the OLD
        // business context (event id, payout id, etc.) and would error
        // out as the new cookie hydrates.
        if (typeof window !== "undefined") {
          window.location.assign("/dashboard");
        }
      } catch (error) {
        setSwitchingTo(null);
        setToastData({
          type: "error",
          message: extractErrorMessage(error),
        });
      }
    },
    [hosts, setToastData]
  );

  const handleAddHost = useCallback(async () => {
    // Clear the HOST_ID_ONBOARDING cookie via the browser so the next
    // createHost call starts a fresh business instead of resuming an abandoned
    // in-progress one. The Set-Cookie header from main-server is honoured by
    // the browser before navigation. The `?create=1` query param tells the
    // onboarding SSR to skip reading existing onboarding data.
    try {
      await sdk.startNewHostOnboarding();
    } catch {
      // Non-fatal: navigation still proceeds; user can resume the old business.
    }
    navigate("/onboarding-host/host-type?create=1");
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await sdk.userLogout();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") window.location.assign("/login");
  }, []);

  return (
    <Sidebar
      id="app-sidebar"
      variant="floating"
      collapsible="offcanvas"
      /* `!border-0` strips both the outer divider AND shadcn's default
         `border-sidebar-border` on the inner [data-sidebar] div. Without
         the inner override the floating panel rendered a hard hairline
         (sidebar-border resolved to pure black because the HSL token
         was unset). Owner-tokens.css now fills the token in, but we
         still drop the chrome here so only the warm glass card inside
         is the visible surface. */
      className="!border-0 !bg-transparent [&_[data-sidebar=sidebar]]:!border-0 [&_[data-sidebar=sidebar]]:!shadow-none [&_[data-sidebar=sidebar]]:!bg-transparent"
    >
      {/* Inner card surface MUST match the main canvas in
          mainBodyLayout.tsx (bg-owner-bg/95) so the sidebar and the
          page content read as the same paper, with only the outer
          cream gradient peeking through the gap between them. Earlier
          this was a warm rgba(247,244,238,0.76) cream which gave the
          dashboard a visible color seam between sidebar and main. */}
      <div className="flex h-full flex-col gap-3 rounded-[24px] border border-white/70 bg-owner-bg/95 px-4 py-4 font-owner text-owner-fg-1 shadow-[0_18px_60px_rgba(43,35,25,0.10)] backdrop-blur-2xl">
        <WorkspaceSwitcher
          hosts={hosts}
          activeHostId={selectedHostId ?? hosts[0]?._id ?? null}
          onSwitch={switchHost}
          onAddHost={handleAddHost}
          onAccount={() => openSettingsModal("account")}
          onLogout={handleLogout}
        />
        {hostsLoading ? (
          <div className="-mt-1.5 h-[2px] w-full overflow-hidden rounded-full bg-owner-bg-subtle">
            <div className="h-full w-1/3 animate-pulse bg-owner-border-strong" />
          </div>
        ) : null}

        <ul className="flex flex-1 flex-col gap-1 overflow-y-auto pt-2">
          {items.map((item) => {
            const active = isActiveFor(pathname, item);
            const expanded = expandedId === item.title;
            return (
              <NavItem
                key={item.title}
                item={item}
                active={active}
                expanded={expanded}
                pathname={pathname}
                onClick={() => {
                  if ((item.subItems ?? []).length > 0) {
                    setExpandedId((current) =>
                      current === item.title ? null : item.title
                    );
                  } else if (item.title === "Settings") {
                    // Settings has no dedicated page anymore — open the
                    // unified Settings modal at the Organisation tab.
                    if (isMobile) toggleSidebar();
                    openSettingsModal("brand");
                  } else {
                    navigate(item.href, item.title);
                  }
                }}
                onChildClick={(href) => navigate(href, item.title)}
              />
            );
          })}
        </ul>

      </div>
      {switchingTo ? <HostSwitchOverlay host={switchingTo} /> : null}
    </Sidebar>
  );
}

/**
 * Full-screen overlay rendered while a business switch is in flight. The
 * server-side cookie write + navigation typically lands in <800ms but
 * shipping any work between the click and the new dashboard render
 * makes the picker feel like it has stalled. The overlay also blocks
 * stray clicks that previously caused the picker to "need multiple
 * clicks" — there's now nothing to click on top of.
 */
const HostSwitchOverlay = ({ host }: { host: HostOption }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-owner-bg/85 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4 rounded-[16px] border border-owner-border bg-owner-bg px-7 py-6 shadow-owner-dropdown">
        <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-owner-bg-subtle">
          <BrandMark host={host} size={40} radius={10} />
        </div>
        <div className="text-center">
          <div className="text-[14px] font-semibold text-owner-fg-1">
            Switching to {host.name || "business"}
          </div>
          <div className="mt-1 text-[12px] text-owner-fg-4">
            Loading {host.locationLabel ?? "your dashboard"}…
          </div>
        </div>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-owner-bg-subtle">
          <div className="h-full w-1/2 animate-pulse bg-owner-blue-500" />
        </div>
      </div>
    </div>
  );
}
