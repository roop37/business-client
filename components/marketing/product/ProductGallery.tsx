"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { MarketingProduct } from "../data/nav-products";
import { ProductContent } from "../data/product-content";
import { getProductStoryImageSrc } from "./product-story-images";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type ProductGalleryProps = {
  content: ProductContent;
  related: MarketingProduct[];
};

const SUBLINES = [
  "Pairs cleanly with this — same workspace, same data.",
  "Compounds with this — share fans, share signals.",
  "Drops in next — no extra setup if you're already on Hoizr.",
];

/**
 * ProductGallery — extended content section for product detail pages.
 *
 * Compact related-product workflow strip. Each tile shows a rounded
 * product image directly, then a short note underneath. No bordered
 * split-card chrome — the image itself carries the visual weight.
 *
 * Animation behaviour:
 *   - Section gets a scroll-driven background gradient that shifts as
 *     the viewport progresses through.
 *   - Tiles enter with a simple fade/lift.
 *   - Images scale subtly on hover.
 */
export const ProductGallery = ({ content, related }: ProductGalleryProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const haloOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 1, 0.4]);
  const haloRotate = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  if (!related.length) return null;

  return (
    <section ref={sectionRef} className="hm-section relative">
      {/* Decorative scroll-driven halo. Conic gradient slowly rotates
          as the section moves through the viewport. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-[440px] w-[840px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "conic-gradient(from 200deg at 50% 50%, rgba(195,255,46,0.18), rgba(31,98,232,0.16), rgba(15,15,15,0.05), rgba(195,255,46,0.18))",
          opacity: haloOpacity,
          rotate: haloRotate,
        }}
      />

      <div className="max-w-[760px]">
        <div className="hm-eyebrow">Inside the workflow</div>
        <h2 className="hm-h2 mt-3">
          {content.label} sits inside the rest of Hoizr.
        </h2>
        <p className="hm-lead mt-5 max-w-[560px]">
          Every product is built so the next thing you need is one click away.
          The same workspace, the same fan signals, the same paid-event data —
          shared across everything below.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {related.map((p, i) => {
          const image = getProductStoryImageSrc(p.slug);
          const subline = SUBLINES[i % SUBLINES.length];
          return (
            <GalleryCard
              key={p.slug}
              index={i}
              product={p}
              image={image}
              subline={subline}
            />
          );
        })}
      </div>
    </section>
  );
};

const GalleryCard = ({
  index,
  product,
  image,
  subline,
}: {
  index: number;
  product: MarketingProduct;
  image: string | null;
  subline: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="group block"
      >
        <div className="relative aspect-[5/4] overflow-hidden rounded-[22px] bg-[var(--m-canvas-2)] shadow-[0_18px_42px_-24px_rgba(15,15,15,0.34)]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              aria-hidden
              className="block h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              draggable={false}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--m-canvas-2)] to-[var(--m-surface)]" />
          )}

          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--m-acid)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--m-forest-900)] shadow-[0_6px_16px_rgba(195,255,46,0.32)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--m-forest-900)]" />
            0{index + 1}
          </span>
        </div>

        <div className="mt-5">
          <div className="hm-eyebrow">{product.label}</div>
          <h3
            className="mt-2 font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(20px, 1.9vw, 25px)",
            }}
          >
            {product.blurb ?? product.label}
          </h3>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--m-ink-3)]">
            {subline}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--m-forest-700)]">
            See {product.label.toLowerCase()}
            <MoveRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};
