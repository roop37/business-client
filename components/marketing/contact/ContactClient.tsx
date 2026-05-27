"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Mail, MessageCircle, PhoneCall, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const EASE = [0.2, 0.6, 0.2, 1] as const;
const CONTACT_PHONE_DISPLAY = "+91 83695 72945";
const CONTACT_PHONE_TEL = "tel:+918369572945";
const CONTACT_WHATSAPP = "https://wa.me/918369572945";

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  full?: boolean;
};

const FIELDS: Field[] = [
  { key: "name", label: "Your name", placeholder: "Aanya M.", required: true },
  { key: "role", label: "Role", placeholder: "Founder · Promoter · Talent buyer" },
  { key: "email", label: "Email", placeholder: "you@yourvenue.in", type: "email", required: true },
  { key: "phone", label: "Phone", placeholder: "+91 9876543210", type: "tel" },
  {
    key: "city",
    label: "City",
    placeholder: "Where do most of your nights run?",
  },
  {
    key: "format",
    label: "Event format",
    type: "select",
    options: [
      "Club nights",
      "Festivals",
      "Concerts",
      "Open-air / warehouse",
      "Comedy / cultural",
      "Mixed",
    ],
  },
  {
    key: "message",
    label: "Tell us about your next show",
    placeholder:
      "Date, capacity, ticket mix, venue, or anything that helps Hoizr understand the event.",
    type: "textarea",
    full: true,
  },
];

type FormState = Record<string, string>;

export const ContactClient = () => {
  const [values, setValues] = useState<FormState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.name?.trim() || !values.email?.trim()) {
      setError("Please give us at least a name and email so we can reach you.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Unable to send your message.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't send right now. Try emailing contact@hoizr.com directly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="rounded-[var(--m-r-xl)] border border-[var(--m-forest-200)] bg-[var(--m-forest-50)] p-8 md:p-10"
      >
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--m-forest-700)] text-[var(--m-acid)]">
          <CheckCircle2 size={22} strokeWidth={1.7} />
        </div>
        <h2
          className="mt-5 font-semibold leading-tight tracking-[-0.02em] text-[var(--m-ink-1)]"
          style={{ fontSize: "clamp(22px, 2.6vw, 30px)" }}
        >
          Got it — we&apos;ll be in touch.
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--m-ink-3)] max-w-[460px]">
          A real human will follow up within one working day. If you need us
          sooner, email{" "}
          <a
            href="mailto:contact@hoizr.com"
            className="font-semibold text-[var(--m-forest-700)] hover:underline"
          >
            contact@hoizr.com
          </a>
          , call{" "}
          <a
            href={CONTACT_PHONE_TEL}
            className="font-semibold text-[var(--m-forest-700)] hover:underline"
          >
            {CONTACT_PHONE_DISPLAY}
          </a>
          , or message us on{" "}
          <a
            href={CONTACT_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[var(--m-forest-700)] hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-[var(--m-surface)] p-6 md:p-8"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FIELDS.map((field) => (
          <label
            key={field.key}
            className={`block ${field.full ? "md:col-span-2" : ""}`}
          >
            <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--m-ink-4)]">
              {field.label}
              {field.required ? <span className="text-[var(--m-blush-deep)]"> *</span> : null}
            </span>

            {field.type === "textarea" ? (
              <textarea
                rows={4}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                placeholder={field.placeholder}
                className="mt-2 w-full rounded-xl border border-[var(--m-border)] bg-white px-3.5 py-3 text-[14.5px] text-[var(--m-ink-1)] outline-none transition focus:border-[var(--m-forest-500)]"
              />
            ) : field.type === "select" ? (
              <select
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                className="mt-2 h-11 w-full rounded-xl border border-[var(--m-border)] bg-white px-3 text-[14.5px] text-[var(--m-ink-1)] outline-none transition focus:border-[var(--m-forest-500)]"
              >
                <option value="" disabled>
                  Pick the closest match
                </option>
                {field.options!.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type ?? "text"}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                placeholder={field.placeholder}
                className="mt-2 h-11 w-full rounded-xl border border-[var(--m-border)] bg-white px-3.5 text-[14.5px] text-[var(--m-ink-1)] outline-none transition focus:border-[var(--m-forest-500)]"
              />
            )}
          </label>
        ))}
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--m-border)] pt-6">
        <p className="text-[12.5px] text-[var(--m-ink-4)]">
          By submitting, you agree to be contacted about Hoizr. We never share
          your details — see our{" "}
          <a
            href="/legal/privacy"
            className="font-semibold text-[var(--m-forest-700)] hover:underline"
          >
            privacy policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="hm-btn hm-btn-primary disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Send <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export const ContactSidePanel = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-canvas-2)] p-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--m-forest-700)] text-[var(--m-acid)]">
          <Mail size={18} strokeWidth={1.7} />
        </div>
        <div className="mt-4 text-[14.5px] font-semibold text-[var(--m-ink-1)]">
          Prefer email?
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--m-ink-3)]">
          Write to{" "}
          <a
            href="mailto:contact@hoizr.com"
            className="font-semibold text-[var(--m-forest-700)] hover:underline"
          >
            contact@hoizr.com
          </a>{" "}
          and a real human will reply within one working day.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={CONTACT_PHONE_TEL}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--m-border)] bg-white px-3 py-2 text-[12.5px] font-semibold text-[var(--m-ink-1)] transition hover:border-[var(--m-forest-300)] hover:text-[var(--m-forest-700)]"
          >
            <PhoneCall size={13} />
            Call
          </a>
          <a
            href={CONTACT_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--m-border)] bg-white px-3 py-2 text-[12.5px] font-semibold text-[var(--m-ink-1)] transition hover:border-[var(--m-forest-300)] hover:text-[var(--m-forest-700)]"
          >
            <MessageCircle size={13} />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[var(--m-r-lg)] bg-[#050504] p-6 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/hero/hero-lines-star.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-black/48"
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold backdrop-blur">
            <Sparkles size={12} className="text-[var(--m-acid)]" /> Ready to ship?
          </div>
          <div className="mt-4 text-[14.5px] font-semibold text-white">
            Bring your next event onto Hoizr.
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">
            Publish directly, keep every fan relationship, and run the night
            from one operating stack.
          </p>
          <Link href="/signup" className="hm-btn hm-btn-acid mt-4">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
