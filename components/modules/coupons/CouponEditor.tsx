"use client";

import { OwnerButton } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  createCoupon,
  fetchCouponById,
  fetchEventsForCoupons,
  updateCoupon,
  type CouponEventOption,
  type CouponUsageType,
  type Day,
  type PromoDiscountType,
} from "@/utils/couponClient";
import { Loader2, Lock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const inputCls =
  "h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050 disabled:cursor-not-allowed disabled:opacity-60";

const DAYS: Day[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const toLocalInput = (d: Date | null): string => {
  if (!d || Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const Field = ({
  label,
  hint,
  locked,
  children,
}: {
  label: string;
  hint?: string;
  locked?: boolean;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="flex items-center gap-1 text-[12px] font-semibold text-owner-fg-2">
      {label}
      {locked ? <Lock size={11} className="text-owner-fg-4" /> : null}
    </span>
    <div className="mt-1">{children}</div>
    {hint ? (
      <span className="mt-1 block text-[11px] text-owner-fg-4">{hint}</span>
    ) : null}
  </label>
);

const numOrUndef = (v: string): number | undefined =>
  v.trim() === "" ? undefined : Number(v);

const CouponEditor = ({
  couponId,
  onDone,
  onCancel,
}: {
  couponId?: string;
  onDone: () => void;
  onCancel: () => void;
}) => {
  const { setToastData } = useGlobalStore();
  const isEdit = !!couponId;
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Lifecycle locks (computed from the loaded coupon on edit).
  const [hasStarted, setHasStarted] = useState(false);
  const [hasBeenUsed, setHasBeenUsed] = useState(false);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  // Event scope — "" means a host-level global promo (all events).
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState<CouponEventOption[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [discountType, setDiscountType] =
    useState<PromoDiscountType>("Percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [uptoAmount, setUptoAmount] = useState("");
  const [applicableDays, setApplicableDays] = useState<Day[]>([...DAYS]);
  const [showToCustomers, setShowToCustomers] = useState(false);
  // Advanced
  const [usageType, setUsageType] = useState<CouponUsageType>("EntireSale");
  const [maxUsage, setMaxUsage] = useState("");
  const [maxPerCustomer, setMaxPerCustomer] = useState("");
  const [minCartValue, setMinCartValue] = useState("");
  const [salesLimit, setSalesLimit] = useState("");

  // Load the host's events for the optional scope picker.
  useEffect(() => {
    (async () => {
      try {
        setEvents(await fetchEventsForCoupons());
      } catch {
        /* non-fatal — the picker just falls back to global-only */
      }
    })();
  }, []);

  useEffect(() => {
    if (!couponId) return;
    (async () => {
      try {
        const c = await fetchCouponById(couponId);
        if (!c) return;
        setCode(c.code);
        setDescription(c.description ?? "");
        setEventId(c.eventId ?? "");
        setStartDate(c.startDate ? new Date(c.startDate) : null);
        setEndDate(c.endDate ? new Date(c.endDate) : null);
        setDiscountType(c.promoCodeDiscountType);
        setDiscountValue(c.discountValue != null ? String(c.discountValue) : "");
        setUptoAmount(c.uptoAmount != null ? String(c.uptoAmount) : "");
        setApplicableDays(
          c.applicableDays && c.applicableDays.length ? c.applicableDays : [...DAYS]
        );
        setShowToCustomers(c.showToCustomers);
        setUsageType(c.couponUsageType);
        setMaxUsage(c.maxUsage != null ? String(c.maxUsage) : "");
        setMaxPerCustomer(
          c.maxUsagePerCustomer != null ? String(c.maxUsagePerCustomer) : ""
        );
        setMinCartValue(c.minCartValue != null ? String(c.minCartValue) : "");
        setSalesLimit(
          c.couponUsageSalesLimit != null ? String(c.couponUsageSalesLimit) : ""
        );
        setHasStarted(c.startDate ? new Date(c.startDate) <= new Date() : false);
        setHasBeenUsed((c.usage?.length ?? 0) > 0);
      } catch (err) {
        setToastData({ type: "error", message: extractErrorMessage(err) });
      } finally {
        setLoading(false);
      }
    })();
  }, [couponId, setToastData]);

  // "Days available" only matters when the window spans more than a week.
  const windowDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
  }, [startDate, endDate]);
  const showDays = windowDays > 7;

  const toggleDay = (d: Day) =>
    setApplicableDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const validateStep1 = (): string | null => {
    if (!code.trim()) return "Enter a promo code.";
    if (!startDate || !endDate) return "Set start and end dates.";
    if (endDate <= startDate) return "End date must be after the start date.";
    if (discountType !== "Free" && !discountValue.trim())
      return "Enter a discount value.";
    if (discountType === "Percentage") {
      const v = Number(discountValue);
      if (!(v > 0 && v <= 100)) return "Percentage must be between 1 and 100.";
    }
    return null;
  };

  const handleContinue = () => {
    const err = validateStep1();
    if (err) {
      setToastData({ type: "error", message: err });
      return;
    }
    setStep(2);
  };

  const save = useCallback(async () => {
    const err = validateStep1();
    if (err) {
      setToastData({ type: "error", message: err });
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      const base = {
        description: description.trim() || undefined,
        eventId: eventId || undefined,
        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
        promoCodeDiscountType: discountType,
        discountValue:
          discountType === "Free" ? undefined : numOrUndef(discountValue),
        uptoAmount:
          discountType === "Percentage" ? numOrUndef(uptoAmount) : undefined,
        applicableDays: showDays ? applicableDays : [],
        showToCustomers,
        couponUsageType: usageType,
        maxUsage: numOrUndef(maxUsage),
        maxUsagePerCustomer: numOrUndef(maxPerCustomer),
        minCartValue: numOrUndef(minCartValue),
        couponUsageSalesLimit: numOrUndef(salesLimit),
      };
      if (isEdit) {
        await updateCoupon({ couponId: couponId!, ...base });
      } else {
        await createCoupon({ code: code.trim().toUpperCase(), ...base });
      }
      setToastData({
        type: "success",
        message: isEdit ? "Coupon updated." : "Coupon created.",
      });
      onDone();
    } catch (e) {
      setToastData({ type: "error", message: extractErrorMessage(e) });
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    code,
    description,
    startDate,
    endDate,
    discountType,
    discountValue,
    uptoAmount,
    applicableDays,
    showDays,
    showToCustomers,
    usageType,
    maxUsage,
    maxPerCustomer,
    minCartValue,
    salesLimit,
    isEdit,
    couponId,
    eventId,
  ]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-10 text-owner-fg-4">
        <Loader2 className="animate-spin" size={18} /> Loading…
      </div>
    );
  }

  const discountLock = hasBeenUsed;

  return (
    <div className="mx-auto max-w-2xl font-owner">
      {/* Stepper */}
      <div className="mb-5 flex items-center gap-2">
        {[
          { n: 1 as const, label: "Promo code" },
          { n: 2 as const, label: "Advanced" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (s.n === 1 ? setStep(1) : handleContinue())}
              className={`flex items-center gap-1.5 text-[13px] ${
                step === s.n
                  ? "font-semibold text-owner-fg-1"
                  : "text-owner-fg-4"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  step >= s.n
                    ? "bg-owner-blue-500 text-white"
                    : "bg-owner-bg-subtle text-owner-fg-4"
                }`}
              >
                {s.n}
              </span>
              {s.label}
            </button>
            {i === 0 ? <span className="h-px w-6 bg-owner-border" /> : null}
          </div>
        ))}
      </div>

      {hasBeenUsed ? (
        <div className="mb-4 rounded-owner-md border border-owner-border-soft bg-owner-bg-subtle p-3 text-[12px] text-owner-fg-3">
          This coupon has been redeemed — discount terms are locked. You can
          still edit the description, end date and visibility.
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <Field label="Promo code" hint="The code your customers enter.">
            <input
              className={inputCls}
              value={code}
              disabled={isEdit}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
              }
              placeholder="SUMMER25"
            />
          </Field>
          <Field label="Description (optional)">
            <input
              className={inputCls}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Early-bird 25% off"
            />
          </Field>
          <Field
            label="Applies to"
            hint={
              eventId
                ? "This code works only for the selected event."
                : "A global promo works on any of your events."
            }
            locked={hasBeenUsed}
          >
            <select
              className={inputCls}
              value={eventId}
              disabled={hasBeenUsed}
              onChange={(e) => setEventId(e.target.value)}
            >
              <option value="">All events (global promo)</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date & time" locked={hasStarted}>
              <input
                type="datetime-local"
                className={inputCls}
                disabled={hasStarted}
                value={toLocalInput(startDate)}
                onChange={(e) =>
                  setStartDate(e.target.value ? new Date(e.target.value) : null)
                }
              />
            </Field>
            <Field label="End date & time">
              <input
                type="datetime-local"
                className={inputCls}
                value={toLocalInput(endDate)}
                onChange={(e) =>
                  setEndDate(e.target.value ? new Date(e.target.value) : null)
                }
              />
            </Field>
          </div>
          <p className="-mt-1 text-[11px] text-owner-fg-4">
            The code activates and expires automatically based on these dates.
          </p>

          {showDays ? (
            <Field
              label="Days available"
              hint="The code only works on the selected days."
              locked={discountLock}
            >
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d) => {
                  const on = applicableDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={discountLock}
                      onClick={() => toggleDay(d)}
                      className={
                        on
                          ? "rounded-full border border-owner-blue-500 bg-owner-blue-050 px-3 py-1 text-[12px] font-medium text-owner-blue-500 disabled:opacity-60"
                          : "rounded-full border border-owner-border px-3 py-1 text-[12px] text-owner-fg-3 disabled:opacity-60"
                      }
                    >
                      {d.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </Field>
          ) : null}

          <Field label="Discount type" locked={discountLock}>
            <select
              className={inputCls}
              value={discountType}
              disabled={discountLock}
              onChange={(e) =>
                setDiscountType(e.target.value as PromoDiscountType)
              }
            >
              <option value="Percentage">Percentage</option>
              <option value="FixedAmount">Fixed amount</option>
              <option value="Free">Free</option>
            </select>
          </Field>

          {discountType === "Percentage" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Discount value" locked={discountLock}>
                <div className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    type="number"
                    disabled={discountLock}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="Discount percentage"
                  />
                  <span className="text-[13px] text-owner-fg-3">%</span>
                </div>
              </Field>
              <Field label="Up to amount (optional)" locked={discountLock}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-owner-fg-3">₹</span>
                  <input
                    className={inputCls}
                    type="number"
                    disabled={discountLock}
                    value={uptoAmount}
                    onChange={(e) => setUptoAmount(e.target.value)}
                    placeholder="Max discount"
                  />
                </div>
              </Field>
            </div>
          ) : discountType === "FixedAmount" ? (
            <Field label="Discount amount" locked={discountLock}>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-owner-fg-3">₹</span>
                <input
                  className={inputCls}
                  type="number"
                  disabled={discountLock}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="Discount amount"
                />
              </div>
            </Field>
          ) : (
            <p className="text-[12px] text-owner-fg-3">
              A <strong>Free</strong> coupon fully discounts the applicable
              amount.
            </p>
          )}

          <label className="flex items-center justify-between rounded-owner-md border border-owner-border bg-owner-bg p-3">
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-owner-fg-1">
                Display on order page
              </span>
              <span className="block text-[11px] text-owner-fg-4">
                Show this code publicly on the ordering page. Off keeps it
                private for specific campaigns.
              </span>
            </span>
            <input
              type="checkbox"
              checked={showToCustomers}
              onChange={(e) => setShowToCustomers(e.target.checked)}
              className="h-4 w-4 shrink-0"
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field
            label="Overall max usage"
            hint="Total redemptions across all customers. Blank = unlimited."
            locked={discountLock}
          >
            <input
              className={inputCls}
              type="number"
              disabled={discountLock}
              value={maxUsage}
              onChange={(e) => setMaxUsage(e.target.value)}
              placeholder="Enter max usage"
            />
          </Field>
          <Field
            label="Max usage per customer"
            hint="How many times one customer can use it. Blank = unlimited."
            locked={discountLock}
          >
            <input
              className={inputCls}
              type="number"
              disabled={discountLock}
              value={maxPerCustomer}
              onChange={(e) => setMaxPerCustomer(e.target.value)}
              placeholder="Enter max usage per customer"
            />
          </Field>
          <Field
            label="Minimum cart value"
            hint="Minimum order amount required to use this code."
            locked={discountLock}
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-owner-fg-3">₹</span>
              <input
                className={inputCls}
                type="number"
                disabled={discountLock}
                value={minCartValue}
                onChange={(e) => setMinCartValue(e.target.value)}
                placeholder="0"
              />
            </div>
          </Field>
          <Field
            label="Limit coupon after sales"
            hint="Auto-deactivate once total sales through the code reach this amount."
            locked={discountLock}
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-owner-fg-3">₹</span>
              <input
                className={inputCls}
                type="number"
                disabled={discountLock}
                value={salesLimit}
                onChange={(e) => setSalesLimit(e.target.value)}
                placeholder="Make coupon inactive after this much sales"
              />
            </div>
          </Field>
          <Field label="Coupon usage type" locked={discountLock}>
            <select
              className={inputCls}
              value={usageType}
              disabled={discountLock}
              onChange={(e) => setUsageType(e.target.value as CouponUsageType)}
            >
              <option value="EntireSale">Entire sale</option>
              <option value="FirstSignedOrder">First signed-in order</option>
            </select>
          </Field>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <OwnerButton
          variant="secondary"
          onClick={step === 1 ? onCancel : () => setStep(1)}
          disabled={saving}
        >
          {step === 1 ? "Cancel" : "Back"}
        </OwnerButton>
        {step === 1 ? (
          <OwnerButton variant="primary" onClick={handleContinue} disabled={saving}>
            Continue
          </OwnerButton>
        ) : (
          <OwnerButton variant="primary" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {isEdit ? "Save changes" : "Create coupon"}
          </OwnerButton>
        )}
      </div>
    </div>
  );
};

export default CouponEditor;
