"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Linkedin } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getRelatedBlogs, type Blog } from "./blog-data";

const EASE = [0.2, 0.6, 0.2, 1] as const;
const BLOG_TOC_TOP_PX = 96;

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
 *   - the same HTML but with `id` attributes injected on every <h2>
 *     (so the Table of Contents can anchor-scroll to them)
 *   - a flat list of {id, text} for rendering the TOC
 */
const buildToc = (
  htmlIn: string
): { html: string; toc: TocItem[] } => {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const html = htmlIn.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/g,
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
      return `<h2 id="${id}"${attrs}>${inner}</h2>`;
    }
  );
  return { html, toc };
};

export const BlogPost = ({ blog }: { blog: Blog }) => {
  const { html, toc } = useMemo(() => {
    const withIds = buildToc(blog.content);
    return { html: sanitize(withIds.html), toc: withIds.toc };
  }, [blog.content]);
  const related = useMemo(() => getRelatedBlogs(blog.id, 3), [blog.id]);
  const contentRef = useRef<HTMLDivElement>(null);
  const tocViewportRef = useRef<HTMLDivElement>(null);
  const tocListRef = useRef<HTMLUListElement>(null);
  const liRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);
  const [indicator, setIndicator] = useState<{ top: number; height: number }>({
    top: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = contentRef.current;
    if (!root || toc.length === 0) return;

    setActiveId(toc[0]?.id ?? null);
    setIndicator({ top: 0, height: 0 });
    tocViewportRef.current?.scrollTo({ top: 0 });

    const getHeadings = () =>
      toc
        .map((t) => root.querySelector<HTMLHeadingElement>(`#${CSS.escape(t.id)}`))
        .filter((el): el is HTMLHeadingElement => Boolean(el));

    let raf = 0;
    const updateActiveFromScroll = () => {
      raf = 0;
      const headings = getHeadings();
      if (!headings.length) return;

      const readingLine = window.scrollY + Math.max(
        BLOG_TOC_TOP_PX + 64,
        Math.round(window.innerHeight * 0.3)
      );
      let next = headings[0].id;

      for (const heading of headings) {
        const headingTop = heading.getBoundingClientRect().top + window.scrollY;
        if (headingTop <= readingLine) {
          next = heading.id;
        } else {
          break;
        }
      }
      const doc = document.documentElement;
      const pageHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
      const nearBottom = window.scrollY + window.innerHeight >= pageHeight - 8;
      if (nearBottom) next = headings[headings.length - 1].id;

      setActiveId((current) => (current === next ? current : next));
    };

    const scheduleUpdate = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(updateActiveFromScroll);
    };

    const observer = new IntersectionObserver(
      () => scheduleUpdate(),
      {
        rootMargin: `-${BLOG_TOC_TOP_PX + 24}px 0px -58% 0px`,
        threshold: [0, 0.01, 0.1, 0.5, 1],
      }
    );
    const headings = getHeadings();
    if (!headings.length) return;
    headings.forEach((h) => observer.observe(h));
    const interval = window.setInterval(scheduleUpdate, 300);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.clearInterval(interval);
      observer.disconnect();
    };
  }, [toc]);

  // Animated TOC rail: measure the active list item, move the thumb,
  // and keep long TOCs auto-scrolled to the active section.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeId) return;

    const measure = () => {
      const list = tocListRef.current;
      const viewport = tocViewportRef.current;
      const li = liRefs.current[activeId];
      if (!list || !li) return;
      setIndicator({ top: li.offsetTop, height: li.offsetHeight });

      if (!viewport) return;
      const padding = 12;
      const itemTop = li.offsetTop;
      const itemBottom = itemTop + li.offsetHeight;
      const visibleTop = viewport.scrollTop;
      const visibleBottom = visibleTop + viewport.clientHeight;
      if (itemTop < visibleTop + padding) {
        viewport.scrollTo({ top: Math.max(0, itemTop - padding), behavior: "smooth" });
      } else if (itemBottom > visibleBottom - padding) {
        viewport.scrollTo({
          top: itemBottom - viewport.clientHeight + padding,
          behavior: "smooth",
        });
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeId, toc]);

  const scrollToHeading = (id: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const root = contentRef.current;
    const heading = root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!heading) return;
    const top = heading.getBoundingClientRect().top + window.scrollY - BLOG_TOC_TOP_PX - 16;
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  };

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

        <aside className="relative hidden md:block">
          <div
            className="sticky z-20 space-y-6"
            style={{ top: BLOG_TOC_TOP_PX }}
          >
            {toc.length > 0 && (
              <div className="rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-4">
                <div className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-3)]">
                  Table of Contents
                </div>
                <div
                  ref={tocViewportRef}
                  className="relative mt-3 max-h-[min(46vh,430px)] overflow-y-auto pl-3 pr-1"
                >
                  {/* Faint full-height guide line — the static rail. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0 bottom-0 w-px bg-[var(--m-border)]"
                  />
                  {/* Animated active thumb — slides to the active item
                      as the reader scrolls through the article. */}
                  <motion.span
                    aria-hidden
                    layout={false}
                    initial={false}
                    animate={{ y: indicator.top, height: indicator.height }}
                    transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.6 }}
                    className="pointer-events-none absolute left-[-1px] top-0 w-[3px] rounded-full bg-[var(--m-forest-700)] shadow-[0_0_0_3px_rgba(46,93,73,0.12)]"
                    style={{ opacity: indicator.height > 0 ? 1 : 0 }}
                  />
                  <ul ref={tocListRef} className="space-y-0.5">
                    {toc.map((t) => {
                      const active = activeId === t.id;
                      return (
                        <li
                          key={t.id}
                          ref={(el) => {
                            liRefs.current[t.id] = el;
                          }}
                          className="relative"
                        >
                          <a
                            href={`#${t.id}`}
                            onClick={(event) => scrollToHeading(t.id, event)}
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
              </div>
            )}

            <div className="rounded-[var(--m-r-lg)] bg-[var(--m-blue-050,#EFF4FE)] p-6">
              <p className="text-[14px] leading-relaxed text-[var(--m-ink-2)]">
                Ready to publish your next event directly? Bring it onto Hoizr
                and keep your fan data in your own CRM.
              </p>
              <ul className="mt-4 space-y-2 text-[13px] text-[var(--m-ink-2)]">
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--m-forest-700)] text-white">
                    ✓
                  </span>
                  No subscription wall
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--m-forest-700)] text-white">
                    ✓
                  </span>
                  Owned fan CRM, exportable
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--m-forest-700)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--m-forest-800)]"
              >
                Get started
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div
        className="relative mt-16 overflow-hidden rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-[var(--m-surface)] p-8 md:p-10"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/hero/hero-lines-star.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.16]"
          draggable={false}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.9)_48%,rgba(255,255,255,0.72)_100%)]"
        />
        <div className="relative z-10">
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--m-border)] bg-white/70 text-[var(--m-ink-2)] transition hover:bg-white"
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
