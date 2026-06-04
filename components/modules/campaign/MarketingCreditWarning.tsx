"use client";

import { inrFormat, OwnerButton } from "@/components/common/owner";
import { RowsPerPageEnum } from "@/generated/graphql";
import { sdk } from "@/utils/graphqlClient";
import { AlertTriangle, CreditCard } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type MarketingCreditWarningProps = {
  estimatedCost: number;
  audienceCount?: number;
  label?: string;
  className?: string;
};

const EMAIL_RATE_INR = 1;

const normalizeAmount = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.ceil(value)) : 0;
const formatCredit = (value: number) => inrFormat(value, { decimals: 2 });

export const MarketingCreditWarning = ({
  estimatedCost,
  audienceCount,
  label = "this campaign",
  className = "",
}: MarketingCreditWarningProps) => {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);

  const normalizedEstimate = normalizeAmount(estimatedCost);
  const shortfall = useMemo(() => {
    if (balance === null) return 0;
    return normalizeAmount(normalizedEstimate - balance);
  }, [balance, normalizedEstimate]);

  useEffect(() => {
    if (normalizedEstimate <= 0) return;

    let cancelled = false;
    sdk
      .myMarketingCreditLedger({
        pagination: {
          pageNumber: 1,
          rowsPerPage: RowsPerPageEnum.Ten,
        },
      })
      .then((response: any) => {
        if (!cancelled) {
          setBalance(Number(response?.myMarketingCreditLedger?.balance ?? 0));
        }
      })
      .catch(() => {
        if (!cancelled) setBalance(null);
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedEstimate]);

  if (normalizedEstimate <= 0 || balance === null || shortfall <= 0) {
    return null;
  }

  const recipientsCopy =
    audienceCount && audienceCount > 0
      ? ` for ${audienceCount.toLocaleString(
          "en-IN"
        )} recipients at ${formatCredit(EMAIL_RATE_INR)}/email`
      : "";

  return (
    <div
      className={`flex flex-col gap-4 rounded-owner-lg border border-owner-warning-text/25 bg-owner-warning-bg/70 p-4 text-owner-fg-1 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-owner-sm bg-owner-bg text-owner-warning-text">
          <AlertTriangle size={17} />
        </span>
        <div>
          <p className="text-[14px] font-semibold">
            {formatCredit(shortfall)} more marketing credit needed
          </p>
          <p className="mt-1 text-[13px] text-owner-fg-3">
            Estimated cost for {label} is {formatCredit(normalizedEstimate)}
            {recipientsCopy}. Current balance is {formatCredit(balance)}.
          </p>
        </div>
      </div>

      <OwnerButton
        type="button"
        size="sm"
        leadingIcon={<CreditCard size={14} />}
        onClick={() =>
          router.push(
            `/campaigns/marketing-credit?topUp=1&amount=${Math.max(
              100,
              shortfall
            )}`
          )
        }
        className="shrink-0"
      >
        Top up
      </OwnerButton>
    </div>
  );
};

export default MarketingCreditWarning;
