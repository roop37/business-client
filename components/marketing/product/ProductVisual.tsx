"use client";

import { motion } from "framer-motion";
import { getProductStoryImageSrc } from "./product-story-images";

type ProductVisualProps = {
  slug: string;
  label: string;
  compact?: boolean;
  className?: string;
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * ProductVisual — image-first showcase.
 *
 * Simplified 2026-05-23 per user feedback:
 *   - 3D pointer-tracked tilt removed (was a mouse-hover gimmick)
 *   - Card border + inner sheen removed
 *   - Image renders directly with its rounded corners baked in
 *   - Floating chips removed so the product screenshot is clean and
 *     the badge text never fights the image itself
 *   - Volumetric glow halo + entrance bounce retained
 */
export const ProductVisual = ({
  slug,
  label,
  compact = false,
  className = "",
}: ProductVisualProps) => {
  const storyImage =
    getProductStoryImageSrc(slug) ??
    "/marketing/brand/metallic-line-portrait.png";

  return (
    <div className={`relative ${className}`}>
      {/* Volumetric glow halo behind the image (kept — it's part of
          the entrance choreography, no mouse tracking). */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(214,255,63,0.22), transparent 60%), radial-gradient(circle at 100% 100%, rgba(31,98,232,0.18), transparent 55%)",
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.1, ease: EASE }}
      />

      {/* The image — direct, no border, no surrounding card chrome,
          rounded corners baked into the <img> itself. Entrance is a
          single spring bounce so it still feels alive when it
          arrives in viewport. */}
      <motion.div
        className={compact ? "absolute inset-0" : "relative"}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          type: "spring",
          stiffness: 140,
          damping: 18,
          mass: 0.9,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={storyImage ?? "/marketing/brand/metallic-line-portrait.png"}
          alt=""
          aria-hidden
          className={
            compact
              ? // Related-product card: fill the aspect-[9/16] box and crop,
                // so any source aspect renders cleanly instead of breaking.
                "h-full w-full rounded-[24px] object-cover"
              : "block h-auto w-full rounded-[24px] shadow-[0_22px_50px_-20px_rgba(15,15,15,0.25)]"
          }
          draggable={false}
        />
      </motion.div>
    </div>
  );
};
