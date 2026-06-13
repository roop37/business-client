"use client";

import useGlobalStore from "@/store/global";
import {
  fetchHostOrderDetail,
  refundHostOrder,
  type HostOrderDetail,
} from "@/utils/orderReceiptClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  CalendarDays,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Ticket,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";

/**
 * App-level order receipt modal. Mounted once at the app root so the orders
 * page (or any surface) can call `openOrderReceipt(orderId)` and get a full
 * receipt without each page re-fetching/re-rendering the layout.
 *
 * Portal to body + z-[1100], mirroring GlobalTopUpModal so it sits reliably
 * on top regardless of who opened it.
 *
 * LEFT  = event details + customer details.
 * RIGHT = host-side ticket + payment breakdown. "Taxes & Fees" is the single
 *         combined line money.taxesAndFees = taxes + platformFee + platformFeeGst
 *         (computed server-side). A Refund button sits in the header top-left.
 */

const inrFormat = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.max(0, Number(value) || 0));

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

// Server sends OrderStatus enum KEYS (e.g. "PAYMENT_SUCCESS").
const statusLabel = (s: string): string => {
  switch (s) {
    case "PAYMENT_SUCCESS":
      return "Confirmed";
    case "CHECKED_IN":
      return "Checked in";
    case "REFUNDED":
      return "Refunded";
    default:
      return s;
  }
};

const sourceLabel = (s: string) =>
  s === "OFFLINE_ISSUED"
    ? "Offline · issued"
    : s === "OFFLINE_LINK"
      ? "Offline · link"
      : "Online";

const OrderReceiptModal = () => {
  const { orderReceiptModalOpen, orderReceiptId, closeOrderReceipt, setToastData } =
    useGlobalStore();

  const [detail, setDetail] = useState<HostOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const load = useCallback(async (orderId: string) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const d = await fetchHostOrderDetail(orderId);
      setDetail(d);
    } catch (err: any) {
      setErrorMessage(extractErrorMessage(err));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!orderReceiptModalOpen || !orderReceiptId) return;
    setDetail(null);
    setConfirming(false);
    setRefunding(false);
    load(orderReceiptId);
  }, [orderReceiptModalOpen, orderReceiptId, load]);

  const handleClose = () => {
    if (refunding) return;
    closeOrderReceipt();
  };

  const handleRefund = async () => {
    if (!detail || refunding) return;
    setRefunding(true);
    try {
      const res = await refundHostOrder(detail.orderId);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              status: res.status,
              refundable: false,
              refundedAt: res.refundedAt ?? prev.refundedAt,
              money: { ...prev.money, refundAmount: res.refundAmount },
            }
          : prev
      );
      setConfirming(false);
      setToastData({
        type: "success",
        message: "Refund initiated. The customer will be notified.",
      });
    } catch (err: any) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setRefunding(false);
    }
  };

  if (!orderReceiptModalOpen) return null;
  if (typeof window === "undefined") return null;

  const isRefunded = detail?.status === "REFUNDED";
  const canRefund = !!detail?.refundable && !isRefunded;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1100] flex flex-col bg-[var(--owner-bg)]">
      {/* Top bar — close left, title centre, refund right */}
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--owner-border)] bg-[var(--owner-bg)] px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={handleClose}
          disabled={refunding}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)] disabled:opacity-50"
        >
          <X size={18} />
          <span className="hidden sm:inline">Close</span>
        </button>

        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-sm font-semibold text-[var(--owner-fg-1)]">
            Order receipt
          </div>
          {detail ? (
            <p className="mt-0.5 truncate text-xs text-[var(--owner-fg-3)]">
              {statusLabel(detail.status)} · {sourceLabel(detail.source)}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-1.5">
          {canRefund ? (
            confirming ? (
              <>
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={refunding}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--owner-danger-bg,#fee2e2)] px-3 py-2 text-xs font-semibold text-[var(--owner-danger-text,#b91c1c)] disabled:opacity-60"
                >
                  {refunding ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RotateCcw size={13} />
                  )}
                  Confirm refund
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={refunding}
                  className="rounded-md border border-[var(--owner-border)] px-2.5 py-2 text-xs font-semibold disabled:opacity-60"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--owner-border-strong)] bg-white px-3 py-2 text-xs font-semibold text-[var(--owner-fg-1)] hover:border-red-300 hover:text-red-600"
              >
                <RotateCcw size={13} />
                Refund
              </button>
            )
          ) : (
            <span className="w-9" aria-hidden />
          )}
        </div>
      </header>

      {/* Body — full-page, centred reading column */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-[var(--owner-fg-3)]">
              <Loader2 size={16} className="animate-spin" />
              Loading receipt…
            </div>
          ) : errorMessage ? (
            <div className="py-24 text-center text-sm text-red-600">
              {errorMessage}
            </div>
          ) : detail ? (
            <>
              {/* Order summary */}
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--owner-border-soft)] pb-5">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--owner-fg-4)]">
                    Order
                  </div>
                  <div className="mt-1 font-mono text-[13px] text-[var(--owner-fg-2)]">
                    #{detail.orderId}
                  </div>
                  <div className="mt-1 text-xs text-[var(--owner-fg-4)]">
                    Placed {fmtDate(detail.createdAt)}
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isRefunded
                      ? "bg-[var(--owner-warning-bg,#fef3c7)] text-[var(--owner-warning-text,#92400e)]"
                      : "bg-[var(--owner-success-bg,#dcfce7)] text-[var(--owner-success-text,#15803d)]"
                  }`}
                >
                  {statusLabel(detail.status)}
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
              {/* LEFT — event + customer */}
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--owner-fg-4)]">
                    Event
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    {detail.event.flyer ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detail.event.flyer}
                        alt={detail.event.title ?? "Event"}
                        className="h-20 w-16 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-md bg-[var(--owner-border-soft)] text-[var(--owner-fg-4)]">
                        <Ticket size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--owner-fg-1)]">
                        {detail.event.title ?? "—"}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--owner-fg-3)]">
                        <CalendarDays size={13} className="shrink-0" />
                        <span className="truncate">
                          {fmtDate(detail.event.startDate)}
                        </span>
                      </div>
                      {detail.event.location || detail.event.city ? (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--owner-fg-3)]">
                          <MapPin size={13} className="shrink-0" />
                          <span className="truncate">
                            {detail.event.location ?? detail.event.city}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--owner-fg-4)]">
                      Customer
                    </div>
                    {detail.customer.isGuest ? (
                      <span className="rounded-full bg-[var(--owner-border-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--owner-fg-3)]">
                        Guest
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--owner-fg-1)]">
                      <User size={14} className="shrink-0 text-[var(--owner-fg-4)]" />
                      <span className="truncate">{detail.customer.name ?? "Guest"}</span>
                    </div>
                    {detail.customer.email ? (
                      <div className="flex items-center gap-2 text-xs text-[var(--owner-fg-3)]">
                        <Mail size={13} className="shrink-0" />
                        <span className="truncate">{detail.customer.email}</span>
                      </div>
                    ) : null}
                    {detail.customer.phone ? (
                      <div className="flex items-center gap-2 text-xs text-[var(--owner-fg-3)]">
                        <Phone size={13} className="shrink-0" />
                        <span className="truncate">{detail.customer.phone}</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3 border-t border-[var(--owner-border-soft)] pt-2 text-xs text-[var(--owner-fg-4)]">
                    Placed {fmtDate(detail.createdAt)}
                  </div>
                </div>
              </div>

              {/* RIGHT — receipt breakdown */}
              <div className="flex flex-col">
                <div className="flex flex-1 flex-col rounded-lg border border-[var(--owner-border)] bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--owner-fg-4)]">
                    Payment
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {detail.tickets.length ? (
                      detail.tickets.map((t, i) => (
                        <div
                          key={`${t.name}-${i}`}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <div className="min-w-0 text-[var(--owner-fg-2)]">
                            <span className="truncate">{t.name}</span>
                            <span className="ml-1 text-xs text-[var(--owner-fg-4)]">
                              × {t.qty}
                            </span>
                          </div>
                          <span className="tabular-nums text-[var(--owner-fg-2)]">
                            {inrFormat(t.lineTotal)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-[var(--owner-fg-4)]">
                        No ticket lines.
                      </div>
                    )}
                  </div>

                  <div className="my-3 border-t border-[var(--owner-border-soft)]" />

                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between text-[var(--owner-fg-3)]">
                      <span>Tickets</span>
                      <span className="tabular-nums">
                        {inrFormat(detail.money.subtotal)}
                      </span>
                    </div>
                    {detail.money.discount ? (
                      <div className="flex items-center justify-between text-[var(--owner-success-text,#15803d)]">
                        <span>
                          Coupon
                          {detail.couponCode ? (
                            <span className="ml-1 rounded bg-[var(--owner-success-bg,#dcfce7)] px-1.5 py-0.5 text-[11px] font-semibold">
                              {detail.couponCode}
                            </span>
                          ) : null}
                        </span>
                        <span className="tabular-nums">
                          −{inrFormat(detail.money.discount)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between text-[var(--owner-fg-3)]">
                      <span>Taxes &amp; Fees</span>
                      <span className="tabular-nums">
                        {inrFormat(detail.money.taxesAndFees)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[var(--owner-border)] pt-3 text-base font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">
                      {inrFormat(detail.money.totalAmount)}
                    </span>
                  </div>

                  {detail.money.refundAmount ? (
                    <div className="mt-3 flex items-center justify-between rounded-md bg-[var(--owner-warning-bg,#fef3c7)] px-3 py-2 text-sm font-semibold text-[var(--owner-warning-text,#92400e)]">
                      <span>Refunded</span>
                      <span className="tabular-nums">
                        −{inrFormat(detail.money.refundAmount)}
                      </span>
                    </div>
                  ) : null}

                  {isRefunded ? (
                    <p className="mt-2 text-xs text-[var(--owner-fg-4)]">
                      Refunded {fmtDate(detail.refundedAt)}.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrderReceiptModal;
