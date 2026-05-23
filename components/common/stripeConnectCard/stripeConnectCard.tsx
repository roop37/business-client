import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import { StripeAccountStatusEnum } from "@/generated/graphql";
import Image from "next/image";

interface StripeIntegration {
  connectionStatus: StripeAccountStatusEnum;
  loading: boolean;
  handleConnect: () => void;
  handleOpenDashboard: () => void;
  handleUpdateAccount: () => void;
}

const StripeCard: React.FC<{ integration: StripeIntegration }> = ({
  integration,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm border border-gray-300">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 relative">
          <Image
            src="/payments/stripe.png"
            alt="Stripe"
            fill
            className="object-cover rounded-xl"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Stripe</h3>
          <p className="text-sm text-gray-500"></p>
        </div>
      </div>
      {integration.connectionStatus === StripeAccountStatusEnum.Connected ? (
        <CButton
          variant={ButtonType.Primary}
          className="bg-primary text-white hover:bg-primary/90"
          onClick={integration.handleOpenDashboard}
          disabled={true}
        >
          Connected
        </CButton>
      ) : integration.connectionStatus === StripeAccountStatusEnum.Pending ? (
        <CButton
          variant={ButtonType.Outlined}
          onClick={integration.handleConnect}
          disabled={true}
        >
          Connect
        </CButton>
      ) : (
        // <Tooltip label="Contact support">s
        <CButton
          variant={ButtonType.Outlined}
          onClick={integration.handleUpdateAccount}
          // className=""
        >
          Update Stripe Account
        </CButton>
      )}
    </div>
  );
};

export default StripeCard;
