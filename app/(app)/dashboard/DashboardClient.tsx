"use client";

import {
  Badge,
  Card,
  inrFormat,
  OwnerButton,
  OwnerTable,
  PageHeader,
  StatTile,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  QrCode,
  ReceiptText,
  ShieldAlert,
  Ticket,
  Users,
  TrendingDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type HostDashboardSummary = {
  upcomingEventsCount: number;
  publishedEventsCount: number;
  draftEventsCount: number;
  salesToday: number;
  ticketsSoldToday: number;
  salesLast30Days: number;
  ticketsSoldLast30Days: number;
  pendingSettlementsCount: number;
  paidOutLifetime: number;
};

type DashboardEvent = {
  _id: string;
  title?: string | null;
  status?: string | null;
  startDate?: string | null;
  city?: string | null;
  tickets?: {
    ticketCapacity?: number | null;
    ticketSold?: number | null;
    ticketPrice?: number | null;
    ticketVisible?: boolean | null;
  }[] | null;
};

type Checklist = {
  logo?: number | boolean;
  payout?: number | boolean;
  event?: number | boolean;
  Scanner?: number | boolean;
  nextSteps?: {
    key: string;
    title: string;
    description: string;
    actionHref?: string | null;
    blocksEventCreation?: boolean;
    blocksPaidEvent?: boolean;
  }[];
};

const emptySummary: HostDashboardSummary = {
  upcomingEventsCount: 0,
  publishedEventsCount: 0,
  draftEventsCount: 0,
  salesToday: 0,
  ticketsSoldToday: 0,
  salesLast30Days: 0,
  ticketsSoldLast30Days: 0,
  pendingSettlementsCount: 0,
  paidOutLifetime: 0,
};

const formatDate = (value?: string | null) => {
  if (!value) return "Date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const statusTone = (status?: string | null): BadgeTone => {
  const value = String(status ?? "").toUpperCase();
  if (value === "PUBLISHED" || value === "LIVE") return "success";
  if (value === "DRAFT") return "neutral";
  if (value === "CANCELLED") return "danger";
  return "info";
};

const isDone = (value: unknown) => value === true || value === 1;

const eventTotals = (event: DashboardEvent) => {
  const tickets = event.tickets ?? [];
  return tickets.reduce(
    (acc, ticket) => {
      const sold = Number(ticket.ticketSold ?? 0);
      const capacity = Number(ticket.ticketCapacity ?? 0);
      const price = Number(ticket.ticketPrice ?? 0);
      return {
        sold: acc.sold + sold,
        capacity: acc.capacity + capacity,
        gross: acc.gross + sold * price,
      };
    },
    { sold: 0, capacity: 0, gross: 0 }
  );
};

export const DashboardClient = () => {
  const router = useRouter();
  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();
  const { meUser } = useUserStore();
  const [summary, setSummary] = useState<HostDashboardSummary>(emptySummary);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedSideBarMenu("dashboard");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryResponse, eventsResponse, checklistResponse]: any[] =
          await Promise.all([
            sdk.getHostDashboardSummary(),
            sdk.getMyEvents(),
            sdk.eventOnboardingChecklist(),
          ]);
        setSummary(summaryResponse?.getHostDashboardSummary ?? emptySummary);
        setEvents(eventsResponse?.getMyEvents ?? []);
        setChecklist(checklistResponse?.eventOnboardingChecklist ?? null);
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setToastData]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return events
      .filter((event) => {
        const date = event.startDate ? new Date(event.startDate).getTime() : 0;
        const status = String(event.status ?? "").toUpperCase();
        return date >= now || status === "DRAFT" || status === "PUBLISHED";
      })
      .sort((a, b) => {
        const aTime = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      })
      .slice(0, 6);
  }, [events]);

  const readinessItems = useMemo(() => {
    const items = [
      {
        key: "payout",
        label: "Payout profile",
        done: isDone(checklist?.payout),
        href: "/payment/payouts",
      },
      {
        key: "logo",
        label: "Host logo",
        done: isDone(checklist?.logo),
        href: "/org-settings",
      },
      {
        key: "event",
        label: "First event",
        done: isDone(checklist?.event),
        href: "/events?create=1",
      },
      {
        key: "scanner",
        label: "Scanner access",
        done: isDone(checklist?.Scanner),
        href: "/scanners",
      },
    ];
    return items;
  }, [checklist]);

  const needsAttention = readinessItems.filter((item) => !item.done);
  const greetingName = meUser?.firstName?.trim() || "there";

  return (
    <div className="font-owner text-owner-fg-1">
      <PageHeader
        title={`Hey ${greetingName}`}
        subtitle="Live host overview for events, sales, scanners, and payouts."
        actions={
          <>
            <OwnerButton
              variant="secondary"
              leadingIcon={<ReceiptText size={15} />}
              onClick={() => router.push("/payment/settlement-history")}
            >
              Settlements
            </OwnerButton>
            <OwnerButton
              leadingIcon={<CalendarDays size={15} />}
              onClick={() => router.push("/events?create=1")}
            >
              Create event
            </OwnerButton>
          </>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-32 animate-pulse bg-owner-bg-subtle" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Sales today"
              value={inrFormat(summary.salesToday)}
              hint={`${summary.ticketsSoldToday} tickets`}
              size="lg"
            />
            <StatTile
              label="Sales last 30 days"
              value={inrFormat(summary.salesLast30Days)}
              hint={`${summary.ticketsSoldLast30Days} tickets`}
              size="lg"
            />
            <StatTile
              label="Upcoming events"
              value={summary.upcomingEventsCount.toLocaleString("en-IN")}
              hint={`${summary.publishedEventsCount} published`}
            />
            <StatTile
              label="Payouts pending"
              value={summary.pendingSettlementsCount.toLocaleString("en-IN")}
              hint={`${inrFormat(summary.paidOutLifetime)} paid out`}
            />
          </div>

          {/* Marketing promise cards — dark-image-led, mirroring the
              public landing aesthetic. These nudge hosts into the two
              actions that compound for them: publish directly on the
              platform and collab with other hosts to pool
              audiences for campaign reach. */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <PromoCard
              eyebrow="Platform access"
              title="Create and publish without card details."
              body="Publish your next event directly without a subscription wall, setup fee, listing fee, or stripped-down starter tier."
              ctaLabel="Why Hoizr"
              icon={<TrendingDown size={18} />}
              onClick={() => router.push("/about")}
            />
            <PromoCard
              eyebrow="Collaborators"
              title="Pool audiences. Boost sales."
              body="Add another host as a collaborator — they get the event on their dashboard and you both run campaigns against the combined customer base."
              ctaLabel="How collaborators work"
              icon={<Users size={18} />}
              onClick={() => router.push("/events?create=1")}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <OwnerTable
              rowCount={upcomingEvents.length}
              empty="No events yet. Create your first event to start selling."
            >
              <OwnerTable.Toolbar>
                <div>
                  <div className="text-[14px] font-semibold text-owner-fg-1">
                    Events in motion
                  </div>
                  <div className="text-[12.5px] text-owner-fg-4">
                    Drafts, published events, and upcoming operations.
                  </div>
                </div>
                <OwnerButton
                  variant="secondary"
                  size="sm"
                  trailingIcon={<ArrowUpRight size={13} />}
                  onClick={() => router.push("/events")}
                >
                  All events
                </OwnerButton>
              </OwnerTable.Toolbar>
              <OwnerTable.Head>
                <OwnerTable.HeaderCell>Event</OwnerTable.HeaderCell>
                <OwnerTable.HeaderCell>Date</OwnerTable.HeaderCell>
                <OwnerTable.HeaderCell>Status</OwnerTable.HeaderCell>
                <OwnerTable.HeaderCell align="right">Sold</OwnerTable.HeaderCell>
                <OwnerTable.HeaderCell align="right">Gross</OwnerTable.HeaderCell>
              </OwnerTable.Head>
              <OwnerTable.Body>
                {upcomingEvents.map((event) => {
                  const totals = eventTotals(event);
                  return (
                    <OwnerTable.Row
                      key={event._id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/events/${event._id}/manage`)}
                    >
                      <OwnerTable.Cell>
                        <div className="font-semibold text-owner-fg-1">
                          {event.title || "Untitled event"}
                        </div>
                        {event.city ? (
                          <div className="text-[12px] text-owner-fg-4">
                            {event.city}
                          </div>
                        ) : null}
                      </OwnerTable.Cell>
                      <OwnerTable.Cell>{formatDate(event.startDate)}</OwnerTable.Cell>
                      <OwnerTable.Cell>
                        <Badge tone={statusTone(event.status)}>
                          {event.status || "Draft"}
                        </Badge>
                      </OwnerTable.Cell>
                      <OwnerTable.Cell align="right">
                        {totals.sold.toLocaleString("en-IN")}
                        {totals.capacity ? (
                          <span className="text-owner-fg-4">
                            {" "}
                            / {totals.capacity.toLocaleString("en-IN")}
                          </span>
                        ) : null}
                      </OwnerTable.Cell>
                      <OwnerTable.Cell align="right" bold>
                        {inrFormat(totals.gross)}
                      </OwnerTable.Cell>
                    </OwnerTable.Row>
                  );
                })}
              </OwnerTable.Body>
            </OwnerTable>

            <div className="space-y-4">
              <Card padding={0}>
                <div className="flex items-center justify-between border-b border-owner-border-soft px-5 py-4">
                  <div className="flex items-center gap-2 text-[14px] font-semibold">
                    <ShieldAlert size={16} className="text-owner-blue-500" />
                    Launch readiness
                  </div>
                  <Badge tone={needsAttention.length ? "warning" : "success"}>
                    {needsAttention.length ? `${needsAttention.length} open` : "Ready"}
                  </Badge>
                </div>
                <div className="divide-y divide-owner-border-soft">
                  {readinessItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => router.push(item.href)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-owner-bg-subtle"
                    >
                      <span className="text-[13.5px] font-medium">
                        {item.label}
                      </span>
                      {item.done ? (
                        <Badge tone="success" icon={<CheckCircle2 size={13} />}>
                          Done
                        </Badge>
                      ) : (
                        <Badge tone="warning">Open</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-medium text-owner-fg-3">
                        Draft events
                      </div>
                      <div className="mt-2 text-[30px] font-semibold tabular-nums">
                        {summary.draftEventsCount}
                      </div>
                    </div>
                    <Ticket size={20} className="text-owner-blue-500" />
                  </div>
                  <OwnerButton
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push("/events")}
                  >
                    Review drafts
                  </OwnerButton>
                </Card>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-medium text-owner-fg-3">
                        Scanner setup
                      </div>
                      <div className="mt-2 text-[16px] font-semibold">
                        Door teams and scan audit
                      </div>
                    </div>
                    <QrCode size={20} className="text-owner-blue-500" />
                  </div>
                  <OwnerButton
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push("/scanners")}
                  >
                    Manage scanners
                  </OwnerButton>
                </Card>
              </div>
            </div>
          </div>

          <Card
            padding={20}
            className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
                <IndianRupee size={18} />
              </div>
              <div>
                <div className="text-[14px] font-semibold">
                  Payout statements are available from settlement history.
                </div>
                <p className="mt-1 text-[12.5px] text-owner-fg-3">
                  Download the signed payout statement after a settlement is paid.
                </p>
              </div>
            </div>
            <OwnerButton
              variant="primary"
              trailingIcon={<ArrowUpRight size={14} />}
              onClick={() => router.push("/payment/settlement-history")}
            >
              Open history
            </OwnerButton>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardClient;

type PromoCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  icon: React.ReactNode;
  onClick: () => void;
};

const PromoCard = ({
  eyebrow,
  title,
  body,
  ctaLabel,
  icon,
  onClick,
}: PromoCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative min-h-[214px] overflow-hidden rounded-owner-lg border border-white/10 bg-[#050504] p-5 text-left text-white shadow-owner-md transition hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/marketing/brand/metallic-line-banner.png')",
      }}
    />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/12 via-black/34 to-black/78" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
    <div className="relative flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur">
        {icon}
        <span>{eyebrow}</span>
      </div>
      <ArrowUpRight
        size={18}
        className="text-white/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
      />
    </div>
    <h3 className="relative mt-4 text-[18px] font-semibold leading-tight">
      {title}
    </h3>
    <p className="relative mt-2 text-[13px] leading-[1.55] text-white/82">
      {body}
    </p>
    <div className="relative mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white">
      {ctaLabel}
      <ArrowUpRight size={13} />
    </div>
  </button>
);
