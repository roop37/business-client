import { inrFormat } from "@/components/common/owner";
import GuestlistManagerModal from "@/components/modules/events/GuestlistManagerModal";
import { IssueOfflineTicketModal } from "@/components/modules/offlineTicket/IssueOfflineTicketModal";
import useGlobalStore from "@/store/global";
import {
  EventCustomerRow,
  EventOrderRow,
  fetchEventCustomers,
  fetchEventOrders,
} from "@/utils/eventOpsClient";
import { sdk } from "@/utils/graphqlClient";
import { orderStatusClasses, orderStatusLabel } from "@/utils/orderStatus";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  DoorOpenIcon,
  PencilIcon,
  SettingsIcon,
  TicketIcon,
  UsersRoundIcon,
} from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Tab = "orders" | "offline" | "guestlist";

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "d MMM yyyy, h:mm a");
};

// Lifecycle is DERIVED so the badge reads correctly even between the worker's
// completion sweeps (an ended event can briefly still be stored "Published").
// Never gate purchase on this — display only.
const deriveLifecycle = (
  status?: string,
  startDate?: string | null,
  endDate?: string | null
): { label: string; cls: string } => {
  const now = Date.now();
  const start = startDate ? new Date(startDate).getTime() : null;
  const end = endDate ? new Date(endDate).getTime() : null;
  if (status === "Cancelled")
    return { label: "Cancelled", cls: "bg-red-500/10 text-red-600" };
  if (status === "Draft")
    return { label: "Draft", cls: "bg-owner-fg-4/10 text-owner-fg-3" };
  if ((end && now > end) || status === "Completed")
    return { label: "Ended", cls: "bg-owner-fg-4/15 text-owner-fg-3" };
  if (start && now >= start && (!end || now <= end))
    return { label: "Live now", cls: "bg-emerald-500/15 text-emerald-600" };
  if (status === "Published")
    return { label: "Upcoming", cls: "bg-[var(--owner-blue-500)]/10 text-[var(--owner-blue-500)]" };
  return { label: status || "—", cls: "bg-owner-fg-4/10 text-owner-fg-3" };
};

/** Small inline tip — most of the platform is used by newly-onboarded staff. */
const Tip = ({ children }: { children: ReactNode }) => (
  <p className="mb-3 text-xs text-[var(--owner-fg-3)]">{children}</p>
);

const Shell = ({
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
          <TicketIcon size={22} className="text-[var(--owner-blue-500)]" />
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
        <div className="mx-auto max-w-5xl space-y-5">{children}</div>
      </main>
    </div>
  );
};

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-4 py-3">
    <p className="text-[11px] uppercase tracking-wider text-[var(--owner-fg-4)]">
      {label}
    </p>
    <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
  </div>
);

// ─── Orders tab ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const OrdersTab = ({
  eventId,
  tickets,
}: {
  eventId: string;
  tickets: Array<{ _id: string; ticketName: string }>;
}) => {
  const { openOrderReceipt, setToastData } = useGlobalStore();
  const [rows, setRows] = useState<EventOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEventOrders(eventId, {
        page,
        pageSize: PAGE_SIZE,
        ticketTypeId: ticketTypeId || undefined,
      });
      setRows(res.items);
      setTotal(res.total);
    } catch (e) {
      setToastData({ type: "error", message: extractErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [eventId, page, ticketTypeId, setToastData]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <Tip>Every confirmed &amp; checked-in order for this event. Tap a row to open its receipt.</Tip>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={ticketTypeId}
          onChange={(e) => {
            setTicketTypeId(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-3 py-1.5 text-sm"
        >
          <option value="">All ticket types</option>
          {tickets.map((t) => (
            <option key={t._id} value={t._id}>
              {t.ticketName}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[var(--owner-fg-3)]">
          {total} {total === 1 ? "order" : "orders"}
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[var(--owner-fg-4)]">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--owner-fg-4)]">No orders yet.</div>
      ) : (
        <div className="divide-y divide-[var(--owner-border)] rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
          {rows.map((o) => (
            <button
              key={o.orderId}
              onClick={() => openOrderReceipt(o.orderId)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[var(--owner-bg-subtle)]"
            >
              <div className="min-w-[64px] font-mono text-sm font-semibold text-[var(--owner-fg-2)]">
                {o.shortId}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {o.customerName || "—"}
                  {o.isGuest ? (
                    <span className="ml-1.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                      Guest
                    </span>
                  ) : null}
                </div>
                <div className="truncate text-xs text-[var(--owner-fg-4)]">
                  {o.ticketSummary || "—"} · {fmtDate(o.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">{inrFormat(o.totalAmount)}</div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${orderStatusClasses(
                    o.checkedIn ? "CheckedIn" : o.status
                  )}`}
                >
                  {orderStatusLabel(o.checkedIn ? "CheckedIn" : o.status)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Pager page={page} pageCount={pageCount} setPage={setPage} />
    </div>
  );
};

// ─── Customers panel (See customers → drill to a customer's orders) ──────────

const CustomersPanel = ({
  eventId,
  onBack,
}: {
  eventId: string;
  onBack: () => void;
}) => {
  const { openOrderReceipt, setToastData } = useGlobalStore();
  const [rows, setRows] = useState<EventCustomerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<EventCustomerRow | null>(null);
  const [orders, setOrders] = useState<EventOrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEventCustomers(eventId, page, PAGE_SIZE);
      setRows(res.items);
      setTotal(res.total);
    } catch (e) {
      setToastData({ type: "error", message: extractErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [eventId, page, setToastData]);

  useEffect(() => {
    if (!selected) load();
  }, [load, selected]);

  const openCustomer = async (c: EventCustomerRow) => {
    setSelected(c);
    setOrdersLoading(true);
    try {
      const res = await fetchEventOrders(eventId, {
        customerId: c.isGuest ? undefined : c.customerId,
        pageSize: 50,
      });
      // Guests have no customerId — fall back to matching by phone-derived rows.
      setOrders(res.items);
    } catch (e) {
      setToastData({ type: "error", message: extractErrorMessage(e) });
    } finally {
      setOrdersLoading(false);
    }
  };

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--owner-blue-500)]"
        >
          <ChevronLeft size={16} /> Back to customers
        </button>
        <div className="mb-3 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4">
          <div className="text-base font-semibold">{selected.name || "Customer"}</div>
          <div className="mt-0.5 text-xs text-[var(--owner-fg-3)]">
            {[selected.phone, selected.email].filter(Boolean).join(" · ") || "—"}
          </div>
          <div className="mt-2 text-xs text-[var(--owner-fg-4)]">
            {selected.ticketCount} tickets · {selected.orderCount} orders ·{" "}
            {inrFormat(selected.totalSpent)} spent
          </div>
        </div>
        {ordersLoading ? (
          <div className="py-10 text-center text-sm text-[var(--owner-fg-4)]">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--owner-fg-4)]">
            No orders found.
          </div>
        ) : (
          <div className="divide-y divide-[var(--owner-border)] rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
            {orders.map((o) => (
              <button
                key={o.orderId}
                onClick={() => openOrderReceipt(o.orderId)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[var(--owner-bg-subtle)]"
              >
                <div className="min-w-[64px] font-mono text-sm font-semibold text-[var(--owner-fg-2)]">
                  {o.shortId}
                </div>
                <div className="min-w-0 flex-1 truncate text-xs text-[var(--owner-fg-3)]">
                  {o.ticketSummary} · {fmtDate(o.createdAt)}
                </div>
                <div className="text-sm font-semibold tabular-nums">{inrFormat(o.totalAmount)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--owner-blue-500)]"
      >
        <ChevronLeft size={16} /> Back
      </button>
      <Tip>Everyone who bought a ticket for this event. Tap a customer to see their orders.</Tip>
      {loading ? (
        <div className="py-12 text-center text-sm text-[var(--owner-fg-4)]">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--owner-fg-4)]">No customers yet.</div>
      ) : (
        <div className="divide-y divide-[var(--owner-border)] rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
          {rows.map((c) => (
            <button
              key={c.customerId}
              onClick={() => openCustomer(c)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[var(--owner-bg-subtle)]"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {c.name || "Customer"}
                  {c.isGuest ? (
                    <span className="ml-1.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                      Guest
                    </span>
                  ) : null}
                </div>
                <div className="truncate text-xs text-[var(--owner-fg-4)]">
                  {[c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <div className="hidden text-right text-xs text-[var(--owner-fg-3)] sm:block">
                <div>{c.ticketCount} tickets · {c.orderCount} orders</div>
                <div className="text-[var(--owner-fg-4)]">
                  {c.checkedInOrders}/{c.orderCount} checked in · last {fmtDate(c.lastPurchaseAt)}
                </div>
              </div>
              <div className="text-right text-sm font-semibold tabular-nums">
                {inrFormat(c.totalSpent)}
              </div>
            </button>
          ))}
        </div>
      )}
      <Pager page={page} pageCount={pageCount} setPage={setPage} />
    </div>
  );
};

const Pager = ({
  page,
  pageCount,
  setPage,
}: {
  page: number;
  pageCount: number;
  setPage: (fn: (p: number) => number) => void;
}) =>
  pageCount > 1 ? (
    <div className="mt-4 flex items-center justify-between">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded text-[var(--owner-fg-3)] transition hover:bg-[var(--owner-bg-subtle)] disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs text-[var(--owner-fg-4)]">
        Page {page} of {pageCount}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        disabled={page === pageCount}
        className="flex h-8 w-8 items-center justify-center rounded text-[var(--owner-fg-3)] transition hover:bg-[var(--owner-bg-subtle)] disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  ) : null;

// ─── Page ────────────────────────────────────────────────────────────────────

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "orders", label: "Orders" },
  { key: "offline", label: "Offline Tickets" },
  { key: "guestlist", label: "Guest Lists" },
];

const EventHubPage = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const eventId = typeof router.query.eventId === "string" ? router.query.eventId : "";
  const [overview, setOverview] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("orders");
  const [showCustomers, setShowCustomers] = useState(false);

  const loadOverview = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await sdk.getEventManageOverview({ id: eventId });
      setOverview(res?.getEventManageOverview ?? null);
    } catch (e) {
      setToastData({ type: "error", message: extractErrorMessage(e) });
    }
  }, [eventId, setToastData]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const lifecycle = useMemo(
    () => deriveLifecycle(overview?.status, overview?.startDate, overview?.endDate),
    [overview?.status, overview?.startDate, overview?.endDate]
  );

  const sold = overview?.totals?.sold ?? 0;
  const capacity = overview?.totals?.capacity ?? 0;
  const canSeeCustomers = sold > 0 && overview?.canAccessCustomerList !== false;
  const isCollaboratorView = Boolean(overview?.isCollaboratorView);
  // Guest-list management stays owner-side (matches the old manage card's
  // `!isCollaboratorView` gate) — a cross-host collaborator viewing the event
  // shouldn't manage the host's lists.
  const visibleTabs = useMemo(
    () => TABS.filter((t) => t.key !== "guestlist" || !isCollaboratorView),
    [isCollaboratorView]
  );

  return (
    <Shell title={overview?.title || "Event"}>
      {/* Header */}
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
              <h2 className="mt-1 flex items-center gap-2 truncate text-2xl font-semibold">
                {overview?.title || "Untitled Event"}
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${lifecycle.cls}`}
                >
                  {lifecycle.label}
                </span>
              </h2>
              <p className="mt-1 text-xs text-[var(--owner-fg-3)]">{fmtDate(overview?.startDate)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canSeeCustomers ? (
              <button
                type="button"
                onClick={() => setShowCustomers(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-3.5 py-2 text-sm font-semibold text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)]"
              >
                <UsersRoundIcon size={16} />
                See customers
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => router.push(`/events/${eventId}/manage`)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-3.5 py-2 text-sm font-semibold text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)]"
            >
              <SettingsIcon size={16} />
              Manage
            </button>
            {!isCollaboratorView ? (
              <button
                type="button"
                onClick={() => router.push(`/events/${eventId}/update`)}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)]"
              >
                <PencilIcon size={16} />
                Edit
              </button>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-[var(--owner-border)] bg-[var(--owner-border)] md:grid-cols-3">
          <Kpi label="Tickets sold" value={`${sold} / ${capacity}`} />
          <Kpi
            label="Sell-through"
            value={`${capacity > 0 ? Math.min(100, Math.round((sold / capacity) * 100)) : 0}%`}
          />
          <Kpi label="Gross revenue" value={inrFormat(overview?.totals?.grossRevenue ?? 0)} />
        </div>
      </div>

      {showCustomers ? (
        <CustomersPanel eventId={eventId} onBack={() => setShowCustomers(false)} />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-1">
            {visibleTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  tab === t.key
                    ? "bg-[var(--owner-blue-500)] text-[var(--owner-bg)]"
                    : "text-[var(--owner-fg-3)] hover:bg-[var(--owner-bg-subtle)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4">
            {tab === "orders" ? (
              <OrdersTab eventId={eventId} tickets={overview?.tickets ?? []} />
            ) : null}

            {tab === "offline" ? (
              <div>
                <Tip>Issue tickets for cash / door sales. They appear in Orders once paid.</Tip>
                <IssueOfflineTicketModal inline presetEventId={eventId} />
              </div>
            ) : null}

            {tab === "guestlist" && !isCollaboratorView ? (
              <div>
                <Tip>
                  {overview?.guestlistEnabled
                    ? "Manage lists, invite links and guests. Golden tickets scan at the door."
                    : "Guest lists are off. Turn on free guest invites with golden tickets."}
                </Tip>
                <GuestlistManagerModal
                  inline
                  eventId={eventId}
                  guestlistEnabled={!!overview?.guestlistEnabled}
                  guestlistAutoAccept={overview?.guestlistAutoAccept !== false}
                  onSettingsChanged={loadOverview}
                />
              </div>
            ) : null}
          </div>
        </>
      )}
    </Shell>
  );
};

export default EventHubPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  try {
    const response = await sdk.MeUserJourney({}, { cookie: cookieHeader });
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
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};
