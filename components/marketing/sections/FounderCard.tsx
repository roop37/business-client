import Link from "next/link";
import { ArrowUpRight, Linkedin } from "lucide-react";

const SANBEDAN_HEADSHOT =
  "https://res.cloudinary.com/duhefgqh4/image/upload/v1748974724/IMG_0652_slotkd__1_ehtwxq.jpg";

/**
 * FounderCard — small, clear author box used below Beliefs (and
 * anywhere else we want the founder credit visible). Reuses the same
 * Cloudinary headshot the blog/post pages already use so the brand
 * face is consistent across the site.
 */
export const FounderCard = () => (
  <section className="hm-section pt-2 md:pt-6">
    <div className="mx-auto flex max-w-[680px] items-center gap-4 rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-5 md:gap-5 md:p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SANBEDAN_HEADSHOT}
        alt="Sanbedan Paul"
        className="h-14 w-14 shrink-0 rounded-full object-cover md:h-16 md:w-16"
        draggable={false}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
          Written + built by
        </div>
        <div className="mt-1 text-[15px] font-semibold leading-tight text-[var(--m-ink-1)]">
          Sanbedan Paul
        </div>
        <div className="mt-0.5 text-[12.5px] text-[var(--m-ink-3)]">
          Founder &amp; CEO · Hoizr Technologies Pvt. Ltd.
        </div>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <a
          href="https://www.linkedin.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--m-border)] text-[var(--m-ink-2)] transition hover:bg-[var(--m-canvas-2)]"
        >
          <Linkedin size={15} />
        </a>
        <Link
          href="/about"
          className="inline-flex items-center gap-1 rounded-full bg-[var(--m-forest-700)] px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-[var(--m-forest-800)]"
        >
          About
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  </section>
);
