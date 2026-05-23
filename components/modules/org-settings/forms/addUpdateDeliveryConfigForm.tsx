// @ts-nocheck
import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import { DeliveryProviderEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, roundOffPrice } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

interface DeliveryZoneFormData {
  deliveryAllowed: boolean;
  provider: DeliveryProviderEnum;
  deliveryFee: number;
  minimumOrderValue: number;
  costCovered: number;
  radius: number;
}

interface AddUpdateDeliveryZoneProps {
  selectedZone: DeliveryZoneRowType | null;
  onSuccess: (data: any) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export interface DeliveryZoneRowType {
  _id: string;
  provider: DeliveryProviderEnum;
  minimumOrderValue: number;
  radius: number;
  costCovered: number;
}

const providerOptions = Object.values(DeliveryProviderEnum).map((provider) => ({
  value: provider,
  label: provider.replace(/([A-Z])/g, " $1").trim(), // Add spaces before capital letters
}));

const AddUpdateDeliveryZone: React.FC<AddUpdateDeliveryZoneProps> = ({
  selectedZone,
  onSuccess,
  onError,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setToastData } = useGlobalStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DeliveryZoneFormData>({
    defaultValues: {
      provider: selectedZone?.provider ?? DeliveryProviderEnum.UberEats,
      minimumOrderValue: selectedZone?.minimumOrderValue ?? NaN,
      costCovered: selectedZone?.costCovered ?? NaN,
      radius: selectedZone?.radius ?? NaN,
    },
  });

  const handleAddZone = async (data: DeliveryZoneFormData) => {
    try {
      if (parseFloat(data.radius.toString()) > 8) {
        setToastData({
          message: "Delivery radius cannot be more than 8 miles",
          type: "error",
        });
        return;
      }
      setIsSubmitting(true);
      const response = await sdk.addDeliveryZone({
        input: {
          costCovered: roundOffPrice(parseFloat(data.costCovered.toString())),
          // deliveryAllowed: true,
          // deliveryFee: roundOffPrice(parseFloat(data.deliveryFee.toString())),
          minimumOrderValue: roundOffPrice(
            parseFloat(data.minimumOrderValue.toString())
          ),
          provider: data.provider,
          radius: parseFloat(data.radius.toString()),
        },
      });

      if (response?.addDeliveryZone) {
        onSuccess({ _id: response.addDeliveryZone, ...data });
        onClose();
      }
    } catch (error) {
      console.log(error);
      onError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateZone = async (data: DeliveryZoneFormData) => {
    if (!selectedZone) return;

    try {
      setIsSubmitting(true);
      const response = await sdk.updateDeliveryZone({
        input: {
          _id: selectedZone._id,
          costCovered: roundOffPrice(parseFloat(data.costCovered.toString())),
          // deliveryAllowed: true,
          // deliveryFee: roundOffPrice(parseFloat(data.deliveryFee.toString())),
          minimumOrderValue: roundOffPrice(
            parseFloat(data.minimumOrderValue.toString())
          ),
          provider: data.provider,
          radius: parseFloat(data.radius.toString()),
        },
      });

      if (response?.updateDeliveryZone) {
        onSuccess({ ...selectedZone, ...data });
        onClose();
      }
    } catch (error) {
      onError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: DeliveryZoneFormData) => {
    if (selectedZone) {
      handleUpdateZone(data);
    } else {
      handleAddZone(data);
    }
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const value = e.target.value.replace(/[^0-9.]/g, "");
    // const parts = value.split(".");

    // if (parts[0].length > 5) {
    //   e.target.value = parts[0].slice(0, 5) + (parts[1] ? "." + parts[1] : "");
    // }
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 4) {
      input = input.slice(0, 6);
    }
    e.target.value = input;
    // setOtp(input);
  };

  return (
    <motion.div
      className="z-10 w-full min-h-full max-w-4xl flex flex-col items-center space-y-5 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto p-6 w-full bg-white rounded-xl space-y-6"
      >
        <div className="mb-1">
          <label className="block mb-2 text-sm font-medium text-left text-gray-700">
            Provider
          </label>
          <Controller
            name="provider"
            control={control}
            rules={{ required: "Provider is required" }}
            render={({ field }) => (
              <Select
                {...field}
                classNames={{
                  option: (state) =>
                    `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent  ${
                      state.isSelected ? "!bg-primary text-white" : ""
                    }  `,
                }}
                options={providerOptions}
                className="mt-1 text-sm rounded-xl w-full focus:outline-none text-left"
                classNamePrefix="react-select"
                value={providerOptions.find(
                  (option) => option.value === field.value
                )}
                styles={{
                  container: (base) => ({
                    ...base,
                    flex: 1,
                    marginRight: "10px",
                  }),
                }}
                onChange={(option) => field.onChange(option?.value)}
              />
            )}
          />
          {errors.provider && (
            <p className="text-red-500 text-sm text-start">
              {errors.provider.message}
            </p>
          )}
        </div>

        <div className="mb-1">
          <label className="block mb-2 text-sm font-medium text-left text-gray-700">
            Minimum Order Value
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-700 font-bold sm:text-sm">$</span>
            </div>
            <input
              type="number"
              {...register("minimumOrderValue", {
                required: "Minimum order value is required",
                min: {
                  value: 0,
                  message: "Minimum order value cannot be negative",
                },
              })}
              className="input input-primary pl-7"
              placeholder="Enter minimum order value"
              step="0.01"
              onInput={handleNumberInput}
              maxLength={7}
              onWheel={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              onFocus={(e) =>
                e.target.addEventListener("wheel", (event) =>
                  event.preventDefault()
                )
              }
            />
          </div>
          {errors.minimumOrderValue && (
            <p className="text-red-500 text-sm text-start">
              {errors.minimumOrderValue.message}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium text-left text-gray-700">
            Cost Covered
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-700 font-bold sm:text-sm">$</span>
            </div>
            <input
              type="number"
              {...register("costCovered", {
                required: "Cost covered is required",
                min: { value: 0, message: "Cost covered cannot be negative" },
              })}
              onInput={handleNumberInput}
              maxLength={7}
              className="input input-primary pl-7 w-full"
              placeholder="Enter cost covered"
              // step="0.01"
              onWheel={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              onFocus={(e) =>
                e.target.addEventListener("wheel", (event) =>
                  event.preventDefault()
                )
              }
            />
          </div>
          <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
            How much do you want to cover for delivery
          </p>
          {errors.costCovered && (
            <p className="text-red-500 text-sm text-start">
              {errors.costCovered.message}
            </p>
          )}
        </div>

        <div className="mb-1">
          <label className="block mb-2 text-sm font-medium text-left text-gray-700">
            Radius
          </label>
          <div className="relative">
            <input
              type="number"
              {...register("radius", {
                required: "Radius is required",
                min: { value: 0, message: "Radius cannot be negative" },
              })}
              className="input input-primary pr-16"
              placeholder="Enter radius"
              step="0.01"
              onInput={handleNumberInput}
              maxLength={7}
              onWheel={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              onFocus={(e) =>
                e.target.addEventListener("wheel", (event) =>
                  event.preventDefault()
                )
              }
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-semibold sm:text-sm">
                miles
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
            Delivery radius from the host can not be more than 8 miles
          </p>
          {errors.radius && (
            <p className="text-red-500 text-sm text-start">
              {errors.radius.message}
            </p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <CButton
            className="w-full"
            variant={ButtonType.Primary}
            type="submit"
            loading={isSubmitting}
          >
            {selectedZone ? "Update" : "Add"} Zone
          </CButton>
        </div>
      </form>
    </motion.div>
  );
};

export default AddUpdateDeliveryZone;
