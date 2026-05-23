"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { ReactNode, useCallback, useRef } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  /** How far the button tracks the cursor in px. Higher = more pull. */
  pull?: number;
};

/**
 * Magnetic CTA. The button's transform follows the cursor with a
 * spring while the pointer is over its bounding box, then snaps
 * back to centre on leave.
 *
 * Common UX pattern, original Hoizr implementation.
 */
export const MagneticButton = ({ href, children, className = "", pull = 14 }: Props) => {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 18, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 220, damping: 18, mass: 0.6 });

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const nx = Math.max(-1, Math.min(1, dx / (rect.width / 2)));
      const ny = Math.max(-1, Math.min(1, dy / (rect.height / 2)));
      rawX.set(nx * pull);
      rawY.set(ny * pull);
    },
    [pull, rawX, rawY]
  );

  const handleLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.div style={{ x, y }} className="inline-block">
      <Link
        href={href}
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className={`group relative inline-flex items-center justify-center overflow-hidden ${className}`}
      >
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
      </Link>
    </motion.div>
  );
};
