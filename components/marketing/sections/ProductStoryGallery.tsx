"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MARKETING_PILLARS } from "../data/nav-products";
import { getProductStoryImageSrc } from "../product/product-story-images";
import { BlurImage } from "../visuals/BlurImage";

/**
 * ProductStoryGallery — compact one-row infinite marquee.
 *
 * Per user spec: direct product images, minimal title + compact
 * single-line description overlaid on the image, auto-scrolling row,
 * pause on hover, sprinkled metallic-banner cards for visual rhythm
 * (no product image — just text on the brand backdrop).
 *
 * Animation driven by useAnimationFrame on a single useMotionValue
 * x-offset. The row is the products list duplicated end-to-end; once
 * x ≤ -halfWidth we wrap to 0 for a seamless loop.
 */

type Tile = {
  slug: string;
  label: string;
  blurb: string;
  pillar: string;
  image: string | null;
  variant: "image" | "metallic";
};

const SPEED_PX_PER_SEC = 72;
const METALLIC_BG = "/marketing/brand/metallic-line-banner.png";
const LOOP_BADGE_CLASS =
  "inline-flex items-center gap-1.5 rounded-full bg-[var(--m-acid)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--m-forest-900)] shadow-[0_4px_10px_rgba(214,255,63,0.32)]";
const LOOP_BADGE_DOT_CLASS =
  "h-1.5 w-1.5 rounded-full bg-[var(--m-forest-900)]";

const SOURCE: Tile[] = MARKETING_PILLARS.flatMap((pillar) =>
  pillar.products.map((p) => ({
    slug: p.slug,
    label: p.label,
    blurb: p.blurb,
    pillar: pillar.label,
    image: getProductStoryImageSrc(p.slug),
  }))
).map((p, i) => ({
  ...p,
  variant:
    !p.image || i % 5 === 4
      ? ("metallic" as const)
      : ("image" as const),
}));

export const ProductStoryGallery = () => {
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const halfWidthRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      const sequence = sequenceRef.current;
      if (!sequence) return;
      halfWidthRef.current = sequence.scrollWidth;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Normalize an arbitrary x offset into the seamless wrap window
  // (-halfWidth, 0]. Used both during drag (so user can fling either
  // direction without the row sliding off) and after release.
  const wrap = (value: number) => {
    const half = halfWidthRef.current;
    if (half <= 0) return value;
    const wrapped = value % half;
    return wrapped > 0 ? wrapped - half : wrapped;
  };

  useAnimationFrame((_, delta) => {
    if (paused || dragging) return;
    const next = wrap(x.get() - (delta / 1000) * SPEED_PX_PER_SEC);
    x.set(next);
  });

  return (
    <section id="product-stories" className="hm-section pt-4 md:pt-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-[680px]">
          <div className="hm-eyebrow">Platform coverage</div>
          <h2 className="hm-h2 mt-3">
            One operating system for the whole event loop.
          </h2>
          <p className="hm-lead mt-5 max-w-[560px]">
            Build demand, sell tickets, keep the door moving, and turn every
            buyer into a reachable audience for the next night.
          </p>
        </div>
        <div className="hidden text-[12px] uppercase tracking-[0.14em] text-[var(--m-ink-4)] md:block">
          Hover to pause · Tap any product
        </div>
      </div>

      <div
        className="relative left-1/2 mt-10 w-screen -translate-x-1/2 overflow-hidden px-6 md:px-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.div
          ref={trackRef}
          style={{ x, touchAction: "pan-y" }}
          drag="x"
          dragMomentum
          dragElastic={0}
          dragTransition={{ power: 0.22, timeConstant: 320, bounceStiffness: 0, bounceDamping: 0 }}
          onDragStart={() => setDragging(true)}
          onDrag={() => {
            // Keep the row inside the seamless wrap window while the
            // user is dragging — without this, a long swipe slides the
            // entire duplicated list off-screen and reveals empty space.
            x.set(wrap(x.get()));
          }}
          onDragEnd={() => {
            x.set(wrap(x.get()));
            setDragging(false);
          }}
          className="flex w-max cursor-grab items-stretch active:cursor-grabbing"
        >
          {[0, 1].map((group) => (
            <div
              key={group}
              ref={group === 0 ? sequenceRef : undefined}
              className="flex shrink-0 items-stretch gap-5 pr-5"
            >
              {SOURCE.map((tile) => (
                <MarqueeTile key={`${tile.slug}-${group}`} tile={tile} />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const MarqueeTile = ({ tile }: { tile: Tile }) => {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPressed(true);
    window.setTimeout(() => {
      router.push(`/product/${tile.slug}`);
    }, 240);
  };

  if (tile.variant === "metallic") {
    return (
      <motion.a
        href={`/product/${tile.slug}`}
        onClick={handleClick}
        animate={pressed ? { scale: 0.95 } : { scale: 1 }}
        whileHover={{ y: -3 }}
        className="group relative flex h-[384px] w-[216px] shrink-0 flex-col justify-between overflow-hidden rounded-[24px] px-5 py-6 text-white md:h-[432px] md:w-[243px]"
      >
        <BlurImage
          src={METALLIC_BG}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 720px) 216px, 243px"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-black/15 via-black/25 to-black/55"
        />
        <span className={`relative w-fit ${LOOP_BADGE_CLASS}`}>
          <span className={LOOP_BADGE_DOT_CLASS} />
          {tile.pillar}
        </span>
        <div className="relative">
          <h3
            className="font-semibold leading-tight tracking-[-0.012em] text-white"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "20px",
            }}
          >
            {tile.label}
          </h3>
          <p className="mt-2 line-clamp-3 text-[14px] leading-snug text-white/82">
            {tile.blurb}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/90">
            Explore
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </motion.a>
    );
  }

  return (
    <motion.a
      href={`/product/${tile.slug}`}
      onClick={handleClick}
      animate={pressed ? { scale: 0.95 } : { scale: 1 }}
      whileHover={{ y: -3 }}
      className="group relative flex h-[384px] w-[216px] shrink-0 flex-col justify-end overflow-hidden rounded-[24px] text-white md:h-[432px] md:w-[243px]"
    >
      <BlurImage
        src={tile.image!}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 720px) 216px, 243px"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        draggable={false}
      />
      {/* Bottom-anchored gradient so the image breathes at top, text
          stays readable at bottom. No heavy global overlay. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0.56) 100%)",
        }}
      />
      <span className={`absolute left-4 top-4 ${LOOP_BADGE_CLASS}`}>
        <span className={LOOP_BADGE_DOT_CLASS} />
        {tile.pillar}
      </span>
      <div className="relative p-5">
        <h3
          className="font-semibold leading-tight tracking-[-0.01em] text-white"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "19px",
          }}
        >
          {tile.label}
        </h3>
        <p className="mt-1.5 line-clamp-1 text-[14px] leading-snug text-white/88">
          {tile.blurb}
        </p>
      </div>
    </motion.a>
  );
};
