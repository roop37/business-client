import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import useGlobalStore from "@/store/global";
import useOnboardingStore from "@/store/onboarding";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface BusinessAdditionalForm {
  websiteUrl?: string;
  businessRegistrationNumber?: string;
  averageEventSize?: string;
  gstNumber?: string;
}

const BusinessAdditionalDetails = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const [btnLoading, setBtnLoading] = useState(false);
  const {
    websiteUrl,
    setWebsiteUrl,
    businessRegistrationNumber,
    setBusinessRegistrationNumber,
    averageEventSize,
    setAverageEventSize,
    gstNumber,
    setGstNumber,
  } = useOnboardingStore();

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<BusinessAdditionalForm>();

  useEffect(() => {
    setValue("websiteUrl", websiteUrl);
    setValue("businessRegistrationNumber", businessRegistrationNumber);
    setValue("averageEventSize", averageEventSize);
    setValue("gstNumber", gstNumber);
  }, [
    averageEventSize,
    businessRegistrationNumber,
    gstNumber,
    setValue,
    websiteUrl,
  ]);

  const onSubmit = async (data: BusinessAdditionalForm) => {
    try {
      setBtnLoading(true);

      await sdk.businessOnboarding({
        input: {
          websiteUrl: data.websiteUrl || null,
          businessRegistrationNumber: data.businessRegistrationNumber || null,
          averageEventSize: data.averageEventSize || null,
          gstNumber: data.gstNumber || null,
        },
      });

      await sdk.completeBusinessOnboarding();

      setToastData({
        type: "success",
        message: "Business details saved.",
      });
      router.replace("/onboarding-host/host-type");
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <motion.div
      className="z-10 w-full bg-transparent max-w-4xl flex flex-col items-center space-y-5 text-center relative"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <div className="w-full max-w-4xl rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg)]/90 p-6 shadow-[0_24px_60px_rgba(56,45,34,0.08)]">
        <form
          className="space-y-6 w-full p-2 md:p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] px-4 py-3 text-left">
            <p className="text-sm font-medium text-gray-900">
              These details are optional.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Filling them can help verification complete faster. You can skip
              these fields and proceed to host onboarding.
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Website Link <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("websiteUrl", {
                pattern: {
                  value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                  message: "Enter a valid website URL",
                },
              })}
              className="input input-primary"
              placeholder="https://yourbusiness.com"
              onChange={(event) => setWebsiteUrl(event.target.value)}
            />
            {errors.websiteUrl && (
              <p className="text-red-500 text-sm text-start">
                {errors.websiteUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Business Registration Number{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("businessRegistrationNumber")}
              className="input input-primary"
              placeholder="Enter registration number"
              onChange={(event) =>
                setBusinessRegistrationNumber(event.target.value)
              }
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Average Event Size{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("averageEventSize")}
              className="input input-primary"
              placeholder="e.g. 200-500 attendees"
              onChange={(event) => setAverageEventSize(event.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              GST Number <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("gstNumber")}
              className="input input-primary"
              placeholder="Enter GST number"
              onChange={(event) => setGstNumber(event.target.value.toUpperCase())}
            />
          </div>
        </form>
      </div>

      <div className="w-full max-w-4xl flex gap-2">
        <CButton
          loading={btnLoading}
          variant={ButtonType.Secondary}
          type="button"
          className="w-full"
          onClick={() => router.push("/onboarding/user/business-location")}
        >
          Back
        </CButton>
        <CButton
          loading={btnLoading}
          variant={ButtonType.Primary}
          type="submit"
          className="w-full"
          onClick={handleSubmit(onSubmit)}
        >
          Continue
        </CButton>
      </div>
    </motion.div>
  );
};

export default BusinessAdditionalDetails;
