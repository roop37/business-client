"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

/**
 * Subtle moving-sheen text. Adapted from React Bits' ShinyText to use
 * framer-motion (already a dep) instead of motion/react, trimmed to the
 * props this site needs, and made reduced-motion aware (renders plain
 * coloured text when the user prefers reduced motion). Colours accept
 * CSS custom properties so callers stay on the marketing token palette.
 */
type ShinyTextProps = {
  text: string;
  /** Base colour of the text. */
  color?: string;
  /** Colour of the sweeping highlight. */
  shineColor?: string;
  /** Seconds per sweep. */
  speed?: number;
  /** Gradient angle in degrees. */
  spread?: number;
  className?: string;
  disabled?: boolean;
};

export const ShinyText = ({
  text,
  color = "var(--m-ink-1)",
  shineColor = "var(--m-forest-300)",
  speed = 5,
  spread = 120,
  className = "",
  disabled = false,
}: ShinyTextProps) => {
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const elapsed = useRef(0);
  const last = useRef<number | null>(null);
  const durationMs = speed * 1000;

  useAnimationFrame((time) => {
    if (disabled || reduce) {
      last.current = null;
      return;
    }
    if (last.current === null) {
      last.current = time;
      return;
    }
    elapsed.current += time - last.current;
    last.current = time;
    progress.set(((elapsed.current % durationMs) / durationMs) * 100);
  });

  // p=0 → shine off right, p=100 → shine off left.
  const backgroundPosition = useTransform(
    progress,
    (p) => `${150 - p * 2}% center`,
  );

  if (disabled || reduce) {
    return (
      <span className={className} style={{ color }}>
        {text}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundPosition,
        display: "inline-block",
        // background-clip:text clips glyph descenders (the "g" tail) when
        // the paint box is shorter than the glyph. Pad the bottom and pull
        // it back with a negative margin so layout/leading is unchanged.
        paddingBottom: "0.18em",
        marginBottom: "-0.18em",
      }}
    >
      {text}
    </motion.span>
  );
};

export default ShinyText;
