import { Card, OwnerButton } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import {
  createAiBoostPaymentOrder,
  fetchAiBoostPaymentInfo,
  type AiBoostPaymentInfo,
} from "@/utils/aiBoostPaymentClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.src = RAZORPAY_SRC;
    s.async = true;
    s.onload = () => resolve(Boolean(window.Razorpay));
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const rupee = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Math.max(0, n));

type Phase = "loading" | "ready" | "paying" | "paid" | "error";

const AiBoostPayPage = () => {
  const router = useRouter();
  const token = (router.query.token as string) ?? "";
  const { setToastData } = useGlobalStore();

  const [phase, setPhase] = useState<Phase>("loading");
  const [info, setInfo] = useState<AiBoostPaymentInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await fetchAiBoostPaymentInfo(token);
        setInfo(data);
        setPhase(data.alreadyPaid ? "paid" : "ready");
      } catch (err) {
        setErrorMsg(extractErrorMessage(err));
        setPhase("error");
      }
    })();
  }, [token]);

  const pay = useCallback(async () => {
    if (!info) return;
    setPhase("paying");
    try {
      const order = await createAiBoostPaymentOrder(info.eventId);
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        throw new Error("Unable to load the payment widget. Please retry.");
      }
      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay!({
          key: order.razorpayKeyId,
          amount: Math.round(order.payableAmount * 100),
          currency: order.currency,
          name: "Hoizr",
          description: `AI Boost fee · ${info.eventTitle}`,
          order_id: order.razorpayOrderId,
          theme: { color: "#2C63E5" },
          // Handler = success: the Razorpay webhook is the source of truth
          // and asynchronously marks the fee paid. We never surface an
          // inline-confirm error here (would risk a double charge); we just
          // show the optimistic success + tell them the team confirms it.
          handler: () => resolve(),
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        checkout.open();
      });
      setPhase("paid");
    } catch (err) {
      const message = extractErrorMessage(err);
      if (message === "Payment cancelled") {
        setPhase("ready");
        return;
      }
      setErrorMsg(message);
      setPhase("error");
      setToastData({ type: "error", message });
    }
  }, [info, setToastData]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-owner-bg-subtle px-4 py-10 font-owner">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-center gap-2 text-owner-fg-2">
          <Sparkles size={18} className="text-owner-blue-500" />
          <span className="text-[15px] font-semibold">Hoizr · AI Boost fee</span>
        </div>

        {phase === "loading" ? (
          <Card padding={24} className="flex items-center justify-center">
            <Loader2 className="animate-spin text-owner-fg-3" size={20} />
          </Card>
        ) : phase === "error" ? (
          <Card padding={24} className="text-center">
            <div className="text-[15px] font-semibold text-owner-danger-text">
              Couldn&apos;t load this payment
            </div>
            <div className="mt-2 text-[13px] text-owner-fg-3">{errorMsg}</div>
          </Card>
        ) : phase === "paid" ? (
          <Card padding={24} className="text-center">
            <CheckCircle2
              size={40}
              className="mx-auto text-owner-success-text"
            />
            <div className="mt-3 text-[16px] font-semibold text-owner-fg-1">
              Payment received
            </div>
            <div className="mt-1 text-[13px] leading-5 text-owner-fg-3">
              Thanks{info ? `, ${info.hostName}` : ""}. Your AI Boost fee for{" "}
              <span className="font-semibold text-owner-fg-2">
                {info?.eventTitle}
              </span>{" "}
              is confirmed. Our team will release your payout shortly.
            </div>
          </Card>
        ) : (
          <Card padding={24}>
            <div className="text-[13px] text-owner-fg-4">Payment for</div>
            <div className="mt-0.5 text-[17px] font-semibold text-owner-fg-1">
              {info?.eventTitle}
            </div>
            <div className="text-[13px] text-owner-fg-3">{info?.hostName}</div>

            <div className="mt-4 space-y-1.5 border-t border-owner-border-soft pt-4 text-[13px]">
              <Row label="AI Boost fee" value={rupee(info?.offerFeeAmount ?? 0)} />
              <Row label="GST" value={rupee(info?.offerFeeGstAmount ?? 0)} />
              <div className="flex items-center justify-between border-t border-owner-border-soft pt-2 text-[14px] font-semibold text-owner-fg-1">
                <span>You pay</span>
                <span className="tabular-nums">
                  {rupee(info?.payableAmount ?? 0)}
                </span>
              </div>
            </div>

            <OwnerButton
              variant="primary"
              className="mt-5 w-full justify-center"
              disabled={phase === "paying"}
              onClick={pay}
            >
              {phase === "paying" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : null}
              Pay {rupee(info?.payableAmount ?? 0)}
            </OwnerButton>

            <p className="mt-3 text-center text-[11px] leading-4 text-owner-fg-4">
              Secured by Razorpay. Once paid, Hoizr releases your event payout.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-owner-fg-3">
    <span>{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);

export default AiBoostPayPage;

// Protected route: must be a logged-in business-client (host) session.
export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    const back = encodeURIComponent(context.resolvedUrl);
    return {
      redirect: { destination: `/login?next=${back}`, permanent: false },
    };
  }
  return { props: {} };
};
