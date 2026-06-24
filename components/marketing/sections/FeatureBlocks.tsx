"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { FEATURE_BLOCKS } from "../data/site-copy";
import { BlurImage } from "../visuals/BlurImage";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * The four deep-dive blocks — alternating image/copy. This is where the
 * differentiators get room to breathe: own your audience, sell every
 * kind of ticket, grow repeat fans, run the night. Copy + art come from
 * FEATURE_BLOCKS so the voice and claims stay in one place.
 */
export const FeatureBlocks = () => {
  return (
    <section className="hm-section">
      <div className="flex flex-col gap-12 md:gap-16">
        {FEATURE_BLOCKS.map((block, index) => {
          const imageFirst = index % 2 === 1;
          return (
            <div
              key={block.id}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
            >
              {/* Copy */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: EASE }}
                className={imageFirst ? "lg:order-2" : ""}
              >
                <div className="hm-eyebrow">{block.eyebrow}</div>
                <h3 className="hm-h2 mt-3 text-[clamp(28px,3.4vw,42px)]">
                  {block.headline}
                </h3>
                <p className="hm-lead mt-5 max-w-[520px]">{block.body}</p>
                <ul className="mt-7 space-y-3">
                  {block.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--m-forest-700)] text-[var(--m-acid)]">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="text-[15px] leading-snug text-[var(--m-ink-2)]">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/product/${block.cta.slug}`}
                  className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--m-forest-700)] hover:underline"
                >
                  {block.cta.label}
                  <ArrowRight size={15} />
                </Link>
              </motion.div>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: EASE }}
                className={`relative ${imageFirst ? "lg:order-1" : ""}`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(214,255,63,0.18), transparent 60%)",
                  }}
                />
                <BlurImage
                  src={block.image}
                  alt={block.headline}
                  width={1200}
                  height={760}
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="h-[260px] w-full rounded-[24px] border border-[var(--m-border)] object-cover shadow-[0_22px_50px_-20px_rgba(15,15,15,0.28)] md:h-[340px]"
                />
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
