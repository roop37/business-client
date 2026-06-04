"use client";

import {
  Badge,
  Card,
  inrFormat,
  OwnerButton,
  PillTabs,
} from "@/components/common/owner";
import type { BadgeTone, PillTab } from "@/components/common/owner";
import { HostDashboardRange } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Mail,
  Megaphone,
  QrCode,
  ReceiptText,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardSeriesPoint = {
  date: string;
  label: string;
  sales: number;
  tickets: number;
  orderCount: number;
};

type DashboardBreakdownRow = {
  label: string;
  amount: number;
  count: number;
  percent: number;
};

type DashboardCampaignRow = {
  id: string;
  name: string;
  status: string;
  scheduledFor?: string | null;
  recipientCount: number;
};

type HostDashboardSummary = {
  upcomingEventsCount: number;
  publishedEventsCount: number;
  draftEventsCount: number;
  salesToday: number;
  ticketsSoldToday: number;
  salesLast30Days: number;
  ticketsSoldLast30Days: number;
  orderCountLast30Days: number;
  averageOrderValueLast30Days: number;
  pendingSettlementsCount: number;
  paidOutLifetime: number;
  marketingSubscribersCount: number;
  lifetimeCampaignMessagesSent: number;
  salesSeries: DashboardSeriesPoint[];
  salesBySource: DashboardBreakdownRow[];
  ticketMix: DashboardBreakdownRow[];
  topItems: DashboardBreakdownRow[];
  upcomingCampaigns: DashboardCampaignRow[];
};

type DashboardEvent = {
  _id: string;
  title?: string | null;
  eventFlyer?: string | null;
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

type DashboardRange = "today" | "yesterday" | "last7" | "last30";

const rangeTabs: PillTab<DashboardRange>[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
];

const emptySummary: HostDashboardSummary = {
  upcomingEventsCount: 0,
  publishedEventsCount: 0,
  draftEventsCount: 0,
  salesToday: 0,
  ticketsSoldToday: 0,
  salesLast30Days: 0,
  ticketsSoldLast30Days: 0,
  orderCountLast30Days: 0,
  averageOrderValueLast30Days: 0,
  pendingSettlementsCount: 0,
  paidOutLifetime: 0,
  marketingSubscribersCount: 0,
  lifetimeCampaignMessagesSent: 0,
  salesSeries: [],
  salesBySource: [],
  ticketMix: [],
  topItems: [],
  upcomingCampaigns: [],
};

const sourceColors = ["#0F8842", "#151412", "#D6A22D", "#3E82D9", "#B54D77", "#6B7280"];
const marketingCardImage = "/marketing/brand/metallic-line-banner.png";

const dashboardMarketingCards = [
  {
    kicker: "Campaign engine",
    title: "Turn the next event into an owned-audience push",
    body: "Top up credits, draft email, and line up direct customer sends before tickets go live.",
    actionLabel: "Open campaigns",
    href: "/campaigns/email",
    icon: <Megaphone size={16} />,
  },
  {
    kicker: "Launch planning",
    title: "Shape the offer before the event hits the market",
    body: "Create the event, compare publish plans, and keep the best customer-saving offer visible first.",
    actionLabel: "Create event",
    href: "/events?create=1",
    icon: <Sparkles size={16} />,
  },
] satisfies {
  kicker: string;
  title: string;
  body: string;
  actionLabel: string;
  href: string;
  icon: ReactNode;
}[];

const isDone = (value: unknown) => value === true || value === 1;

const formatInteger = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString("en-IN");

const formatDate = (value?: string | null, compact = false) => {
  if (!value) return "Date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    ...(compact ? {} : { year: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getRangeKeys = (range: DashboardRange) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (range === "today") {
    return { from: toDateKey(today), to: toDateKey(today) };
  }

  if (range === "yesterday") {
    const yesterday = addDays(today, -1);
    return { from: toDateKey(yesterday), to: toDateKey(yesterday) };
  }

  if (range === "last7") {
    return { from: toDateKey(addDays(today, -6)), to: toDateKey(today) };
  }

  return { from: toDateKey(addDays(today, -29)), to: toDateKey(today) };
};

const statusTone = (status?: string | null): BadgeTone => {
  const value = String(status ?? "").toUpperCase();
  if (value === "PUBLISHED" || value === "LIVE" || value === "ACTIVE") return "success";
  if (value === "DRAFT") return "neutral";
  if (value === "CANCELLED" || value === "FAILED") return "danger";
  return "info";
};

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

const selectedRangeLabel = (range: DashboardRange, series: DashboardSeriesPoint[]) => {
  if (series.length === 0) return rangeTabs.find((tab) => tab.value === range)?.label ?? "";
  if (series.length === 1) return series[0].label;
  return `${series[0].label} - ${series[series.length - 1].label}`;
};

const rangeSentenceLabel = (range: DashboardRange) => {
  if (range === "today") return "today";
  if (range === "yesterday") return "yesterday";
  return `in the ${rangeTabs.find((tab) => tab.value === range)?.label.toLowerCase() ?? "selected range"}`;
};

const toApiRange = (range: DashboardRange): HostDashboardRange => {
  if (range === "today") return HostDashboardRange.Today;
  if (range === "yesterday") return HostDashboardRange.Yesterday;
  if (range === "last7") return HostDashboardRange.Last_7Days;
  return HostDashboardRange.Last_30Days;
};

const clampPercent = (percent: number) => {
  if (!Number.isFinite(percent) || percent <= 0) return 0;
  return Math.max(percent, 2);
};

type ReadinessItem = {
  key: string;
  label: string;
  description?: string;
  done: boolean;
  href?: string;
  onSelect?: () => void;
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const sales = payload.find((item: any) => item.dataKey === "sales")?.value ?? 0;
  const tickets = payload.find((item: any) => item.dataKey === "tickets")?.value ?? 0;
  return (
    <div className="rounded-owner-md border border-owner-border bg-owner-bg px-3 py-2 text-[12.5px] shadow-[0_10px_30px_rgba(15,15,15,0.10)]">
      <div className="font-semibold text-owner-fg-1">{label}</div>
      <div className="mt-1 text-owner-fg-3">{inrFormat(Number(sales))}</div>
      <div className="text-owner-fg-4">{formatInteger(Number(tickets))} tickets</div>
    </div>
  );
};

export const DashboardClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSelectedSideBarMenu, setToastData, openSettingsModal } =
    useGlobalStore();
  const { meUser } = useUserStore();
  const [summary, setSummary] = useState<HostDashboardSummary>(emptySummary);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  // Distinguish "payout submitted" from "payout verified". The
  // onboarding checklist's `payout` flips true the moment an account is
  // submitted — admin verification can take hours. The hero copy used
  // to claim "Payout is verified — list your first event…" even while
  // the row was still PENDING in the admin queue. We now read the
  // actual verificationStatus from hostPayoutAccounts.
  const [payoutVerified, setPayoutVerified] = useState(false);
  const [range, setRange] = useState<DashboardRange>("last30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedSideBarMenu("dashboard");
  }, [setSelectedSideBarMenu]);

  // /profile and /org-settings are now thin redirects that land here
  // with ?settings=<tab>. Auto-open the modal once, then strip the
  // param so a refresh doesn't re-open it.
  useEffect(() => {
    const settings = searchParams?.get("settings");
    if (!settings) return;
    const allowed = ["account", "security", "brand", "alerts"] as const;
    type SettingsTab = (typeof allowed)[number];
    const isAllowed = (s: string): s is SettingsTab =>
      (allowed as readonly string[]).includes(s);
    if (isAllowed(settings)) {
      openSettingsModal(settings);
    }
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("settings");
    const next = params.toString();
    router.replace(next ? `/dashboard?${next}` : "/dashboard");
  }, [searchParams, openSettingsModal, router]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [
          summaryResponse,
          eventsResponse,
          checklistResponse,
          payoutsResponse,
        ]: any[] = await Promise.all([
          sdk.getHostDashboardSummary({ input: { range: toApiRange(range) } }),
          sdk.getMyEventsForSelector(),
          sdk.eventOnboardingChecklist(),
          // Tolerant: a failed payout fetch shouldn't block the dashboard.
          sdk.hostPayoutAccounts().catch(() => null),
        ]);
        setSummary({
          ...emptySummary,
          ...(summaryResponse?.getHostDashboardSummary ?? {}),
        });
        setEvents(eventsResponse?.getMyEvents ?? []);
        setChecklist(checklistResponse?.eventOnboardingChecklist ?? null);
        const accounts = payoutsResponse?.hostPayoutAccounts ?? [];
        setPayoutVerified(
          accounts.some((a: any) => a?.verificationStatus === "VERIFIED")
        );
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range, setToastData]);

  const filteredSeries = useMemo(() => {
    const series = summary.salesSeries ?? [];
    const { from, to } = getRangeKeys(range);
    return series.filter((point) => point.date >= from && point.date <= to);
  }, [range, summary.salesSeries]);

  const rangeSales = useMemo(
    () => filteredSeries.reduce((sum, point) => sum + Number(point.sales ?? 0), 0),
    [filteredSeries]
  );

  const rangeTickets = useMemo(
    () => filteredSeries.reduce((sum, point) => sum + Number(point.tickets ?? 0), 0),
    [filteredSeries]
  );

  const rangeOrderCount = useMemo(
    () => filteredSeries.reduce((sum, point) => sum + Number(point.orderCount ?? 0), 0),
    [filteredSeries]
  );

  const chartData = filteredSeries.length > 0 ? filteredSeries : summary.salesSeries;
  const displaySales = filteredSeries.length > 0 ? rangeSales : summary.salesLast30Days;
  const displayTickets = filteredSeries.length > 0 ? rangeTickets : summary.ticketsSoldLast30Days;
  const displayOrderCount = filteredSeries.length > 0 ? rangeOrderCount : summary.orderCountLast30Days;
  const displayAverageOrderValue = displayOrderCount > 0 ? displaySales / displayOrderCount : 0;
  const displayRange = selectedRangeLabel(range, chartData);
  const displayRangeSentence = rangeSentenceLabel(range);

  const sourceRows = useMemo(() => {
    if (summary.salesBySource.length > 0) return summary.salesBySource;
    if (displaySales <= 0) return [];
    return [
      {
        label: "Direct",
        amount: displaySales,
        count: displayOrderCount,
        percent: 100,
      },
    ];
  }, [displayOrderCount, displaySales, summary.salesBySource]);

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
      .slice(0, 8);
  }, [events]);

  // Each item carries either a route (`href`) or an in-app handler
  // (`onSelect`). The logo upload step has no dedicated route anymore —
  // it lives in the Settings modal's Organisation tab.
  const readinessItems = useMemo<ReadinessItem[]>(
    () => [
      {
        key: "payout",
        label: "Payout profile",
        description:
          "Add bank or UPI details so settlements can land in the right account.",
        done: isDone(checklist?.payout),
        href: "/payment/payouts",
      },
      {
        key: "logo",
        label: "Venue logo",
        description:
          "Upload a brand mark — it shows on every ticket, email, and customer-facing page.",
        done: isDone(checklist?.logo),
        onSelect: () => openSettingsModal("brand"),
      },
      {
        key: "event",
        label: "First event",
        description:
          "Create your first event listing and publish it to start selling tickets.",
        done: isDone(checklist?.event),
        href: "/events?create=1",
      },
      {
        key: "scanner",
        label: "Scanner access",
        description:
          "Set up scanner accounts so your team can verify QR tickets at the door.",
        done: isDone(checklist?.Scanner),
        href: "/scanners",
      },
    ],
    [checklist, openSettingsModal]
  );

  const goToReadinessItem = (item: ReadinessItem) => {
    if (item.onSelect) item.onSelect();
    else if (item.href) router.push(item.href);
  };

  const needsAttention = readinessItems.filter((item) => !item.done);
  const greetingName = meUser?.firstName?.trim() || "there";

  // Hero state machine. The greeting ("Hey {name}") stays fixed; only
  // the subtitle copy + CTA buttons swap. We surface the "You made ₹X"
  // earnings sentence only when an event exists AND the AOV is above
  // ₹99 — below that threshold (or with no events at all) the host
  // sees an action-oriented prompt instead of a near-zero revenue
  // headline that reads as failure.
  const payoutSubmitted = isDone(checklist?.payout);
  const hasEvent = events.length > 0;
  // Three payout phases (in order): none → submitted → verified. The
  // hero copy + CTAs differ for each. Without this split the dashboard
  // was claiming verification the moment the host saved their bank
  // details, even though admin review was still pending.
  const hostStage:
    | "no-payout"
    | "payout-pending"
    | "no-event"
    | "earning"
    | "active" = !payoutSubmitted
    ? "no-payout"
    : !payoutVerified
      ? "payout-pending"
      : !hasEvent
        ? "no-event"
        : displayAverageOrderValue > 99
          ? "earning"
          : "active";

  type HeroCta = {
    label: string;
    icon: ReactNode;
    variant?: "primary" | "secondary";
    onClick: () => void;
  };
  const heroCopy = (() => {
    switch (hostStage) {
      case "no-payout":
        return "Add your payout profile to publish exclusive and non-exclusive events. You can run campaigns now to grow your audience before launch.";
      case "payout-pending":
        return "Payout details submitted — our team usually verifies within a few hours. While you wait, you can sketch out events as drafts and run campaigns.";
      case "no-event":
        return "Payout is verified — list your first event and start filling tickets through Hoizr campaigns.";
      case "earning":
        return null; // Render the "You made ₹X …" headline directly.
      default:
        return "Your events are live — promote them with a campaign or queue your next listing.";
    }
  })();

  const heroCtas: HeroCta[] = (() => {
    switch (hostStage) {
      case "no-payout":
        return [
          {
            label: "Add payout",
            icon: <Banknote size={15} />,
            onClick: () => router.push("/payment/payouts"),
          },
          {
            label: "Run campaign",
            icon: <Megaphone size={15} />,
            variant: "secondary",
            onClick: () => router.push("/campaigns"),
          },
        ];
      case "payout-pending":
        return [
          {
            label: "View payout status",
            icon: <Banknote size={15} />,
            onClick: () => router.push("/payment/payouts"),
          },
          {
            label: "Run campaign",
            icon: <Megaphone size={15} />,
            variant: "secondary",
            onClick: () => router.push("/campaigns"),
          },
        ];
      case "no-event":
        return [
          {
            label: "Add event",
            icon: <CalendarDays size={15} />,
            onClick: () => router.push("/events?create=1"),
          },
          {
            label: "Run campaign",
            icon: <Megaphone size={15} />,
            variant: "secondary",
            onClick: () => router.push("/campaigns"),
          },
        ];
      default:
        return [
          {
            label: "Create event",
            icon: <CalendarDays size={15} />,
            onClick: () => router.push("/events?create=1"),
          },
          {
            label: "Run campaigns",
            icon: <Megaphone size={15} />,
            variant: "secondary",
            onClick: () => router.push("/campaigns"),
          },
        ];
    }
  })();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1180px] space-y-5 font-owner text-owner-fg-1">
        <Card className="h-32 animate-pulse bg-owner-bg-subtle" />
        <Card className="h-[520px] animate-pulse bg-owner-bg-subtle" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="h-72 animate-pulse bg-owner-bg-subtle" />
          <Card className="h-72 animate-pulse bg-owner-bg-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-5 font-owner text-owner-fg-1">
      <Card padding={0} className="overflow-hidden shadow-[0_2px_10px_rgba(15,15,15,0.04)]">
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:p-6">
          <div>
            <p className="text-[24px] font-semibold leading-tight text-owner-fg-3 sm:text-[30px]">
              Hey {greetingName},
            </p>
            {hostStage === "earning" ? (
              <h1 className="mt-3 max-w-[780px] text-[31px] font-semibold leading-[1.18] text-owner-fg-1 sm:text-[38px]">
                You made{" "}
                <span className="text-owner-blue-500">
                  {inrFormat(displaySales)}
                </span>{" "}
                {displayRangeSentence}.
              </h1>
            ) : (
              <h1 className="mt-3 max-w-[680px] text-[20px] font-medium leading-[1.32] text-owner-fg-1 sm:text-[22px]">
                {heroCopy}
              </h1>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {heroCtas.map((cta) => (
                <OwnerButton
                  key={cta.label}
                  variant={cta.variant}
                  leadingIcon={cta.icon}
                  onClick={cta.onClick}
                >
                  {cta.label}
                </OwnerButton>
              ))}
              {/* Settlement button appears only when at least one
                  event exists — surfaces the payout history right
                  next to the hero CTAs without crowding new hosts. */}
              {hasEvent ? (
                <OwnerButton
                  variant="secondary"
                  leadingIcon={<ReceiptText size={15} />}
                  onClick={() => router.push("/payment/settlement-history")}
                >
                  Settlements
                </OwnerButton>
              ) : null}
            </div>
          </div>

          <ReadinessBadgeRail
            items={readinessItems}
            needsAttention={needsAttention}
            onSelect={goToReadinessItem}
          />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {dashboardMarketingCards.map((card) => (
          <MarketingSpotlightCard
            key={card.title}
            {...card}
            onClick={() => router.push(card.href)}
          />
        ))}
      </div>

      <Card padding={0} className="overflow-hidden shadow-[0_2px_10px_rgba(15,15,15,0.04)]">
        <div className="flex flex-col gap-3 border-b border-owner-border-soft px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <PillTabs tabs={rangeTabs} value={range} onChange={setRange} />
          <div className="flex items-center gap-2 text-[13px] font-medium text-owner-fg-3">
            <CalendarDays size={15} />
            <span>{displayRange}</span>
          </div>
        </div>

        <div className="grid gap-6 px-5 pb-6 pt-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-6">
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[15px] font-semibold text-owner-fg-3">
                  <CircleDollarSign size={17} className="text-owner-fg-4" />
                  Net sales
                </div>
                <div className="mt-3 text-[40px] font-semibold leading-none tabular-nums sm:text-[46px]">
                  {inrFormat(displaySales, { decimals: displaySales > 0 && displaySales < 1000 ? 2 : 0 })}
                </div>
                <div className="mt-2 text-[13px] font-medium text-owner-fg-4">
                  {formatInteger(displayTickets)} tickets sold in this view
                </div>
              </div>
              <OwnerButton
                variant="secondary"
                trailingIcon={<ChevronRight size={16} />}
                onClick={() => router.push("/reports")}
              >
                View report
              </OwnerButton>
            </div>

            <div className="mt-6 h-[280px] min-h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardSalesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F8842" stopOpacity={0.26} />
                      <stop offset="95%" stopColor="#0F8842" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#EEE9DF" strokeDasharray="3 5" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                    tick={{ fill: "#77736B", fontSize: 12 }}
                  />
                  <YAxis hide domain={[0, "dataMax"]} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#D7D0C2", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#0F8842"
                    strokeWidth={2.5}
                    fill="url(#dashboardSalesFill)"
                    dot={false}
                    activeDot={{ r: 4, stroke: "#0F8842", strokeWidth: 2, fill: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <MetricBlock
              icon={<ClipboardList size={17} />}
              label="Total orders"
              value={formatInteger(displayOrderCount)}
              rows={[
                { label: "Average order value", value: inrFormat(displayAverageOrderValue, { decimals: 2 }) },
                { label: "Tickets sold", value: formatInteger(displayTickets) },
                { label: "Net sales", value: inrFormat(displaySales, { decimals: displaySales > 0 && displaySales < 1000 ? 2 : 0 }) },
              ]}
              actionLabel="Open orders"
              onAction={() => router.push("/orders")}
            />

            <BreakdownBlock
              title="By source"
              rows={sourceRows}
              amountFormatter={(value) => inrFormat(value, { decimals: value > 0 && value < 1000 ? 2 : 0 })}
              empty="No paid sales sources yet."
            />
          </aside>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card padding={0} className="overflow-hidden">
          <SectionHeader
            icon={<CalendarDays size={17} />}
            title="Upcoming events"
            actionLabel="View events"
            onAction={() => router.push("/events")}
          />
          <div className="p-5 lg:p-6">
            {upcomingEvents.length ? (
              <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:thin] lg:-mx-6 lg:px-6">
                <div className="flex min-w-max gap-4">
                  {upcomingEvents.map((event) => (
                    <CompactDashboardEventCard
                      key={event._id}
                      event={event}
                      onClick={() => router.push(`/events/${event._id}/manage`)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/events?create=1")}
                className="flex min-h-[150px] w-full items-center justify-between gap-4 rounded-owner-md border border-dashed border-owner-border bg-owner-bg-subtle px-5 py-5 text-left transition hover:border-owner-blue-200 hover:bg-owner-blue-050/40"
              >
                <div>
                  <div className="text-[15px] font-semibold text-owner-fg-1">
                    Create your first event
                  </div>
                  <div className="mt-1 max-w-[480px] text-[13px] leading-5 text-owner-fg-4">
                    Your compact event cards will appear here once drafts or published events exist.
                  </div>
                </div>
                <ChevronRight size={18} className="text-owner-fg-4" />
              </button>
            )}
          </div>
        </Card>

        <Card padding={0} className="overflow-hidden">
          <SectionHeader
            icon={<Mail size={17} />}
            title="Marketing"
            actionLabel="View campaigns"
            onAction={() => router.push("/campaigns/marketing-credit")}
          />
          <div className="p-5 lg:p-6">
            <div>
              <div className="text-[14px] font-semibold text-owner-fg-3">
                Marketing subscribers
              </div>
              <div className="mt-3 text-[38px] font-semibold leading-none tabular-nums">
                {formatInteger(summary.marketingSubscribersCount)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniMetric label="Messages sent" value={formatInteger(summary.lifetimeCampaignMessagesSent)} />
                <MiniMetric label="Scheduled" value={formatInteger(summary.upcomingCampaigns.length)} />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-[13px] font-semibold text-owner-fg-3">
                Upcoming automated campaigns
              </div>
              <div className="divide-y divide-owner-border-soft rounded-owner-md border border-owner-border-soft">
                {summary.upcomingCampaigns.length ? (
                  summary.upcomingCampaigns.map((campaign) => (
                    <button
                      type="button"
                      key={campaign.id}
                      onClick={() => router.push("/campaigns/marketing-credit")}
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition hover:bg-owner-bg-subtle"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] font-semibold text-owner-fg-1">
                          {campaign.name}
                        </div>
                        <div className="mt-1 text-[12px] text-owner-fg-4">
                          {formatDate(campaign.scheduledFor, true)} / {formatInteger(campaign.recipientCount)} recipients
                        </div>
                      </div>
                      <Badge tone={statusTone(campaign.status)} className="shrink-0">
                        {campaign.status}
                      </Badge>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-5 text-[13px] text-owner-fg-4">
                    No scheduled campaigns yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card padding={0} className="overflow-hidden">
        <SectionHeader
          icon={<CheckCircle2 size={17} />}
          title="Launch readiness"
          actionLabel="Open settings"
          onAction={() => openSettingsModal("brand")}
        />
        <div className="grid gap-0 divide-y divide-owner-border-soft md:grid-cols-4 md:divide-x md:divide-y-0">
          {readinessItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => goToReadinessItem(item)}
              className="flex items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-owner-bg-subtle"
            >
              <div>
                <div className="text-[13.5px] font-semibold text-owner-fg-1">
                  {item.label}
                </div>
                <div className="mt-1 text-[12px] text-owner-fg-4">
                  {item.done ? "Complete" : "Needs attention"}
                </div>
              </div>
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

      <div className="grid gap-5 md:grid-cols-3">
        <ActionTile
          icon={<Send size={18} />}
          title="Publish without setup fees"
          body="Create the next event and pick the launch offer at publish time."
          onClick={() => router.push("/events?create=1")}
        />
        <ActionTile
          icon={<Users size={18} />}
          title="Use collaborators"
          body="Invite another host so both audiences can discover the event."
          onClick={() => router.push("/events?create=1")}
        />
        <ActionTile
          icon={<QrCode size={18} />}
          title="Prep scanners"
          body="Confirm door access before the next check-in window."
          onClick={() => router.push("/scanners")}
        />
      </div>
    </div>
  );
};

export default DashboardClient;

type MetricBlockProps = {
  icon: ReactNode;
  label: string;
  value: string;
  rows: { label: string; value: string }[];
  actionLabel: string;
  onAction: () => void;
};

const MetricBlock = ({ icon, label, value, rows, actionLabel, onAction }: MetricBlockProps) => (
  <div className="rounded-owner-md border border-owner-border-soft p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-[14px] font-semibold text-owner-fg-3">
          {icon}
          {label}
        </div>
        <div className="mt-3 text-[34px] font-semibold leading-none tabular-nums">{value}</div>
      </div>
      <OwnerButton variant="secondary" size="sm" trailingIcon={<ChevronRight size={14} />} onClick={onAction}>
        {actionLabel}
      </OwnerButton>
    </div>
    <div className="mt-5 space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3 border-t border-owner-border-soft pt-3">
          <span className="text-[13px] font-medium text-owner-fg-3">{row.label}</span>
          <span className="text-right text-[13.5px] font-semibold text-owner-fg-1">{row.value}</span>
        </div>
      ))}
    </div>
  </div>
);

type BreakdownBlockProps = {
  title: string;
  rows: DashboardBreakdownRow[];
  amountFormatter: (value: number) => string;
  empty: string;
};

const BreakdownBlock = ({ title, rows, amountFormatter, empty }: BreakdownBlockProps) => (
  <div className="rounded-owner-md border border-owner-border-soft p-4">
    <div className="text-[14px] font-semibold text-owner-fg-3">{title}</div>
    {rows.length ? (
      <>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-owner-bg-subtle">
          {rows.slice(0, 6).map((row, index) => (
            <span
              key={`${row.label}-${index}`}
              style={{
                width: `${clampPercent(row.percent)}%`,
                backgroundColor: sourceColors[index % sourceColors.length],
              }}
            />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {rows.slice(0, 6).map((row, index) => (
            <div key={`${row.label}-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-owner-sm"
                  style={{ backgroundColor: sourceColors[index % sourceColors.length] }}
                />
                <span className="truncate text-[13.5px] font-medium text-owner-fg-1">{row.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-right">
                {row.percent > 0 ? (
                  <span className="rounded-owner-sm bg-owner-success-bg px-2 py-0.5 text-[12px] font-semibold text-owner-success-text">
                    {row.percent.toFixed(row.percent % 1 ? 1 : 0)}%
                  </span>
                ) : null}
                <span className="text-[13.5px] font-semibold tabular-nums">{amountFormatter(row.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="mt-4 rounded-owner-md bg-owner-bg-subtle px-3 py-5 text-[13px] text-owner-fg-4">
        {empty}
      </div>
    )}
  </div>
);

const CompactDashboardEventCard = ({
  event,
  onClick,
}: {
  event: DashboardEvent;
  onClick: () => void;
}) => {
  const totals = eventTotals(event);
  const progress =
    totals.capacity > 0 ? Math.min(100, Math.round((totals.sold / totals.capacity) * 100)) : 0;
  const salesLabel =
    totals.gross > 0
      ? inrFormat(totals.gross, { decimals: totals.gross < 1000 ? 2 : 0 })
      : "Sales pending";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-[214px] shrink-0 overflow-hidden rounded-owner-lg border border-owner-border bg-owner-bg text-left shadow-owner-sm transition hover:-translate-y-0.5 hover:border-owner-blue-200 hover:shadow-[0_16px_34px_rgba(15,15,15,0.12)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-owner-bg-subtle">
        {event.eventFlyer ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.eventFlyer}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f7f2ea,#edf3fb)]">
            <CalendarDays size={34} className="text-owner-fg-4/60" />
          </div>
        )}
        <Badge
          tone={statusTone(event.status)}
          className="absolute right-2.5 top-2.5 bg-white/92 px-2 py-0.5 text-[10.5px] shadow-[0_8px_20px_rgba(15,15,15,0.16)]"
        >
          {event.status || "Draft"}
        </Badge>
      </div>

      <div className="px-3.5 pb-4 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-owner-blue-500">
          {formatDate(event.startDate, true)}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-[38px] text-[15px] font-semibold leading-tight text-owner-fg-1">
          {event.title || "Untitled event"}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2 text-[12px] font-medium text-owner-fg-4">
          <span className="truncate">{event.city || "Location pending"}</span>
          <span className="shrink-0">{formatInteger(totals.sold)} sold</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-owner-bg-subtle">
          <span
            className="block h-full rounded-full bg-owner-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[12px] font-medium text-owner-fg-4">
            {totals.capacity ? `${progress}% capacity` : "Capacity pending"}
          </span>
          <span className="text-[12.5px] font-semibold tabular-nums text-owner-fg-1">
            {salesLabel}
          </span>
        </div>
      </div>
    </button>
  );
};

type SectionHeaderProps = {
  icon: ReactNode;
  title: string;
  actionLabel: string;
  onAction: () => void;
};

const SectionHeader = ({ icon, title, actionLabel, onAction }: SectionHeaderProps) => (
  <div className="flex items-center justify-between gap-3 border-b border-owner-border-soft px-5 py-4">
    <div className="flex items-center gap-2 text-[15px] font-semibold text-owner-fg-3">
      {icon}
      {title}
    </div>
    <OwnerButton variant="secondary" size="sm" trailingIcon={<ChevronRight size={14} />} onClick={onAction}>
      {actionLabel}
    </OwnerButton>
  </div>
);

const MiniMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-owner-md border border-owner-border-soft bg-owner-bg-subtle p-3">
    <div className="text-[12px] font-medium text-owner-fg-4">{label}</div>
    <div className="mt-1 text-[20px] font-semibold leading-none tabular-nums text-owner-fg-1">{value}</div>
  </div>
);

// Readiness badges — one pill per checklist item. Pending items use
// the amber tone, done items the green tone. Hovering or focusing a
// pending pill expands a small popover with the action description so
// the host knows what's required without leaving the dashboard.
const ReadinessBadgeRail = ({
  items,
  needsAttention,
  onSelect,
}: {
  items: ReadinessItem[];
  needsAttention: ReadinessItem[];
  onSelect: (item: ReadinessItem) => void;
}) => {
  if (!items.length) return null;
  const allDone = needsAttention.length === 0;
  return (
    <div
      className={`flex flex-col gap-2 rounded-owner-md border p-4 ${
        allDone
          ? "border-owner-success-bg bg-owner-success-bg/40"
          : "border-owner-border bg-owner-bg-subtle"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-owner-fg-3">
          Setup
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[11.5px] font-semibold ${
            allDone ? "text-owner-success-text" : "text-owner-warning-text"
          }`}
        >
          {allDone ? (
            <>
              <CheckCircle2 size={12} /> All set
            </>
          ) : (
            <>
              <AlertTriangle size={12} /> {needsAttention.length} pending
            </>
          )}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <ReadinessBadge
            key={item.key}
            item={item}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

const ReadinessBadge = ({
  item,
  onSelect,
}: {
  item: ReadinessItem;
  onSelect: (item: ReadinessItem) => void;
}) => {
  const tone = item.done
    ? "border-owner-success-bg bg-owner-bg text-owner-success-text"
    : "border-owner-warning-bg bg-[#FFF8E7] text-owner-warning-text";
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition group-hover:shadow-sm ${tone}`}
        aria-label={item.description ?? item.label}
      >
        {item.done ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
        <span>{item.label}</span>
      </button>
      {/* Hover/focus expansion. Pinned to the right column the rail
          lives in so it never spills outside the card. `group-hover`
          + `group-focus-within` cover both pointer and keyboard. */}
      {item.description ? (
        <div className="pointer-events-none absolute left-0 right-0 top-full z-10 mt-1 hidden rounded-owner-sm border border-owner-border bg-owner-bg p-2 text-[11.5px] leading-4 text-owner-fg-2 shadow-owner-dropdown group-hover:block group-focus-within:block">
          {item.description}
        </div>
      ) : null}
    </div>
  );
};

const MarketingSpotlightCard = ({
  kicker,
  title,
  body,
  actionLabel,
  icon,
  onClick,
}: {
  kicker: string;
  title: string;
  body: string;
  actionLabel: string;
  icon: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative min-h-[194px] overflow-hidden rounded-owner-lg border border-white/10 bg-[#080907] p-5 text-left text-white shadow-[0_18px_46px_rgba(15,15,15,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(15,15,15,0.25)] sm:p-6"
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={marketingCardImage}
      alt=""
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover"
      draggable={false}
    />
    <div className="relative flex min-h-[146px] flex-col justify-between">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80 backdrop-blur">
          {icon}
          {kicker}
        </span>
        <h2
          className="mt-5 max-w-[540px] text-[22px] font-semibold leading-[1.12] text-white sm:text-[26px]"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.72)" }}
        >
          {title}
        </h2>
        <p
          className="mt-3 max-w-[560px] text-[13.5px] leading-5 text-white/78 sm:text-[14px]"
          style={{ textShadow: "0 2px 14px rgba(0,0,0,0.78)" }}
        >
          {body}
        </p>
      </div>
      <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-owner-sm bg-white px-3 py-2 text-[13px] font-semibold text-[#10110D] transition group-hover:translate-x-0.5">
        {actionLabel}
        <ChevronRight size={14} />
      </span>
    </div>
  </button>
);

const ActionTile = ({
  icon,
  title,
  body,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group rounded-owner-lg border border-owner-border bg-owner-bg p-5 text-left transition hover:-translate-y-0.5 hover:border-owner-blue-200 hover:shadow-[0_10px_28px_rgba(15,15,15,0.08)]"
  >
    <div className="flex items-start justify-between gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-owner-sm bg-owner-blue-050 text-owner-blue-500">
        {icon}
      </span>
      <ArrowUpRight size={17} className="text-owner-fg-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-owner-blue-500" />
    </div>
    <div className="mt-4 text-[15px] font-semibold text-owner-fg-1">{title}</div>
    <div className="mt-1.5 text-[13px] leading-5 text-owner-fg-4">{body}</div>
  </button>
);
