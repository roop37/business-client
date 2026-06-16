"use client";

import { inrFormat } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { format } from "date-fns";
import { GraphQLClient } from "graphql-request";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";

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

const statusLabel = (s: string): string => {
  switch (s) {
    case "PAYMENT_SUCCESS":
      return "Confirmed";
    case "CHECKED_IN":
      return "Checked in";
    default:
      return s.replace(/_/g, " ").toLowerCase();
  }
};

const statusColor = (s: string): string => {
  switch (s) {
    case "PAYMENT_SUCCESS":
      return "bg-emerald-500/10 text-emerald-400";
    case "CHECKED_IN":
      return "bg-blue-500/10 text-blue-400";
    default:
      return "bg-owner-fg-4/10 text-owner-fg-4";
  }
};

const PAGE_SIZE = 10;

interface Props {
  target: TicketOrdersTarget | null;
  onClose: () => void;
}

const TicketOrdersModalInner: React.FC<{
  target: TicketOrdersTarget;
  onClose: () => void;
}> = ({ target, onClose }) => {
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
    <div className="fixed inset-0 z-[1200] flex flex-col bg-owner-bg">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-owner-border px-6 py-4">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-owner-fg-3 hover:bg-owner-bg-subtle hover:text-owner-fg-1 transition"
        >
          <X size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-owner-fg-1">
            {target.ticketName || "Ticket"} — orders
          </div>
          <div className="truncate text-xs text-owner-fg-4">
            Confirmed &amp; checked-in orders that include this ticket
          </div>
        </div>
        <div className="text-sm text-owner-fg-3">
          {total} {total === 1 ? "order" : "orders"}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-owner-fg-4 text-sm">
            Loading…
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-owner-fg-4 text-sm">
            No orders found for this ticket
          </div>
        ) : (
          <div className="divide-y divide-owner-border">
            {orders.map((o) => (
              <button
                key={o.orderId}
                onClick={() => openOrderReceipt(o.orderId)}
                className="flex w-full items-center gap-4 py-4 text-left hover:bg-owner-bg-subtle rounded-lg px-2 -mx-2 transition"
              >
                <div className="min-w-[80px] font-mono text-sm font-semibold text-owner-fg-2">
                  {o.shortId}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-owner-fg-1">
                    {o.eventTitle ?? "—"}
                  </div>
                  <div className="text-xs text-owner-fg-4">
                    {o.eventDate
                      ? format(new Date(o.eventDate), "d MMM yyyy")
                      : o.createdAt
                      ? format(new Date(o.createdAt), "d MMM yyyy")
                      : "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-owner-fg-1 tabular-nums">
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
      </div>

      {/* Pagination */}
      {pageCount > 1 ? (
        <div className="flex items-center justify-between border-t border-owner-border px-6 py-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded text-owner-fg-3 hover:bg-owner-bg-subtle disabled:opacity-40 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-owner-fg-4">
            Page {page} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="flex h-8 w-8 items-center justify-center rounded text-owner-fg-3 hover:bg-owner-bg-subtle disabled:opacity-40 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
};

const TicketOrdersModal: React.FC<Props> = ({ target, onClose }) => {
  if (!target) return null;
  if (typeof window === "undefined") return null;
  return ReactDOM.createPortal(
    <TicketOrdersModalInner target={target} onClose={onClose} />,
    document.body
  );
};

export default TicketOrdersModal;
