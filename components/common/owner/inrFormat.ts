/**
 * Format a number as INR using the Indian lakh grouping convention.
 *
 *   inrFormat(482500)       → "₹4,82,500"
 *   inrFormat(1055720, { decimals: 2 }) → "₹10,55,720.00"
 *   inrFormat(-9999, { withSymbol: false }) → "-9,999"
 *
 * Spec source: design_handoff_hoizr_admin/DESIGN.md §1.6.
 */
export function inrFormat(
  n: number | null | undefined,
  { withSymbol = true, decimals = 0 }: { withSymbol?: boolean; decimals?: number } = {}
): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) {
    return withSymbol ? "₹—" : "—";
  }
  const num = Number(n);
  const neg = num < 0;
  const abs = Math.abs(num);
  const [intPart, decPart] = abs.toFixed(decimals).split(".");
  const lastThree = intPart.slice(-3);
  const otherDigits = intPart.slice(0, -3);
  const grouped = otherDigits
    ? otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;
  return (
    (neg ? "-" : "") +
    (withSymbol ? "₹" : "") +
    grouped +
    (decPart ? "." + decPart : "")
  );
}
