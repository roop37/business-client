"use client";

import ReusableModal from "@/components/common/modal/modal";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { Instagram, Loader2, Send, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type WaitlistStatus = "WAITING" | "INVITED" | "CONVERTED" | "DECLINED";

type WaitlistEntry = {
  _id: string;
  customerId: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  partySize?: number | null;
  note?: string | null;
  instagramHandle?: string | null;
  facebookHandle?: string | null;
  xHandle?: string | null;
  status: WaitlistStatus;
  invitedAt?: string | null;
  createdAt?: string | null;
};

type TicketOption = { _id: string; ticketName: string; ticketPrice?: number };

type Props = {
  open?: boolean;
  onClose?: () => void;
  eventId: string;
  tickets?: TicketOption[];
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "WAITING", label: "Waiting" },
  { id: "INVITED", label: "Invited" },
  { id: "CONVERTED", label: "Converted" },
  { id: "DECLINED", label: "Declined" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];

const STATUS_BADGE: Record<WaitlistStatus, string> = {
  WAITING: "bg-amber-100 text-amber-800",
  INVITED: "bg-blue-100 text-blue-800",
  CONVERTED: "bg-emerald-100 text-emerald-800",
  DECLINED: "bg-gray-100 text-gray-600",
};

const WaitlistManagerModal: React.FC<Props> = ({
  open = false,
  onClose,
  eventId,
  tickets = [],
}) => {
  const { setToastData } = useGlobalStore();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Send-link picker: which entry is being invited + the chosen ticket/qty.
  const [sendFor, setSendFor] = useState<WaitlistEntry | null>(null);
  const [ticketId, setTicketId] = useState<string>("");
  const [qty, setQty] = useState<number>(1);

  const load = useCallback(async () => {
    if (!open || !eventId) return;
    setLoading(true);
    try {
      const res: any = await sdk.eventWaitlist({ filter: { eventId } });
      setEntries(res?.eventWaitlist ?? []);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [open, eventId, setToastData]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { total: entries.length, WAITING: 0, INVITED: 0, CONVERTED: 0, DECLINED: 0 };
    entries.forEach((e) => (c[e.status] += 1));
    return c;
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q) return true;
      return [e.name, e.phone, e.city, e.instagramHandle]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [entries, filter, search]);

  const openSend = (entry: WaitlistEntry) => {
    setSendFor(entry);
    setTicketId(tickets[0]?._id ?? "");
    setQty(Math.max(1, Number(entry.partySize ?? 1)));
  };

  const confirmSend = async () => {
    if (!sendFor) return;
    const ticket = tickets.find((t) => t._id === ticketId);
    if (!ticket) {
      setToastData({ type: "error", message: "Pick a ticket to send." });
      return;
    }
    setBusyId(sendFor._id);
    try {
      await sdk.sendWaitlistPaymentLink({
        input: {
          entryId: sendFor._id,
          lines: [
            {
              itemId: ticket._id,
              name: ticket.ticketName,
              quantity: Math.max(1, qty),
              unitPrice: Number(ticket.ticketPrice ?? 0),
              isExtra: false,
            },
          ],
        },
      });
      setToastData({ type: "success", message: "Payment link sent." });
      setSendFor(null);
      await load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const decline = async (entry: WaitlistEntry) => {
    setBusyId(entry._id);
    try {
      await sdk.declineWaitlistEntry({ entryId: entry._id });
      setToastData({ type: "success", message: "Waitlister declined." });
      await load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ReusableModal
      isOpen={open}
      onClose={onClose ?? (() => undefined)}
      title="Waitlist"
    >
      <div className="space-y-4">
        {/* Demand snapshot */}
        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { label: "Total", value: counts.total },
            { label: "Waiting", value: counts.WAITING },
            { label: "Invited", value: counts.INVITED },
            { label: "Converted", value: counts.CONVERTED },
            { label: "Declined", value: counts.DECLINED },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] py-2">
              <div className="text-lg font-bold text-[var(--owner-fg-1)]">{s.value}</div>
              <div className="text-[11px] text-[var(--owner-fg-3)]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex flex-wrap rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  filter === f.id
                    ? "bg-[var(--owner-fg-1)] text-[var(--owner-bg)]"
                    : "text-[var(--owner-fg-3)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, city, IG"
            className="w-full max-w-xs rounded-lg border border-[var(--owner-border)] bg-white px-3 py-2 text-sm"
          />
        </div>

        {/* List */}
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[var(--owner-fg-3)]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--owner-fg-3)]">
              No waitlisters {filter !== "all" ? `(${filter.toLowerCase()})` : "yet"}.
            </div>
          ) : (
            filtered.map((e) => (
              <div
                key={e._id}
                className="rounded-lg border border-[var(--owner-border)] bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--owner-fg-1)]">
                        {e.name || "Guest"}
                      </span>
                      {e.partySize && e.partySize > 1 ? (
                        <span className="rounded-full bg-[var(--owner-bg)] px-2 py-0.5 text-[11px] text-[var(--owner-fg-3)]">
                          ×{e.partySize}
                        </span>
                      ) : null}
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[e.status]}`}>
                        {e.status}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--owner-fg-3)]">
                      {[e.phone, e.city].filter(Boolean).join(" · ")}
                    </div>
                    {e.instagramHandle ? (
                      <div className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--owner-fg-2)]">
                        <Instagram size={12} /> {e.instagramHandle}
                      </div>
                    ) : null}
                    {e.note ? (
                      <div className="mt-1 text-xs italic text-[var(--owner-fg-3)]">
                        “{e.note}”
                      </div>
                    ) : null}
                  </div>
                  {e.status === "WAITING" ? (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={busyId === e._id}
                        onClick={() => openSend(e)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--owner-fg-1)] px-3 py-1.5 text-xs font-semibold text-[var(--owner-bg)] disabled:opacity-60"
                      >
                        <Send size={13} /> Send link
                      </button>
                      <button
                        type="button"
                        disabled={busyId === e._id}
                        onClick={() => decline(e)}
                        className="inline-flex items-center rounded-lg border border-[var(--owner-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--owner-fg-3)] disabled:opacity-60"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Inline send-link picker */}
                {sendFor?._id === e._id ? (
                  <div className="mt-3 space-y-2 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-3">
                    {tickets.length === 0 ? (
                      <div className="text-xs text-red-600">
                        No ticket types configured — add a ticket before sending a link.
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-end gap-2">
                        <label className="text-xs text-[var(--owner-fg-3)]">
                          Ticket
                          <select
                            value={ticketId}
                            onChange={(ev) => setTicketId(ev.target.value)}
                            className="mt-1 block rounded-md border border-[var(--owner-border)] bg-white px-2 py-1.5 text-sm"
                          >
                            {tickets.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.ticketName}
                                {t.ticketPrice != null ? ` — ₹${t.ticketPrice}` : ""}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs text-[var(--owner-fg-3)]">
                          Qty
                          <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(ev) => setQty(Math.max(1, Number(ev.target.value)))}
                            className="mt-1 block w-16 rounded-md border border-[var(--owner-border)] bg-white px-2 py-1.5 text-sm"
                          />
                        </label>
                        <button
                          type="button"
                          disabled={busyId === e._id}
                          onClick={confirmSend}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--owner-fg-1)] px-3 py-2 text-xs font-semibold text-[var(--owner-bg)] disabled:opacity-60"
                        >
                          {busyId === e._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Send size={13} />
                          )}
                          Send payment link
                        </button>
                        <button
                          type="button"
                          onClick={() => setSendFor(null)}
                          className="text-xs font-semibold text-[var(--owner-fg-3)]"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </ReusableModal>
  );
};

export default WaitlistManagerModal;
