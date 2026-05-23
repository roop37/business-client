"use client";

import {
  inrFormat,
  OwnerTable,
  PageHeader,
} from "@/components/common/owner";
import { RowsPerPageEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  Bell,
  CreditCard,
  Mail,
  MessageCircle,
  Repeat,
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
  iconBg: string;
  iconColor: string;
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

// Fallback used until the live `getMarketingPricing` query resolves.
// Matches the worker fallback (EMAIL_CAMPAIGN_RATE_FALLBACK_INR = 1) and
// the GST percent admins set on Config[type=gstOnMarketingCredit].
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
    iconBg: "var(--owner-success-bg)",
    iconColor: "var(--owner-success-text)",
    rate: formatRate(pricing.whatsappRate, "message"),
    divisor: pricing.whatsappRate || undefined,
  },
  {
    channel: "SMS",
    Icon: Zap,
    iconBg: "var(--owner-blue-050)",
    iconColor: "var(--owner-blue-500)",
    rate: formatRate(pricing.smsRate, "SMS"),
    divisor: pricing.smsRate || undefined,
  },
  {
    channel: "Email",
    Icon: Mail,
    iconBg: "var(--owner-danger-bg)",
    iconColor: "var(--owner-danger-text)",
    rate: formatRate(pricing.emailRate, "email"),
    divisor: pricing.emailRate || undefined,
  },
  {
    channel: "Push",
    Icon: Bell,
    iconBg: "var(--owner-warning-bg)",
    iconColor: "var(--owner-warning-text)",
    rate: pricing.pushRate <= 0 ? "Free" : formatRate(pricing.pushRate, "push"),
  },
];

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

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

const formatAmountCell = (amount: number) => {
  if (amount === 0) return { text: "—", className: "text-owner-fg-4" };
  if (amount > 0) {
    return {
      text: `+ ${inrFormat(amount)}`,
      className: "text-owner-success-text font-semibold",
    };
  }
  return {
    text: `− ${inrFormat(Math.abs(amount))}`,
    className: "text-owner-fg-1 font-semibold",
  };
};

export const MarketingCredit = () => {
  const router = useRouter();
  const { setToastData, openTopUpModal, topUpModalOpen } = useGlobalStore();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const handledTopUpQuery = useRef(false);

  // Live pricing from Config[type=...]. Starts on the fallback values so
  // the rate card paints immediately, then updates once the query lands.
  const [pricing, setPricing] = useState<MarketingPricingShape>(
    PRICING_FALLBACK
  );
  const rateCard = useMemo(() => buildRateCard(pricing), [pricing]);

  // Fetch live pricing once on mount. If the query fails (e.g. main-server
  // unreachable), the fallback values stay in place so the UI keeps working.
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

  // Refresh balance + ledger whenever the global top-up modal closes. The
  // modal verifies the payment server-side before closing, so by the time
  // we re-fetch the new credit is already on the summary.
  const prevTopUpModalOpenRef = useRef(false);
  useEffect(() => {
    if (prevTopUpModalOpenRef.current && !topUpModalOpen) {
      loadLedger();
    }
    prevTopUpModalOpenRef.current = topUpModalOpen;
  }, [topUpModalOpen, loadLedger]);

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

  // Top-up amount + payment + verify all live in the global TopUpModal,
  // mounted at the app root (see pages/_app.tsx → GlobalTopUpModal). The
  // useEffect above re-fetches the ledger when the modal closes so the
  // balance shown on this page stays in sync with the new credit.

  const showAutoRechargePendingToast = () => {
    setToastData({
      type: "warning",
      message: "Auto-recharge is coming soon.",
    });
  };

  return (
    <div className="flex flex-col gap-8 font-owner text-owner-fg-1">
      <PageHeader
        title="Marketing Credit"
        subtitle="Pre-funded balance for WhatsApp, SMS, Email and Push campaigns. Push and in-app messages remain free."
        className="!mb-0"
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div
          className="relative overflow-hidden rounded-owner-xl p-8 text-white shadow-owner-sm"
          style={{
            background:
              "linear-gradient(135deg, #0F1E3F 0%, var(--owner-blue-500) 100%)",
          }}
        >
          <div className="flex items-center gap-2 text-[13.5px] text-white/80">
            <Wallet size={16} />
            Available balance
          </div>
          <div className="mt-3 text-[56px] font-semibold leading-none tabular-nums">
            {inrFormat(balance)}
          </div>
          <p className="mt-3 max-w-md text-[13.5px] text-white/75">
            Enough for ~{messageCapacity.whatsapp.toLocaleString("en-IN")}{" "}
            WhatsApp messages · ~{messageCapacity.email.toLocaleString("en-IN")}{" "}
            emails
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openTopUpModal()}
              className="inline-flex h-10 items-center gap-2 rounded-owner-md bg-white px-5 text-[14px] font-semibold text-owner-blue-500 transition hover:bg-white/95"
            >
              <CreditCard size={14} />
              Top up
            </button>
            <button
              type="button"
              onClick={showAutoRechargePendingToast}
              aria-disabled="true"
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-owner-md border border-white/20 bg-white/10 px-5 text-[14px] font-semibold text-white/70"
            >
              <Repeat size={14} />
              Auto-recharge
            </button>
          </div>
        </div>

        <div className="rounded-owner-lg border border-owner-border bg-owner-bg p-6 shadow-owner-sm">
          <div className="text-[13px] font-semibold uppercase text-owner-fg-3">
            Rate card
          </div>
          <ul className="mt-4 space-y-1">
            {rateCard.map(({ channel, Icon, iconBg, iconColor, rate }) => (
              <li
                key={channel}
                className="flex items-center justify-between gap-3 border-b border-dashed border-owner-border-soft py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-owner-sm"
                    style={{ background: iconBg, color: iconColor }}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span className="text-[14px] font-semibold text-owner-fg-1">
                    {channel}
                  </span>
                </div>
                <span className="text-[13px] text-owner-fg-3 tabular-nums">
                  {rate}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="owner-h2 mb-4">Your reputation tier</h2>
        <ReputationTierCard />
      </div>

      <div>
        <h2 className="owner-h2 mb-4">Activity</h2>
        <OwnerTable
          loading={loading}
          rowCount={ledger.length}
          empty="No marketing-credit activity yet."
        >
          <OwnerTable.Head>
            <OwnerTable.HeaderCell width="160px">Date</OwnerTable.HeaderCell>
            <OwnerTable.HeaderCell>Activity</OwnerTable.HeaderCell>
            <OwnerTable.HeaderCell align="right" width="120px">
              Recipients
            </OwnerTable.HeaderCell>
            <OwnerTable.HeaderCell align="right" width="140px">
              Amount
            </OwnerTable.HeaderCell>
            <OwnerTable.HeaderCell align="right" width="120px">
              Balance
            </OwnerTable.HeaderCell>
          </OwnerTable.Head>
          <OwnerTable.Body>
            {ledger.map((row) => {
              const amount = formatAmountCell(row.amount);
              return (
                <OwnerTable.Row key={row.id}>
                  <OwnerTable.Cell muted>{row.date}</OwnerTable.Cell>
                  <OwnerTable.Cell>{row.activity}</OwnerTable.Cell>
                  <OwnerTable.Cell align="right" muted>
                    {row.recipients
                      ? row.recipients.toLocaleString("en-IN")
                      : "—"}
                  </OwnerTable.Cell>
                  <OwnerTable.Cell align="right">
                    <span className={amount.className}>{amount.text}</span>
                  </OwnerTable.Cell>
                  <OwnerTable.Cell align="right" bold>
                    {inrFormat(row.balance)}
                  </OwnerTable.Cell>
                </OwnerTable.Row>
              );
            })}
          </OwnerTable.Body>
        </OwnerTable>
        <p className="mt-3 text-[12px] text-owner-fg-4">
          Ledger rows are host-scoped and update as campaign sends and top-ups
          are recorded.
        </p>
      </div>

    </div>
  );
};

export default MarketingCredit;
