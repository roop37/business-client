"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { blogs, getAllCategories, type Blog } from "./blog-data";
import { BLOG_FIXED_TOP_PX, useFixedAfterReachTop } from "./useFixedAfterReachTop";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * ChoosePOS-style blog index.
 *
 * Layout (desktop):
 *   ─ Page header (title + lede)
 *   ─ Sticky Categories sidebar  |  Featured card (1 wide)
 *                                 |  2-col grid of remaining posts
 *
 * Layout (mobile): single-column post stack with category select up top.
 */
export const BlogIndex = () => {
  const allCategories = ["All", ...getAllCategories()];
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categoriesRef = useRef<HTMLElement>(null);
  const categoryStopRef = useRef<HTMLDivElement>(null);
  const categoryFixed = useFixedAfterReachTop(
    categoriesRef,
    categoryStopRef
  );

  const filtered =
    activeCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === activeCategory);
  const [featured, ...rest] = filtered;

  return (
    <section className="hm-section pt-12 md:pt-16">
      <div className="max-w-[760px]">
        <h1
          className="font-semibold leading-[1.04] tracking-[-0.025em] text-[var(--m-ink-1)]"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(40px, 5.4vw, 64px)",
          }}
        >
          Resources and insights
        </h1>
        <p className="mt-5 max-w-[620px] text-[17px] leading-relaxed text-[var(--m-ink-3)]">
          Fresh insights and practical playbooks for modern event hosts, venues,
          and nightlife operators in India.
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:mt-14 md:grid-cols-[260px,1fr] md:gap-10">
        {/* CATEGORIES — sidebar on desktop, horizontal scroll-chip row
            on mobile. The mobile layout keeps the filter accessible
            without taking 200+px of vertical space above the posts. */}
        <aside
          ref={categoriesRef}
          className="relative md:min-h-[340px] md:self-start"
        >
          {/* Mobile: horizontal chip row, scrollable */}
          <div className="sticky top-[calc(var(--m-nav-h)+8px)] z-30 -mx-5 border-y border-[var(--m-border)] bg-[var(--m-canvas)]/95 px-5 py-3 backdrop-blur md:hidden">
            <div className="overflow-x-auto">
              <div className="flex w-max gap-2 pb-1">
                {allCategories.map((cat) => {
                  const active = cat === activeCategory;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition ${
                        active
                          ? "border-[var(--m-forest-700)] bg-[var(--m-forest-700)] text-white"
                          : "border-[var(--m-border)] bg-[var(--m-surface)] text-[var(--m-ink-2)] hover:bg-[var(--m-canvas-2)]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop: sticky vertical list */}
          <div
            className={`hidden md:block ${
              categoryFixed.stuck
                ? "md:fixed md:z-30"
                : categoryFixed.stopped
                  ? "md:absolute md:left-0"
                  : ""
            }`}
            style={
              categoryFixed.stuck
                ? {
                    top: BLOG_FIXED_TOP_PX,
                    width: categoryFixed.width,
                  }
                : categoryFixed.stopped
                  ? {
                      top: categoryFixed.stopTop,
                      width: categoryFixed.width,
                    }
                : undefined
            }
          >
            <div className="rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-6 shadow-[0_18px_40px_rgba(11,11,8,0.08)]">
              <div className="text-[15px] font-semibold tracking-[-0.012em] text-[var(--m-ink-1)]">
                Categories
              </div>
              <ul className="mt-5 space-y-1.5">
                {allCategories.map((cat) => {
                  const active = cat === activeCategory;
                  return (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full rounded-[10px] px-3.5 py-2.5 text-left text-[13.5px] font-medium transition ${
                          active
                            ? "bg-[var(--m-forest-700)] text-white"
                            : "text-[var(--m-ink-2)] hover:bg-[var(--m-canvas-2)]"
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* POST GRID */}
        <div>
          {featured ? (
            <FeaturedCard blog={featured} />
          ) : (
            <div className="rounded-[var(--m-r-lg)] border border-dashed border-[var(--m-border)] p-10 text-center text-[var(--m-ink-4)]">
              No posts in this category yet.
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {rest.map((b, i) => (
                <BlogCard key={b.id} blog={b} index={i} />
              ))}
            </div>
          )}
          <div ref={categoryStopRef} aria-hidden className="h-px" />
        </div>
      </div>
    </section>
  );
};

const FeaturedCard = ({ blog }: { blog: Blog }) => (
  <motion.article
    initial={{ opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: EASE }}
  >
    <Link
      href={`/blog/${blog.id}`}
      className="group block overflow-hidden rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-[var(--m-surface)] transition hover:-translate-y-1 hover:shadow-[var(--m-shadow-pop)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--m-canvas-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blog.image}
          alt={blog.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          draggable={false}
        />
      </div>
      <div className="p-7 md:p-9">
        <span className="inline-flex items-center rounded-full bg-[var(--m-canvas-2)] px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[var(--m-ink-2)]">
          {blog.category}
        </span>
        <h2
          className="mt-5 font-semibold leading-[1.08] tracking-[-0.018em] text-[var(--m-ink-1)]"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(26px, 3vw, 38px)",
          }}
        >
          <span className="inline-flex items-baseline gap-2">
            <span className="underline-offset-4 group-hover:text-[var(--m-forest-700)] group-hover:underline">
              {blog.title}
            </span>
            <ArrowRight
              size={22}
              className="shrink-0 translate-y-0.5 text-[var(--m-forest-700)] transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </h2>
        <p className="mt-4 max-w-[540px] text-[15.5px] leading-relaxed text-[var(--m-ink-3)]">
          {blog.excerpt}
        </p>
        <div className="mt-7 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.author.image}
            alt={blog.author.name}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
            draggable={false}
          />
          <div className="text-[13px] leading-tight">
            <div className="font-semibold text-[var(--m-ink-1)]">
              {blog.author.name}
            </div>
            <div className="text-[var(--m-ink-4)]">
              {blog.date} · {blog.readTime}
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.article>
);

const BlogCard = ({ blog, index }: { blog: Blog; index: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, ease: EASE, delay: 0.04 * (index % 6) }}
  >
    <Link
      href={`/blog/${blog.id}`}
      className="group block overflow-hidden rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-[var(--m-surface)] transition hover:-translate-y-1 hover:shadow-[var(--m-shadow-pop)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--m-canvas-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blog.image}
          alt={blog.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          draggable={false}
        />
      </div>
      <div className="p-6 md:p-7">
        <span className="inline-flex items-center rounded-full bg-[var(--m-canvas-2)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--m-ink-2)]">
          {blog.category}
        </span>
        <h3
          className="mt-4 font-semibold leading-[1.12] tracking-[-0.015em] text-[var(--m-ink-1)]"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(20px, 1.95vw, 24px)",
          }}
        >
          <span className="inline-flex items-baseline gap-1.5">
            <span className="underline-offset-4 group-hover:text-[var(--m-forest-700)] group-hover:underline">
              {blog.title}
            </span>
            <ArrowUpRight
              size={18}
              className="shrink-0 translate-y-0.5 text-[var(--m-forest-700)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </h3>
        <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-[var(--m-ink-3)]">
          {blog.excerpt}
        </p>
        <div className="mt-5 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.author.image}
            alt={blog.author.name}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
            draggable={false}
          />
          <div className="text-[12.5px] leading-tight">
            <div className="font-semibold text-[var(--m-ink-1)]">
              {blog.author.name}
            </div>
            <div className="text-[var(--m-ink-4)]">
              {blog.date} · {blog.readTime}
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.article>
);
