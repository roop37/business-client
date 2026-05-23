import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import {
  HoizrBusinessType,
  formatHoizrBusinessType,
  normalizeHoizrBusinessType,
  toBusinessTypeGraphqlInput,
} from "@/lib/hoizrConstants";
import useGlobalStore from "@/store/global";
import useOnboardingStore from "@/store/onboarding";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, sanitizeText } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

interface BusinessDetailsForm {
  businessName: string;
  businessType: string;
  businessPhone: string;
  businessEmail: string;
}

const UserInfo = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const [btnLoading, setBtnLoading] = useState(false);
  const {
    businessName,
    setBusinessName,
    businessType,
    setBusinessType,
    businessPhone,
    setBusinessPhone,
    businessEmail,
    setBusinessEmail,
  } = useOnboardingStore();

  const {
    control,
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<BusinessDetailsForm>();

  useEffect(() => {
    setValue("businessName", businessName);
    setValue("businessType", businessType);
    setValue("businessPhone", businessPhone);
    setValue("businessEmail", businessEmail);
  }, [businessEmail, businessName, businessPhone, businessType, setValue]);

  const businessTypeOptions = Object.values(HoizrBusinessType).map((value) => ({
    value,
    label: formatHoizrBusinessType(value),
  }));

  const onSubmit = async (data: BusinessDetailsForm) => {
    try {
      setBtnLoading(true);

      await sdk.businessOnboarding({
        input: {
          name: sanitizeText(data.businessName),
          businessType: toBusinessTypeGraphqlInput(data.businessType),
          businessPhone: data.businessPhone,
          businessEmail: sanitizeText(data.businessEmail),
        },
      });

      setToastData({
        type: "success",
        message: "Business details saved.",
      });
      router.push("/onboarding/user/business-location");
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
          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Business Type
            </label>
            <Controller
              name="businessType"
              control={control}
              rules={{ required: "Please select a business type" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={businessTypeOptions}
                  value={businessTypeOptions.find(
                    (option) =>
                      option.value === normalizeHoizrBusinessType(businessType)
                  )}
                  onChange={(option) => {
                    const value = option?.value ?? "";
                    setValue("businessType", value);
                    setBusinessType(value);
                  }}
                  classNamePrefix="react-select"
                  className="text-left text-sm"
                  placeholder="Select business type"
                />
              )}
            />
            {errors.businessType && (
              <p className="text-red-500 text-sm text-start">
                {errors.businessType.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Legal Name
            </label>
            <input
              type="text"
              {...register("businessName", {
                required: "Legal name is required",
              })}
              className="input input-primary"
              placeholder="Enter legal business name"
              onChange={(event) => setBusinessName(event.target.value)}
            />
            {errors.businessName && (
              <p className="text-red-500 text-sm text-start">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Business Email
            </label>
            <input
              type="email"
              {...register("businessEmail", {
                required: "Business email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              className="input input-primary"
              placeholder="Enter business email"
              onChange={(event) => setBusinessEmail(event.target.value)}
            />
            {errors.businessEmail && (
              <p className="text-red-500 text-sm text-start">
                {errors.businessEmail.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Business Phone
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              {...register("businessPhone", {
                required: "Business phone is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
                onChange: (event) => {
                  const value = event.target.value.replace(/\D/g, "").slice(0, 10);
                  event.target.value = value;
                  setBusinessPhone(value);
                },
              })}
              className="input input-primary"
              placeholder="Enter business phone"
            />
            {errors.businessPhone && (
              <p className="text-red-500 text-sm text-start">
                {errors.businessPhone.message}
              </p>
            )}
          </div>
        </form>
      </div>

      <div className="w-full max-w-4xl">
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

export default UserInfo;
