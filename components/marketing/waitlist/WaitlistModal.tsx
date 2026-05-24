"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type Role = "host" | "event-org" | "promoter" | "other";

const ROLE_OPTIONS: { value: Role; label: string; blurb: string }[] = [
  {
    value: "host",
    label: "Venue / Host",
    blurb: "I run the room — club, bar, festival ground, or open-air venue.",
  },
  {
    value: "event-org",
    label: "Event organiser",
    blurb:
      "I curate and produce shows, festivals, or tours — venue varies night-to-night.",
  },
  {
    value: "promoter",
    label: "Promoter",
    blurb:
      "I drive ticket sales, collaborator pools, and on-sale-day campaigns.",
  },
  {
    value: "other",
    label: "Other",
    blurb: "Artist team, agency, vendor, or something the categories miss.",
  },
];

const EASE = [0.2, 0.6, 0.2, 1] as const;

export const WaitlistModal = ({
  open,
  onClose,
  source,
}: {
  open: boolean;
  onClose: () => void;
  source?: string;
}) => {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset state every time the modal opens fresh, but leave it alone
  // while it's open so the spinner / success view can read it.
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setErrorMsg(null);
    }
  }, [open]);

  // Lock body scroll while modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape to close (only when idle/success — keep open while submitting).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "submitting") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (name.trim().length < 2) {
      setErrorMsg("Please share your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("That email doesn't look right.");
      return;
    }
    if (phone.trim().length < 7) {
      setErrorMsg("Please share a contactable phone number.");
      return;
    }
    if (!role) {
      setErrorMsg("Pick the role that fits best.");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role,
          source,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong. Try again.");
      }
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setRole(null);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="waitlist-title"
        >
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status === "submitting" ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0a0a] text-white shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/hero/hero-lines-star.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />

            <div className="relative z-10 flex items-start justify-between gap-4 px-7 pt-7 pb-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--m-acid)]">
                  Pre-launch waitlist
                </div>
                <h2
                  id="waitlist-title"
                  className="mt-2 font-bold leading-tight tracking-tight"
                  style={{
                    fontFamily: "var(--m-font-display)",
                    fontSize: "26px",
                  }}
                >
                  Join the Hoizr waitlist.
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={status === "submitting"}
                aria-label="Close"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/80 transition hover:bg-white/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative z-10 overflow-y-auto px-7 pb-7">
              {status === "success" ? (
                <SuccessState onClose={onClose} />
              ) : (
                <>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/72">
                    The dashboard opens to verified hosts in waves. Drop your
                    details and we&rsquo;ll reach out personally when your
                    slot opens.
                  </p>

                  <form onSubmit={submit} className="mt-6 space-y-5">
                    <Field
                      id={nameId}
                      label="Your name"
                      placeholder="Riya Mehta"
                      value={name}
                      onChange={setName}
                      autoComplete="name"
                    />
                    <Field
                      id={emailId}
                      label="Email"
                      type="email"
                      placeholder="you@venue.in"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                    />
                    <Field
                      id={phoneId}
                      label="Phone (with country code)"
                      type="tel"
                      placeholder="+91 98xxxxxxxx"
                      value={phone}
                      onChange={setPhone}
                      autoComplete="tel"
                    />

                    <div>
                      <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-white/55">
                        I am a…
                      </label>
                      <div className="mt-3 grid gap-2">
                        {ROLE_OPTIONS.map((option) => {
                          const selected = role === option.value;
                          return (
                            <button
                              type="button"
                              key={option.value}
                              onClick={() => setRole(option.value)}
                              className={`group rounded-2xl border px-4 py-3 text-left transition ${
                                selected
                                  ? "border-[var(--m-acid)] bg-[rgba(214,255,63,0.10)]"
                                  : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[14px] font-semibold text-white">
                                  {option.label}
                                </span>
                                {selected ? (
                                  <CheckCircle2
                                    size={16}
                                    className="text-[var(--m-acid)]"
                                  />
                                ) : null}
                              </div>
                              <div className="mt-1 text-[12.5px] leading-snug text-white/65">
                                {option.blurb}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {errorMsg ? (
                      <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-200">
                        {errorMsg}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="hm-btn hm-btn-acid w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          Sending…
                        </>
                      ) : (
                        "Join the waitlist"
                      )}
                    </button>

                    <p className="text-center text-[11.5px] text-white/50">
                      We&rsquo;ll only use these to onboard you. No marketing list.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const Field = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-white/55"
    >
      {label}
    </label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      className="mt-2 block w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-[15px] text-white placeholder-white/40 outline-none transition focus:border-[var(--m-acid)] focus:bg-white/[0.08]"
    />
  </div>
);

const SuccessState = ({ onClose }: { onClose: () => void }) => (
  <div className="py-6 text-center">
    <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--m-acid)]/15 text-[var(--m-acid)]">
      <CheckCircle2 size={28} />
    </div>
    <h3
      className="mt-5 font-bold tracking-tight"
      style={{ fontFamily: "var(--m-font-display)", fontSize: "22px" }}
    >
      You&rsquo;re on the list.
    </h3>
    <p className="mx-auto mt-3 max-w-[380px] text-[14px] leading-relaxed text-white/70">
      Confirmation is on its way to your inbox. The team will reach out
      personally when your slot opens.
    </p>
    <button
      type="button"
      onClick={onClose}
      className="hm-btn hm-btn-ghost mt-7 border border-white/20 text-white hover:bg-white/10"
    >
      Close
    </button>
  </div>
);
