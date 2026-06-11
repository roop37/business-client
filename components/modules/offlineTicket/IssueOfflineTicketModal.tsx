"use client";

import {
  createOfflinePaymentLink,
  fetchMyEventsForOffline,
  issueOfflineTicket,
  type OfflineEvent,
  type OfflineTicketLineInput,
} from "@/utils/offlineTicketClient";
import {
  Check,
  Copy,
  Link2,
  Loader2,
  Minus,
  Plus,
  TicketCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Pre-select an event (manage-event quick entry). */
  presetEventId?: string;
};

type Mode = "ISSUE" | "LINK";
type Qty = Record<string, number>;

const rupee = (n: number) =>
  `₹${(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const IssueOfflineTicketModal = ({
  open,
  onClose,
  presetEventId,
}: Props) => {
  const [events, setEvents] = useState<OfflineEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventId, setEventId] = useState<string>("");
  const [ticketQty, setTicketQty] = useState<Qty>({});
  const [extraQty, setExtraQty] = useState<Qty>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<Mode>("ISSUE");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<
    null | { mode: Mode; shortUrl?: string; whatsappQueued?: boolean }
  >(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingEvents(true);
    fetchMyEventsForOffline()
      .then((evts) => {
        setEvents(evts);
        if (presetEventId && evts.some((e) => e._id === presetEventId)) {
          setEventId(presetEventId);
        }
      })
      .catch((e) =>
        setError(e?.response?.errors?.[0]?.message ?? "Couldn't load events")
      )
      .finally(() => setLoadingEvents(false));
  }, [open, presetEventId]);

  const selectedEvent = useMemo(
    () => events.find((e) => e._id === eventId) ?? null,
    [events, eventId]
  );

  const visibleTickets = (selectedEvent?.tickets ?? []).filter(
    (t) => t.ticketVisible !== false
  );
  const extras = selectedEvent?.extras ?? [];

  const lines: OfflineTicketLineInput[] = useMemo(() => {
    const out: OfflineTicketLineInput[] = [];
    for (const t of visibleTickets) {
      const q = ticketQty[t._id] ?? 0;
      if (q > 0)
        out.push({
          itemId: t._id,
          name: t.ticketName,
          quantity: q,
          unitPrice: t.ticketPrice,
          isExtra: false,
        });
    }
    for (const x of extras) {
      const q = extraQty[x._id] ?? 0;
      if (q > 0)
        out.push({
          itemId: x._id,
          name: x.name,
          quantity: q,
          unitPrice: x.price,
          isExtra: true,
        });
    }
    return out;
  }, [visibleTickets, extras, ticketQty, extraQty]);

  const total = lines.reduce((s, l) => s + (l.unitPrice ?? 0) * l.quantity, 0);
  const validPhone = phone.trim().length >= 8;
  const canSubmit = !!eventId && lines.length > 0 && validPhone && !submitting;

  const reset = () => {
    setEventId("");
    setTicketQty({});
    setExtraQty({});
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setMode("ISSUE");
    setNotes("");
    setError(null);
    setDone(null);
    setCopied(false);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const step = (set: (fn: (q: Qty) => Qty) => void, id: string, d: number) =>
    set((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + d) }));

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const input = {
        eventId,
        customerFirstName: firstName.trim() || undefined,
        customerLastName: lastName.trim() || undefined,
        customerEmail: email.trim() || undefined,
        customerPhone: phone.trim(),
        lines,
        notes: notes.trim() || undefined,
      };
      if (mode === "ISSUE") {
        await issueOfflineTicket(input);
        setDone({ mode: "ISSUE" });
      } else {
        const res = await createOfflinePaymentLink(input);
        setDone({
          mode: "LINK",
          shortUrl: res.shortUrl,
          whatsappQueued: res.whatsappQueued,
        });
      }
    } catch (e: any) {
      setError(
        e?.response?.errors?.[0]?.message ??
          e?.message ??
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-end bg-black/40 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
      onClick={close}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-owner-xl border border-owner-border bg-owner-bg shadow-owner-lg sm:rounded-owner-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-owner-border-soft px-5 py-4">
          <div className="flex items-center gap-2">
            <TicketCheck size={18} className="text-owner-blue-500" />
            <h2 className="text-[15px] font-semibold text-owner-fg-1">
              Issue offline ticket
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="grid h-8 w-8 place-items-center rounded-owner-md text-owner-fg-3 hover:bg-owner-bg-subtle"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {done ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-600">
                <Check size={26} />
              </div>
              {done.mode === "ISSUE" ? (
                <>
                  <h3 className="mt-3 text-base font-semibold text-owner-fg-1">
                    Ticket issued
                  </h3>
                  <p className="mt-1 text-sm text-owner-fg-3">
                    The ticket + QR has been created and emailed to the guest.
                    It's now scannable at the door.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-3 text-base font-semibold text-owner-fg-1">
                    Payment link sent
                  </h3>
                  <p className="mt-1 text-sm text-owner-fg-3">
                    {done.whatsappQueued
                      ? "Sent on WhatsApp. "
                      : "WhatsApp unavailable for this number. "}
                    Share the link below too:
                  </p>
                  <div className="mt-3 flex w-full items-center gap-2 rounded-owner-md border border-owner-border bg-owner-bg-subtle px-3 py-2">
                    <Link2 size={14} className="shrink-0 text-owner-fg-3" />
                    <span className="flex-1 truncate text-left text-[13px] text-owner-fg-2">
                      {done.shortUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (done.shortUrl) {
                          navigator.clipboard?.writeText(done.shortUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }
                      }}
                      className="grid h-7 w-7 place-items-center rounded-owner-sm text-owner-fg-3 hover:bg-owner-bg"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </>
              )}
              <div className="mt-5 flex w-full gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="owner-btn owner-btn--secondary flex-1"
                >
                  Issue another
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="owner-btn owner-btn--primary flex-1"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Event picker */}
              <Field label="Event">
                <select
                  value={eventId}
                  onChange={(e) => {
                    setEventId(e.target.value);
                    setTicketQty({});
                    setExtraQty({});
                  }}
                  disabled={loadingEvents}
                  className="h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-sm text-owner-fg-1 outline-none focus:border-owner-blue-200"
                >
                  <option value="">
                    {loadingEvents ? "Loading events…" : "Select an event"}
                  </option>
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Ticket lines */}
              {selectedEvent ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-owner-fg-4">
                    Tickets
                  </p>
                  {visibleTickets.length === 0 ? (
                    <p className="text-sm text-owner-fg-3">
                      No tickets on this event.
                    </p>
                  ) : (
                    visibleTickets.map((t) => (
                      <LineRow
                        key={t._id}
                        name={t.ticketName}
                        price={t.ticketPrice}
                        qty={ticketQty[t._id] ?? 0}
                        onMinus={() => step(setTicketQty, t._id, -1)}
                        onPlus={() => step(setTicketQty, t._id, 1)}
                      />
                    ))
                  )}
                  {extras.length > 0 ? (
                    <>
                      <p className="pt-1 text-xs font-medium uppercase tracking-wide text-owner-fg-4">
                        Add-ons
                      </p>
                      {extras.map((x) => (
                        <LineRow
                          key={x._id}
                          name={x.name}
                          price={x.price}
                          qty={extraQty[x._id] ?? 0}
                          onMinus={() => step(setExtraQty, x._id, -1)}
                          onPlus={() => step(setExtraQty, x._id, 1)}
                        />
                      ))}
                    </>
                  ) : null}
                </div>
              ) : null}

              {/* Customer */}
              <div className="grid grid-cols-2 gap-2">
                <Field label="First name">
                  <Input value={firstName} onChange={setFirstName} placeholder="Aarav" />
                </Field>
                <Field label="Last name">
                  <Input value={lastName} onChange={setLastName} placeholder="Shah" />
                </Field>
              </div>
              <Field label="Email (optional)">
                <Input value={email} onChange={setEmail} placeholder="guest@email.com" type="email" />
              </Field>
              <Field label="Phone">
                <Input value={phone} onChange={setPhone} placeholder="98765 43210" type="tel" />
              </Field>

              {/* Mode */}
              <div className="grid grid-cols-2 gap-2">
                <ModeButton
                  active={mode === "ISSUE"}
                  onClick={() => setMode("ISSUE")}
                  title="Issue now"
                  subtitle="Payment collected"
                />
                <ModeButton
                  active={mode === "LINK"}
                  onClick={() => setMode("LINK")}
                  title="Send payment link"
                  subtitle="Customer pays online"
                />
              </div>

              {error ? (
                <p className="rounded-owner-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600">
                  {error}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {!done ? (
          <div className="flex items-center justify-between gap-3 border-t border-owner-border-soft px-5 py-4">
            <span className="text-sm text-owner-fg-3">
              Total <span className="font-semibold text-owner-fg-1">{rupee(total)}</span>
            </span>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className="owner-btn owner-btn--primary !px-5 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : mode === "ISSUE" ? (
                "Issue ticket"
              ) : (
                "Send link"
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-owner-fg-3">{label}</span>
    {children}
  </label>
);

const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className="h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-sm text-owner-fg-1 outline-none transition focus:border-owner-blue-200"
  />
);

const LineRow = ({
  name,
  price,
  qty,
  onMinus,
  onPlus,
}: {
  name: string;
  price: number;
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
}) => (
  <div className="flex items-center justify-between rounded-owner-md border border-owner-border-soft px-3 py-2">
    <div className="min-w-0">
      <p className="truncate text-sm text-owner-fg-1">{name}</p>
      <p className="text-xs text-owner-fg-3">{rupee(price)}</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onMinus}
        disabled={qty <= 0}
        className="grid h-7 w-7 place-items-center rounded-owner-sm border border-owner-border text-owner-fg-2 disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <span className="w-5 text-center text-sm font-medium text-owner-fg-1">{qty}</span>
      <button
        type="button"
        onClick={onPlus}
        className="grid h-7 w-7 place-items-center rounded-owner-sm border border-owner-border text-owner-fg-2"
      >
        <Plus size={14} />
      </button>
    </div>
  </div>
);

const ModeButton = ({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-owner-md border px-3 py-2.5 text-left transition ${
      active
        ? "border-owner-blue-500 bg-owner-blue-050"
        : "border-owner-border bg-owner-bg hover:bg-owner-bg-subtle"
    }`}
  >
    <p className="text-[13px] font-semibold text-owner-fg-1">{title}</p>
    <p className="text-[11px] text-owner-fg-3">{subtitle}</p>
  </button>
);

export default IssueOfflineTicketModal;
