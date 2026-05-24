"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Linkedin } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWaitlist } from "../waitlist/WaitlistContext";
import { getRelatedBlogs, type Blog } from "./blog-data";
import { BLOG_FIXED_TOP_PX, useFixedAfterReachTop } from "./useFixedAfterReachTop";

const EASE = [0.2, 0.6, 0.2, 1] as const;

type TocItem = { id: string; text: string };

/**
 * Defensive sanitizer for the blog HTML body. Content comes from a
 * checked-in TS file we author ourselves (blog-data.ts) — so there
 * is no untrusted-input vector — but stripping the obvious XSS
 * vectors keeps the surface tight in case future blogs ever come
 * from anywhere else.
 *
 * Strips: <script>, <iframe>, <object>, <embed>, on*="..." event
 * handlers, and javascript:/data:text/html URL schemes.
 */
const sanitize = (html: string): string =>
  html
    .replace(/<\s*(script|iframe|object|embed|style)[\s\S]*?<\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|style)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'")
    .replace(/(href|src)\s*=\s*"\s*data:text\/html[^"]*"/gi, '$1="#"');

/**
 * Parse the post's HTML body and return:
 *   - the same HTML but with `id` attributes injected on every <h3>
 *     (so the Table of Contents can anchor-scroll to them)
 *   - a flat list of {id, text} for rendering the TOC
 */
const buildToc = (
  htmlIn: string
): { html: string; toc: TocItem[] } => {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const html = htmlIn.replace(
    /<h3([^>]*)>([\s\S]*?)<\/h3>/g,
    (_match, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const base = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80) || "section";
      const count = used.get(base) ?? 0;
      const id = count === 0 ? base : `${base}-${count + 1}`;
      used.set(base, count + 1);
      toc.push({ id, text });
      return `<h3 id="${id}"${attrs}>${inner}</h3>`;
    }
  );
  return { html, toc };
};

export const BlogPost = ({ blog }: { blog: Blog }) => {
  const { open: openWaitlist } = useWaitlist();
  const { html, toc } = useMemo(() => {
    const withIds = buildToc(blog.content);
    return { html: sanitize(withIds.html), toc: withIds.toc };
  }, [blog.content]);
  const related = useMemo(() => getRelatedBlogs(blog.id, 3), [blog.id]);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const sidebarFixed = useFixedAfterReachTop(sidebarRef, authorRef);
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = contentRef.current;
    if (!root || toc.length === 0) return;
    const headings = toc
      .map((t) => root.querySelector<HTMLHeadingElement>(`#${CSS.escape(t.id)}`))
      .filter((el): el is HTMLHeadingElement => Boolean(el));
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.1 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <article className="hm-section pt-12 md:pt-16">
      <Link
        href="/blog"
        className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--m-ink-2)] hover:text-[var(--m-ink-1)]"
      >
        <ArrowLeft
          size={16}
          className="transition-transform duration-300 group-hover:-translate-x-0.5"
        />
        Back
      </Link>

      <div className="mt-7 max-w-[860px]">
        <span className="inline-flex items-center rounded-full bg-[var(--m-canvas-2)] px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[var(--m-ink-2)]">
          {blog.category}
        </span>
        <h1
          className="mt-5 font-semibold leading-[1.06] tracking-[-0.022em] text-[var(--m-ink-1)]"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(34px, 4.6vw, 56px)",
          }}
        >
          {blog.title}
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-[var(--m-ink-3)]">
          {blog.excerpt}
        </p>

        <div className="mt-7 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.author.image}
            alt={blog.author.name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            draggable={false}
          />
          <div className="text-[13.5px] leading-tight">
            <div className="font-semibold text-[var(--m-ink-1)]">
              {blog.author.name}
            </div>
            <div className="text-[var(--m-ink-4)]">
              {blog.date} · {blog.readTime}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-[var(--m-r-xl)] bg-[var(--m-canvas-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blog.image}
          alt={blog.title}
          className="block h-auto w-full"
          draggable={false}
        />
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr,300px] md:gap-14">
        <div
          ref={contentRef}
          className="blog-body max-w-[760px] break-words text-[16.5px] leading-[1.7] text-[var(--m-ink-2)] [overflow-wrap:anywhere]"
          /* Content is author-controlled (blog-data.ts checked into
             repo) and additionally passed through sanitize() above —
             strips script/iframe/object/embed/style + on* event
             handlers + javascript: / data:text/html URL schemes. */
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <aside ref={sidebarRef} className="relative hidden md:block md:min-h-[520px] md:self-start">
          <div
            className={`space-y-6 ${
              sidebarFixed.stuck
                ? "md:fixed md:z-30 md:max-h-[calc(100vh-var(--m-nav-h)-40px)] md:overflow-y-auto md:pr-1"
                : sidebarFixed.stopped
                  ? "md:absolute md:left-0"
                : ""
            }`}
            style={
              sidebarFixed.stuck
                ? {
                    top: BLOG_FIXED_TOP_PX,
                    width: sidebarFixed.width,
                  }
                : sidebarFixed.stopped
                  ? {
                      top: sidebarFixed.stopTop,
                      width: sidebarFixed.width,
                    }
                : undefined
            }
          >
            {toc.length > 0 && (
              <div className="rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-4">
                <div className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-3)]">
                  Table of Contents
                </div>
                <ul className="mt-3 space-y-0.5 border-l border-[var(--m-border)] pl-3">
                  {toc.map((t) => {
                    const active = activeId === t.id;
                    return (
                      <li key={t.id} className="relative">
                        {/* Acid accent strip on the active item — replaces the
                            full-pill background so the TOC stays compact. */}
                        {active ? (
                          <span
                            aria-hidden
                            className="absolute -left-3 top-0 bottom-0 w-[2px] rounded-full bg-[var(--m-forest-700)]"
                          />
                        ) : null}
                        <a
                          href={`#${t.id}`}
                          className={`block rounded-[6px] px-2 py-1 text-[12.5px] leading-[1.35] transition ${
                            active
                              ? "font-semibold text-[var(--m-ink-1)]"
                              : "text-[var(--m-ink-3)] hover:text-[var(--m-ink-1)]"
                          }`}
                        >
                          {t.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="rounded-[var(--m-r-lg)] bg-[var(--m-blue-050,#EFF4FE)] p-6">
              <p className="text-[14px] leading-relaxed text-[var(--m-ink-2)]">
                Ready to lower your commission and own your fan data? Get a
                quick event-specific quote from Hoizr.
              </p>
              <ul className="mt-4 space-y-2 text-[13px] text-[var(--m-ink-2)]">
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--m-forest-700)] text-white">
                    ✓
                  </span>
                  Lowest commission in India
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--m-forest-700)] text-white">
                    ✓
                  </span>
                  Owned fan CRM, exportable
                </li>
              </ul>
              {/* Pre-launch: signup CTA hidden until dashboard reopens.
              <Link
                href="/signup"
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--m-forest-700)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--m-forest-800)]"
              >
                Get my event rate
                <ArrowUpRight size={14} />
              </Link>
              */}
              <button
                type="button"
                onClick={() => openWaitlist("blog-sidebar")}
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--m-forest-700)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--m-forest-800)]"
              >
                Join the waitlist
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div ref={authorRef} className="mt-16 rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-[var(--m-surface)] p-8 md:p-10">
        <div className="text-[14.5px] font-semibold tracking-[-0.01em] text-[var(--m-ink-1)]">
          About the author
        </div>
        <div className="mt-6 flex flex-col items-start gap-6 md:flex-row md:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.author.image}
            alt={blog.author.name}
            className="h-24 w-24 shrink-0 rounded-full object-cover"
            draggable={false}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div
                  className="font-semibold leading-tight text-[var(--m-ink-1)]"
                  style={{
                    fontFamily: "var(--m-font-display)",
                    fontSize: "clamp(20px, 2.2vw, 26px)",
                  }}
                >
                  {blog.author.name}
                </div>
                <div className="mt-1 text-[13px] text-[var(--m-ink-4)]">
                  {blog.author.role}
                </div>
              </div>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--m-border)] text-[var(--m-ink-2)] transition hover:bg-[var(--m-canvas-2)]"
              >
                <Linkedin size={16} />
              </a>
            </div>
            <p className="mt-4 max-w-[640px] text-[14.5px] leading-relaxed text-[var(--m-ink-3)]">
              {blog.author.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2
          className="text-center font-semibold leading-[1.06] tracking-[-0.02em] text-[var(--m-ink-1)]"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(28px, 3.2vw, 40px)",
          }}
        >
          Other recent blogs
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {related.map((b, i) => (
            <RelatedCard key={b.id} blog={b} index={i} />
          ))}
        </div>
      </div>
    </article>
  );
};

const RelatedCard = ({ blog, index }: { blog: Blog; index: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, ease: EASE, delay: 0.05 * index }}
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
      <div className="p-6">
        <span className="inline-flex items-center rounded-full bg-[var(--m-canvas-2)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--m-ink-2)]">
          {blog.category}
        </span>
        <h3
          className="mt-4 font-semibold leading-[1.12] tracking-[-0.015em] text-[var(--m-ink-1)] underline-offset-4 group-hover:text-[var(--m-forest-700)] group-hover:underline"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(18px, 1.8vw, 22px)",
          }}
        >
          {blog.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-[var(--m-ink-3)]">
          {blog.excerpt}
        </p>
        <div className="mt-5 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.author.image}
            alt={blog.author.name}
            className="h-7 w-7 shrink-0 rounded-full object-cover"
            draggable={false}
          />
          <div className="text-[12px] leading-tight">
            <div className="font-semibold text-[var(--m-ink-1)]">
              {blog.author.name}
            </div>
            <div className="text-[var(--m-ink-4)]">{blog.date}</div>
          </div>
        </div>
      </div>
    </Link>
  </motion.article>
);
