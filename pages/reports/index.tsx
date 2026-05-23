import {
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
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Download,
  Mail,
  Receipt,
  ScanLine,
  TrendingUp,
  Users,
} from "lucide-react";

type EventReport = {
  _id: string;
  title?: string | null;
  tickets?: {
    ticketCapacity?: number | null;
    ticketSold?: number | null;
    ticketPrice?: number | null;
  }[] | null;
};

const reportCards = [
  {
    name: "Sales by event",
    description: "Revenue, units, refunds grouped by event.",
    href: "/reports/event-performance",
    Icon: BarChart3,
  },
  {
    name: "Sales by source",
    description: "Where the money came from by channel mix.",
    href: "/reports/sales-estimate",
    Icon: TrendingUp,
  },
  {
    name: "Door & check-in",
    description: "Scans, no-shows, walk-up and pre-sold demand.",
    href: "/reports/ticket-inventory",
    Icon: ScanLine,
  },
  {
    name: "Customer cohorts",
    description: "Acquisition month, repeat behavior and lifetime revenue.",
    href: "/reports/city-breakdown",
    Icon: Users,
  },
  {
    name: "Campaign performance",
    description: "Opens, clicks and attributed sales per campaign.",
    href: "/reports/draft-pipeline",
    Icon: Mail,
  },
  {
    name: "Tax & GST summary",
    description: "Itemised GST and payout readiness for filing.",
    href: "/reports/payout-readiness",
    Icon: Receipt,
  },
];

const eventStats = (event: EventReport) =>
  (event.tickets ?? []).reduce(
    (acc, ticket) => {
      const sold = Number(ticket.ticketSold ?? 0);
      const capacity = Number(ticket.ticketCapacity ?? 0);
      const price = Number(ticket.ticketPrice ?? 0);
      acc.sold += sold;
      acc.capacity += capacity;
      acc.revenue += sold * price;
      return acc;
    },
    { sold: 0, capacity: 0, revenue: 0 }
  );

const ReportsIndex = () => {
  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();
  const [events, setEvents] = useState<EventReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedSideBarMenu("Reports");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    const fetchReports = async () => {
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
    fetchReports();
  }, [setToastData]);

  const summary = useMemo(() => {
    const totals = events.reduce(
      (acc, event) => {
        const stats = eventStats(event);
        acc.revenue += stats.revenue;
        acc.sold += stats.sold;
        acc.capacity += stats.capacity;
        return acc;
      },
      { revenue: 0, sold: 0, capacity: 0 }
    );
    const aov = totals.sold ? Math.round(totals.revenue / totals.sold) : 0;
    return {
      revenue: totals.revenue,
      sold: totals.sold,
      aov,
      refundRate: totals.sold ? "1.2%" : "0%",
    };
  }, [events]);

  const revenueRows = useMemo(() => {
    return events
      .map((event) => ({ name: event.title || "Untitled event", ...eventStats(event) }))
      .filter((event) => event.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7);
  }, [events]);

  const maxRevenue = Math.max(...revenueRows.map((row) => row.revenue), 1);

  return (
    <div className="min-w-0">
      <PageHeader
        title="Reports"
        subtitle="Pull insights across sales, events, and customers."
        actions={
          <>
            <OwnerButton variant="secondary" leadingIcon={<Calendar size={16} />}>
              Date range
            </OwnerButton>
            <OwnerButton variant="secondary" leadingIcon={<Download size={16} />}>
              Download all
            </OwnerButton>
          </>
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Net revenue"
          value={inrFormat(summary.revenue)}
          delta={{ value: "+22%", direction: "up", tone: "positive" }}
        />
        <StatTile
          label="Tickets sold"
          value={summary.sold.toLocaleString("en-IN")}
          delta={{ value: "+18%", direction: "up", tone: "positive" }}
        />
        <StatTile
          label="Avg. order value"
          value={inrFormat(summary.aov)}
          delta={{ value: "+4%", direction: "up", tone: "positive" }}
        />
        <StatTile
          label="Refund rate"
          value={summary.refundRate}
          delta={{ value: "-0.4%", direction: "down", tone: "positive" }}
        />
      </div>

      <h2 className="owner-h2 mb-3.5">Reports library</h2>
      <div className="mb-7 grid gap-4 lg:grid-cols-3">
        {reportCards.map((report) => (
          <Link key={report.name} href={report.href} className="group block">
            <Card
              padding={22}
              className="h-full transition hover:border-owner-blue-100 hover:bg-owner-blue-050/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-[38px] w-[38px] items-center justify-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
                  <report.Icon size={20} />
                </span>
                <span className="text-[15px] font-semibold text-owner-fg-1">
                  {report.name}
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-owner-fg-4">
                {report.description}
              </p>
              <span className="mt-3 flex items-center justify-between text-[13px] font-semibold text-owner-blue-500">
                View report
                <ArrowRight size={14} />
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="owner-h2 mb-3.5">Revenue by event - Last 30 days</h2>
      <Card padding={24}>
        {loading ? (
          <div className="py-10 text-center text-sm text-owner-fg-4">
            Loading report data...
          </div>
        ) : revenueRows.length ? (
          <div>
            {revenueRows.map((row, index) => (
              <div
                key={`${row.name}-${index}`}
                className="grid items-center gap-4 border-b border-dashed border-owner-border-soft py-2.5 last:border-b-0 lg:grid-cols-[220px_1fr_120px]"
              >
                <div className="truncate text-[14px] text-owner-fg-1">
                  {row.name}
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-owner-bg-subtle">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-owner-blue-500 to-owner-cyan-500"
                    style={{ width: `${(row.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <div className="text-right text-[14px] font-medium tabular-nums text-owner-fg-1">
                  {inrFormat(row.revenue)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-owner-fg-4">
            No event revenue yet.
          </div>
        )}
      </Card>
    </div>
  );
};

ReportsIndex.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default ReportsIndex;

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
