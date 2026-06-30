"use client";

import {
  inrFormat,
  PageHeader,
} from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import { RowsPerPageEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  Bell,
  CreditCard,
  Mail,
  MessageCircle,
  MessageCircleMore,
  Send,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReputationTierCard from "./ReputationTierCard";

type LedgerEntry = {
  id: string;
  date: string;
  activity: string;
  recipients?: number | null;
  amount: number;
  balance: number;
};

type RateCardItem = {
  channel: string;
  Icon: LucideIcon;
  rate: string;
  divisor?: number;
};

type MarketingPricingShape = {
  emailRate: number;
  smsRate: number;
  whatsappRate: number;
  pushRate: number;
  gstPercent: number;
  currency: string;
};

const PRICING_FALLBACK: MarketingPricingShape = {
  emailRate: 1,
  smsRate: 0.2,
  whatsappRate: 0.5,
  pushRate: 0,
  gstPercent: 18,
  currency: "INR",
};

const formatRate = (rate: number, unit: string) =>
  rate <= 0 ? "Free" : `₹${rate.toFixed(2)} / ${unit}`;

const buildRateCard = (pricing: MarketingPricingShape): RateCardItem[] => [
  {
    channel: "WhatsApp",
    Icon: MessageCircle,
    rate: formatRate(pricing.whatsappRate, "message"),
    divisor: pricing.whatsappRate || undefined,
  },
  {
    channel: "SMS",
    Icon: Zap,
    rate: formatRate(pricing.smsRate, "SMS"),
    divisor: pricing.smsRate || undefined,
  },
  {
    channel: "Email",
    Icon: Mail,
    rate: formatRate(pricing.emailRate, "email"),
    divisor: pricing.emailRate || undefined,
  },
  {
    channel: "Push",
    Icon: Bell,
    rate: pricing.pushRate <= 0 ? "Free" : formatRate(pricing.pushRate, "push"),
  },
];

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCredit = (value: number) => inrFormat(value, { decimals: 2 });

const formatAmountCell = (amount: number) => {
  if (amount === 0) return { text: "—", className: "text-owner-fg-4" };
  if (amount > 0) {
    return {
      text: `+ ${formatCredit(amount)}`,
      className: "text-owner-success-text font-semibold",
    };
  }
  return {
    text: `− ${formatCredit(Math.abs(amount))}`,
    className: "text-owner-fg-1 font-semibold",
  };
};

export const MarketingCredit = () => {
  const router = useRouter();
  const { setToastData, openTopUpModal, topUpModalOpen, marketingCreditVersion } =
    useGlobalStore();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const handledTopUpQuery = useRef(false);

  const [pricing, setPricing] = useState<MarketingPricingShape>(PRICING_FALLBACK);
  const rateCard = useMemo(() => buildRateCard(pricing), [pricing]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await sdk.GetMarketingPricing();
        if (!cancelled && res?.getMarketingPricing) {
          setPricing(res.getMarketingPricing as MarketingPricingShape);
        }
      } catch {
        // Silent — fallback already in state.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadLedger = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sdk.myMarketingCreditLedger({
        pagination: {
          pageNumber: 1,
          rowsPerPage: RowsPerPageEnum.Fifty,
        },
      });
      const payload = response.myMarketingCreditLedger;
      setBalance(Number(payload?.balance ?? 0));
      setLedger(
        (payload?.items ?? []).map((item: any) => ({
          id: item._id,
          date: formatDate(item.createdAt),
          activity: item.activity || "Marketing credit activity",
          recipients: item.recipients ?? null,
          amount: Number(item.amount ?? 0),
          balance: Number(item.balance ?? 0),
        }))
      );
    } catch (error) {
      setBalance(0);
      setLedger([]);
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [setToastData]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  useEffect(() => {
    if (!router.isReady || handledTopUpQuery.current) return;
    if (router.query.topUp !== "1") return;

    handledTopUpQuery.current = true;
    const requestedAmount =
      typeof router.query.amount === "string"
        ? Number(router.query.amount)
        : 0;
    openTopUpModal(
      Number.isFinite(requestedAmount) && requestedAmount > 0
        ? Math.ceil(requestedAmount)
        : undefined
    );
  }, [router.isReady, router.query.amount, router.query.topUp, openTopUpModal]);

  const prevTopUpModalOpenRef = useRef(false);
  useEffect(() => {
    if (prevTopUpModalOpenRef.current && !topUpModalOpen) {
      loadLedger();
    }
    prevTopUpModalOpenRef.current = topUpModalOpen;
  }, [topUpModalOpen, loadLedger]);

  // Refetch immediately on a verified top-up (even before the modal closes)
  // so the balance + ledger update reactively. Skip the initial mount —
  // loadLedger already runs there.
  const prevCreditVersionRef = useRef(marketingCreditVersion);
  useEffect(() => {
    if (prevCreditVersionRef.current !== marketingCreditVersion) {
      prevCreditVersionRef.current = marketingCreditVersion;
      loadLedger();
    }
  }, [marketingCreditVersion, loadLedger]);

  const messageCapacity = useMemo(() => {
    const whatsappDivisor = rateCard.find(
      (rate) => rate.channel === "WhatsApp"
    )?.divisor;
    const emailDivisor = rateCard.find((rate) => rate.channel === "Email")
      ?.divisor;

    return {
      whatsapp:
        whatsappDivisor && balance > 0 ? Math.floor(balance / whatsappDivisor) : 0,
      email: emailDivisor && balance > 0 ? Math.floor(balance / emailDivisor) : 0,
    };
  }, [balance, rateCard]);

  const columnHelper = createColumnHelper<LedgerEntry>();
  const ledgerColumns: ColumnDef<LedgerEntry, any>[] = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => <DataTableTextCell value={row.original.date} />,
      }),
      columnHelper.accessor("activity", {
        header: "Activity",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => <DataTableTextCell value={row.original.activity} />,
      }),
      columnHelper.accessor("recipients", {
        header: "Recipients",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {row.original.recipients
              ? row.original.recipients.toLocaleString("en-IN")
              : "—"}
          </span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const amount = formatAmountCell(row.original.amount);
          return (
            <span className={`text-sm tabular-nums ${amount.className}`}>
              {amount.text}
            </span>
          );
        },
      }),
      columnHelper.accessor("balance", {
        header: "Balance",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-owner-fg-1 tabular-nums">
            {formatCredit(row.original.balance)}
          </span>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper]
  );

  const handleAddEmailCampaign = () => {
    router.push("/campaigns/onboarding/template-select");
  };

  const handleWhatsAppComingSoon = () => {
    setToastData({
      type: "warning",
      message: "WhatsApp campaigns coming soon.",
    });
  };

  return (
    <div className="flex flex-col gap-6 font-owner text-owner-fg-1">
      <PageHeader
        title="Marketing"
        subtitle="One place to fund, plan, and run your event marketing."
        className="!mb-0"
      />

      {/* Top row: balance card + quick action stack */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div
          className="relative overflow-hidden rounded-owner-xl p-7 text-white shadow-owner-sm"
          style={{
            background:
              "linear-gradient(135deg, #0F1E3F 0%, var(--owner-blue-500) 100%)",
          }}
        >
          <div className="flex items-center gap-2 text-[13px] text-white/80">
            <Wallet size={15} />
            Marketing credit balance
          </div>
          <div className="mt-3 text-[44px] font-semibold leading-none tabular-nums">
            {formatCredit(balance)}
          </div>
          <p className="mt-2 text-[12.5px] text-white/70">
            ~{messageCapacity.whatsapp.toLocaleString("en-IN")} WhatsApp ·
            ~{messageCapacity.email.toLocaleString("en-IN")} emails
          </p>
          <button
            type="button"
            onClick={() => openTopUpModal()}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-owner-md bg-white px-5 text-[14px] font-semibold text-owner-blue-500 transition hover:bg-white/95"
          >
            <CreditCard size={14} />
            Top-up Marketing Credit
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <button
            type="button"
            onClick={handleAddEmailCampaign}
            className="group flex items-start gap-3 rounded-owner-lg border border-owner-border bg-owner-bg p-4 text-left shadow-owner-sm transition hover:border-owner-blue-200 hover:bg-owner-bg-subtle"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
              <Send size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-owner-fg-1">
                Add email campaign
              </p>
              <p className="mt-0.5 text-[12.5px] text-owner-fg-4">
                Reach attendees and your wider audience with a single send.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppComingSoon}
            className="group flex items-start gap-3 rounded-owner-lg border border-dashed border-owner-border bg-owner-bg p-4 text-left shadow-owner-sm transition hover:bg-owner-bg-subtle"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-owner-md bg-owner-success-bg text-owner-success-text">
              <MessageCircleMore size={18} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-owner-fg-1">
                  Add WhatsApp campaign
                </p>
                <span className="rounded-full bg-owner-bg-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-owner-fg-3">
                  Soon
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-owner-fg-4">
                Send broadcast lists straight from your buyer CRM.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Rate card + Support card */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-owner-lg border border-owner-border bg-owner-bg p-5 shadow-owner-sm">
          <div className="text-[12.5px] font-semibold uppercase tracking-wider text-owner-fg-3">
            Rate card
          </div>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {rateCard.map(({ channel, Icon, rate }) => (
              <li
                key={channel}
                className="flex items-center justify-between gap-3 rounded-owner-md px-3 py-2.5 transition hover:bg-owner-bg-subtle"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className="text-owner-fg-3" />
                  <span className="text-[13.5px] font-medium text-owner-fg-1">
                    {channel}
                  </span>
                </div>
                <span className="text-[12.5px] text-owner-fg-3 tabular-nums">
                  {rate}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-owner-lg border border-owner-border bg-owner-bg p-5 shadow-owner-sm">
          <p className="text-[14px] font-semibold text-owner-fg-1">
            Need help with marketing?
          </p>
          <p className="mt-1 text-[12.5px] leading-5 text-owner-fg-4">
            Talk to a real human at Hoizr. We help with campaign timing,
            audience segments, and creative.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://wa.me/918910385523"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] font-semibold text-owner-fg-1 hover:bg-owner-bg-subtle"
            >
              <MessageCircle size={14} className="text-owner-success-text" />
              Chat on WhatsApp
            </a>
            <a
              href="mailto:contact@hoizr.com"
              className="inline-flex h-9 items-center gap-2 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] font-semibold text-owner-fg-1 hover:bg-owner-bg-subtle"
            >
              <Mail size={14} className="text-owner-blue-500" />
              contact@hoizr.com
            </a>
          </div>
        </div>
      </div>

      <ReputationTierCard />

      <div>
        <h2 className="owner-h2 mb-4">Activity</h2>
        <DataTable
          totalRows={ledger.length}
          columns={ledgerColumns}
          data={ledger}
          loading={loading}
          manualPagination={false}
          hideDownloadButton
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default MarketingCredit;
