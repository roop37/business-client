import { Check, X } from "lucide-react";
import { ProductContent } from "../data/product-content";

/**
 * ProductComparison — "Hoizr vs the marketplace" table.
 *
 * Rendered server-side as a real <table> (no "use client", no motion)
 * so AI crawlers, which do not run JavaScript, can extract it directly.
 * Comparison tables are a prime AI-citation format. Renders only when
 * the product defines `content.comparison`.
 */
export const ProductComparison = ({ content }: { content: ProductContent }) => {
  const cmp = content.comparison;
  if (!cmp?.rows?.length) return null;

  return (
    <section className="hm-section">
      <div className="hm-eyebrow">Hoizr vs the marketplace</div>
      <h2
        className="mt-3 max-w-[720px] font-bold leading-[1.04] tracking-[-0.025em] text-[var(--m-ink-1)]"
        style={{
          fontFamily: "var(--m-font-display)",
          fontSize: "clamp(30px, 3.6vw, 44px)",
        }}
      >
        {cmp.heading ?? `Why run ${content.label.toLowerCase()} on Hoizr, not a marketplace.`}
      </h2>

      <div className="mt-8 overflow-x-auto rounded-[var(--m-r-2xl)] border border-[var(--m-border)] bg-[var(--m-surface)]">
        <table className="w-full border-collapse text-left text-[15px] leading-relaxed">
          <thead>
            <tr className="border-b border-[var(--m-border)]">
              <th scope="col" className="p-4 font-semibold text-[var(--m-ink-3)]">
                <span className="sr-only">Capability</span>
              </th>
              <th scope="col" className="p-4 font-bold text-[var(--m-ink-1)]">
                On Hoizr
              </th>
              <th scope="col" className="p-4 font-semibold text-[var(--m-ink-3)]">
                On a marketplace
              </th>
            </tr>
          </thead>
          <tbody>
            {cmp.rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-[var(--m-border)] align-top last:border-0"
              >
                <th
                  scope="row"
                  className="p-4 text-left font-medium text-[var(--m-ink-2)]"
                >
                  {row.label}
                </th>
                <td className="p-4 text-[var(--m-ink-1)]">
                  <span className="inline-flex items-start gap-2">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-[var(--m-forest-600)]"
                      aria-hidden
                    />
                    <span>{row.hoizr}</span>
                  </span>
                </td>
                <td className="p-4 text-[var(--m-ink-3)]">
                  <span className="inline-flex items-start gap-2">
                    <X size={16} className="mt-0.5 shrink-0" aria-hidden />
                    <span>{row.marketplace}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
