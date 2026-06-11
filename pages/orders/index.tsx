import {
  Badge,
  Card,
  PageHeader,
  PillTabs,
  StatTile,
  inrFormat,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { PermissionTypeEnum } from "@/generated/graphql";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import {
  fetchHostOrders,
  fetchMyEventsForOffline,
  fetchMyOfflineOrders,
  type HostOrderRow,
  type OfflineEvent,
  type OfflineOrderRow,
} from "@/utils/offlineTicketClient";
import { Search } from "lucide-react";
import { GetServerSideProps } from "next";
import React, { useEffect, useMemo, useState } from "react";

type TopTab = "orders" | "offline";

const topTabs = [
  { value: "orders", label: "Orders" },
  { value: "offline", label: "Offline Orders" },
];

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

// Server sends OrderStatus enum KEYS (e.g. "PAYMENT_SUCCESS").
const orderStatusLabel = (s: string): { label: string; tone: BadgeTone } => {
  switch (s) {
    case "PAYMENT_SUCCESS":
      return { label: "Confirmed", tone: "success" };
    case "CHECKED_IN":
      return { label: "Checked in", tone: "info" };
    case "REFUNDED":
      return { label: "Refunded", tone: "warning" };
    default:
      return { label: s, tone: "neutral" };
  }
};

const offlineStatusLabel = (s: string): { label: string; tone: BadgeTone } => {
  switch (s) {
    case "ISSUED":
      return { label: "Issued", tone: "success" };
    case "LINK_SENT":
      return { label: "Link sent", tone: "warning" };
    case "PAID":
      return { label: "Paid", tone: "success" };
    case "EXPIRED":
      return { label: "Expired", tone: "neutral" };
    case "CANCELLED":
      return { label: "Cancelled", tone: "neutral" };
    default:
      return { label: s, tone: "neutral" };
  }
};

const sourceLabel = (s: string) =>
  s === "OFFLINE_ISSUED"
    ? "Offline · issued"
    : s === "OFFLINE_LINK"
      ? "Offline · link"
      : "Online";

const OrdersPage = () => {
  const [tab, setTab] = useState<TopTab>("orders");
  const [events, setEvents] = useState<OfflineEvent[]>([]);
  const [eventId, setEventId] = useState<string>("");
  const [completedOnly, setCompletedOnly] = useState(false);
  const [search, setSearch] = useState("");

  const [orders, setOrders] = useState<HostOrderRow[]>([]);
  const [offline, setOffline] = useState<OfflineOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Event list (filter dropdown + title map for offline rows).
  useEffect(() => {
    fetchMyEventsForOffline()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  const eventTitleById = useMemo(
    () => new Map(events.map((e) => [e._id, e.title])),
    [events]
  );

  const filterEvents = useMemo(
    () =>
      completedOnly
        ? events.filter((e) => String(e.status).toUpperCase() === "COMPLETED")
        : events,
    [events, completedOnly]
  );

  useEffect(() => {
    setLoading(true);
    const args = eventId || undefined;
    const job =
      tab === "orders"
        ? fetchHostOrders(args).then((r) => setOrders(r.items))
        : fetchMyOfflineOrders(args).then((r) => setOffline(r.items));
    job.catch(() => (tab === "orders" ? setOrders([]) : setOffline([]))).finally(
      () => setLoading(false)
    );
  }, [tab, eventId]);

  const ordersFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.customerName, o.customerEmail, o.customerPhone, o.eventTitle, o.orderId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [orders, search]);

  const offlineFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offline;
    return offline.filter((o) =>
      [o.customerFirstName, o.customerLastName, o.customerEmail, o.customerPhone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [offline, search]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status !== "REFUNDED")
      .reduce((s, o) => s + o.totalAmount, 0);
    const tickets = orders.reduce((s, o) => s + o.ticketCount, 0);
    return { count: orders.length, revenue, tickets };
  }, [orders]);

  return (
    <div className="min-w-0">
      <PageHeader
        title="Orders"
        subtitle="Every order across all your events, latest first."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Orders" value={stats.count.toLocaleString("en-IN")} />
        <StatTile label="Tickets sold" value={stats.tickets.toLocaleString("en-IN")} />
        <StatTile label="Revenue" value={inrFormat(stats.revenue)} />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <PillTabs tabs={topTabs} value={tab} onChange={(v) => setTab(v as TopTab)} />
        <div className="flex-1" />
        <label className="flex items-center gap-2 text-[13px] text-owner-fg-3">
          <input
            type="checkbox"
            checked={completedOnly}
            onChange={(e) => setCompletedOnly(e.target.checked)}
            className="h-4 w-4 accent-owner-blue-500"
          />
          Completed events only
        </label>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="h-9 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] text-owner-fg-1 outline-none focus:border-owner-blue-200"
        >
          <option value="">All events</option>
          {filterEvents.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      <Card padding={0} className="overflow-hidden">
        <div className="border-b border-owner-border-soft p-4">
          <div className="owner-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, email, phone, or event"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {tab === "orders" ? (
            <table className="owner-table min-w-[920px]">
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Event</th>
                  <th scope="col" className="num">Tickets</th>
                  <th scope="col" className="num">Amount</th>
                  <th scope="col">Source</th>
                  <th scope="col">Status</th>
                  <th scope="col">Placed</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center text-owner-fg-4">
                      Loading orders…
                    </td>
                  </tr>
                ) : ordersFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-owner-fg-4">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  ordersFiltered.map((o) => {
                    const st = orderStatusLabel(o.status);
                    return (
                      <tr key={o.orderId}>
                        <td>
                          <div className="font-medium text-owner-fg-1">
                            {o.customerName}
                          </div>
                          <div className="text-xs text-owner-fg-4">
                            {o.customerEmail ?? o.customerPhone ?? ""}
                          </div>
                        </td>
                        <td>{o.eventTitle ?? "—"}</td>
                        <td className="num tabular-nums">{o.ticketCount}</td>
                        <td className="num tabular-nums">{inrFormat(o.totalAmount)}</td>
                        <td className="text-xs">{sourceLabel(o.source)}</td>
                        <td>
                          <Badge tone={st.tone}>
                            {o.checkedIn && o.status !== "REFUNDED"
                              ? "Checked in"
                              : st.label}
                          </Badge>
                        </td>
                        <td className="text-xs text-owner-fg-3">{fmtDate(o.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="owner-table min-w-[920px]">
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Event</th>
                  <th scope="col">Type</th>
                  <th scope="col" className="num">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Issued by</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center text-owner-fg-4">
                      Loading offline orders…
                    </td>
                  </tr>
                ) : offlineFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-owner-fg-4">
                      No offline orders yet. Use “Issue offline ticket” to create one.
                    </td>
                  </tr>
                ) : (
                  offlineFiltered.map((o) => {
                    const st = offlineStatusLabel(o.status);
                    const name =
                      [o.customerFirstName, o.customerLastName]
                        .filter(Boolean)
                        .join(" ") || "Guest";
                    return (
                      <tr key={o._id}>
                        <td>
                          <div className="font-medium text-owner-fg-1">{name}</div>
                          <div className="text-xs text-owner-fg-4">
                            {o.customerEmail ?? o.customerPhone}
                          </div>
                        </td>
                        <td>{eventTitleById.get(o.eventId) ?? "—"}</td>
                        <td className="text-xs">
                          {o.mode === "ISSUED" ? "Issued" : "Payment link"}
                        </td>
                        <td className="num tabular-nums">{inrFormat(o.amountTotal)}</td>
                        <td>
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </td>
                        <td className="text-xs">
                          {o.createdByName ?? "—"}
                          {o.createdByCollaborator ? (
                            <span className="ml-1 text-owner-fg-4">(collab)</span>
                          ) : null}
                        </td>
                        <td className="text-xs text-owner-fg-3">{fmtDate(o.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-owner-border-soft px-6 py-4">
          <span className="text-[13px] text-owner-fg-4">
            {tab === "orders" ? ordersFiltered.length : offlineFiltered.length} shown
          </span>
        </div>
      </Card>
    </div>
  );
};

OrdersPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default OrdersPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  try {
    const [userResponse, journeyResponse] = await Promise.all([
      sdk.MeCheckUser({}, { cookie: cookieHeader }),
      sdk.MeUserJourney({}, { cookie: cookieHeader }),
    ]);
    const journey = journeyResponse.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }
    if (userResponse?.meUser) {
      const canAccess = hasAccess(
        userResponse.meUser.permissions,
        PermissionTypeEnum.Tickets
      );
      if (!canAccess) {
        return {
          redirect: {
            destination: `/account/access-blocked?target=${PermissionTypeEnum.Tickets}`,
            permanent: false,
          },
        };
      }
      return { props: {} };
    }
    return { redirect: { destination: "/login", permanent: false } };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};
