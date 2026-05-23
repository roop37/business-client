"use client";

import { Sparkles } from "lucide-react";

type Orientation = "banner" | "portrait" | "blue" | "photo";

type BrandLineVisualProps = {
  label: string;
  /**
   * `banner` → horizontal metallic-line card (use for wide bento
   *            slots / `layout="right"` visuals).
   * `portrait` → vertical metallic-line card (use for tall bento
   *              visual slots / square+).
   * `blue` → blue-line-portrait alt, sprinkle 1-2 across a section
   *          for tonal variety.
   * `photo` → grayscale party-image variant; pass `photoSrc` to pick
   *           which of the three approved images to use.
   */
  orientation?: Orientation;
  /** Required when orientation === "photo". */
  photoSrc?: string;
  /** Compact variant for tight bento slots — lighter padding. */
  compact?: boolean;
  /** Hide the small label pill when the card text is already overlaid. */
  showBadge?: boolean;
  className?: string;
};

const SRC: Record<Exclude<Orientation, "photo">, string> = {
  banner: "/marketing/brand/metallic-line-banner.png",
  portrait: "/marketing/brand/metallic-line-portrait.png",
  blue: "/marketing/brand/blue-line-portrait.png",
};

/**
 * Clean brand-line backdrop used inside BentoCard visual slots.
 *
 * The product screenshots inside ProductVisual contain in-image UI
 * text that fights the BentoCard's own title/body — readability
 * collapses on tiles like "Reporting & Analytics" or "Conversation
 * Marketing". This component swaps in one of the metallic / blue
 * line backgrounds so the cards stay visually rich without the
 * text collision. The card's own title + body remain the readable
 * surface; the visual is purely tonal.
 */
export const BrandLineVisual = ({
  label,
  orientation = "banner",
  photoSrc,
  compact = false,
  showBadge = true,
  className = "",
}: BrandLineVisualProps) => {
  const isPhoto = orientation === "photo";
  const bgSrc = isPhoto
    ? photoSrc ?? "/images/pexels-osvaldo-coelho-jr-388501-1117256_oi210m.jpg"
    : SRC[orientation as Exclude<Orientation, "photo">];

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgSrc}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover ${
          isPhoto ? "grayscale brightness-110 contrast-110" : ""
        }`}
        draggable={false}
      />
      {/* Tonal overlay — keeps the kicker pill readable on either
          the line graphics or the duotoned grayscale photo. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isPhoto
            ? "linear-gradient(160deg, rgba(214,255,63,0.12) 0%, rgba(12,12,10,0.55) 55%, rgba(6,6,4,0.92) 100%)"
            : "linear-gradient(to bottom right, rgba(0,0,0,0.20), rgba(0,0,0,0.35), rgba(0,0,0,0.65))",
        }}
      />
      {showBadge ? (
        <div
          className={`relative flex h-full w-full items-end ${
            compact ? "p-3" : "p-4 md:p-5"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--m-acid)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--m-forest-900)] shadow-[0_6px_14px_rgba(214,255,63,0.32)]">
            <Sparkles size={10} strokeWidth={2.4} />
            {label}
          </span>
        </div>
      ) : null}
    </div>
  );
};
