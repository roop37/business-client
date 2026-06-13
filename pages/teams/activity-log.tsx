import {
  Badge,
  PageHeader,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { PermissionTypeEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import {
  fetchActivityLogs,
  type ActivityLogRow,
} from "@/utils/activityLogClient";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { GetServerSideProps } from "next";
import React, { useEffect, useMemo, useState } from "react";

type NextPageWithLayout = React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

const PAGE_SIZE = 25;

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

// Server sends ActivityActionType enum KEYS (e.g. "OFFLINE_TICKET_ISSUED").
const actionLabel = (action: string): { label: string; tone: BadgeTone } => {
  switch (action) {
    case "OFFLINE_TICKET_ISSUED":
      return { label: "Ticket issued", tone: "success" };
    case "OFFLINE_PAYMENT_LINK_CREATED":
      return { label: "Payment link sent", tone: "warning" };
    case "TEAM_UPDATED":
      return { label: "Team updated", tone: "info" };
    case "USER_LOGIN":
      return { label: "Login", tone: "neutral" };
    case "USER_LOGOUT":
      return { label: "Logout", tone: "neutral" };
    case "HOST_SETTINGS_UPDATED":
      return { label: "Settings updated", tone: "info" };
    case "EVENT_CREATED":
      return { label: "Event created", tone: "success" };
    case "EVENT_UPDATED":
      return { label: "Event updated", tone: "info" };
    case "EVENT_PUBLISHED":
      return { label: "Event published", tone: "success" };
    case "EVENT_CANCELLED":
      return { label: "Event cancelled", tone: "danger" };
    case "PAYOUT_ADDED":
      return { label: "Payout added", tone: "info" };
    case "PAYOUT_VERIFIED":
      return { label: "Payout verified", tone: "success" };
    case "PAYOUT_REJECTED":
      return { label: "Payout rejected", tone: "danger" };
    default:
      return {
        label: action
          .toLowerCase()
          .split("_")
          .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
          .join(" "),
        tone: "neutral",
      };
  }
};

const ActivityLogPage: NextPageWithLayout = () => {
  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();

  const [rows, setRows] = useState<ActivityLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    setSelectedSideBarMenu("Activity Log");
  }, [setSelectedSideBarMenu]);

  // Debounce the search box so we don't fire a query per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetchActivityLogs(
          { pageNumber: page, rowsPerPage: PAGE_SIZE },
          undefined,
          { key: "createdAt", sortType: "Desc" },
          debouncedSearch || undefined
        );
        if (cancelled) return;
        setRows(res.activityLogs);
        setTotal(res.total);
      } catch (error) {
        if (cancelled) return;
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, setToastData]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  const columnHelper = createColumnHelper<ActivityLogRow>();
  const columns: ColumnDef<ActivityLogRow, any>[] = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        header: "When",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={fmtDate(row.original.createdAt)} />
        ),
      }),
      columnHelper.accessor("performedBy", {
        header: "Who",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell
            className="font-semibold"
            value={row.original.performedBy || "Unknown"}
          />
        ),
      }),
      columnHelper.accessor("actionType", {
        header: "Action",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => {
          const action = actionLabel(row.original.actionType);
          return <Badge tone={action.tone}>{action.label}</Badge>;
        },
      }),
      columnHelper.accessor("description", {
        header: "Details",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => <DataTableTextCell value={row.original.description} />,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper]
  );

  return (
    <div className="min-w-0">
      <PageHeader
        title="Activity Log"
        subtitle="See offline-ticket activity performed on your events by your team members and by collaborating organizations."
      />

      <DataTable
        totalRows={total}
        columns={columns}
        data={rows}
        loading={loading}
        manualPagination={true}
        hideDownloadButton
        pageSize={PAGE_SIZE}
        pageCount={totalPages}
        nextPage={() => {
          if (page < totalPages) setPage((p) => p + 1);
        }}
        prevPage={() => {
          if (page > 1) setPage((p) => p - 1);
        }}
        paginationData={{ pageIndex: page - 1, pageSize: PAGE_SIZE }}
        searchFilter={search}
        setSearchFilter={(value) => {
          setSearch(value);
        }}
      />
    </div>
  );
};

ActivityLogPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default ActivityLogPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  const tokenExists = cookieHeader.includes("accessToken=");

  if (!tokenExists) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  try {
    const [userResponse, journeyResponse] = await Promise.all([
      sdk.MeCheckUser(
        {},
        { cookie: context.req.headers.cookie?.toString() ?? "" }
      ),
      sdk.MeUserJourney(
        {},
        { cookie: context.req.headers.cookie?.toString() ?? "" }
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
      const { permissions } = userResponse.meUser;
      // Mirror the resolver guard: getActivityLogs requires UpdateHost.
      const canAccessMenu = hasAccess(permissions, PermissionTypeEnum.UpdateHost);

      if (!canAccessMenu) {
        return {
          redirect: {
            destination: `/account/access-blocked?target=${PermissionTypeEnum.UpdateHost}`,
            permanent: false,
          },
        };
      }

      return { props: {} };
    }

    return {
      redirect: { destination: "/login", permanent: false },
    };
  } catch {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }
};
