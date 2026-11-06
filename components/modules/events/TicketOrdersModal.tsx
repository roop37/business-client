"use client";

import { inrFormat } from "@/components/common/owner";
import ReusableModal from "@/components/common/modal/modal";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { GraphQLClient } from "@/utils/demo/gqlClient";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

const resolveEndpoint = (): string => {
  const base = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.replace(/\/+$/, "");
  if (!base) return "http://localhost:4000/graphql";
  return base.endsWith("/graphql") ? base : `${base}/graphql`;
};

const gql = new GraphQLClient(resolveEndpoint(), {
  credentials: "include",
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    let res = await fetch(input, init);
    if (res.status === 401) {
      try {
        const refresher = new GraphQLClient(resolveEndpoint(), {
          credentials: "include",
        });
        await refresher.request("mutation { tokensRefresh }");
        res = await fetch(input, init);
      } catch {
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return res;
  },
});

const EVENT_TICKET_ORDERS_QUERY = `
  query EventTicketOrders(
    $eventId: String!
    $ticketId: String!
    $page: Int
    $pageSize: Int
  ) {
    eventTicketOrders(
      eventId: $eventId
      ticketId: $ticketId
      page: $page
      pageSize: $pageSize
    ) {
      total
      items {
        orderId shortId eventTitle eventDate totalAmount status createdAt
      }
    }
  }
`;

type OrderRow = {
  orderId: string;
  shortId: string;
  eventTitle?: string | null;
  eventDate?: string | null;
  totalAmount: number;
  status: string;
  createdAt?: string | null;
};

export type TicketOrdersTarget = {
  eventId: string;
  ticketId: string;
  ticketName?: string | null;
};

// The `status` field comes back as the RAW stored enum value ("PaymentSuccess",
// "CheckedIn") because the resolver types it as String, not the OrderStatus enum.
// Normalise to UPPER_SNAKE so we match regardless of which form the server sends.
const normStatus = (s: string): string =>
  (s || "").replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();

const statusLabel = (s: string): string => {
  switch (normStatus(s)) {
    case "PAYMENT_SUCCESS":
      return "Confirmed";
    case "CHECKED_IN":
      return "Checked in";
    default:
      return s.replace(/_/g, " ").toLowerCase();
  }
};

const statusColor = (s: string): string => {
  switch (normStatus(s)) {
    case "PAYMENT_SUCCESS":
      return "bg-emerald-500/10 text-emerald-600";
    case "CHECKED_IN":
      return "bg-blue-500/10 text-blue-600";
    default:
      return "bg-owner-fg-4/10 text-owner-fg-4";
  }
};

const PAGE_SIZE = 10;

const TicketOrdersList: React.FC<{ target: TicketOrdersTarget }> = ({
  target,
}) => {
  const { openOrderReceipt, setToastData } = useGlobalStore();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await gql.request<{
        eventTicketOrders: { items: OrderRow[]; total: number };
      }>(EVENT_TICKET_ORDERS_QUERY, {
        eventId: target.eventId,
        ticketId: target.ticketId,
        page,
        pageSize: PAGE_SIZE,
      });
      setOrders(resp.eventTicketOrders.items ?? []);
      setTotal(resp.eventTicketOrders.total ?? 0);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [target.eventId, target.ticketId, page, setToastData]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <div className="mb-2 text-xs text-owner-fg-3">
        {total} {total === 1 ? "order" : "orders"}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-owner-fg-4">
          Loading…
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-owner-fg-4">
          No orders found for this ticket
        </div>
      ) : (
        <div className="divide-y divide-owner-border">
          {orders.map((o) => (
            <button
              key={o.orderId}
              onClick={() => openOrderReceipt(o.orderId)}
              className="-mx-2 flex w-full items-center gap-4 rounded-lg px-2 py-3 text-left transition hover:bg-owner-bg-subtle"
            >
              <div className="min-w-[72px] font-mono text-sm font-semibold text-owner-fg-2">
                {o.shortId}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-owner-fg-1">
                  {o.eventTitle ?? "—"}
                </div>
                <div className="text-xs text-owner-fg-4">
                  {o.createdAt
                    ? format(new Date(o.createdAt), "d MMM yyyy, h:mm a")
                    : o.eventDate
                    ? formatInTimeZone(
                        new Date(o.eventDate),
                        "Asia/Kolkata",
                        "d MMM yyyy"
                      )
                    : "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums text-owner-fg-1">
                  {inrFormat(o.totalAmount)}
                </div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(o.status)}`}
                >
                  {statusLabel(o.status)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <div className="mt-4 flex items-center justify-between border-t border-owner-border pt-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded text-owner-fg-3 transition hover:bg-owner-bg-subtle disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-owner-fg-4">
            Page {page} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="flex h-8 w-8 items-center justify-center rounded text-owner-fg-3 transition hover:bg-owner-bg-subtle disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
};

interface Props {
  target: TicketOrdersTarget | null;
  onClose: () => void;
}

const TicketOrdersModal: React.FC<Props> = ({ target, onClose }) => (
  <ReusableModal
    isOpen={!!target}
    onClose={onClose}
    title={target ? `${target.ticketName || "Ticket"} — orders` : "Orders"}
    comments="Confirmed & checked-in orders that include this ticket. Tap an order to see its receipt."
    width="ml"
    isHighIndex
  >
    {target ? <TicketOrdersList target={target} /> : null}
  </ReusableModal>
);

export default TicketOrdersModal;
