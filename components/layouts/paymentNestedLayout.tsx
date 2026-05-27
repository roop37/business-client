"use client";

import { PageHeader, PillTabs, type PillTab } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useMemo, useState } from "react";
import Joyride, { STATUS } from "react-joyride";
import CustomJoyrideTooltip from "../joyride";

type Props = {
  children: ReactNode;
};

type PaymentTab = "payouts" | "settlement-history" | "invoices";

const TABS: PillTab<PaymentTab>[] = [
  { value: "payouts", label: "Payout details" },
  { value: "settlement-history", label: "Settlement history" },
  { value: "invoices", label: "Payout invoices" },
];

const walkthroughDone = (userId?: string, tour = "payments") => {
  if (typeof window === "undefined" || !userId) return true;
  return localStorage.getItem(`hoizr.walkthrough.${userId}.${tour}`) === "done";
};

const markWalkthroughDone = (userId?: string, tour = "payments") => {
  if (typeof window === "undefined" || !userId) return;
  localStorage.setItem(`hoizr.walkthrough.${userId}.${tour}`, "done");
};

const PaymentLayout = ({ children }: Props) => {
  const router = useRouter();
  const { query } = router;
  const paymentSlug = query["paymentSlug"]?.toString();
  const { meUser } = useUserStore();
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setToastData } = useGlobalStore();

  const selected: PaymentTab = useMemo(
    () =>
      TABS.find((tab) => tab.value === paymentSlug)?.value ?? "payouts",
    [paymentSlug]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await sdk.MeUser();
        if (response?.meUser) {
          useUserStore.getState().setMeUser(response.meUser);
          setShowWalkthrough(!walkthroughDone(response.meUser._id, "payments"));
        }
      } catch (error) {
        setToastData({ message: extractErrorMessage(error), type: "error" });
      }
      setLoading(false);
    };

    fetchData();
    // setToastData is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtitle =
    selected === "payouts"
      ? "Bank accounts where ticket sale settlements arrive."
      : selected === "settlement-history"
      ? "Past and pending event settlements with signed payout statements."
      : "Tax invoices issued for payout settlements.";

  return (
    // PaymentLayout intentionally does NOT carry h-full / overflow-hidden
    // any more — the outer mainBodyLayout already provides the scrollable
    // content container. Nesting another scroll inside an auto-height
    // wrapper let the inner scroll collapse to 0 height, which is why the
    // payout-profile list couldn't scroll past the first card.
    <div
      id="payment"
      className="flex min-w-0 flex-col gap-6 font-owner"
    >
      <Joyride
        steps={[
          {
            title: "Payments",
            content:
              "Add and verify payout profiles here. Paid events can publish only after a payout profile is ready.",
            target: "#payment",
            placement: "center",
          },
        ]}
        run={showWalkthrough && !loading && !!meUser}
        continuous
        disableCloseOnEsc={true}
        disableScrolling={true}
        disableOverlayClose={true}
        hideCloseButton={true}
        callback={async (data) => {
          const { status } = data;
          const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

          if (finishedStatuses.includes(status) && meUser) {
            markWalkthroughDone(meUser._id, "payments");
            setShowWalkthrough(false);
          }
        }}
        tooltipComponent={CustomJoyrideTooltip}
      />

      <PageHeader
        title="Payments"
        subtitle={subtitle}
        actions={
          <PillTabs<PaymentTab>
            tabs={TABS}
            value={selected}
            onChange={(next) => router.push(next)}
          />
        }
        className="!mb-0"
      />

      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default PaymentLayout;
