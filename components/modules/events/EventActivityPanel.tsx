import { inrFormat } from "@/components/common/owner";
import { IssueOfflineTicketModal } from "@/components/modules/offlineTicket/IssueOfflineTicketModal";
import useGlobalStore from "@/store/global";
import {
  EventCustomerRow,
  EventOrderRow,
  fetchEventCustomers,
  fetchEventOrders,
} from "@/utils/eventOpsClient";
import { orderStatusClasses, orderStatusLabel } from "@/utils/orderStatus";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

/**
 * Event activity (Orders · Offline Tickets · Customers) — moved out of the
 * old Event Hub into a reusable panel rendered inside Manage Event, so an
 * event has a single page. Guest Lists live in their own Manage card.
 */

const PAGE_SIZE = 15;

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "d MMM yyyy, h:mm a");
};

const Tip = ({ children }: { children: ReactNode }) => (
  <p className="mb-3 text-xs text-[var(--owner-fg-3)]">{children}</p>
);

const Pager = ({
  page,
  pageCount,
  setPage,
}: {
  page: number;
  pageCount: number;
  setPage: (fn: (p: number) => number) => void;
}) =>
  pageCount > 1 ? (
    <div className="mt-4 flex items-center justify-between">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded text-[var(--owner-fg-3)] transition hover:bg-[var(--owner-bg-subtle)] disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs text-[var(--owner-fg-4)]">
        Page {page} of {pageCount}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        disabled={page === pageCount}
        className="flex h-8 w-8 items-center justify-center rounded text-[var(--owner-fg-3)] transition hover:bg-[var(--owner-bg-subtle)] disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  ) : null;

const OrdersTab = ({
  eventId,
  tickets,
}: {
  eventId: string;
  tickets: Array<{ _id: string; ticketName: string }>;
}) => {
  const { openOrderReceipt, setToastData } = useGlobalStore();
  const [rows, setRows] = useState<EventOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEventOrders(eventId, {
        page,
        pageSize: PAGE_SIZE,
        ticketTypeId: ticketTypeId || undefined,
      });
      setRows(res.items);
      setTotal(res.total);
    } catch (e) {
      setToastData({ type: "error", message: extractErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [eventId, page, ticketTypeId, setToastData]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <Tip>Every confirmed &amp; checked-in order for this event. Tap a row to open its receipt.</Tip>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={ticketTypeId}
          onChange={(e) => {
            setTicketTypeId(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-3 py-1.5 text-sm"
        >
          <option value="">All ticket types</option>
          {tickets.map((t) => (
            <option key={t._id} value={t._id}>
              {t.ticketName}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[var(--owner-fg-3)]">
          {total} {total === 1 ? "order" : "orders"}
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[var(--owner-fg-4)]">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--owner-fg-4)]">No orders yet.</div>
      ) : (
        <div className="max-h-[460px] divide-y divide-[var(--owner-border)] overflow-y-auto rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
          {rows.map((o) => (
            <button
              key={o.orderId}
              onClick={() => openOrderReceipt(o.orderId)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[var(--owner-bg-subtle)]"
            >
              <div className="min-w-[64px] font-mono text-sm font-semibold text-[var(--owner-fg-2)]">
                {o.shortId}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {o.customerName || "—"}
                  {o.isGuest ? (
                    <span className="ml-1.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                      Guest
                    </span>
                  ) : null}
                </div>
                <div className="truncate text-xs text-[var(--owner-fg-4)]">
                  {o.ticketSummary || "—"} · {fmtDate(o.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">{inrFormat(o.totalAmount)}</div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${orderStatusClasses(
                    o.checkedIn ? "CheckedIn" : o.status
                  )}`}
                >
                  {orderStatusLabel(o.checkedIn ? "CheckedIn" : o.status)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Pager page={page} pageCount={pageCount} setPage={setPage} />
    </div>
  );
};

const CustomersTab = ({ eventId }: { eventId: string }) => {
  const { openOrderReceipt, setToastData } = useGlobalStore();
  const [rows, setRows] = useState<EventCustomerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<EventCustomerRow | null>(null);
  const [orders, setOrders] = useState<EventOrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEventCustomers(eventId, page, PAGE_SIZE);
      setRows(res.items);
      setTotal(res.total);
    } catch (e) {
      setToastData({ type: "error", message: extractErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [eventId, page, setToastData]);

  useEffect(() => {
    if (!selected) load();
  }, [load, selected]);

  const openCustomer = async (c: EventCustomerRow) => {
    setSelected(c);
    setOrdersLoading(true);
    try {
      const res = await fetchEventOrders(eventId, {
        customerId: c.isGuest ? undefined : c.customerId,
        pageSize: 50,
      });
      setOrders(res.items);
    } catch (e) {
      setToastData({ type: "error", message: extractErrorMessage(e) });
    } finally {
      setOrdersLoading(false);
    }
  };

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--owner-blue-500)]"
        >
          <ChevronLeft size={16} /> Back to customers
        </button>
        <div className="mb-3 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4">
          <div className="text-base font-semibold">{selected.name || "Customer"}</div>
          <div className="mt-0.5 text-xs text-[var(--owner-fg-3)]">
            {[selected.phone, selected.email].filter(Boolean).join(" · ") || "—"}
          </div>
          <div className="mt-2 text-xs text-[var(--owner-fg-4)]">
            {selected.ticketCount} tickets · {selected.orderCount} orders ·{" "}
            {inrFormat(selected.totalSpent)} spent
          </div>
        </div>
        {ordersLoading ? (
          <div className="py-10 text-center text-sm text-[var(--owner-fg-4)]">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--owner-fg-4)]">
            No orders found.
          </div>
        ) : (
          <div className="max-h-[400px] divide-y divide-[var(--owner-border)] overflow-y-auto rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
            {orders.map((o) => (
              <button
                key={o.orderId}
                onClick={() => openOrderReceipt(o.orderId)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[var(--owner-bg-subtle)]"
              >
                <div className="min-w-[64px] font-mono text-sm font-semibold text-[var(--owner-fg-2)]">
                  {o.shortId}
                </div>
                <div className="min-w-0 flex-1 truncate text-xs text-[var(--owner-fg-3)]">
                  {o.ticketSummary} · {fmtDate(o.createdAt)}
                </div>
                <div className="text-sm font-semibold tabular-nums">{inrFormat(o.totalAmount)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <Tip>Everyone who bought a ticket for this event. Tap a customer to see their orders.</Tip>
      {loading ? (
        <div className="py-12 text-center text-sm text-[var(--owner-fg-4)]">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--owner-fg-4)]">No customers yet.</div>
      ) : (
        <div className="max-h-[460px] divide-y divide-[var(--owner-border)] overflow-y-auto rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
          {rows.map((c) => (
            <button
              key={c.customerId}
              onClick={() => openCustomer(c)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[var(--owner-bg-subtle)]"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {c.name || "Customer"}
                  {c.isGuest ? (
                    <span className="ml-1.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                      Guest
                    </span>
                  ) : null}
                </div>
                <div className="truncate text-xs text-[var(--owner-fg-4)]">
                  {[c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <div className="hidden text-right text-xs text-[var(--owner-fg-3)] sm:block">
                <div>{c.ticketCount} tickets · {c.orderCount} orders</div>
                <div className="text-[var(--owner-fg-4)]">
                  {c.checkedInOrders}/{c.orderCount} checked in · last {fmtDate(c.lastPurchaseAt)}
                </div>
              </div>
              <div className="text-right text-sm font-semibold tabular-nums">
                {inrFormat(c.totalSpent)}
              </div>
            </button>
          ))}
        </div>
      )}
      <Pager page={page} pageCount={pageCount} setPage={setPage} />
    </div>
  );
};

type ActivityTab = "orders" | "offline" | "customers";

export const EventActivityPanel = ({
  eventId,
  tickets,
  canSeeCustomers,
}: {
  eventId: string;
  tickets: Array<{ _id: string; ticketName: string }>;
  canSeeCustomers: boolean;
}) => {
  const [tab, setTab] = useState<ActivityTab>("orders");
  const tabs: Array<{ key: ActivityTab; label: string }> = [
    { key: "orders", label: "Orders" },
    { key: "offline", label: "Offline Tickets" },
    ...(canSeeCustomers
      ? [{ key: "customers" as const, label: "Customers" }]
      : []),
  ];

  return (
    <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-[var(--owner-blue-050)] text-[var(--owner-blue-500)]"
                : "text-[var(--owner-fg-3)] hover:bg-[var(--owner-bg-subtle)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" ? <OrdersTab eventId={eventId} tickets={tickets} /> : null}
      {tab === "offline" ? (
        <IssueOfflineTicketModal inline presetEventId={eventId} />
      ) : null}
      {tab === "customers" && canSeeCustomers ? (
        <CustomersTab eventId={eventId} />
      ) : null}
    </div>
  );
};
