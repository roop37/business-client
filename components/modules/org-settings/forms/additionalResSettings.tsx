import { StripeAccountStatusEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import React, { useState } from "react";
interface StripeIntegration {
  connectionStatus: StripeAccountStatusEnum;
}
const IdentityVerificationForm: React.FC = () => {
  const [stripeIntegration, setStripeIntegration] = useState({
    connectionStatus: StripeAccountStatusEnum.Pending,
    loading: false,
  });
  const { setToastData } = useGlobalStore();
  const handleManageSubscription = async () => {
    try {
      const response = await sdk.userLogoutFromEverywhere();

      if (response && response.userLogoutFromEverywhere) {
        setToastData({
          message: "Successfully logged out from every other device",
          type: "success",
        });
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    }
  };

  const checkStripeConnection = async () => {
    setStripeIntegration((prev) => ({ ...prev, loading: true }));
    try {
      const response = await sdk.getStripeIntegration();
      setStripeIntegration((prev) => ({ ...prev, loading: false }));

      if (!response.getStripeIntegration) {
        setStripeIntegration((prev) => ({
          ...prev,
          connectionStatus: StripeAccountStatusEnum.Pending,
        }));
      } else {
        setStripeIntegration((prev) => ({
          ...prev,
          connectionStatus: response.getStripeIntegration
            ?.status as StripeAccountStatusEnum,
        }));
      }
    } catch (error) {
      setStripeIntegration((prev) => ({ ...prev, loading: false }));
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  return (
    <>
      {stripeIntegration.connectionStatus ===
        StripeAccountStatusEnum.Pending && (
        <>
          <div className="bg-white p-4 rounded-xl space-y-4 md:space-y-3 w-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white mb-2 rounded-xl w-full">
                <h2 className="text-xl font-semibold">Stripe</h2>
              </div>

              <div className="border p-4 rounded-xl bg-gray-50 space-y-2">
                <h3 className="text-md font-semibold text-gray-900">
                  Manage Subscription
                </h3>
                <p className="text-md text-gray-600">
                  {
                    "An extra layer to boost your account security. A verification code will be required each time you sign in."
                  }
                </p>
                {stripeIntegration.connectionStatus ===
                  StripeAccountStatusEnum.Pending && (
                  <button
                    className="text-red-500 hover:underline text-md"
                    onClick={handleManageSubscription}
                  >
                    Disable
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default IdentityVerificationForm;
