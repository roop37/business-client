import { Card, PageHeader, StatTile } from "@/components/common/owner";
import {
  formatReportValue,
  getPresetRange,
  type HostReportData,
} from "@/components/common/reports";
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
  Globe,
  Megaphone,
  Receipt,
  ScanLine,
  Sparkles,
  Users,
} from "lucide-react";

type ReportLink = { name: string; slug: string };
type ReportGroup = {
  title: string;
  description: string;
  Icon: typeof BarChart3;
  available: boolean;
  reports: ReportLink[];
};

const GROUPS: ReportGroup[] = [
  {
    title: "Sales & Tickets",
    description: "Understand ticket revenue and ticket movement.",
    Icon: BarChart3,
    available: true,
    reports: [
      { name: "Sales Summary", slug: "sales-summary" },
      { name: "Orders", slug: "orders" },
      { name: "Ticket Sales by Type", slug: "ticket-sales-by-type" },
      { name: "Refunds & Cancellations", slug: "refunds" },
      { name: "Discounts / Promo Codes", slug: "discounts" },
      { name: "Add-ons & Upsells", slug: "add-ons" },
    ],
  },
  {
    title: "Payouts & Settlement",
    description: "What was collected, deducted and paid out.",
    Icon: Receipt,
    available: true,
    reports: [{ name: "Payouts & Settlement", slug: "payouts-settlement" }],
  },
  {
    title: "Marketing",
    description: "Campaign performance and attributed ticket sales.",
    Icon: Megaphone,
    available: true,
    reports: [
      { name: "Campaign Performance", slug: "campaign-performance" },
      { name: "Campaign ROI", slug: "campaign-roi" },
      { name: "Automation Performance", slug: "automation-performance" },
    ],
  },
  {
    title: "Fans",
    description: "Your audience, top fans and repeat buyers.",
    Icon: Users,
    available: true,
    reports: [{ name: "Customers / Fans", slug: "customers-fans" }],
  },
  {
    title: "Event Operations",
    description: "Check-ins, guestlist, door sales and line-up performance.",
    Icon: ScanLine,
    available: true,
    reports: [
      { name: "Check-in Report", slug: "check-in" },
      { name: "Comp & No-show", slug: "comp-noshow" },
      { name: "Guestlist Report", slug: "guestlist" },
      { name: "Door & Offline Sales", slug: "door-offline" },
      { name: "Artist & Collaborator Performance", slug: "artist-collaborator" },
    ],
  },
  {
    title: "Website & Funnel",
    description: "Traffic and how visitors move from ticket select to paid.",
    Icon: Globe,
    available: true,
    reports: [
      { name: "Website Metrics", slug: "website-metrics" },
      { name: "Booking Funnel", slug: "website-funnel" },
    ],
  },
  {
    title: "Advanced",
    description: "Compare events, project sell-out, and surface insights.",
    Icon: Sparkles,
    available: true,
    reports: [
      { name: "Event Comparison", slug: "event-comparison" },
      { name: "Predicted Sellout", slug: "predicted-sellout" },
      { name: "Insights", slug: "ai-insights" },
    ],
  },
];

const KPI_KEYS = ["netTicketSales", "ticketsSold", "orders", "aov"];

const ReportsIndex = () => {
  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();
  const [summary, setSummary] = useState<HostReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedSideBarMenu("Reports");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { startDate, endDate } = getPresetRange("last30");
        const res: any = await sdk.getHostReport({
          input: { type: "SALES_SUMMARY", startDate, endDate },
        });
        setSummary(res?.getHostReport ?? null);
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setToastData]);

  const kpis = useMemo(() => {
    const byKey = new Map((summary?.metrics ?? []).map((m) => [m.key, m]));
    return KPI_KEYS.map((key) => byKey.get(key)).filter(Boolean);
  }, [summary]);

  return (
    <div className="min-w-0">
      <PageHeader
        title="Reports"
        subtitle="What sold, who bought, where they came from, and how much is ready to settle."
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <Card key={i} className="h-[92px] animate-pulse bg-owner-bg-subtle" />
            ))
          : kpis.map((m) => (
              <StatTile
                key={m!.key}
                label={`${m!.label} · last 30 days`}
                value={formatReportValue(m!.value, m!.valueType)}
              />
            ))}
      </div>

      <h2 className="owner-h2 mb-3.5">Report library</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {GROUPS.map((group) => (
          <Card key={group.title} padding={22} className="h-full">
            <div className="flex items-center gap-3">
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
                <group.Icon size={20} />
              </span>
              <div>
                <div className="text-[15px] font-semibold text-owner-fg-1">
                  {group.title}
                </div>
                {!group.available ? (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-owner-fg-4">
                    Coming soon
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-6 text-owner-fg-4">
              {group.description}
            </p>
            <div className="mt-4 space-y-1.5">
              {group.reports.map((report) =>
                group.available ? (
                  <Link
                    key={report.name}
                    href={`/reports/${report.slug}`}
                    className="flex items-center justify-between rounded-owner-sm px-2 py-1.5 text-[13.5px] text-owner-fg-2 transition hover:bg-owner-blue-050/50 hover:text-owner-blue-500"
                  >
                    {report.name}
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <div
                    key={report.name}
                    className="flex items-center justify-between px-2 py-1.5 text-[13.5px] text-owner-fg-4/70"
                  >
                    {report.name}
                  </div>
                )
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

ReportsIndex.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default ReportsIndex;

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
      if (
        !hasAccess(userResponse.meUser.permissions, PermissionTypeEnum.Reports)
      ) {
        return {
          redirect: {
            destination: `/account/access-blocked?target=${PermissionTypeEnum.Reports}`,
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
