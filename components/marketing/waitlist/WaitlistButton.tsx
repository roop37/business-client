"use client";

import { useWaitlist } from "./WaitlistContext";

/**
 * Drop-in pre-launch CTA. Same classNames as the underlying anchor so
 * existing hm-btn variants flow through. When the dashboard reopens,
 * swap WaitlistButton back to <Link href="/signup">.
 */
export const WaitlistButton = ({
  source,
  className,
  children,
  type = "button",
}: {
  source?: string;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
}) => {
  const { open } = useWaitlist();
  return (
    <button
      type={type}
      onClick={() => open(source)}
      className={className}
    >
      {children}
    </button>
  );
};
