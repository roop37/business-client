import FullPageModal from "@/components/common/modal/fullPageModal";
import EventJourney from "@/components/modules/events/EventJourney";
import { EventScanners } from "@/components/modules/events/EventScanners";
import {
  CustomersTab,
  OfflineTab,
  OrdersTab,
} from "@/components/modules/events/EventActivityPanel";
import GuestlistManagerModal from "@/components/modules/events/GuestlistManagerModal";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import { eventDisplayStatus, extractErrorMessage } from "@/utils/utilFUncs";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  DoorOpenIcon,
  EyeIcon,
  EyeOffIcon,
  HandshakeIcon,
  type LucideIcon,
  MegaphoneIcon,
  PencilIcon,
  QrCodeIcon,
  ReceiptTextIcon,
  ScanLineIcon,
  SettingsIcon,
  SparklesIcon,
  TicketIcon,
  UsersRoundIcon,
} from "lucide-react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const journeyModes = ["create", "update"];
const opsModes = ["manage", "scanners"];

const EventModePage = () => {
  const router = useRouter();
  const { eventId, eventMode } = router.query;
  const id = typeof eventId === "string" ? eventId : "";
  const mode = typeof eventMode === "string" ? eventMode : "";

  if (!router.isReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--owner-bg-sidebar)] text-sm text-[var(--owner-fg-3)]">
        Loading event...
      </div>
    );
  }

  if (!id || (!journeyModes.includes(mode) && !opsModes.includes(mode))) {
    return (
      <EventShell title="Event route not found">
        <p className="text-sm text-[var(--owner-fg-3)]">
          The event route is invalid or no longer available.
        </p>
      </EventShell>
    );
  }

  if (mode === "create" || mode === "update") {
    return <EventJourney eventId={id} mode={mode} />;
  }

  return <EventOperations eventId={id} mode={mode as "manage" | "scanners"} />;
};

const rupee = (n?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Number(n ?? 0)));

/**
 * Manage-domain panels. Each is a compact card on the right rail that opens
 * a full-page takeover, driven by ?panel=<key> (shallow routing) so browser
 * back closes the panel and a refresh/deep-link restores it.
 */
const PANEL_KEYS = [
  "guestlists",
  "customers",
  "offline",
  "collaborators",
] as const;
type PanelKey = (typeof PANEL_KEYS)[number];

const EventOperations = ({
  eventId,
  mode,
}: {
  eventId: string;
  mode: "manage" | "scanners";
}) => {
  const router = useRouter();
  const { setToastData, openRunCampaignModal } = useGlobalStore();
  const [overview, setOverview] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  // The collaborators panel renders from `overview` (it doesn't self-fetch), so
  // gate it on its own loading flag while its on-open refetch is in flight —
  // otherwise it would flash the previous snapshot for a round-trip.
  const [collabLoading, setCollabLoading] = useState(false);
  // True when the open panel got onto the history stack via our own push —
  // then closing = router.back(). False on a direct ?panel= load, where
  // back() would leave the page instead of just closing the panel.
  const panelPushedRef = useRef(false);
  // Skips the collaborators on-open refetch on the very first mount — the
  // [eventId] effect already loads the overview there, so a deep-link to
  // ?panel=collaborators would otherwise fire two identical requests.
  const collabDidMountRef = useRef(false);

  const openPanel = (panel: PanelKey) => {
    panelPushedRef.current = true;
    router.push(
      { pathname: router.pathname, query: { ...router.query, panel } },
      undefined,
      { shallow: true }
    );
  };

  const closePanel = () => {
    if (panelPushedRef.current) {
      panelPushedRef.current = false;
      router.back();
      return;
    }
    const { panel: _panel, ...rest } = router.query;
    router.replace({ pathname: router.pathname, query: rest }, undefined, {
      shallow: true,
    });
  };

  const loadOverview = async () => {
    try {
      const response = await sdk.getEventManageOverview({ id: eventId });
      setOverview(response?.getEventManageOverview ?? null);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // The Customers / Offline / Guest-list panels self-fetch on mount (each
  // unmounts when its FullPageModal closes, so opening always refetches). The
  // Collaborators panel renders from the overview payload instead, so pull a
  // fresh overview whenever it opens (with a loading gate so no stale rows
  // flash). The first mount is skipped — the [eventId] effect already loaded.
  useEffect(() => {
    if (!collabDidMountRef.current) {
      collabDidMountRef.current = true;
      return;
    }
    if (router.query.panel === "collaborators") {
      setCollabLoading(true);
      loadOverview().finally(() => setCollabLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.panel]);

  const togglePatch = async (input: Record<string, any>) => {
    setBusy(true);
    try {
      await sdk.updateEventPartial({ id: eventId, input });
      await loadOverview();
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "scanners" ? "Event Scanners" : "Manage Event";

  const soldPct =
    overview && overview.totals?.capacity > 0
      ? Math.min(100, Math.round((overview.totals.sold / overview.totals.capacity) * 100))
      : 0;
  const isCollaboratorView = Boolean(overview?.isCollaboratorView);
  // Door scanning window — mirrors the server scanner gates: opens 2h before
  // the event starts, closes 24h after it ends. Surfaced so the host knows
  // exactly when staff can scan.
  const scanWindowLabel = (() => {
    if (!overview?.startDate) return "";
    const fmt = (d: Date) =>
      // Door-scan window derives from the event's stored UTC instants — render
      // in IST so the times match the editor on every browser timezone.
      new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(d);
    const opens = new Date(new Date(overview.startDate).getTime() - 2 * 60 * 60 * 1000);
    const end = overview.endDate ? new Date(overview.endDate) : null;
    const closes = end ? new Date(end.getTime() + 24 * 60 * 60 * 1000) : null;
    return closes
      ? `Scanning ${fmt(opens)} – ${fmt(closes)}`
      : `Scanning opens ${fmt(opens)}`;
  })();
  const canSeeMetrics = !isCollaboratorView || overview?.canSeeMetrics === true;
  const canRunCampaigns =
    !isCollaboratorView || overview?.canRunCampaigns === true;
  // Commercial-terms data (offer + reconcile mode) only flows to Owner
  // / Manager seats. Marketing and Staff team members on the same host
  // should never see the commission breakdown or the payout-reconcile
  // switch — those are business-decision surfaces, not operational
  // ones. Collaborators (cross-host) are gated separately via
  // isCollaboratorView.
  const viewerTeamRole = overview?.viewerTeamRole ?? null;
  const canSeeOfferSettlement =
    !isCollaboratorView &&
    (viewerTeamRole === "Owner" || viewerTeamRole === "Manager");
  // Collaborating hosts / promoters configured during event edit.
  // Server only populates this for the owner view (it returns [] to a
  // collaborator viewer), so the card stays hidden whenever the viewer
  // is themselves a collaborator.
  const collaborators: any[] = Array.isArray(overview?.collaborators)
    ? overview.collaborators
    : [];
  const showCollaboratorsCard = !isCollaboratorView && collaborators.length > 0;

  const canSeeCustomers =
    canSeeMetrics &&
    (overview?.totals?.sold ?? 0) > 0 &&
    overview?.canAccessCustomerList !== false;
  const showGuestlistCard = !isCollaboratorView || overview?.guestlistEnabled;

  // A ?panel= value only takes effect once the overview is loaded AND the
  // viewer passes that panel's gate — same gates as the rail cards.
  const panelGates: Record<PanelKey, boolean> = {
    guestlists: Boolean(showGuestlistCard),
    customers: canSeeCustomers,
    offline: canSeeMetrics,
    collaborators: showCollaboratorsCard,
  };
  const panelParam =
    typeof router.query.panel === "string" ? router.query.panel : "";
  const activePanel: PanelKey | null =
    overview && (PANEL_KEYS as readonly string[]).includes(panelParam) &&
    panelGates[panelParam as PanelKey]
      ? (panelParam as PanelKey)
      : null;

  return (
    <EventShell title={title} status={overview?.status}>
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header card */}
        <div className="overflow-hidden rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {overview?.eventFlyer ? (
                <span
                  className="h-16 w-14 shrink-0 rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${overview.eventFlyer})` }}
                />
              ) : null}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--owner-blue-500)]">
                  {overview?.city || "City pending"}
                </p>
                <h2 className="mt-1 truncate text-2xl font-semibold">
                  {overview?.title || "Untitled Event"}
                </h2>
                <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
                  {eventDisplayStatus(
                    overview?.status,
                    overview?.startDate,
                    overview?.endDate
                  )}{" "}
                  · {overview?.scannersCount ?? 0} scanner
                  {(overview?.scannersCount ?? 0) === 1 ? "" : "s"}
                  {overview?.commissionRate != null
                    ? ` · ${overview.commissionRate}% commission`
                    : ""}
                </p>
                {scanWindowLabel ? (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-[var(--owner-fg-4)]">
                    <ScanLineIcon size={12} />
                    {scanWindowLabel}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode !== "scanners" && !isCollaboratorView ? (
                <button
                  type="button"
                  onClick={() => router.push(`/events/${eventId}/update`)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)]"
                >
                  <PencilIcon size={16} />
                  Edit Event
                </button>
              ) : isCollaboratorView ? (
                <span className="rounded-full bg-[#1B0B3D]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7E2BD6]">
                  Collaborator · read-only
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {mode === "scanners" ? (
          <EventScanners eventId={eventId} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="min-w-0 space-y-5">
            {/* KPI tiles */}
            {canSeeMetrics ? (
              <div className="grid gap-3 md:grid-cols-4">
                <MetricTile
                  label="Tickets sold"
                  value={`${overview?.totals?.sold ?? 0} / ${overview?.totals?.capacity ?? 0}`}
                  Icon={TicketIcon}
                />
                <MetricTile
                  label="Sell-through"
                  value={`${soldPct}%`}
                  Icon={UsersRoundIcon}
                />
                <MetricTile
                  label="Gross revenue"
                  value={rupee(overview?.totals?.grossRevenue)}
                  Icon={MegaphoneIcon}
                />
                <MetricTile
                  label="Scanners"
                  value={String(overview?.scannersCount ?? 0)}
                  Icon={QrCodeIcon}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 text-sm text-[var(--owner-fg-3)]">
                You are viewing this as a collaborator. The event owner has not
                enabled metrics access for your business.
              </div>
            )}

            {/* Quick toggles + actions */}
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleCard
                title="Visible on customer site"
                description="Hide quickly without unpublishing the event."
                checked={Boolean(overview?.isVisible)}
                Icon={overview?.isVisible ? EyeIcon : EyeOffIcon}
                disabled={busy || isCollaboratorView}
                onChange={(next) => togglePatch({ isVisible: next })}
              />
              <ToggleCard
                title="Ticket sales open"
                description="Pause ticket purchases without taking the event down."
                checked={Boolean(overview?.ticketingEnabled)}
                Icon={TicketIcon}
                disabled={busy || isCollaboratorView}
                onChange={(next) => togglePatch({ ticketingEnabled: next })}
              />
            </div>

            {/* Commission terms. One fixed rate stamped at publish —
                read-only for hosts; Hoizr can adjust it until the event
                starts. Visible to Owner / Manager only — Marketing and
                Staff seats see the rest of Manage Event without the
                commercial-terms block. */}
            {canSeeOfferSettlement && overview?.commissionRate != null ? (
              <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
                <div className="border-b border-[var(--owner-border)] px-5 py-3 text-sm font-semibold">
                  Commission
                </div>
                <div className="p-5">
                  <p className="text-sm">
                    <span className="text-2xl font-semibold">
                      {overview.commissionRate}%
                    </span>{" "}
                    <span className="text-[var(--owner-fg-3)]">
                      of ticket value (+ GST on commission), deducted at
                      settlement.
                    </span>
                  </p>
                  <p className="mt-2 text-[11px] text-[var(--owner-fg-3)]">
                    This is Hoizr&apos;s fixed commission for this event.
                    Contact support if you believe it needs adjusting —
                    changes are only possible before the event starts.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Per-ticket table */}
            <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
              <div className="border-b border-[var(--owner-border)] px-5 py-3 text-sm font-semibold">
                Ticket types
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--owner-border)] text-left text-xs text-[var(--owner-fg-3)]">
                      <th className="px-5 py-2">Name</th>
                      <th className="px-5 py-2 text-right">Sold</th>
                      <th className="px-5 py-2 text-right">Capacity</th>
                      <th className="px-5 py-2 text-right">Price</th>
                      <th className="px-5 py-2 text-right">Revenue</th>
                      <th className="px-5 py-2">Visible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview?.tickets ?? []).map((t: any) => (
                      <tr key={t._id} className="border-b border-[var(--owner-border-soft)] last:border-b-0">
                        <td className="px-5 py-3 font-medium">{t.ticketName}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{t.ticketSold}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{t.ticketCapacity}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{rupee(t.ticketPrice)}</td>
                        <td className="px-5 py-3 text-right tabular-nums">
                          {rupee(Number(t.ticketPrice) * Number(t.ticketSold))}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            disabled={busy || (!!t.ticketVisible && Number(t.ticketSold) > 0)}
                            role="switch"
                            aria-checked={!!t.ticketVisible}
                            title={
                              !!t.ticketVisible && Number(t.ticketSold) > 0
                                ? "Can't hide — this ticket already has sales"
                                : t.ticketVisible
                                ? "Visible — click to hide"
                                : "Hidden — click to show"
                            }
                            onClick={async () => {
                              const next = !t.ticketVisible;
                              setBusy(true);
                              try {
                                await sdk.setEventTicketVisibility({
                                  id: eventId,
                                  ticketId: t._id,
                                  visible: next,
                                });
                                setToastData({
                                  type: "success",
                                  message: next ? "Ticket is now visible" : "Ticket hidden",
                                });
                                await loadOverview();
                              } catch (error) {
                                setToastData({
                                  type: "error",
                                  message: extractErrorMessage(error),
                                });
                              } finally {
                                setBusy(false);
                              }
                            }}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition disabled:opacity-50 ${
                              t.ticketVisible
                                ? "bg-[var(--owner-blue-500)]"
                                : "bg-[var(--owner-border)]"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                t.ticketVisible ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(overview?.tickets ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-6 text-center text-xs text-[var(--owner-fg-3)]">
                          No tickets configured.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orders — inline; the rest of the activity surfaces (Customers,
                Offline Tickets) open as full-page panels from the rail. */}
            {canSeeMetrics ? (
              <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
                <div className="border-b border-[var(--owner-border)] px-5 py-3 text-sm font-semibold">
                  Orders
                </div>
                <div className="p-4 sm:p-5">
                  <OrdersTab
                    eventId={eventId}
                    tickets={(overview?.tickets ?? []).map((t: any) => ({
                      _id: String(t._id),
                      ticketName: t.ticketName,
                    }))}
                  />
                </div>
              </div>
            ) : null}

            {/* Report navigation */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/reports/sales-summary?eventId=${eventId}`}
                className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-4 py-2 text-sm font-medium hover:border-[#c89d75]"
              >
                See sales report
              </Link>
              <Link
                href={`/reports/campaign-performance?eventId=${eventId}`}
                className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-4 py-2 text-sm font-medium hover:border-[#c89d75]"
              >
                See marketing report
              </Link>
            </div>

            {/* Action cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {!isCollaboratorView ? (
                <OpsAction
                  title="Event Settings"
                  description="Edit event details, ticket visibility, collaborators, and pricing."
                  Icon={SettingsIcon}
                  onClick={() => router.push(`/events/${eventId}/update`)}
                />
              ) : null}
              <OpsAction
                title="Scanners"
                description="Create or manage scanner access for this event."
                Icon={QrCodeIcon}
                onClick={() => router.push(`/events/${eventId}/scanners`)}
                disabled={isCollaboratorView}
              />
              <OpsAction
                title="Run Campaign"
                description="Start a campaign that is attached to this event."
                Icon={MegaphoneIcon}
                onClick={() =>
                  openRunCampaignModal({
                    eventId,
                    title: overview?.title || "Untitled Event",
                  })
                }
                disabled={!canRunCampaigns}
              />
            </div>
          </div>

          {/* Right rail — compact cards; each opens a full-page panel. */}
          <aside className="space-y-3">
            {showGuestlistCard ? (
              <RailCard
                title="Guest lists"
                meta={
                  isCollaboratorView
                    ? "Your list, invite link and guests"
                    : overview?.guestlistEnabled
                    ? "Lists, invite links and guests"
                    : "Off — turn on free guest invites"
                }
                Icon={SparklesIcon}
                onClick={() => openPanel("guestlists")}
                badge={
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      overview?.guestlistEnabled
                        ? "bg-[var(--owner-blue-500)]/[0.10] text-[var(--owner-blue-500)]"
                        : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-3)]"
                    }`}
                  >
                    {overview?.guestlistEnabled ? "On" : "Off"}
                  </span>
                }
              />
            ) : null}
            {canSeeCustomers ? (
              <RailCard
                title="Customers"
                meta="Buyers, contacts and check-ins"
                Icon={UsersRoundIcon}
                onClick={() => openPanel("customers")}
              />
            ) : null}
            {canSeeMetrics ? (
              <RailCard
                title="Offline tickets"
                meta="Door sales and payment links"
                Icon={ReceiptTextIcon}
                onClick={() => openPanel("offline")}
              />
            ) : null}
            {showCollaboratorsCard ? (
              <RailCard
                title="Collaborators & promoters"
                meta={`${collaborators.length} ${
                  collaborators.length === 1 ? "organizer" : "organizers"
                } on this event`}
                Icon={HandshakeIcon}
                onClick={() => openPanel("collaborators")}
              />
            ) : null}
          </aside>
          </div>
        )}
      </div>

      <FullPageModal
        isOpen={activePanel === "guestlists"}
        onClose={closePanel}
        onEscClose
        title="Guest lists"
        subtitle="Invite guests for free — golden tickets scan at the door."
      >
        <div className="mx-auto w-full max-w-6xl py-2">
          <GuestlistManagerModal
            inline
            eventId={eventId}
            guestlistEnabled={!!overview?.guestlistEnabled}
            guestlistAutoAccept={overview?.guestlistAutoAccept !== false}
            guestlistMaxCapacity={overview?.guestlistMaxCapacity ?? null}
            isCollaboratorView={isCollaboratorView}
            onSettingsChanged={loadOverview}
          />
        </div>
      </FullPageModal>

      <FullPageModal
        isOpen={activePanel === "customers"}
        onClose={closePanel}
        onEscClose
        title="Customers"
        subtitle={`Everyone who bought tickets to ${overview?.title || "this event"}.`}
      >
        <div className="mx-auto w-full max-w-5xl py-2">
          <CustomersTab eventId={eventId} />
        </div>
      </FullPageModal>

      <FullPageModal
        isOpen={activePanel === "offline"}
        onClose={closePanel}
        onEscClose
        title="Offline tickets"
        subtitle="Tickets issued at the door and payment links."
      >
        <div className="mx-auto w-full max-w-5xl py-2">
          <OfflineTab eventId={eventId} />
        </div>
      </FullPageModal>

      <FullPageModal
        isOpen={activePanel === "collaborators"}
        onClose={closePanel}
        onEscClose
        title="Collaborators & promoters"
        subtitle="Read-only view of each organizer's access on this event."
      >
        <CollaboratorsPanel
          collaborators={collaborators}
          loading={collabLoading}
          onManage={() => router.push(`/events/${eventId}/update`)}
        />
      </FullPageModal>
    </EventShell>
  );
};

const COLLAB_STATUS_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  CONFIRMED: {
    label: "Confirmed",
    className:
      "bg-[var(--owner-blue-500)]/[0.10] text-[var(--owner-blue-500)]",
  },
  INVITED: {
    label: "Invited",
    className: "bg-amber-500/10 text-amber-600",
  },
  DECLINED: {
    label: "Declined",
    className: "bg-red-500/10 text-red-600",
  },
};

/**
 * Read-only review of the collaborating hosts / promoters configured
 * for an event and their per-collaboration access settings. Mirrors
 * the grouping + labels of the EventJourney collaborator modal ("What
 * this collaborator can do" + "Display & operations") but renders every
 * flag as a static On/Off row — editing happens in the event edit flow.
 * Rendered inside a FullPageModal, so no overlay/header of its own.
 */
const CollaboratorsPanel = ({
  collaborators,
  loading = false,
  onManage,
}: {
  collaborators: any[];
  loading?: boolean;
  onManage: () => void;
}) => {
  return (
    <div className="mx-auto w-full max-w-4xl py-2">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onManage}
            className="rounded-lg bg-[var(--owner-blue-500)] px-3 py-2 text-sm font-semibold text-[var(--owner-bg)]"
          >
            Manage collaborators
          </button>
        </div>
        {loading ? (
          <div className="py-16 text-center text-sm text-[var(--owner-fg-3)]">
            Loading…
          </div>
        ) : (
        <div className="space-y-4">
          {collaborators.map((c: any, index: number) => {
            const badge =
              COLLAB_STATUS_BADGE[String(c.collaborationStatus ?? "")] ?? null;
            return (
              <div
                key={c.businessLinkId ?? `${c.name}-${index}`}
                className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--owner-bg-subtle)] bg-cover bg-center text-sm font-semibold uppercase text-[var(--owner-fg-3)]"
                    style={
                      c.logo ? { backgroundImage: `url(${c.logo})` } : undefined
                    }
                  >
                    {!c.logo ? (c.name ?? "?").slice(0, 1) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {c.name ?? "Unnamed organizer"}
                    </p>
                    <p className="truncate text-xs text-[var(--owner-fg-3)]">
                      Collaborating organizer
                    </p>
                  </div>
                  {badge ? (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--owner-fg-3)]">
                    What this collaborator can do
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <ReadOnlySettingRow
                      title="See event metrics"
                      subtitle="Sales, attendance, conversion."
                      enabled={c.canSeeMetrics !== false}
                    />
                    <ReadOnlySettingRow
                      title="Run campaigns for this event"
                      subtitle="Email blasts targeting attendees."
                      enabled={c.canRunCampaigns !== false}
                    />
                    <ReadOnlySettingRow
                      title="Create offers / discount codes"
                      subtitle="Promo codes that apply at checkout."
                      enabled={c.canCreateOffers !== false}
                    />
                    <ReadOnlySettingRow
                      title="Access customer list"
                      subtitle="Download buyer contact details."
                      enabled={c.requestCustomerListAccess !== false}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--owner-fg-3)]">
                    Display &amp; operations
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <ReadOnlySettingRow
                      title="Hide on Event Page"
                      subtitle="Don't show as a co-organizer publicly."
                      enabled={Boolean(c.hideOnEventPage)}
                    />
                    <ReadOnlySettingRow
                      title="Allow Offline Tickets"
                      subtitle="Can issue tickets at the door."
                      enabled={Boolean(c.allowIssuingOfflineTickets)}
                    />
                    <ReadOnlySettingRow
                      title="Send Transactional Emails"
                      subtitle="Cc'd on ticket purchase emails."
                      enabled={Boolean(c.sendTransactionalMails)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
    </div>
  );
};

/**
 * Compact right-rail card on Manage Event — icon, title, one-line meta,
 * optional status badge. Clicking opens the matching full-page panel.
 */
const RailCard = ({
  title,
  meta,
  Icon,
  onClick,
  badge,
}: {
  title: string;
  meta: string;
  Icon: LucideIcon;
  onClick: () => void;
  badge?: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 text-left transition hover:border-[#c89d75]"
  >
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--owner-bg-subtle)] text-[var(--owner-blue-500)]">
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{title}</span>
          {badge}
        </span>
        <span className="mt-0.5 block truncate text-xs text-[var(--owner-fg-3)]">
          {meta}
        </span>
      </span>
      <ChevronRightIcon
        size={16}
        className="shrink-0 text-[var(--owner-fg-4)]"
      />
    </div>
  </button>
);

/**
 * Static (non-interactive) twin of EventJourney's `ToggleSettingRow` —
 * same card shell + labels, but the right-hand control is a fixed
 * On/Off pill instead of a toggle, signalling that this surface is
 * read-only.
 */
const ReadOnlySettingRow = ({
  title,
  subtitle,
  enabled,
}: {
  title: string;
  subtitle?: string;
  enabled: boolean;
}) => (
  <div className="flex min-h-[64px] items-center justify-between gap-4 rounded-lg border border-[var(--owner-border)] bg-white px-4 py-3 text-left">
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-[var(--owner-fg-1)]">
        {title}
      </span>
      {subtitle ? (
        <span className="mt-1 block text-xs leading-5 text-[var(--owner-fg-3)]">
          {subtitle}
        </span>
      ) : null}
    </span>
    {/* Actual switch visual (disabled — this is a read-only review of the
        collaborator's granted capabilities; editing happens in "Manage
        collaborators"). Mirrors ToggleCard's switch so the UI is consistent. */}
    <span
      role="switch"
      aria-checked={enabled}
      aria-readonly="true"
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-default items-center rounded-full opacity-70 transition ${
        enabled ? "bg-[var(--owner-blue-500)]" : "bg-[var(--owner-border)]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </span>
  </div>
);

const MetricTile = ({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: LucideIcon;
}) => (
  <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4">
    <div className="flex items-center justify-between text-xs text-[var(--owner-fg-3)]">
      <span>{label}</span>
      <Icon size={14} />
    </div>
    <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
  </div>
);

const ToggleCard = ({
  title,
  description,
  checked,
  Icon,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  Icon: LucideIcon;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4">
    <div className="flex min-w-0 items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[var(--owner-bg-subtle)] text-[var(--owner-blue-500)]">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-[var(--owner-fg-3)]">{description}</p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
        checked ? "bg-[var(--owner-blue-500)]" : "bg-[var(--owner-border)]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  </div>
);

const EventShell = ({
  title,
  status,
  children,
}: {
  title: string;
  status?: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden overscroll-none bg-[var(--owner-bg-sidebar)] text-[var(--owner-fg-1)]">
      <header className="flex min-h-[64px] shrink-0 items-center justify-between border-b border-[var(--owner-border)] px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <CalendarDaysIcon size={22} className="text-[var(--owner-blue-500)]" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            {status ? (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--owner-blue-500)]">
                {status}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] px-3 py-2 text-sm font-semibold"
        >
          <DoorOpenIcon size={16} />
          Exit
        </button>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-6">
        {children}
      </main>
    </div>
  );
};

const OpsAction = ({
  title,
  description,
  Icon,
  onClick,
  disabled = false,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 text-left transition hover:border-[#c89d75] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--owner-bg-subtle)] text-[var(--owner-blue-500)]">
      <Icon size={20} />
    </div>
    <p className="mt-4 font-semibold">{title}</p>
    <p className="mt-2 text-sm leading-6 text-[var(--owner-fg-3)]">{description}</p>
  </button>
);

export default EventModePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const response = await sdk.MeUserJourney(
      {},
      {
        cookie: context.req.headers.cookie?.toString() ?? "",
      }
    );
    const journey = response.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }

    const _vGate = verificationGateRedirect(journey);
    if (_vGate) return _vGate;
    return { props: {} };
  } catch (error) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
