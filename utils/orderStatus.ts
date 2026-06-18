/**
 * Order-status display helpers (shared).
 *
 * Server `status` fields that are typed as plain GraphQL String return the RAW
 * stored enum value ("PaymentSuccess", "CheckedIn"), NOT the GraphQL key
 * ("PAYMENT_SUCCESS"). Enum-TYPED fields serialise to keys. To be safe against
 * both, normalise to UPPER_SNAKE before switching — otherwise badges fall
 * through to a gray "paymentsuccess". Use these everywhere an order status is
 * rendered so the mismatch isn't re-seeded per component.
 */
export const normOrderStatus = (s?: string | null): string =>
  (s || "").replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();

export const orderStatusLabel = (s?: string | null): string => {
  switch (normOrderStatus(s)) {
    case "PAYMENT_SUCCESS":
      return "Confirmed";
    case "CHECKED_IN":
      return "Checked in";
    case "PAYMENT_PENDING":
      return "Pending";
    case "REFUNDED":
      return "Refunded";
    case "FULL_REFUND_PENDING":
      return "Refund pending";
    case "CANCELLED":
      return "Cancelled";
    default:
      return (s || "").replace(/_/g, " ").toLowerCase() || "—";
  }
};

export const orderStatusClasses = (s?: string | null): string => {
  switch (normOrderStatus(s)) {
    case "PAYMENT_SUCCESS":
      return "bg-emerald-500/10 text-emerald-600";
    case "CHECKED_IN":
      return "bg-blue-500/10 text-blue-600";
    case "PAYMENT_PENDING":
    case "FULL_REFUND_PENDING":
      return "bg-amber-500/10 text-amber-600";
    case "REFUNDED":
    case "CANCELLED":
      return "bg-red-500/10 text-red-600";
    default:
      return "bg-owner-fg-4/10 text-owner-fg-4";
  }
};
