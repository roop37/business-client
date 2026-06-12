"use client";

import ReusableModal from "@/components/common/modal/modal";
import { Badge, type BadgeTone } from "@/components/common/owner";
import type { Coupon } from "@/utils/couponClient";

const fmtDateTime = (v?: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
};

const rupee = (n?: number | null) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;

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
  if (c.promoCodeDiscountType === "Free") return "Free (full discount)";
  if (c.promoCodeDiscountType === "Percentage")
    return `${c.discountValue ?? 0}% off${
      c.uptoAmount ? ` (up to ₹${c.uptoAmount})` : ""
    }`;
  return `₹${c.discountValue ?? 0} off`;
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3 py-1.5">
    <span className="text-[12px] text-owner-fg-4">{label}</span>
    <span className="text-right text-[13px] font-medium text-owner-fg-1">
      {value}
    </span>
  </div>
);

/**
 * Read-only coupon detail + redemption log. Opened from the coupons list when
 * a host clicks a row, so they can inspect terms and see who has used it
 * without leaving the page.
 */
const CouponDetailModal = ({
  coupon,
  eventTitle,
  onClose,
}: {
  coupon: Coupon | null;
  /** Resolved title for coupon.eventId, when scoped to one event. */
  eventTitle?: string | null;
  onClose: () => void;
}) => {
  if (!coupon) return null;
  const st = statusOf(coupon);
  const usage = coupon.usage ?? [];

  return (
    <ReusableModal
      isOpen={!!coupon}
      onClose={onClose}
      title={coupon.code}
      comments={coupon.description ?? undefined}
      width="ml"
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-owner-md border border-owner-border bg-owner-bg-subtle p-3">
          <Row
            label="Status"
            value={<Badge tone={st.tone}>{st.label}</Badge>}
          />
          <Row label="Discount" value={discountOf(coupon)} />
          <Row
            label="Applies to"
            value={
              coupon.eventId
                ? eventTitle || "One event"
                : "All events (global promo)"
            }
          />
          <Row
            label="Window"
            value={`${fmtDateTime(coupon.startDate)} → ${fmtDateTime(
              coupon.endDate
            )}`}
          />
          <Row
            label="Visibility"
            value={coupon.showToCustomers ? "Shown on order page" : "Private"}
          />
          <Row
            label="Usage type"
            value={
              coupon.couponUsageType === "FirstSignedOrder"
                ? "First signed-in order"
                : "Entire sale"
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Redeemed"
            value={`${usage.length}${
              coupon.maxUsage ? ` / ${coupon.maxUsage}` : ""
            }`}
          />
          <Stat label="Per customer" value={coupon.maxUsagePerCustomer ?? "∞"} />
          <Stat label="Min cart" value={rupee(coupon.minCartValue)} />
          <Stat
            label="Sales used"
            value={`${rupee(coupon.totalSalesUsed)}${
              coupon.couponUsageSalesLimit
                ? ` / ${rupee(coupon.couponUsageSalesLimit)}`
                : ""
            }`}
          />
        </div>

        <div>
          <div className="mb-2 text-[12px] font-semibold text-owner-fg-2">
            Redemptions ({usage.length})
          </div>
          {usage.length === 0 ? (
            <div className="rounded-owner-md border border-dashed border-owner-border p-4 text-center text-[12px] text-owner-fg-4">
              No redemptions yet.
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-owner-md border border-owner-border">
              <table className="w-full text-left text-[12px]">
                <thead className="sticky top-0 bg-owner-bg-subtle text-owner-fg-4">
                  <tr>
                    <th className="px-3 py-2 font-medium">Customer</th>
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Discount
                    </th>
                    <th className="px-3 py-2 text-right font-medium">Order</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.map((u, i) => (
                    <tr
                      key={`${u.orderId ?? i}`}
                      className="border-t border-owner-border-soft"
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium text-owner-fg-1">
                          {u.name || "Guest"}
                        </div>
                        <div className="text-owner-fg-4">
                          {u.email || u.phone || "—"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-owner-fg-3">
                        {fmtDateTime(u.usedAt)}
                      </td>
                      <td className="px-3 py-2 text-right text-owner-fg-1">
                        {rupee(u.discountApplied)}
                      </td>
                      <td className="px-3 py-2 text-right text-owner-fg-3">
                        {rupee(u.saleAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ReusableModal>
  );
};

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-owner-md border border-owner-border bg-owner-bg p-2.5">
    <div className="text-[11px] text-owner-fg-4">{label}</div>
    <div className="mt-0.5 text-[14px] font-semibold text-owner-fg-1">
      {value}
    </div>
  </div>
);

export default CouponDetailModal;
