"use client";

import type { ReactNode } from "react";

/**
 * CustomerEventCard — the EXACT visual the customer sees on
 * hoizr-client (`<EventCard>` in `src/components/hoizr-ui/EventCard.tsx`).
 *
 * Mirrored here so the host's "Live Event Preview" in EventJourney
 * shows the same card a customer will see. Keep this file in sync with
 * `hoizr-client/src/components/hoizr-ui/EventCard.tsx` and the
 * `.h-tile*` rules in `hoizr-client/src/app/globals.css`.
 */
export type CustomerEventCardProps = {
  flyer?: string | null;
  fallbackGradient?: string;
  dateLine: string;
  title: string;
  venueLine?: string;
  priceLine: string;
  placeholder?: ReactNode;
};

const DEFAULT_FALLBACK =
  "linear-gradient(135deg, #FA2D48 0%, #7A1FFF 100%)";

const CustomerEventCard = ({
  flyer,
  fallbackGradient = DEFAULT_FALLBACK,
  dateLine,
  title,
  venueLine,
  priceLine,
  placeholder,
}: CustomerEventCardProps) => (
  <div className="cust-tile">
    <div className="cust-tile-flyer">
      {flyer ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={flyer} alt={title || "Event flyer"} />
      ) : placeholder ? (
        <div className="cust-tile-flyer-placeholder">{placeholder}</div>
      ) : (
        <div
          className="cust-tile-flyer-fallback"
          style={{ background: fallbackGradient }}
          aria-hidden
        />
      )}
    </div>
    <div className="cust-tile-info">
      <span className="cust-tile-date">{dateLine}</span>
      <h3 className="cust-tile-title">{title || "Untitled Event"}</h3>
      {venueLine ? <p className="cust-tile-venue">{venueLine}</p> : null}
      <p className="cust-tile-price">{priceLine}</p>
    </div>
  </div>
);

export default CustomerEventCard;
