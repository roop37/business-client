"use client";

import { useWaitlist } from "./WaitlistContext";

/**
 * Shared waitlist CTA. Public marketing surfaces stay in waitlist mode
 * while account creation remains hidden.
 */
export const WaitlistButton = ({
  source,
  className,
  children,
}: {
  source?: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const waitlist = useWaitlist();

  return (
    <button
      type="button"
      className={className}
      onClick={() => waitlist.open(source)}
    >
      {children}
    </button>
  );
};
