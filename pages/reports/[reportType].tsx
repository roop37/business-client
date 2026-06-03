import {
  Badge,
  Card,
  OwnerButton,
  PageHeader,
  StatTile,
  inrFormat,
} from "@/components/common/owner";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { PermissionTypeEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Download, Loader2 } from "lucide-react";

type EventReport = {
  _id: string;
  title?: string | null;
  status?: string | null;
  city?: string | null;
  startDate?: string | null;
  isVisible?: boolean | null;
  tickets?: {
    _id?: string | null;
    ticketName?: string | null;
    ticketCapacity?: number | null;
    ticketSold?: number | null;
    ticketPrice?: number | null;
    ticketVisible?: boolean | null;
  }[] | null;
};

type PayoutReport = {
  _id: string;
  entityName?: string | null;
  bankName?: string | null;
  last4?: string | null;
  isPrimary?: boolean | null;
  isActive?: boolean | null;
  verificationStatus?: string | null;
};

type ReportColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
};

type ReportConfig = {
  title: string;
  description: string;
};

const reports: Record<string, ReportConfig> = {
  "event-performance": {
    title: "Sales by event",
    description: "Published, draft, completed, hidden, and upcoming event data.",
  },
  "draft-pipeline": {
    title: "Campaign performance",
    description: "Draft events that still need setup before publishing.",
  },
  "city-breakdown": {
    title: "Customer cohorts",
    description: "Event distribution by city for the active account.",
  },
  "ticket-inventory": {
    title: "Door & check-in",
    description: "Capacity, sold count, visibility, and price by ticket.",
  },
  "sales-estimate": {
    title: "Sales by source",
    description: "Estimated gross sales from saved ticket sold counts.",
  },
  "payout-readiness": {
    title: "Tax & GST summary",
    description: "Primary payout and verification status for paid events.",
  },
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const normalizeStatus = (status?: string | null) =>
  String(status ?? "Draft").toLowerCase();

const statusLabel = (value?: string | null) =>
  String(value ?? "Draft")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const eventTicketStats = (event: EventReport) => {
  const tickets = event.tickets ?? [];
  return tickets.reduce(
    (acc, ticket) => {
      const sold = Number(ticket.ticketSold ?? 0);
      const capacity = Number(ticket.ticketCapacity ?? 0);
      const price = Number(ticket.ticketPrice ?? 0);
      acc.sold += sold;
      acc.capacity += capacity;
      acc.gross += sold * price;
      return acc;
    },
    { sold: 0, capacity: 0, gross: 0 }
  );
};

const statusTone = (value?: string | null) => {
  const normalized = normalizeStatus(value);
  if (normalized.includes("active") || normalized.includes("verified")) {
    return "success";
  }
  if (normalized.includes("pending") || normalized.includes("draft")) {
    return "warning";
  }
  if (normalized.includes("hidden") || normalized.includes("inactive")) {
    return "neutral";
  }
  return "info";
};

const ReportTable = ({
  columns,
  rows,
}: {
  columns: ReportColumn[];
  rows: Record<string, React.ReactNode>[];
}) => {
  if (!rows.length) {
    return (
      <Card className="p-8 text-center text-sm text-owner-fg-4">
        No rows found for this report.
      </Card>
    );
  }

  return (
    <Card padding={0} className="overflow-hidden">
      <div className="max-h-[58vh] overflow-auto">
        <table className="owner-table min-w-[820px]">
          <caption className="sr-only">Report rows</caption>
          <thead className="sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={column.align === "right" ? "num" : ""}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.align === "right" ? "num" : ""}
                  >
                    {row[column.key] ?? "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const ReportDetail = () => {
  const router = useRouter();
  const reportType = router.query.reportType?.toString() ?? "";
  const config = reports[reportType] ?? reports["event-performance"];
  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();
  const [events, setEvents] = useState<EventReport[]>([]);
  const [payouts, setPayouts] = useState<PayoutReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedSideBarMenu("Reports");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const eventResponse = await sdk.getMyEvents();
        setEvents(eventResponse?.getMyEvents ?? []);

        if (reportType === "payout-readiness") {
          const payoutResponse = await sdk.hostPayoutAccounts();
          setPayouts(payoutResponse?.hostPayoutAccounts ?? []);
        }
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchReportData();
    }
  }, [reportType, router.isReady, setToastData]);

  const summary = useMemo(() => {
    const ticketTotals = events.reduce(
      (acc, event) => {
        const stats = eventTicketStats(event);
        acc.sold += stats.sold;
        acc.capacity += stats.capacity;
        acc.gross += stats.gross;
        return acc;
      },
      { sold: 0, capacity: 0, gross: 0 }
    );
    return [
      { label: "Events", value: events.length.toString() },
      {
        label: "Drafts",
        value: events
          .filter((event) => normalizeStatus(event.status).includes("draft"))
          .length.toString(),
      },
      { label: "Tickets sold", value: ticketTotals.sold.toString() },
      { label: "Estimated gross", value: inrFormat(ticketTotals.gross) },
    ];
  }, [events]);

  const reportRows = useMemo(() => {
    if (reportType === "ticket-inventory" || reportType === "sales-estimate") {
      return events.flatMap((event) =>
        (event.tickets ?? []).map((ticket) => ({
          event: event.title || "Untitled event",
          ticket: ticket.ticketName || "Untitled ticket",
          status: (
            <Badge tone={ticket.ticketVisible === false ? "neutral" : "success"}>
              {ticket.ticketVisible === false ? "Hidden" : "Visible"}
            </Badge>
          ),
          capacity: Number(ticket.ticketCapacity ?? 0).toLocaleString("en-IN"),
          sold: Number(ticket.ticketSold ?? 0).toLocaleString("en-IN"),
          price: inrFormat(Number(ticket.ticketPrice ?? 0)),
          gross: inrFormat(
            Number(ticket.ticketSold ?? 0) * Number(ticket.ticketPrice ?? 0)
          ),
        }))
      );
    }

    if (reportType === "city-breakdown") {
      const grouped = events.reduce<Record<string, { count: number; sold: number }>>(
        (acc, event) => {
          const city = event.city || "City not set";
          const stats = eventTicketStats(event);
          acc[city] = acc[city] ?? { count: 0, sold: 0 };
          acc[city].count += 1;
          acc[city].sold += stats.sold;
          return acc;
        },
        {}
      );

      return Object.entries(grouped).map(([city, values]) => ({
        city,
        events: values.count.toLocaleString("en-IN"),
        sold: values.sold.toLocaleString("en-IN"),
      }));
    }

    if (reportType === "payout-readiness") {
      return payouts.map((payout) => ({
        entity: payout.entityName || "N/A",
        bank: payout.bankName || "N/A",
        account: payout.last4 ? `**** ${payout.last4}` : "N/A",
        primary: (
          <Badge tone={payout.isPrimary ? "info" : "neutral"}>
            {payout.isPrimary ? "Primary" : "Secondary"}
          </Badge>
        ),
        active: (
          <Badge tone={payout.isActive ? "success" : "neutral"}>
            {payout.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
        status: (
          <Badge tone={statusTone(payout.verificationStatus)}>
            {statusLabel(payout.verificationStatus)}
          </Badge>
        ),
      }));
    }

    const source =
      reportType === "draft-pipeline"
        ? events.filter((event) => normalizeStatus(event.status).includes("draft"))
        : events;

    return source.map((event) => {
      const stats = eventTicketStats(event);
      return {
        event: event.title || "Untitled event",
        status: (
          <Badge tone={statusTone(event.status)}>{statusLabel(event.status)}</Badge>
        ),
        city: event.city || "Not set",
        startDate: formatDate(event.startDate),
        visible: (
          <Badge tone={event.isVisible === false ? "neutral" : "success"}>
            {event.isVisible === false ? "Hidden" : "Visible"}
          </Badge>
        ),
        sold: stats.sold.toLocaleString("en-IN"),
        capacity: stats.capacity.toLocaleString("en-IN"),
        gross: inrFormat(stats.gross),
      };
    });
  }, [events, payouts, reportType]);

  const columns: ReportColumn[] = useMemo(() => {
    if (reportType === "ticket-inventory" || reportType === "sales-estimate") {
      return [
        { key: "event", label: "Event" },
        { key: "ticket", label: "Ticket" },
        { key: "status", label: "Visibility" },
        { key: "capacity", label: "Capacity", align: "right" },
        { key: "sold", label: "Sold", align: "right" },
        { key: "price", label: "Price", align: "right" },
        { key: "gross", label: "Estimated gross", align: "right" },
      ];
    }

    if (reportType === "city-breakdown") {
      return [
        { key: "city", label: "City" },
        { key: "events", label: "Events", align: "right" },
        { key: "sold", label: "Tickets sold", align: "right" },
      ];
    }

    if (reportType === "payout-readiness") {
      return [
        { key: "entity", label: "Entity" },
        { key: "bank", label: "Bank" },
        { key: "account", label: "Account" },
        { key: "primary", label: "Primary" },
        { key: "active", label: "Active" },
        { key: "status", label: "Verification" },
      ];
    }

    return [
      { key: "event", label: "Event" },
      { key: "status", label: "Status" },
      { key: "city", label: "City" },
      { key: "startDate", label: "Start date" },
      { key: "visible", label: "Visibility" },
      { key: "sold", label: "Tickets sold", align: "right" },
      { key: "capacity", label: "Capacity", align: "right" },
      { key: "gross", label: "Estimated gross", align: "right" },
    ];
  }, [reportType]);

  return (
    <div className="min-w-0">
      <Link
        href="/reports"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-owner-fg-3 hover:text-owner-blue-500"
      >
        <ChevronLeft size={16} />
        Reports
      </Link>

      <PageHeader
        title={config.title}
        subtitle={config.description}
        actions={
          <OwnerButton variant="secondary" leadingIcon={<Download size={16} />}>
            Download CSV
          </OwnerButton>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((metric) => (
          <StatTile key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      {loading ? (
        <Card className="flex h-56 items-center justify-center">
          <Loader2 className="animate-spin text-owner-blue-500" size={28} />
        </Card>
      ) : (
        <ReportTable columns={columns} rows={reportRows} />
      )}
    </div>
  );
};

ReportDetail.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default ReportDetail;

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
        PermissionTypeEnum.Reports
      );
      if (!canAccessMenu) {
        return {
          redirect: {
            destination: `/account/access-blocked?target=${PermissionTypeEnum.Reports}`,
            permanent: false,
          },
        };
      }
      return {
        props: {
          pagePath: context.query["reportType"]?.toString() ?? "",
        },
      };
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
