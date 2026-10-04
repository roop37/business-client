import {
  Badge,
  OwnerButton,
  PageHeader,
  inrFormat,
} from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import CustomSwitch from "@/components/common/customSwitch/customSwitch";
import MainLayout from "@/components/layouts/mainBodyLayout";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import {
  createLoyaltyReward,
  deleteLoyaltyReward,
  fetchMyRewards,
  toggleLoyaltyRewardActive,
  updateLoyaltyReward,
  type LoyaltyReward,
  type PromoDiscountType,
} from "@/utils/loyaltyRewardClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { GetServerSideProps } from "next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type View = { mode: "list" } | { mode: "new" } | { mode: "edit"; reward: LoyaltyReward };

const discountSummary = (r: LoyaltyReward): string => {
  const t = r.couponTemplate;
  const upto = t.uptoAmount != null ? ` (up to ₹${t.uptoAmount})` : "";
  switch (t.discountType) {
    case "Percentage":
      return `${t.discountValue ?? 0}% OFF${upto}`;
    case "FixedAmount":
      return `₹${t.discountValue ?? 0} OFF`;
    case "Free":
      return "FREE";
    default:
      return "OFFER";
  }
};

const inputCls =
  "w-full rounded-owner-md border border-owner-border bg-white px-3 py-2 text-sm text-owner-fg-1 focus:outline-none focus:ring-2 focus:ring-owner-primary/30";
const labelCls = "block text-xs font-medium text-owner-fg-3 mb-1";

const RewardEditor: React.FC<{
  initial?: LoyaltyReward;
  onDone: () => void;
  onCancel: () => void;
}> = ({ initial, onDone, onCancel }) => {
  const { setToastData } = useGlobalStore();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [pointsCost, setPointsCost] = useState<number>(initial?.pointsCost ?? 100);
  const [discountType, setDiscountType] = useState<PromoDiscountType>(
    initial?.couponTemplate.discountType ?? "Percentage"
  );
  const [discountValue, setDiscountValue] = useState<number | undefined>(
    initial?.couponTemplate.discountValue ?? undefined
  );
  const [uptoAmount, setUptoAmount] = useState<number | undefined>(
    initial?.couponTemplate.uptoAmount ?? undefined
  );
  const [minCartValue, setMinCartValue] = useState<number | undefined>(
    initial?.couponTemplate.minCartValue ?? undefined
  );
  const [validityDays, setValidityDays] = useState<number>(
    initial?.couponTemplate.validityDays ?? 30
  );
  const [perCustomerLimit, setPerCustomerLimit] = useState<number | undefined>(
    initial?.perCustomerLimit ?? undefined
  );
  const [totalStock, setTotalStock] = useState<number | undefined>(
    initial?.totalStock ?? undefined
  );

  const save = async () => {
    if (!title.trim()) {
      setToastData({ type: "error", message: "Give the reward a title" });
      return;
    }
    if (!(pointsCost > 0)) {
      setToastData({ type: "error", message: "Points cost must be greater than 0" });
      return;
    }
    setSaving(true);
    try {
      const couponTemplate = {
        discountType,
        discountValue,
        uptoAmount,
        minCartValue,
        validityDays,
      };
      if (initial) {
        await updateLoyaltyReward({
          rewardId: initial._id,
          title,
          description,
          pointsCost,
          couponTemplate,
          perCustomerLimit,
          totalStock,
        });
      } else {
        await createLoyaltyReward({
          title,
          description,
          pointsCost,
          couponTemplate,
          perCustomerLimit,
          totalStock,
        });
      }
      setToastData({ type: "success", message: "Reward saved" });
      onDone();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const numOrUndef = (v: string): number | undefined =>
    v.trim() === "" ? undefined : Number(v);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={initial ? "Edit reward" : "New reward"}
        subtitle="Fans spend loyalty points to claim the coupon you define here."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 10% off your next ticket" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Description (optional)</label>
          <input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Points cost</label>
          <input type="number" min={1} className={inputCls} value={pointsCost} onChange={(e) => setPointsCost(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Discount type</label>
          <select className={inputCls} value={discountType} onChange={(e) => setDiscountType(e.target.value as PromoDiscountType)}>
            <option value="Percentage">Percentage</option>
            <option value="FixedAmount">Fixed amount</option>
            <option value="Free">Free</option>
          </select>
        </div>
        {discountType !== "Free" && (
          <div>
            <label className={labelCls}>{discountType === "Percentage" ? "Percent off" : "Amount off (₹)"}</label>
            <input type="number" min={1} className={inputCls} value={discountValue ?? ""} onChange={(e) => setDiscountValue(numOrUndef(e.target.value))} />
          </div>
        )}
        {discountType === "Percentage" && (
          <div>
            <label className={labelCls}>Max discount ₹ (optional)</label>
            <input type="number" min={0} className={inputCls} value={uptoAmount ?? ""} onChange={(e) => setUptoAmount(numOrUndef(e.target.value))} />
          </div>
        )}
        <div>
          <label className={labelCls}>Min cart value ₹ (optional)</label>
          <input type="number" min={0} className={inputCls} value={minCartValue ?? ""} onChange={(e) => setMinCartValue(numOrUndef(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Coupon validity (days)</label>
          <input type="number" min={1} className={inputCls} value={validityDays} onChange={(e) => setValidityDays(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Claims per customer (blank = unlimited)</label>
          <input type="number" min={1} className={inputCls} value={perCustomerLimit ?? ""} onChange={(e) => setPerCustomerLimit(numOrUndef(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Total stock (blank = unlimited)</label>
          <input type="number" min={1} className={inputCls} value={totalStock ?? ""} onChange={(e) => setTotalStock(numOrUndef(e.target.value))} />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <OwnerButton onClick={save} disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create reward"}
        </OwnerButton>
        <OwnerButton variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </OwnerButton>
      </div>
    </div>
  );
};

const LoyaltySettings = () => {
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>({ mode: "list" });

  useEffect(() => {
    setSelectedSideBarMenu("Rewards & Loyalties");
  }, [setSelectedSideBarMenu]);

  const load = async () => {
    setLoading(true);
    try {
      setRewards(await fetchMyRewards());
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view.mode === "list") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.mode]);

  const columnHelper = createColumnHelper<LoyaltyReward>();
  const columns: ColumnDef<LoyaltyReward, any>[] = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Reward",
        enableSorting: false,
        cell: ({ row }) => <DataTableTextCell value={row.original.title} />,
      }),
      columnHelper.accessor("pointsCost", {
        header: "Points",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {row.original.pointsCost.toLocaleString("en-IN")}
          </span>
        ),
      }),
      columnHelper.display({
        id: "discount",
        header: "Discount",
        cell: ({ row }) => <DataTableTextCell value={discountSummary(row.original)} />,
      }),
      columnHelper.display({
        id: "claims",
        header: "Claims",
        cell: ({ row }) => (
          <DataTableTextCell
            value={`${row.original.redeemedCount}${
              row.original.totalStock != null ? ` / ${row.original.totalStock}` : ""
            }`}
          />
        ),
      }),
      columnHelper.display({
        id: "active",
        header: "Active",
        cell: ({ row }) => (
          <CustomSwitch
            label=""
            checked={row.original.active}
            onChange={async () => {
              try {
                await toggleLoyaltyRewardActive(row.original._id, !row.original.active);
                load();
              } catch (err) {
                setToastData({ type: "error", message: extractErrorMessage(err) });
              }
            }}
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="text-owner-fg-3 hover:text-owner-primary"
              onClick={() => setView({ mode: "edit", reward: row.original })}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              className="text-owner-fg-3 hover:text-red-600"
              onClick={async () => {
                try {
                  await deleteLoyaltyReward(row.original._id);
                  setToastData({ type: "success", message: "Reward deleted" });
                  load();
                } catch (err) {
                  setToastData({ type: "error", message: extractErrorMessage(err) });
                }
              }}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      }),
    ],
    [columnHelper]
  );

  if (view.mode !== "list") {
    return (
      <div className="min-w-0">
        <RewardEditor
          initial={view.mode === "edit" ? view.reward : undefined}
          onDone={() => setView({ mode: "list" })}
          onCancel={() => setView({ mode: "list" })}
        />
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <PageHeader
        title="Loyalty rewards"
        subtitle="Let fans spend the points they earn on your events for discount coupons."
        actions={
          <OwnerButton leadingIcon={<Plus size={16} />} onClick={() => setView({ mode: "new" })}>
            New reward
          </OwnerButton>
        }
      />
      <DataTable
        totalRows={rewards.length}
        columns={columns}
        data={rewards}
        loading={loading}
        manualPagination={false}
        pageSize={rewards.length || 1}
        pageCount={1}
        nextPage={() => {}}
        prevPage={() => {}}
        paginationData={{ pageIndex: 0, pageSize: rewards.length || 1 }}
        pageSizeChangeHandler={() => {}}
      />
    </div>
  );
};

LoyaltySettings.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default LoyaltySettings;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  try {
    const response = await sdk.MeUserJourney({}, { cookie: cookieHeader });
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
