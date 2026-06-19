import {
  Badge,
  PageHeader,
  PillTabs,
} from "@/components/common/owner";
import {
  getPresetRange,
  RANGE_PRESETS,
  ReportView,
  type HostReportData,
  type ReportRangePreset,
} from "@/components/common/reports";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { PermissionTypeEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Clock, Loader2 } from "lucide-react";

type ReportConfig = { type: string; title: string; description: string };

const REPORTS: Record<string, ReportConfig> = {
  "sales-summary": {
    type: "SALES_SUMMARY",
    title: "Sales Summary",
    description:
      "Net ticket sales, total collected, tickets and AOV — with daily trend and breakdowns by event, ticket type and source.",
  },
  orders: {
    type: "ORDERS",
    title: "Orders",
    description:
      "Every paid order with gross, discount, net, ticket GST, fees and total collected.",
  },
  "ticket-sales-by-type": {
    type: "TICKET_SALES_BY_TYPE",
    title: "Ticket Sales by Type",
    description: "Units sold and gross revenue per ticket type.",
  },
  refunds: {
    type: "REFUNDS",
    title: "Refunds & Cancellations",
    description: "Refunded and cancelled orders with amounts, status and dates.",
  },
  discounts: {
    type: "DISCOUNTS",
    title: "Discounts / Promo Codes",
    description: "Coupon usage, amount discounted and net sales driven.",
  },
  "taxes-gst": {
    type: "TAXES_GST",
    title: "Taxes & GST",
    description:
      "Ticket GST collected (pass-through to the organiser) and Hoizr fee GST, by rate.",
  },
  "add-ons": {
    type: "ADDONS",
    title: "Add-ons & Upsells",
    description: "Add-on quantity, gross revenue and attach rate.",
  },
  "payouts-settlement": {
    type: "PAYOUTS_SETTLEMENT",
    title: "Payouts & Settlement",
    description:
      "Per-event settlements — gross, commission, ticket GST, refunds, net payout and status, with scheduled and paid dates.",
  },
  "campaign-performance": {
    type: "CAMPAIGN_PERFORMANCE",
    title: "Campaign Performance",
    description:
      "Email campaign reach (sent, delivered, opened, clicked) and attributed net ticket sales.",
  },
  "customers-fans": {
    type: "CUSTOMERS_FANS",
    title: "Customers / Fans",
    description:
      "Your buyers — orders, tickets, net spend, new vs returning, and top fans.",
  },
  "check-in": {
    type: "CHECK_IN",
    title: "Check-in Report",
    description:
      "Tickets sold vs checked in, check-in rate and not-checked-in counts, per event.",
  },
  "door-offline": {
    type: "DOOR_OFFLINE",
    title: "Door & Offline Sales",
    description:
      "Online vs offline (issued / payment link) split — orders, tickets and net sales by channel.",
  },
  "artist-collaborator": {
    type: "ARTIST_COLLAB",
    title: "Artist & Collaborator Performance",
    description:
      "Events, tickets and associated net sales per artist (platform + phantom) and per collaborator, plus the top artists on Hoizr by events played.",
  },
  guestlist: {
    type: "GUESTLIST",
    title: "Guestlist Report",
    description:
      "Guestlist entries, accepted golden tickets, pending approvals, admitted (checked-in) and revoked — per event.",
  },
  "website-funnel": {
    type: "WEBSITE_FUNNEL",
    title: "Website & Funnel",
    description:
      "Booking funnel — ticket selected → payment started → order placed — with cart-to-order conversion, payment drop-off, traffic sources and devices.",
  },
  "event-comparison": {
    type: "EVENT_COMPARISON",
    title: "Event Comparison",
    description:
      "All your events side by side (all-time): capacity, sold, sell-through, net sales and AOV.",
  },
  "predicted-sellout": {
    type: "PREDICTED_SELLOUT",
    title: "Predicted Sellout",
    description:
      "Upcoming events projected to capacity using the current 7-day sales velocity.",
  },
  "ai-insights": {
    type: "AI_INSIGHTS",
    title: "Insights",
    description:
      "Automatic observations about what's driving your sales in the selected range.",
  },
};

const BackLink = () => (
  <Link
    href="/reports"
    className="group inline-flex items-center gap-1 text-[13px] text-owner-fg-3 hover:text-owner-blue-500"
  >
    <ChevronLeft size={16} className="transition group-hover:-translate-x-0.5" />
    All reports
  </Link>
);

const ReportDetail = () => {
  const router = useRouter();
  const slug = String(router.query.reportType ?? "");
  const config = REPORTS[slug];

  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();
  const { meUser } = useUserStore();

  const [preset, setPreset] = useState<ReportRangePreset>("last30");
  const [data, setData] = useState<HostReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const canDownload = useMemo(
    () => hasAccess(meUser?.permissions ?? [], PermissionTypeEnum.DownloadReports),
    [meUser?.permissions]
  );

  useEffect(() => {
    setSelectedSideBarMenu("Reports");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }
    let active = true;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const { startDate, endDate } = getPresetRange(preset);
        const res: any = await sdk.getHostReport({
          input: { type: config.type, startDate, endDate },
        });
        if (active) setData(res?.getHostReport ?? null);
      } catch (error) {
        if (active)
          setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchReport();
    return () => {
      active = false;
    };
  }, [config, preset, setToastData]);

  if (!config) {
    return (
      <div className="min-w-0">
        <BackLink />
        <div className="mt-6 rounded-owner-md border border-dashed border-owner-border bg-owner-bg-subtle px-5 py-12 text-center text-[14px] text-owner-fg-4">
          Unknown report.
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <BackLink />
      <PageHeader
        title={config.title}
        subtitle={config.description}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {data?.freshnessLabel ? (
              <Badge tone="neutral" icon={<Clock size={12} />}>
                {data.freshnessLabel}
              </Badge>
            ) : null}
            <PillTabs tabs={RANGE_PRESETS} value={preset} onChange={setPreset} />
          </div>
        }
      />

      <div className="mt-6">
        {loading ? (
          <div className="flex h-[320px] items-center justify-center">
            <Loader2 className="animate-spin text-owner-blue-500" size={34} />
          </div>
        ) : data ? (
          <ReportView
            data={data}
            fileNamePrefix={config.title.replace(/\s+/g, "_")}
            canDownload={canDownload}
          />
        ) : (
          <div className="rounded-owner-md border border-dashed border-owner-border bg-owner-bg-subtle px-5 py-12 text-center text-[14px] text-owner-fg-4">
            No data for this report in the selected range.
          </div>
        )}
      </div>
    </div>
  );
};

ReportDetail.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default ReportDetail;

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
