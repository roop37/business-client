import {
  Badge,
  OwnerButton,
  PageHeader,
  PillTabs,
  StatTile,
  inrFormat,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { PermissionTypeEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Download, Filter, Plus, Ticket } from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

type EventTicket = {
  _id?: string | null;
  ticketName?: string | null;
  ticketCategory?: string | null;
  ticketCapacity?: number | null;
  ticketSold?: number | null;
  ticketPrice?: number | null;
  ticketVisible?: boolean | null;
};

type EventRecord = {
  _id: string;
  title?: string | null;
  status?: string | null;
  startDate?: string | null;
  city?: string | null;
  tickets?: EventTicket[] | null;
};

type TicketRow = {
  id: string;
  eventId: string;
  event: string;
  tier: string;
  buyer: string;
  email: string;
  booked: string;
  price: number;
  qty: number;
  status: "Confirmed" | "Pending" | "Refunded";
  checkedIn: boolean;
  sold: number;
  capacity: number;
};

type TicketTab = "all" | "confirmed" | "pending" | "refunded" | "checked-in";

const ticketTabs = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "checked-in", label: "Checked-in" },
] satisfies { value: TicketTab; label: string }[];

const formatDate = (value?: string | null) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const normalizeStatus = (status?: string | null) =>
  String(status ?? "").toLowerCase();

const tierTone = (tier: string): BadgeTone => {
  const value = tier.toLowerCase();
  if (value.includes("couple") || value.includes("vip")) return "info";
  if (value.includes("early") || value.includes("free")) return "success";
  if (value.includes("walk")) return "warning";
  return "neutral";
};

const statusTone = (status: TicketRow["status"]): BadgeTone => {
  if (status === "Confirmed") return "success";
  if (status === "Pending") return "info";
  return "danger";
};

const flattenTickets = (events: EventRecord[]): TicketRow[] => {
  return events.flatMap((event) => {
    const rows = event.tickets ?? [];
    return rows.map((ticket, index) => {
      const sold = Number(ticket.ticketSold ?? 0);
      const capacity = Number(ticket.ticketCapacity ?? 0);
      const isVisible = ticket.ticketVisible !== false;
      const status = isVisible ? "Confirmed" : "Pending";
      const ticketId =
        ticket._id || `${event._id}-${String(index + 1).padStart(2, "0")}`;
      return {
        id: `HZR-${ticketId.slice(-6).toUpperCase()}`,
        eventId: event._id,
        event: event.title || "Untitled event",
        tier: ticket.ticketName || ticket.ticketCategory || "General",
        buyer: sold > 1 ? `${sold} buyers` : sold === 1 ? "1 buyer" : "No buyers yet",
        email: event.city || normalizeStatus(event.status) || "Event workspace",
        booked: formatDate(event.startDate),
        price: Number(ticket.ticketPrice ?? 0),
        qty: Math.max(sold, 1),
        status,
        checkedIn: false,
        sold,
        capacity,
      };
    });
  });
};

const downloadCsv = (rows: TicketRow[]) => {
  const header = [
    "Ticket ID",
    "Event",
    "Tier",
    "Booked",
    "Price",
    "Sold",
    "Capacity",
    "Status",
  ];
  const csvRows = rows.map((row) =>
    [
      row.id,
      row.event,
      row.tier,
      row.booked,
      row.price,
      row.sold,
      row.capacity,
      row.status,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );
  const blob = new Blob([[header.join(","), ...csvRows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = "hoizr-tickets.csv";
  anchor.click();
  URL.revokeObjectURL(href);
};

const TicketsPage = () => {
  const router = useRouter();
  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TicketTab>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelectedSideBarMenu("Tickets");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const response = await sdk.getMyEvents();
        setEvents(response?.getMyEvents ?? []);
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [setToastData]);

  const rows = useMemo(() => flattenTickets(events), [events]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesTab =
        tab === "all" ||
        (tab === "checked-in"
          ? row.checkedIn
          : row.status.toLowerCase() === tab);
      const matchesSearch =
        !query ||
        row.id.toLowerCase().includes(query) ||
        row.event.toLowerCase().includes(query) ||
        row.tier.toLowerCase().includes(query) ||
        row.buyer.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [rows, search, tab]);

  const stats = useMemo(() => {
    const sold = rows.reduce((sum, row) => sum + row.sold, 0);
    const revenue = rows.reduce((sum, row) => sum + row.sold * row.price, 0);
    const refunds = rows.filter((row) => row.status === "Refunded").length;
    const avg = sold ? Math.round(revenue / sold) : 0;
    return { sold, revenue, refunds, avg };
  }, [rows]);

  const columnHelper = createColumnHelper<TicketRow>();
  const columns: ColumnDef<TicketRow, any>[] = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Ticket ID",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-mono text-[13px] text-owner-fg-1">
            {row.original.id}
          </span>
        ),
      }),
      columnHelper.accessor("event", {
        header: "Event",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => <DataTableTextCell value={row.original.event} />,
      }),
      columnHelper.accessor("tier", {
        header: "Tier",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge tone={tierTone(row.original.tier)}>{row.original.tier}</Badge>
        ),
      }),
      columnHelper.accessor("buyer", {
        header: "Buyer",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-owner-fg-1">
              {row.original.buyer}
            </span>
            <span className="text-[12px] text-owner-fg-4">
              {row.original.email}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("booked", {
        header: "Booked",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => <DataTableTextCell value={row.original.booked} />,
      }),
      columnHelper.accessor("price", {
        header: "Price",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.price)}
            {row.original.sold > 1 ? (
              <span className="ml-1 font-normal text-owner-fg-4">
                x {row.original.sold}
              </span>
            ) : null}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge
            tone={statusTone(row.original.status)}
            icon={row.original.checkedIn ? <Ticket size={13} /> : undefined}
          >
            {row.original.checkedIn ? "Checked-in" : row.original.status}
          </Badge>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper]
  );

  return (
    <div className="min-w-0">
      <PageHeader
        title="Tickets"
        subtitle="Every ticket tier and sold count across all your events."
        actions={
          <>
            <OwnerButton
              variant="secondary"
              leadingIcon={<Download size={16} />}
              onClick={() => downloadCsv(filtered)}
              disabled={!filtered.length}
            >
              Download CSV
            </OwnerButton>
            <OwnerButton
              leadingIcon={<Plus size={16} />}
              onClick={() => router.push("/events/create")}
            >
              Issue ticket
            </OwnerButton>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Tickets sold"
          value={stats.sold.toLocaleString("en-IN")}
          delta={{ value: "+22%", direction: "up", tone: "positive" }}
        />
        <StatTile
          label="Revenue"
          value={inrFormat(stats.revenue)}
          delta={{ value: "+18%", direction: "up", tone: "positive" }}
        />
        <StatTile
          label="Refunded tiers"
          value={stats.refunds.toLocaleString("en-IN")}
          delta={{ value: "-4%", direction: "down", tone: "positive" }}
        />
        <StatTile
          label="Avg. ticket value"
          value={inrFormat(stats.avg)}
          delta={{ value: "+3%", direction: "up", tone: "positive" }}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <PillTabs tabs={ticketTabs} value={tab} onChange={setTab} />
        <div className="flex-1" />
        <OwnerButton variant="secondary" leadingIcon={<Filter size={16} />}>
          Filter
        </OwnerButton>
      </div>

      <DataTable
        totalRows={filtered.length}
        columns={columns}
        data={filtered}
        loading={loading}
        manualPagination={false}
        hideDownloadButton
        pageSize={10}
        searchFilter={search}
        setSearchFilter={setSearch}
      />
    </div>
  );
};

TicketsPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default TicketsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  const tokenExists = cookieHeader.includes("accessToken=");

  if (!tokenExists) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const [userResponse, journeyResponse] = await Promise.all([
      sdk.MeCheckUser(
        {},
        {
          cookie: context.req.headers.cookie?.toString() ?? "",
        }
      ),
      sdk.MeUserJourney(
        {},
        {
          cookie: context.req.headers.cookie?.toString() ?? "",
        }
      ),
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
      const canAccessMenu = hasAccess(
        userResponse.meUser.permissions,
        PermissionTypeEnum.Tickets
      );
      if (!canAccessMenu) {
        return {
          redirect: {
            destination: `/account/access-blocked?target=${PermissionTypeEnum.Tickets}`,
            permanent: false,
          },
        };
      }
      return { props: {} };
    }

    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
