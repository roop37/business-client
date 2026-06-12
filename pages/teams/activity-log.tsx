import {
  Badge,
  OwnerButton,
  OwnerTable,
  PageHeader,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import EmptyStateView from "@/components/common/emptyTableView/emptyTableView";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-w-0">
      <PageHeader
        title="Activity Log"
        subtitle="See offline-ticket activity performed on your events by your team members and by collaborating organizations."
      />

      <OwnerTable
        rowCount={rows.length}
        loading={loading}
        empty={
          <EmptyStateView
            title="No activity yet. Actions performed on your events will appear here."
          />
        }
        className="mb-6"
      >
        <OwnerTable.Toolbar>
          <OwnerTable.SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by person, action, or description"
            className="flex-1"
          />
        </OwnerTable.Toolbar>

        <OwnerTable.Head>
          <OwnerTable.HeaderCell width="20%">When</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell width="20%">Who</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell width="18%">Action</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Details</OwnerTable.HeaderCell>
        </OwnerTable.Head>

        <OwnerTable.Body>
          {rows.map((row) => {
            const action = actionLabel(row.actionType);
            return (
              <OwnerTable.Row key={row._id}>
                <OwnerTable.Cell muted>{fmtDate(row.createdAt)}</OwnerTable.Cell>
                <OwnerTable.Cell bold>
                  {row.performedBy || "Unknown"}
                </OwnerTable.Cell>
                <OwnerTable.Cell>
                  <Badge tone={action.tone}>{action.label}</Badge>
                </OwnerTable.Cell>
                <OwnerTable.Cell muted>{row.description}</OwnerTable.Cell>
              </OwnerTable.Row>
            );
          })}
        </OwnerTable.Body>

        <OwnerTable.Footer
          summary={
            total === 0
              ? "No entries"
              : `Showing ${rangeStart.toLocaleString(
                  "en-IN"
                )}–${rangeEnd.toLocaleString("en-IN")} of ${total.toLocaleString(
                  "en-IN"
                )}`
          }
        >
          <div className="flex items-center gap-2">
            <OwnerButton
              variant="secondary"
              size="sm"
              disabled={loading || page <= 1}
              leadingIcon={<ChevronLeft size={16} />}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </OwnerButton>
            <span className="text-[13px] text-owner-fg-4">
              Page {page} of {totalPages}
            </span>
            <OwnerButton
              variant="secondary"
              size="sm"
              disabled={loading || page >= totalPages}
              trailingIcon={<ChevronRight size={16} />}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </OwnerButton>
          </div>
        </OwnerTable.Footer>
      </OwnerTable>
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
