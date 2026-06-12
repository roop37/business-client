import {
  Badge,
  type BadgeTone,
  OwnerButton,
  OwnerTable,
  PageHeader,
} from "@/components/common/owner";
import MainLayout from "@/components/layouts/mainBodyLayout";
import CouponEditor from "@/components/modules/coupons/CouponEditor";
import CouponDetailModal from "@/components/modules/coupons/CouponDetailModal";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import {
  deleteCoupon,
  fetchEventsForCoupons,
  fetchMyCoupons,
  toggleCouponActive,
  type Coupon,
} from "@/utils/couponClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { Pencil, Plus, Power, RefreshCcw, Trash2 } from "lucide-react";
import { GetServerSideProps } from "next";
import { useCallback, useEffect, useState } from "react";

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

  if (view.mode !== "list") {
    return (
      <div className="min-w-0 py-2">
        <PageHeader
          title={view.mode === "new" ? "New coupon" : "Edit coupon"}
          subtitle="Set up a discount code your customers can use at checkout."
        />
        <CouponEditor
          couponId={view.mode === "edit" ? view.id : undefined}
          onCancel={() => setView({ mode: "list" })}
          onDone={() => setView({ mode: "list" })}
        />
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

      <OwnerTable
        loading={loading}
        rowCount={rows.length}
        empty="No coupons yet. Create your first one."
      >
        <OwnerTable.Head>
          <OwnerTable.HeaderCell>Code</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Discount</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Status</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Used</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Window</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Actions</OwnerTable.HeaderCell>
        </OwnerTable.Head>
        <OwnerTable.Body>
          {rows.map((c) => {
            const st = statusOf(c);
            return (
              <OwnerTable.Row key={c._id}>
                <OwnerTable.Cell>
                  <button
                    type="button"
                    onClick={() => setDetail(c)}
                    className="text-left"
                  >
                    <div className="text-[13px] font-semibold text-owner-blue-500 hover:underline">
                      {c.code}
                    </div>
                    <div className="text-[12px] text-owner-fg-4">
                      {c.description ??
                        (c.showToCustomers ? "Public" : "Private")}
                    </div>
                  </button>
                </OwnerTable.Cell>
                <OwnerTable.Cell>{discountOf(c)}</OwnerTable.Cell>
                <OwnerTable.Cell>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </OwnerTable.Cell>
                <OwnerTable.Cell align="right">
                  {c.usage?.length ?? 0}
                  {c.maxUsage ? `/${c.maxUsage}` : ""}
                </OwnerTable.Cell>
                <OwnerTable.Cell>
                  <div className="text-[12px] text-owner-fg-3">
                    {fmtDate(c.startDate)} → {fmtDate(c.endDate)}
                  </div>
                </OwnerTable.Cell>
                <OwnerTable.Cell align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <OwnerButton
                      variant="secondary"
                      size="sm"
                      leadingIcon={<Pencil size={12} />}
                      disabled={busyId === c._id}
                      onClick={() => setView({ mode: "edit", id: c._id })}
                    >
                      Edit
                    </OwnerButton>
                    <OwnerButton
                      variant="secondary"
                      size="sm"
                      leadingIcon={<Power size={12} />}
                      disabled={busyId === c._id}
                      onClick={() => toggle(c)}
                    >
                      {c.isActive ? "Deactivate" : "Activate"}
                    </OwnerButton>
                    {(c.usage?.length ?? 0) === 0 ? (
                      <OwnerButton
                        variant="secondary"
                        size="sm"
                        leadingIcon={<Trash2 size={12} />}
                        disabled={busyId === c._id}
                        onClick={() => remove(c)}
                      >
                        Delete
                      </OwnerButton>
                    ) : null}
                  </div>
                </OwnerTable.Cell>
              </OwnerTable.Row>
            );
          })}
        </OwnerTable.Body>
      </OwnerTable>

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
    return { props: {} };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};
