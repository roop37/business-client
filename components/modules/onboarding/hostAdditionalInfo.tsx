import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import useGlobalStore from "@/store/global";
import RestaurantOnboardingStore from "@/store/hostOnboarding";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface IFormInput {
  businessRegistrationNumber?: string;
  averageEventSize?: string;
  gstNumber?: string;
  websiteUrl?: string;
}

const HostAdditionalInformation = () => {
  const { setToastData } = useGlobalStore();
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    register,
  } = useForm<IFormInput>();

  const {
    businessRegistrationNumber,
    setBusinessRegistrationNumber,
    averageEventSize,
    setAverageEventSize,
    gstNumber,
    setGstNumber,
    websiteUrl,
    setWebsiteUrl,
  } = RestaurantOnboardingStore();

  useEffect(() => {
    setValue("businessRegistrationNumber", businessRegistrationNumber);
    setValue("averageEventSize", averageEventSize);
    setValue("gstNumber", gstNumber);
    setValue("websiteUrl", websiteUrl);
  }, [
    averageEventSize,
    businessRegistrationNumber,
    gstNumber,
    websiteUrl,
    setValue,
  ]);

  const [btnLoading, setBtnLoading] = useState(false);

  const onSubmit = async (data: IFormInput) => {
    try {
      setBtnLoading(true);
      const input: any = {};
      if (data.businessRegistrationNumber) {
        input.businessRegistrationNumber = data.businessRegistrationNumber;
      }
      if (data.averageEventSize) input.averageEventSize = data.averageEventSize;
      if (data.gstNumber) input.gstNumber = data.gstNumber;
      if (data.websiteUrl) input.websiteUrl = data.websiteUrl;

      if (Object.keys(input).length > 0) {
        const response = await sdk.hostOnboarding({ input });
        if (!response.hostOnboarding) {
          setToastData({
            type: "error",
            message: "Something went wrong, please try again.",
          });
          return;
        }
      }

      const finalResponse = await sdk.completeHostOnboarding();
      if (finalResponse.completeHostOnboarding) {
        setToastData({
          message: "Business onboarding completed",
          type: "success",
        });
        router.replace("/dashboard");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <motion.div
      className="z-10 flex h-full min-h-0 w-full max-w-[720px] flex-col items-center bg-transparent text-center"
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        show: {
          opacity: 1,
          scale: 1,
          transition: { staggerChildren: 0.2 },
        },
      }}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: 0.3, type: "spring" }}
    >
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg)]/96 shadow-[0_12px_32px_rgba(56,45,34,0.08)]">
        <div className="shrink-0 border-b border-[var(--owner-border)] px-4 py-4 text-left md:px-5">
          <p className="text-xs font-semibold uppercase text-[var(--owner-blue-500)]">
            Step 3/3
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Add optional verification details.
          </h2>
          <p className="mt-1 text-sm leading-5 text-gray-600">
            Skip this if you are moving fast. These details can be added later
            from settings.
          </p>
        </div>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 md:px-5">
          <div>
            <label
              htmlFor="businessRegistrationNumber"
              className="block mb-2 text-sm font-medium text-left text-gray-700"
            >
              Business Registration Number{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("businessRegistrationNumber")}
              id="businessRegistrationNumber"
              className="input input-primary"
              placeholder="Enter registration number"
              onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="averageEventSize"
              className="block mb-2 text-sm font-medium text-left text-gray-700"
            >
              Average Event Size{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("averageEventSize")}
              id="averageEventSize"
              className="input input-primary"
              placeholder="e.g. 100-300 attendees"
              onChange={(e) => setAverageEventSize(e.target.value)}
            />
            <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
              Helps us recommend the right ticketing setup.
            </p>
            {errors.averageEventSize && (
              <p className="text-red-500 text-sm text-start">
                {errors.averageEventSize.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="gstNumber"
              className="block mb-2 text-sm font-medium text-left text-gray-700"
            >
              GST Number <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("gstNumber")}
              id="gstNumber"
              className="input input-primary"
              placeholder="Enter business GSTIN"
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
            />
            <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
              Required for invoicing if your business bills separately from the
              account.
            </p>
            {errors.gstNumber && (
              <p className="text-red-500 text-sm text-start">
                {errors.gstNumber.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="websiteUrl"
              className="block mb-2 text-sm font-medium text-left text-gray-700"
            >
              Website URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("websiteUrl", {
                pattern: {
                  value:
                    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                  message: "Please enter a valid website URL",
                },
              })}
              id="websiteUrl"
              className="input input-primary"
              placeholder="https://yourbusiness.com"
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
            {errors.websiteUrl && (
              <p className="text-red-500 text-sm text-start">
                {errors.websiteUrl.message}
              </p>
            )}
          </div>

          </div>

          <div className="grid shrink-0 gap-3 border-t border-[var(--owner-border)] bg-[var(--owner-bg)]/96 px-4 py-3 sm:grid-cols-2 md:px-5">
            <CButton
              loading={btnLoading}
              variant={ButtonType.Secondary}
              type="button"
              onClick={() => router.push("/onboarding-host/host-address")}
              className="w-full"
            >
              Back
            </CButton>
            <CButton
              loading={btnLoading}
              variant={ButtonType.Primary}
              type="submit"
              className="w-full"
            >
              Finish
            </CButton>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default HostAdditionalInformation;
