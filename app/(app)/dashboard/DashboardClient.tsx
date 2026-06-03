"use client";

import {
  Badge,
  Card,
  inrFormat,
  OwnerButton,
  PillTabs,
} from "@/components/common/owner";
import type { BadgeTone, PillTab } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Mail,
  QrCode,
  ReceiptText,
  Send,
  Ticket,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

const clampPercent = (percent: number) => {
  if (!Number.isFinite(percent) || percent <= 0) return 0;
  return Math.max(percent, 2);
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
  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();
  const { meUser } = useUserStore();
  const [summary, setSummary] = useState<HostDashboardSummary>(emptySummary);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [range, setRange] = useState<DashboardRange>("last30");
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
        setSummary({
          ...emptySummary,
          ...(summaryResponse?.getHostDashboardSummary ?? {}),
        });
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

  const chartData = filteredSeries.length > 0 ? filteredSeries : summary.salesSeries;
  const displaySales = filteredSeries.length > 0 ? rangeSales : summary.salesLast30Days;
  const displayTickets = filteredSeries.length > 0 ? rangeTickets : summary.ticketsSoldLast30Days;
  const displayRange = selectedRangeLabel(range, chartData);

  const sourceRows = useMemo(() => {
    if (summary.salesBySource.length > 0) return summary.salesBySource;
    if (summary.salesLast30Days <= 0) return [];
    return [
      {
        label: "Direct",
        amount: summary.salesLast30Days,
        count: summary.orderCountLast30Days,
        percent: 100,
      },
    ];
  }, [summary.orderCountLast30Days, summary.salesBySource, summary.salesLast30Days]);

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
      .slice(0, 5);
  }, [events]);

  const readinessItems = useMemo(
    () => [
      {
        key: "payout",
        label: "Payout profile",
        done: isDone(checklist?.payout),
        href: "/payment/payouts",
      },
      {
        key: "logo",
        label: "Venue logo",
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
    ],
    [checklist]
  );

  const needsAttention = readinessItems.filter((item) => !item.done);
  const greetingName = meUser?.firstName?.trim() || "there";

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
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:p-6">
          <div>
            <p className="text-[24px] font-semibold leading-tight text-owner-fg-3 sm:text-[30px]">
              Hey {greetingName},
            </p>
            <h1 className="mt-3 max-w-[780px] text-[31px] font-semibold leading-[1.18] text-owner-fg-1 sm:text-[38px]">
              You made <span className="text-owner-blue-500">{inrFormat(summary.salesLast30Days)}</span> in the last 30 days.
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <OwnerButton
                leadingIcon={<CalendarDays size={15} />}
                onClick={() => router.push("/events?create=1")}
              >
                Create event
              </OwnerButton>
              <OwnerButton
                variant="secondary"
                leadingIcon={<ReceiptText size={15} />}
                onClick={() => router.push("/payment/settlement-history")}
              >
                Settlements
              </OwnerButton>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(needsAttention[0]?.href ?? "/org-settings")}
            className={`flex min-h-[92px] items-center justify-between gap-4 rounded-owner-md border px-4 py-3 text-left transition hover:-translate-y-0.5 ${
              needsAttention.length
                ? "border-owner-warning-bg bg-[#FFF8E7] text-owner-warning-text"
                : "border-owner-success-bg bg-owner-success-bg text-owner-success-text"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-owner-sm bg-white/75">
                {needsAttention.length ? <AlertTriangle size={19} /> : <CheckCircle2 size={19} />}
              </span>
              <div>
                <div className="text-[14px] font-semibold">
                  {needsAttention.length
                    ? `${needsAttention.length} setup item${needsAttention.length === 1 ? "" : "s"} need attention`
                    : "Your setup is ready"}
                </div>
                <div className="mt-1 text-[12.5px] opacity-80">
                  {needsAttention[0]?.label ?? "Profile, payout, event, and scanner checks are complete"}
                </div>
              </div>
            </div>
            <ChevronRight size={19} />
          </button>
        </div>
      </Card>

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
              value={formatInteger(summary.orderCountLast30Days)}
              rows={[
                { label: "Average order value", value: inrFormat(summary.averageOrderValueLast30Days, { decimals: 2 }) },
                { label: "Tickets sold", value: formatInteger(summary.ticketsSoldLast30Days) },
                { label: "Today", value: `${inrFormat(summary.salesToday)} / ${formatInteger(summary.ticketsSoldToday)} tickets` },
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
            icon={<Ticket size={17} />}
            title="Items"
            actionLabel="View menu"
            onAction={() => router.push("/events")}
          />
          <div className="grid gap-6 p-5 lg:grid-cols-2 lg:p-6">
            <RankedList
              title="Best selling tickets"
              rows={summary.topItems}
              empty="Ticket sales will appear after orders are paid."
              valueFormatter={(row) => inrFormat(row.amount, { decimals: row.amount > 0 && row.amount < 1000 ? 2 : 0 })}
              metaFormatter={(row) => `${formatInteger(row.count)} sold`}
            />
            <RankedList
              title="Upcoming events"
              rows={upcomingEvents.map((event) => {
                const totals = eventTotals(event);
                return {
                  label: event.title || "Untitled event",
                  amount: totals.gross,
                  count: totals.sold,
                  percent: totals.capacity ? Math.round((totals.sold / totals.capacity) * 1000) / 10 : 0,
                  href: `/events/${event._id}/manage`,
                  badge: event.status || "Draft",
                  subLabel: formatDate(event.startDate, true),
                };
              })}
              empty="Create an event to start the operations list."
              valueFormatter={(row) => inrFormat(row.amount, { decimals: row.amount > 0 && row.amount < 1000 ? 2 : 0 })}
              metaFormatter={(row) => `${formatInteger(row.count)} sold`}
              onRowClick={(row) => router.push(row.href ?? "/events")}
            />
          </div>
        </Card>

        <Card padding={0} className="overflow-hidden">
          <SectionHeader
            icon={<Mail size={17} />}
            title="Marketing"
            actionLabel="View campaigns"
            onAction={() => router.push("/marketing-credit")}
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
                      onClick={() => router.push("/marketing-credit")}
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
          onAction={() => router.push("/org-settings")}
        />
        <div className="grid gap-0 divide-y divide-owner-border-soft md:grid-cols-4 md:divide-x md:divide-y-0">
          {readinessItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => router.push(item.href)}
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

type RankedRow = DashboardBreakdownRow & {
  href?: string;
  badge?: string | null;
  subLabel?: string;
};

type RankedListProps = {
  title: string;
  rows: RankedRow[];
  empty: string;
  valueFormatter: (row: RankedRow) => string;
  metaFormatter: (row: RankedRow) => string;
  onRowClick?: (row: RankedRow) => void;
};

const RankedList = ({
  title,
  rows,
  empty,
  valueFormatter,
  metaFormatter,
  onRowClick,
}: RankedListProps) => (
  <div>
    <div className="text-[14px] font-semibold text-owner-fg-3">{title}</div>
    <div className="mt-3 divide-y divide-owner-border-soft">
      {rows.length ? (
        rows.slice(0, 5).map((row, index) => {
          const clickable = typeof onRowClick === "function";
          const content = (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-owner-sm bg-owner-bg-subtle text-[13px] font-semibold text-owner-fg-3">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-owner-fg-1">{row.label}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-owner-fg-4">
                    {row.subLabel ? <span>{row.subLabel}</span> : null}
                    {row.badge ? <Badge tone={statusTone(row.badge)} className="px-2 py-0.5 text-[11px]">{row.badge}</Badge> : null}
                    <span>{metaFormatter(row)}</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right text-[13.5px] font-semibold tabular-nums text-owner-fg-1">
                {valueFormatter(row)}
              </div>
            </>
          );

          if (clickable) {
            return (
              <button
                key={`${row.label}-${index}`}
                type="button"
                onClick={() => onRowClick(row)}
                className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-owner-bg-subtle"
              >
                {content}
              </button>
            );
          }

          return (
            <div key={`${row.label}-${index}`} className="flex items-center justify-between gap-4 py-3">
              {content}
            </div>
          );
        })
      ) : (
        <div className="rounded-owner-md bg-owner-bg-subtle px-3 py-5 text-[13px] text-owner-fg-4">
          {empty}
        </div>
      )}
    </div>
  </div>
);

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
