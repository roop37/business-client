import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RestaurantStatus } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import { StoreIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

interface IIncompleteLocationsProps {
  restaurants: { id: string; name: string; status: RestaurantStatus }[];
}

const IncompleteLocations = ({ restaurants }: IIncompleteLocationsProps) => {
  const router = useRouter();
  const [restauro, setResto] = useState<
    IIncompleteLocationsProps["restaurants"]
  >([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const { setToastData } = useGlobalStore();
  const [confirmationModalOpen, setConfirmationModalOpen] =
    useState<boolean>(false);
  const [selectedHostId, setSelectedHostId] = useState<
    string | null
  >(null);

  const completeClickHandler = async (id: string) => {
    try {
      const res = await sdk.setRestaurantIdAsCookie({ id });
      if (res.setRestaurantIdAsCookie) {
        router.push("/onboarding-host/host-type");
      }
    } catch (error: any) {
      setToastData({ message: extractErrorMessage(error), type: "error" });
    }
  };

  const handleDiscardRestaurant = async (id: string) => {
    try {
      setBtnLoading(true);
      const res = await sdk.deleteIncompleteRestaurant({ id });
      if (res.deleteIncompleteRestaurant) {
        setToastData({
          message: "Host details discarded.",
          type: "success",
        });
        setConfirmationModalOpen(false);
        setSelectedHostId(null);
        router.reload();
      }
    } catch (error: any) {
      setToastData({ message: extractErrorMessage(error), type: "error" });
    } finally {
      setBtnLoading(false);
    }
  };

  const pendingRestaurants = restaurants.filter(
    (r) => r.status === RestaurantStatus.OnboardingPending
  );

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-300 w-full mb-4"
    >
      <Accordion type="single" collapsible>
        <AccordionItem value="incomplete-locations" className="border-b-0">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex flex-col justify-start items-start w-full">
              <h3 className="font-medium text-lg">
                {`Organizer onboarding pending (${pendingRestaurants.length})`}
              </h3>
              <p className="text-xs font-normal mt-1 text-blackBg/60">
                Click to view pending organizers and continue the onboarding process
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="flex flex-col">
              {pendingRestaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className={`flex justify-between items-center w-full space-x-4 py-4 
                    ${
                      index !== pendingRestaurants.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                >
                  <div className="flex justify-start items-start w-full space-x-4">
                    <StoreIcon
                      size={32}
                      className="bg-background text-blackBg/40 p-2 rounded-xl"
                    />
                    <div className="flex flex-col justify-start items-start">
                      <h4 className="font-normal text-sm text-blackBg">
                        {restaurant.name}
                      </h4>
                      <p className="font-light text-xs text-blackBg/60">
                        Organizer details are incomplete
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setConfirmationModalOpen(true);
                        setSelectedHostId(restaurant.id);
                      }}
                      // onClick={() => handleDiscardRestaurant(restaurant.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Discard
                    </button>
                    <CButton
                      variant={ButtonType.Text}
                      onClick={() => completeClickHandler(restaurant.id)}
                      className="text-xs"
                    >
                      Complete
                    </CButton>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <ReusableModal
        isOpen={confirmationModalOpen}
        onClose={() => {
          setSelectedHostId(null);
          setConfirmationModalOpen(false);
        }}
        title="Are you sure?"
        comments="By clicking yes the selected organizer will be discarded and you may not be able to recover the data."
      >
        <div className="flex justify-end space-x-4">
          <CButton
            loading={btnLoading}
            variant={ButtonType.Primary}
            onClick={() => handleDiscardRestaurant(selectedHostId!)}
          >
            Yes
          </CButton>
        </div>
      </ReusableModal>
    </motion.div>
  );
};

export default IncompleteLocations;
