import EventJourney from "@/components/modules/events/EventJourney";
import { EventScanners } from "@/components/modules/events/EventScanners";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  CalendarDaysIcon,
  DoorOpenIcon,
  EyeIcon,
  EyeOffIcon,
  type LucideIcon,
  MegaphoneIcon,
  PencilIcon,
  QrCodeIcon,
  SettingsIcon,
  TicketIcon,
  UsersRoundIcon,
} from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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

const EventOperations = ({
  eventId,
  mode,
}: {
  eventId: string;
  mode: "manage" | "scanners";
}) => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const [overview, setOverview] = useState<any>(null);
  const [busy, setBusy] = useState(false);

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
  const canSeeMetrics = !isCollaboratorView || overview?.canSeeMetrics === true;
  const canRunCampaigns =
    !isCollaboratorView || overview?.canRunCampaigns === true;

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
                  {overview?.status} · {overview?.scannersCount ?? 0} scanner
                  {(overview?.scannersCount ?? 0) === 1 ? "" : "s"}
                  {overview?.selectedPricingPlan
                    ? ` · ${overview.selectedPricingPlan} plan` +
                      (overview.selectedCommissionRate != null
                        ? ` · ${overview.selectedCommissionRate}% commission`
                        : "")
                    : ""}
                </p>
              </div>
            </div>
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

        {mode === "scanners" ? (
          <EventScanners eventId={eventId} />
        ) : (
          <>
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
                        <td className="px-5 py-3 text-xs">
                          {t.ticketVisible ? "Yes" : "Hidden"}
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
                  router.push(`/campaigns/onboarding/template-select?eventId=${eventId}`)
                }
                disabled={!canRunCampaigns}
              />
            </div>
          </>
        )}
      </div>
    </EventShell>
  );
};

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
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[var(--owner-bg-sidebar)] text-[var(--owner-fg-1)]">
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
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
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
