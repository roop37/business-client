import {
  Badge,
  type BadgeTone,
  inrFormat,
  OwnerButton,
  PageHeader,
  StatTile,
} from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { PermissionTypeEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Copy, ScanLine, ShieldCheck, Smartphone } from "lucide-react";
import { FiSettings } from "react-icons/fi";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type EventRow = {
  _id: string;
  title?: string | null;
  status?: string | null;
  startDate?: string | null;
  city?: string | null;
  eventFlyer?: string | null;
  capacity?: number | null;
  ticketSold?: number | null;
};

const formatEventDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

type ScannerCount = {
  active: number;
  total: number;
};

const ScannersIndex: React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
} = () => {
  const router = useRouter();
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, ScannerCount>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await sdk.getMyEvents();
      const list: EventRow[] = response?.getMyEvents ?? [];
      setEvents(list);

      // Fan out scanner counts in parallel — this is fine for a typical
      // host (≤30 events). If a host has hundreds of events we should
      // add a `getMyScannerSummary` aggregate query.
      const upcoming = list
        .filter((e) =>
          ["LIVE", "PUBLISHED", "DRAFT"].includes(
            (e.status ?? "").toUpperCase()
          )
        )
        .slice(0, 50);

      const entries = await Promise.all(
        upcoming.map(async (event) => {
          try {
            const res: any = await sdk.listScannersForEvent({
              eventId: event._id,
            });
            const all = res?.listScannersForEvent ?? [];
            const active = all.filter((s: any) => s.isActive).length;
            return [event._id, { total: all.length, active }] as const;
          } catch {
            return [event._id, { total: 0, active: 0 }] as const;
          }
        })
      );
      setCounts(Object.fromEntries(entries));
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [setToastData]);

  useEffect(() => {
    setSelectedSideBarMenu("Scanners");
    load();
  }, [load, setSelectedSideBarMenu]);

  const summary = useMemo(() => {
    const list = Object.values(counts);
    const totalActive = list.reduce((s, c) => s + c.active, 0);
    const totalScanners = list.reduce((s, c) => s + c.total, 0);
    const eventsWithAtLeastOne = list.filter((c) => c.total > 0).length;
    return { totalActive, totalScanners, eventsWithAtLeastOne };
  }, [counts]);

  const visibleEvents = useMemo(
    () =>
      events.filter((e) =>
        ["LIVE", "PUBLISHED", "DRAFT"].includes(
          (e.status ?? "").toUpperCase()
        )
      ),
    [events]
  );

  const columnHelper = createColumnHelper<EventRow>();
  const columns: ColumnDef<EventRow, any>[] = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Event",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {/* Compact event-flyer thumbnail (falls back to the scan icon
                when an event has no flyer). */}
            {row.original.eventFlyer ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.original.eventFlyer}
                alt={row.original.title || "Event"}
                className="h-9 w-9 shrink-0 rounded-owner-md object-cover"
              />
            ) : (
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-owner-md text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #0F8842 0%, #16A150 100%)",
                }}
              >
                <ScanLine size={15} />
              </div>
            )}
            <div className="flex flex-col">
              <DataTableTextCell
                className="cursor-pointer font-semibold"
                onClick={() =>
                  router.push(`/events/${row.original._id}/scanners`)
                }
                value={row.original.title || "Untitled Event"}
              />
              {row.original.city ? (
                <span className="text-[12px] text-owner-fg-4">
                  {row.original.city}
                </span>
              ) : null}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("startDate", {
        header: "Date & time",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell value={formatEventDate(row.original.startDate)} />
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          const status = (row.original.status ?? "").toUpperCase();
          const tone: BadgeTone =
            status === "PUBLISHED" || status === "LIVE"
              ? "success"
              : status === "DRAFT"
              ? "neutral"
              : "info";
          return (
            <Badge tone={tone}>
              {status === "PUBLISHED"
                ? "Live"
                : status.charAt(0) + status.slice(1).toLowerCase()}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("capacity", {
        header: "Capacity",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {row.original.ticketSold ?? 0} / {row.original.capacity ?? "—"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "scanners",
        header: "Scanners",
        cell: ({ row }) => {
          const count = counts[row.original._id];
          if (!count) return <span className="text-owner-fg-4">—</span>;
          return (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-owner-fg-1">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  count.active > 0
                    ? "bg-owner-success-text"
                    : "bg-owner-fg-4"
                }`}
              />
              {count.active} active{" "}
              <span className="text-owner-fg-4">/ {count.total}</span>
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Manage",
        cell: ({ row }) => (
          <TooltipProvider>
            <div className="flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger>
                  <FiSettings
                    className="text-primary text-lg cursor-pointer"
                    onClick={() =>
                      router.push(`/events/${row.original._id}/scanners`)
                    }
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-xs">
                  <p>Manage scanners</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper, counts, router]
  );

  const copyInviteLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const url =
          typeof window !== "undefined"
            ? `${window.location.origin}/scanners/invite`
            : "";
        await navigator.clipboard.writeText(url);
        setToastData({ type: "success", message: "Invite link copied" });
      }
    } catch {
      setToastData({
        type: "warning",
        message: "Could not copy. Open the event to invite scanners.",
      });
    }
  };

  return (
    <div className="font-owner text-owner-fg-1">
      <PageHeader
        title="Scanners"
        subtitle="Devices and operators that scan tickets at the door across all your events."
        actions={
          <>
            <OwnerButton
              variant="secondary"
              leadingIcon={<Copy size={14} />}
              onClick={copyInviteLink}
            >
              Copy invite link
            </OwnerButton>
            <OwnerButton
              variant="primary"
              leadingIcon={<ScanLine size={14} />}
              onClick={() => router.push("/events")}
            >
              Open an event
            </OwnerButton>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Active scanners"
          value={`${summary.totalActive}`}
          hint={`${summary.totalScanners} total provisioned`}
        />
        <StatTile
          label="Events with scanners"
          value={`${summary.eventsWithAtLeastOne}`}
          hint={`${visibleEvents.length} live or upcoming events`}
        />
        <StatTile
          label="Avg per event"
          value={
            summary.eventsWithAtLeastOne
              ? (summary.totalScanners / summary.eventsWithAtLeastOne).toFixed(
                  1
                )
              : "0"
          }
          hint="Door + back door + VIP combined"
        />
      </div>

      <DataTable
        totalRows={visibleEvents.length}
        columns={columns}
        data={visibleEvents}
        loading={loading}
        manualPagination={false}
        hideDownloadButton
        pageSize={10}
      />

      {/* Bottom info banner */}
      <div
        className="mt-6 flex flex-col items-start justify-between gap-4 rounded-owner-lg border bg-owner-blue-050 px-6 py-5 sm:flex-row sm:items-center"
        style={{ borderColor: "var(--owner-blue-100)" }}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-owner-md bg-owner-blue-100 text-owner-blue-500">
            <Smartphone size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-owner-fg-1">
              Bring your own phone. Scan in seconds.
            </p>
            <p className="text-[12.5px] text-owner-fg-3">
              The Hoizr Scanner app works on any iOS / Android phone with a
              camera. No Bluetooth scanner required.
            </p>
          </div>
        </div>
        <OwnerButton
          variant="primary"
          leadingIcon={<ShieldCheck size={14} />}
        >
          Open scanner app
        </OwnerButton>
      </div>

      {summary.totalScanners > 0 ? (
        <div className="mt-3 text-right text-[11.5px] text-owner-fg-4">
          Sales fired through scanned tickets:{" "}
          {inrFormat(
            visibleEvents.reduce(
              (s, e) => s + Number(e.ticketSold ?? 0) * 1500,
              0
            )
          )}{" "}
          (estimate)
        </div>
      ) : null}
    </div>
  );
};

ScannersIndex.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default ScannersIndex;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
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
    const me = userResponse?.meUser;
    if (!me) {
      return { redirect: { destination: "/login", permanent: false } };
    }
    if (
      !hasAccess(me.permissions, PermissionTypeEnum.Events)
    ) {
      return {
        redirect: {
          destination: `/account/access-blocked?target=${PermissionTypeEnum.Events}`,
          permanent: false,
        },
      };
    }
    return { props: {} };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};
