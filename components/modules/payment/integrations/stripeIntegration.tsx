import React, { useEffect, useState } from "react";

import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import { StripeAccountStatusEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface IStripeIntegrationProps {
  stripeIntegration: { status: StripeAccountStatusEnum } | null;
}

const StripeConnect: React.FC<IStripeIntegrationProps> = ({
  stripeIntegration,
}) => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();

  const [loading, setLoading] = useState(false);
  const [contentBasedOnStatus, setContentBasedOnStatus] = useState<{
    title: string;
    subtitle: string;
    action: string;
  }>({
    title: "Stripe Connect",
    subtitle:
      "We have partnered with Stripe to help you accept payments online. Start by creating a new Stripe Connect account or linking your existing Stripe account.",
    action: "Connect",
  });

  const connectHandler = async () => {
    setLoading(true);
    try {
      const response = await sdk.createStripeIntegration();

      if (response.createStripeIntegration) {
        router.push(response.createStripeIntegration);
      } else {
        setToastData({
          message: "Something went wrong, please try again!",
          type: "error",
        });
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stripeIntegration?.status === StripeAccountStatusEnum.Pending) {
      setContentBasedOnStatus({
        title: "Stripe Connect",
        subtitle:
          "Your stripe account onboarding is not complete, please complete it to start accepting payments online.",
        action: "Continue",
      });
    } else if (stripeIntegration?.status === StripeAccountStatusEnum.Blocked) {
      setContentBasedOnStatus({
        title: "Stripe Connect",
        subtitle:
          "Your account is not enabled to accept payments online. Please login to stripe to enable your account.",
        action: "Stripe Login",
      });
    } else if (
      stripeIntegration?.status === StripeAccountStatusEnum.Connected
    ) {
      setContentBasedOnStatus({
        title: "Account Connected",
        subtitle:
          "Your account is connected to Stripe. You can now start accepting payments online.",
        action: "Stripe Dashboard",
      });
    }
  }, [stripeIntegration]);

  return (
    <div className="py-2">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-300 flex justify-between items-center space-x-2 group w-full"
        onClick={() => {}}
      >
        <div className="flex flex-col justify-start items-start max-w-lg">
          <h3 className="font-medium text-lg">{contentBasedOnStatus.title}</h3>
          <p className="text-xs font-normal text-blackBg/60">
            {contentBasedOnStatus.subtitle}
          </p>
        </div>
        <CButton
          variant={ButtonType.Primary}
          onClick={() => {
            if (
              stripeIntegration === null ||
              stripeIntegration?.status === StripeAccountStatusEnum.Pending
            ) {
              connectHandler();
            } else {
              // redirect to stripe dashboard
              const newWindow = window.open(
                "https://dashboard.stripe.com/",
                "_blank",
                "noopener,noreferrer"
              );
              if (newWindow) newWindow.opener = null;
            }
          }}
          disabled={loading}
          loading={loading}
        >
          {contentBasedOnStatus.action}
        </CButton>
      </motion.div>
    </div>
  );
};

export default StripeConnect;
