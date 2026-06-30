import {
  Badge,
  type BadgeTone,
  OwnerButton,
  PageHeader,
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
import CouponEditor from "@/components/modules/coupons/CouponEditor";
import CouponDetailModal from "@/components/modules/coupons/CouponDetailModal";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import {
  deleteCoupon,
  fetchEventsForCoupons,
  fetchMyCoupons,
  toggleCouponActive,
  type Coupon,
} from "@/utils/couponClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Plus, RefreshCcw } from "lucide-react";
import { FiInfo } from "react-icons/fi";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { TbPower } from "react-icons/tb";
import { GetServerSideProps } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";

const fmtDate = (v?: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
};

const statusOf = (c: Coupon): { label: string; tone: BadgeTone } => {
  const now = Date.now();
  if (!c.isActive) return { label: "Inactive", tone: "neutral" };
  if (now < new Date(c.startDate).getTime())
    return { label: "Scheduled", tone: "info" };
  if (now > new Date(c.endDate).getTime())
    return { label: "Expired", tone: "warning" };
  return { label: "Active", tone: "success" };
};

const discountOf = (c: Coupon): string => {
  if (c.promoCodeDiscountType === "Free") return "Free";
  if (c.promoCodeDiscountType === "Percentage")
    return `${c.discountValue ?? 0}% off${
      c.uptoAmount ? ` (up to ₹${c.uptoAmount})` : ""
    }`;
  return `₹${c.discountValue ?? 0} off`;
};

type View = { mode: "list" } | { mode: "new" } | { mode: "edit"; id: string };

const CouponsPage = () => {
  const { setToastData } = useGlobalStore();
  const [view, setView] = useState<View>({ mode: "list" });
  const [rows, setRows] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Coupon | null>(null);
  const [eventTitles, setEventTitles] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchMyCoupons());
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [setToastData]);

  // Event id → title map so the detail modal can name an event-scoped coupon.
  useEffect(() => {
    (async () => {
      try {
        const evs = await fetchEventsForCoupons();
        setEventTitles(
          Object.fromEntries(evs.map((e) => [e._id, e.title]))
        );
      } catch {
        /* non-fatal */
      }
    })();
  }, []);

  useEffect(() => {
    if (view.mode === "list") load();
  }, [view, load]);

  const toggle = async (c: Coupon) => {
    setBusyId(c._id);
    try {
      await toggleCouponActive(c._id, !c.isActive);
      await load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    setBusyId(c._id);
    try {
      await deleteCoupon(c._id);
      setToastData({ type: "success", message: "Coupon deleted." });
      await load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const columnHelper = createColumnHelper<Coupon>();

  const columns: ColumnDef<Coupon, any>[] = useMemo(
    () => [
      columnHelper.accessor("code", {
        header: "Code",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <DataTableTextCell
              className="cursor-pointer font-semibold text-owner-blue-500"
              onClick={() => setDetail(row.original)}
              value={row.original.code}
            />
            <span className="text-[12px] text-owner-fg-4">
              {row.original.description ??
                (row.original.showToCustomers ? "Public" : "Private")}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("promoCodeDiscountType", {
        header: "Discount",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => <DataTableTextCell value={discountOf(row.original)} />,
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const st = statusOf(row.original);
          return <Badge tone={st.tone}>{st.label}</Badge>;
        },
      }),
      columnHelper.accessor("usage", {
        header: "Used",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell
            value={`${row.original.usage?.length ?? 0}${
              row.original.maxUsage ? `/${row.original.maxUsage}` : ""
            }`}
          />
        ),
      }),
      columnHelper.accessor("startDate", {
        header: "Window",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell
            value={`${fmtDate(row.original.startDate)} → ${fmtDate(
              row.original.endDate
            )}`}
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const c = row.original;
          const busy = busyId === c._id;
          const canDelete = (c.usage?.length ?? 0) === 0;
          return (
            <TooltipProvider>
              <div className="flex items-center justify-center gap-3">
                <Tooltip>
                  <TooltipTrigger>
                    <FiInfo
                      className="text-primary text-lg cursor-pointer"
                      onClick={() => setDetail(c)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>View coupon</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger disabled={busy}>
                    <MdOutlineEdit
                      className={`text-primary text-lg ${
                        busy ? "opacity-40" : "cursor-pointer"
                      }`}
                      onClick={() =>
                        !busy && setView({ mode: "edit", id: c._id })
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>Edit coupon</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger disabled={busy}>
                    <TbPower
                      className={`text-primary text-lg ${
                        busy ? "opacity-40" : "cursor-pointer"
                      }`}
                      onClick={() => !busy && toggle(c)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>{c.isActive ? "Deactivate" : "Activate"}</p>
                  </TooltipContent>
                </Tooltip>
                {canDelete ? (
                  <Tooltip>
                    <TooltipTrigger disabled={busy}>
                      <MdDeleteOutline
                        className={`text-primary text-lg ${
                          busy ? "opacity-40" : "cursor-pointer"
                        }`}
                        onClick={() => !busy && remove(c)}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Delete coupon</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            </TooltipProvider>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper, busyId]
  );

  if (view.mode !== "list") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--owner-bg-sidebar)]">
        {/* Branded top header (logo + title), divider, then step + form below. */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--owner-border)] bg-[var(--owner-bg)] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/logoDark.png" alt="Hoizr" className="h-6 w-auto" />
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-[var(--owner-fg-1)]">
                {view.mode === "new" ? "New coupon" : "Edit coupon"}
              </div>
              <div className="truncate text-xs text-[var(--owner-fg-3)]">
                Set up a discount code your customers can use at checkout.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setView({ mode: "list" })}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--owner-border)] bg-white text-[var(--owner-fg-3)] hover:border-[var(--owner-blue-500)] hover:text-[var(--owner-fg-1)]"
          >
            <svg
              className="h-3 w-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto px-4 py-6 md:px-6">
          <CouponEditor
            couponId={view.mode === "edit" ? view.id : undefined}
            onCancel={() => setView({ mode: "list" })}
            onDone={() => setView({ mode: "list" })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 py-2 font-owner">
      <PageHeader
        title="Coupons"
        subtitle="Create discount codes for your customers."
        actions={
          <div className="flex items-center gap-2">
            <OwnerButton
              variant="secondary"
              size="sm"
              leadingIcon={<RefreshCcw size={13} />}
              onClick={load}
            >
              Refresh
            </OwnerButton>
            <OwnerButton
              variant="primary"
              size="sm"
              leadingIcon={<Plus size={13} />}
              onClick={() => setView({ mode: "new" })}
            >
              New coupon
            </OwnerButton>
          </div>
        }
      />

      <DataTable
        totalRows={rows.length}
        columns={columns}
        data={rows}
        loading={loading}
        manualPagination={false}
        hideDownloadButton
        pageSize={10}
        addClickHandler={() => setView({ mode: "new" })}
      />

      <CouponDetailModal
        coupon={detail}
        eventTitle={detail?.eventId ? eventTitles[detail.eventId] : undefined}
        onClose={() => setDetail(null)}
      />
    </div>
  );
};

CouponsPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default CouponsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  try {
    const response = await sdk.MeUserJourney(
      {},
      { cookie: cookieHeader }
    );
    const journey = response.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }

    const _vGate = verificationGateRedirect(journey);
    if (_vGate) return _vGate;
    return { props: {} };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};
