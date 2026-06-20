import {
  Badge,
  PageHeader,
  PillTabs,
  StatTile,
  inrFormat,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MainLayout from "@/components/layouts/mainBodyLayout";
import useGlobalStore from "@/store/global";
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
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { FiEye } from "react-icons/fi";
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
  const openOrderReceipt = useGlobalStore((s) => s.openOrderReceipt);
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

  // Always latest-first (newest createdAt at the top), regardless of how the
  // server returns the page.
  const byNewest = <T extends { createdAt?: string | null }>(a: T, b: T) =>
    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();

  const ordersFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = !q
      ? orders
      : orders.filter((o) =>
          [o.customerName, o.customerEmail, o.customerPhone, o.eventTitle, o.orderId]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        );
    return [...rows].sort(byNewest);
  }, [orders, search]);

  const offlineFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = !q
      ? offline
      : offline.filter((o) =>
          [o.customerFirstName, o.customerLastName, o.customerEmail, o.customerPhone]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        );
    return [...rows].sort(byNewest);
  }, [offline, search]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status !== "REFUNDED")
      .reduce((s, o) => s + o.totalAmount, 0);
    const tickets = orders.reduce((s, o) => s + o.ticketCount, 0);
    return { count: orders.length, revenue, tickets };
  }, [orders]);

  const orderColumnHelper = createColumnHelper<HostOrderRow>();
  const orderColumns: ColumnDef<HostOrderRow, any>[] = useMemo(
    () => [
      orderColumnHelper.display({
        id: "shortId",
        header: "Order",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-owner-fg-3">
            #{row.original.orderId.slice(-6).toUpperCase()}
          </span>
        ),
      }),
      orderColumnHelper.accessor("customerName", {
        header: "Customer",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <DataTableTextCell
              className="cursor-pointer"
              onClick={() => openOrderReceipt(row.original.orderId)}
              value={row.original.customerName}
            />
            <span className="text-[12px] text-owner-fg-4">
              {row.original.customerEmail ?? row.original.customerPhone ?? ""}
            </span>
          </div>
        ),
      }),
      orderColumnHelper.accessor("eventTitle", {
        header: "Event",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.eventTitle ?? "—"} />
        ),
      }),
      orderColumnHelper.accessor("ticketCount", {
        header: "Tickets",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {row.original.ticketCount}
          </span>
        ),
      }),
      orderColumnHelper.accessor("totalAmount", {
        header: "Amount",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.totalAmount)}
          </span>
        ),
      }),
      orderColumnHelper.accessor("source", {
        header: "Source",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={sourceLabel(row.original.source)} />
        ),
      }),
      orderColumnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          const st = orderStatusLabel(row.original.status);
          return (
            <Badge tone={st.tone}>
              {row.original.checkedIn && row.original.status !== "REFUNDED"
                ? "Checked in"
                : st.label}
            </Badge>
          );
        },
      }),
      orderColumnHelper.accessor("createdAt", {
        header: "Placed",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell value={fmtDate(row.original.createdAt)} />
        ),
      }),
      orderColumnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TooltipProvider>
            <div className="flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger>
                  <FiEye
                    className="text-primary text-lg cursor-pointer"
                    onClick={() => openOrderReceipt(row.original.orderId)}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-xs">
                  <p>View receipt</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderColumnHelper]
  );

  const offlineColumnHelper = createColumnHelper<OfflineOrderRow>();
  const offlineColumns: ColumnDef<OfflineOrderRow, any>[] = useMemo(
    () => [
      offlineColumnHelper.accessor("customerFirstName", {
        header: "Customer",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          const name =
            [row.original.customerFirstName, row.original.customerLastName]
              .filter(Boolean)
              .join(" ") || "Guest";
          return (
            <div className="flex flex-col">
              <DataTableTextCell value={name} />
              <span className="text-[12px] text-owner-fg-4">
                {row.original.customerEmail ?? row.original.customerPhone}
              </span>
            </div>
          );
        },
      }),
      offlineColumnHelper.accessor("eventId", {
        header: "Event",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell
            value={eventTitleById.get(row.original.eventId) ?? "—"}
          />
        ),
      }),
      offlineColumnHelper.accessor("mode", {
        header: "Type",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell
            value={row.original.mode === "ISSUED" ? "Issued" : "Payment link"}
          />
        ),
      }),
      offlineColumnHelper.accessor("amountTotal", {
        header: "Amount",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.amountTotal)}
          </span>
        ),
      }),
      offlineColumnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          const st = offlineStatusLabel(row.original.status);
          return <Badge tone={st.tone}>{st.label}</Badge>;
        },
      }),
      offlineColumnHelper.accessor("createdByName", {
        header: "Issued by",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm text-owner-fg-1">
            {row.original.createdByName ?? "—"}
            {row.original.createdByCollaborator ? (
              <span className="text-[12px] text-owner-fg-4">(collab)</span>
            ) : null}
          </div>
        ),
      }),
      offlineColumnHelper.accessor("createdAt", {
        header: "Created",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell value={fmtDate(row.original.createdAt)} />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offlineColumnHelper, eventTitleById]
  );

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

      {tab === "orders" ? (
        <DataTable
          totalRows={ordersFiltered.length}
          columns={orderColumns}
          data={ordersFiltered}
          loading={loading}
          manualPagination={false}
          hideDownloadButton
          pageSize={10}
          searchFilter={search}
          setSearchFilter={setSearch}
        />
      ) : (
        <DataTable
          totalRows={offlineFiltered.length}
          columns={offlineColumns}
          data={offlineFiltered}
          loading={loading}
          manualPagination={false}
          hideDownloadButton
          pageSize={10}
          searchFilter={search}
          setSearchFilter={setSearch}
        />
      )}
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
