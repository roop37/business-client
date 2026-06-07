"use client";

import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { CheckCircle2, CreditCard, Loader2, Wallet, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";

/**
 * App-level top-up modal for marketing credit. Mounted once at the app
 * root so any feature can call `openTopUpModal()` and get the same
 * verified flow without each page rewriting the Razorpay handshake.
 *
 * The flow is two server hops on top of the Razorpay checkout:
 *   1) createMarketingCreditTopUpOrder — server-built order, signed notes
 *   2) Razorpay Checkout opens with the returned key + order
 *   3) On Razorpay success → verifyMarketingCreditTopUp — verifies the
 *      checkout signature, fetches the payment from Razorpay, calls the
 *      same idempotent apply path the webhook uses. Returns the new
 *      balance so we can update the modal in place.
 *
 * Webhook + this verify mutation share `recordRazorpayTopUp`, which
 * dedupes by paymentReference — running them in parallel is safe.
 */

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const MIN_TOP_UP_INR = 100;
const QUICK_PICKS = [100, 200, 500, 1000, 2500];
const DEFAULT_GST_PERCENT = 18;

const roundCurrency = (value: number) => Math.round(value * 100) / 100;
const inrFormat = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.max(0, value));

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme?: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () =>
        resolve(Boolean(window.Razorpay))
      );
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

type Status = "idle" | "paying" | "verifying" | "success" | "error";

const GlobalTopUpModal = () => {
  const {
    topUpModalOpen,
    topUpPresetAmount,
    closeTopUpModal,
    setToastData,
  } = useGlobalStore();

  const [amount, setAmount] = useState<number>(MIN_TOP_UP_INR);
  const [gstPercent, setGstPercent] = useState<number>(DEFAULT_GST_PERCENT);
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const gstFraction = gstPercent / 100;
  const gstAmount = useMemo(
    () => roundCurrency(Math.max(0, amount) * gstFraction),
    [amount, gstFraction]
  );
  const platformFeeAmount = useMemo(
    () => roundCurrency(Math.max(0, amount) * (platformFeePercent / 100)),
    [amount, platformFeePercent]
  );
  const payable = useMemo(
    () => roundCurrency(Math.max(0, amount) + gstAmount + platformFeeAmount),
    [amount, gstAmount, platformFeeAmount]
  );
  const belowMin = amount < MIN_TOP_UP_INR;
  const submitDisabled = belowMin || status === "paying" || status === "verifying";

  const loadInitialState = useCallback(async () => {
    try {
      const [pricingRes, ledgerRes] = await Promise.all([
        sdk.GetMarketingPricing().catch(() => null),
        sdk
          .myMarketingCreditLedger({
            pagination: { pageNumber: 1, rowsPerPage: "ONE" as any },
          })
          .catch(() => null),
      ]);
      if (pricingRes?.getMarketingPricing?.gstPercent !== undefined) {
        const pct = Number(pricingRes.getMarketingPricing.gstPercent);
        if (Number.isFinite(pct) && pct >= 0) setGstPercent(pct);
      }
      if (
        pricingRes?.getMarketingPricing?.platformFeePercent !== undefined
      ) {
        const pct = Number(pricingRes.getMarketingPricing.platformFeePercent);
        if (Number.isFinite(pct) && pct >= 0) setPlatformFeePercent(pct);
      }
      if (ledgerRes?.myMarketingCreditLedger?.balance !== undefined) {
        setBalance(Number(ledgerRes.myMarketingCreditLedger.balance) || 0);
      }
    } catch {
      // Best-effort — modal still works with defaults.
    }
  }, []);

  // Reset to a clean state whenever the modal is opened. presetAmount
  // (passed by the opener via openTopUpModal(X)) prefills the field so
  // a "you need ₹420 more" CTA can deep-link straight to the right pack.
  useEffect(() => {
    if (!topUpModalOpen) return;
    setStatus("idle");
    setErrorMessage("");
    setAmount(
      topUpPresetAmount && topUpPresetAmount >= MIN_TOP_UP_INR
        ? topUpPresetAmount
        : MIN_TOP_UP_INR
    );
    loadInitialState();
  }, [topUpModalOpen, topUpPresetAmount, loadInitialState]);

  const handleClose = () => {
    if (status === "paying" || status === "verifying") return;
    closeTopUpModal();
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    if (belowMin) {
      setErrorMessage(`Minimum top-up is ₹${MIN_TOP_UP_INR}.`);
      return;
    }
    setStatus("paying");
    try {
      const orderResponse = await sdk.createMarketingCreditTopUpOrder({
        input: { amount },
      });
      const order = orderResponse.createMarketingCreditTopUpOrder;
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        throw new Error("Unable to load Razorpay. Please retry.");
      }

      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay!({
          key: order.razorpayKeyId,
          amount: Math.round(Number(order.payableAmount) * 100),
          currency: order.currency,
          name: "Hoizr",
          description: `${inrFormat(order.creditsAmount)} marketing credit`,
          order_id: order.razorpayOrderId,
          theme: { color: "#2C63E5" },
          handler: async (response) => {
            try {
              setStatus("verifying");
              const verifyRes = await sdk.verifyMarketingCreditTopUp({
                input: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
              });
              const newBalance = Number(
                verifyRes?.verifyMarketingCreditTopUp?.balance ?? balance
              );
              setBalance(newBalance);
              setStatus("success");
              resolve();
            } catch (verifyError) {
              reject(verifyError);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        });
        checkout.open();
      });
    } catch (error: any) {
      const message = extractErrorMessage(error);
      setErrorMessage(message);
      setStatus("error");
      // Toast only on hard errors; user-cancelled gets a softer message.
      if (message !== "Payment cancelled") {
        setToastData({ type: "error", message });
      }
    }
  };

  if (!topUpModalOpen) return null;

  // Portal to body + z-[1100]. Top-up is a secondary modal that can be
  // launched from inside other modals (RunCampaignModal, EventJourney
  // pricing CTAs). Both other surfaces use ReactDOM.createPortal and
  // sit at z-50 or z-[1000] (ReusableModal's isHighIndex). Rendering
  // top-up inline at z-50 meant the parent modal's portal stacked on
  // top, and the user reported it "opens behind" Run a campaign.
  // Portaling + higher z keeps top-up reliably on top regardless of
  // who launched it.
  if (typeof window === "undefined") return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 px-4 py-6">
      <div className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-[var(--owner-bg)] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--owner-border)] px-5 py-4">
          <div>
            <div className="text-sm font-semibold">Top up Marketing Credit</div>
            <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
              Pre-funded balance for WhatsApp and Meta x Hoizr campaigns.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={status === "paying" || status === "verifying"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)] disabled:opacity-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--owner-success-bg)] text-[var(--owner-success-text)]">
                <CheckCircle2 size={28} />
              </span>
              <div>
                <p className="text-base font-semibold">Credit added</p>
                <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
                  Your campaigns can use the new balance right away.
                </p>
              </div>
              <div className="w-full rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] p-4">
                <div className="flex items-center justify-between text-xs text-[var(--owner-fg-3)]">
                  <span>New balance</span>
                  <Wallet size={14} />
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {inrFormat(balance)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] p-4">
                <div className="flex items-center justify-between text-xs text-[var(--owner-fg-3)]">
                  <span>Current balance</span>
                  <Wallet size={14} />
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {inrFormat(balance)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Top-up amount (₹)
                  <div className="mt-1">
                    <input
                      type="number"
                      min={MIN_TOP_UP_INR}
                      step={100}
                      value={amount || ""}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setAmount(Number.isFinite(v) ? Math.max(0, v) : 0);
                      }}
                      className="input input-primary h-10 w-full px-3 text-sm"
                      placeholder={`min ₹${MIN_TOP_UP_INR}`}
                      disabled={status === "paying" || status === "verifying"}
                    />
                  </div>
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {QUICK_PICKS.map((pack) => (
                    <button
                      key={pack}
                      type="button"
                      onClick={() => setAmount(pack)}
                      disabled={status === "paying" || status === "verifying"}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        amount === pack
                          ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)] text-[var(--owner-blue-500)]"
                          : "border-[var(--owner-border)] bg-white text-[var(--owner-fg-3)] hover:border-[var(--owner-blue-500)]"
                      }`}
                    >
                      ₹{pack.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                {belowMin ? (
                  <p className="mt-2 text-xs text-red-600">
                    Minimum top-up is ₹{MIN_TOP_UP_INR}.
                  </p>
                ) : null}
              </div>

              <div className="rounded-lg border border-dashed border-[var(--owner-border)] bg-white p-3 text-sm">
                <div className="flex items-center justify-between text-[var(--owner-fg-3)]">
                  <span>Credit added</span>
                  <span className="tabular-nums">{inrFormat(amount)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[var(--owner-fg-3)]">
                  <span>GST ({gstPercent}%)</span>
                  <span className="tabular-nums">{inrFormat(gstAmount)}</span>
                </div>
                {platformFeePercent > 0 ? (
                  <div className="mt-1 flex items-center justify-between text-[var(--owner-fg-3)]">
                    <span>Payment adjustment ({platformFeePercent}%)</span>
                    <span className="tabular-nums">
                      {inrFormat(platformFeeAmount)}
                    </span>
                  </div>
                ) : null}
                <div className="mt-2 flex items-center justify-between border-t border-[var(--owner-border-soft)] pt-2 text-sm font-semibold">
                  <span>You pay</span>
                  <span className="tabular-nums">{inrFormat(payable)}</span>
                </div>
              </div>

              {errorMessage && status === "error" ? (
                <p className="text-xs text-red-600">{errorMessage}</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--owner-border)] px-5 py-3">
          {status === "success" ? (
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)]"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={status === "paying" || status === "verifying"}
                className="rounded-lg border border-[var(--owner-border-strong)] bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitDisabled}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "paying" || status === "verifying" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CreditCard size={14} />
                )}
                {status === "paying"
                  ? "Opening payment…"
                  : status === "verifying"
                  ? "Verifying…"
                  : `Pay ${inrFormat(payable)}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GlobalTopUpModal;
