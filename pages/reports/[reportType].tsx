import {
  PageHeader,
  PillTabs,
} from "@/components/common/owner";
import {
  getPresetRange,
  getPreviousPeriod,
  RANGE_PRESETS,
  ReportTable,
  ReportView,
  type HostReportData,
  type ReportRangePreset,
  type ReportTableData,
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Loader2, X } from "lucide-react";

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
  "campaign-roi": {
    type: "CAMPAIGN_ROI",
    title: "Campaign ROI",
    description:
      "Paid campaigns (WhatsApp / SMS / Push): credits spent vs attributed net sales and net-sales-per-credit. Email is free — see Campaign Performance.",
  },
  "automation-performance": {
    type: "AUTOMATION_PERFORMANCE",
    title: "Automation Performance",
    description:
      "Per automation (abandoned-cart retargeting, selling-fast alerts): whether it's on, messages sent, and attributed orders + net sales.",
  },
  "comp-noshow": {
    type: "COMP_NOSHOW",
    title: "Comp & No-show",
    description:
      "Complimentary tickets you issued for free, and guests who bought a ticket but never checked in — measured across events that have already finished.",
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
      "Events, tickets and associated net sales for each artist (platform + off-platform) and each collaborator on your events.",
  },
  guestlist: {
    type: "GUESTLIST",
    title: "Guestlist Report",
    description:
      "Guestlist entries, accepted golden tickets, pending approvals, admitted (checked-in) and revoked — per event.",
  },
  "website-metrics": {
    type: "WEBSITE_METRICS",
    title: "Website Metrics",
    description:
      "Traffic sources, devices and engagement (carts created, payment starts) for your event pages.",
  },
  "website-funnel": {
    type: "WEBSITE_FUNNEL",
    title: "Booking Funnel",
    description:
      "Ticket selected → payment started → order placed, with cart-to-order conversion and payment drop-off.",
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

  const { setSelectedSideBarMenu, setToastData, openOrderReceipt } =
    useGlobalStore();
  const { meUser } = useUserStore();

  const [preset, setPreset] = useState<ReportRangePreset>("last30");
  const [data, setData] = useState<HostReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoTable, setPromoTable] = useState<ReportTableData | null>(null);
  const [eventId, setEventId] = useState<string>("");
  const [events, setEvents] = useState<
    { _id: string; title?: string | null; status?: string | null }[]
  >([]);

  const canDownload = useMemo(
    () => hasAccess(meUser?.permissions ?? [], PermissionTypeEnum.DownloadReports),
    [meUser?.permissions]
  );

  // Row clicks: "order:<id>" opens the order receipt; "promo:<code>" opens a
  // drill-down modal listing who used that code.
  const handleRowAction = useCallback(
    async (action: string) => {
      if (action.startsWith("order:")) {
        const id = action.slice("order:".length);
        if (id) openOrderReceipt(id);
        return;
      }
      if (action.startsWith("promo:")) {
        const code = action.slice("promo:".length);
        try {
          const { startDate, endDate } = getPresetRange(preset);
          const res: any = await sdk.getHostPromoUsage({
            input: { code, startDate, endDate, ...(eventId ? { eventId } : {}) },
          });
          setPromoTable(res?.getHostPromoUsage ?? null);
        } catch (error) {
          setToastData({ type: "error", message: extractErrorMessage(error) });
        }
      }
    },
    [preset, eventId, openOrderReceipt, setToastData]
  );

  useEffect(() => {
    setSelectedSideBarMenu("Reports");
  }, [setSelectedSideBarMenu]);

  // Seed the event filter from the URL (?eventId=) when arriving via an event's
  // "See sales/marketing report" link, so the report scopes + attributes to
  // that event instead of all events. Runs once the router query hydrates;
  // the picker can still change it afterwards.
  useEffect(() => {
    if (!router.isReady) return;
    const qid = router.query.eventId;
    const id = Array.isArray(qid) ? qid[0] : qid;
    if (id) setEventId(String(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Master event filter — load the host's non-draft events for the picker.
  useEffect(() => {
    (async () => {
      try {
        const res: any = await sdk.getMyEvents();
        const list = (res?.getMyEvents ?? []).filter((e: any) => {
          const s = String(e.status ?? "").toUpperCase();
          return s !== "DRAFT" && s !== "CANCELLED" && s !== "ARCHIVED";
        });
        setEvents(list);
      } catch {
        /* picker is optional — ignore failures */
      }
    })();
  }, []);

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
        const prev = getPreviousPeriod(preset);
        const res: any = await sdk.getHostReport({
          input: {
            type: config.type,
            startDate,
            endDate,
            // Always send the previous period; reports that compute trends
            // (Sales Summary) light up deltas, others ignore it.
            compareStartDate: prev.startDate,
            compareEndDate: prev.endDate,
            ...(eventId ? { eventId } : {}),
          },
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
  }, [config, preset, eventId, setToastData]);

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
            {events.length ? (
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                aria-label="Filter by event"
                className="h-9 max-w-[220px] rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] font-medium text-owner-fg-1 focus:outline-none focus:ring-2 focus:ring-owner-blue-200"
              >
                <option value="">All events</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title || "Untitled event"}
                  </option>
                ))}
              </select>
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
            onRowAction={handleRowAction}
          />
        ) : (
          <div className="rounded-owner-md border border-dashed border-owner-border bg-owner-bg-subtle px-5 py-12 text-center text-[14px] text-owner-fg-4">
            No data for this report in the selected range.
          </div>
        )}
      </div>

      {promoTable ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPromoTable(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-owner-lg bg-owner-bg p-4 shadow-owner-dropdown"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-owner-fg-1">
                {promoTable.title}
              </h3>
              <button
                type="button"
                onClick={() => setPromoTable(null)}
                className="rounded-owner-sm p-1 text-owner-fg-3 hover:bg-owner-bg-subtle"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <ReportTable
              table={promoTable}
              fileName="promo_usage"
              canDownload={canDownload}
              onRowAction={handleRowAction}
            />
          </div>
        </div>
      ) : null}
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
