import CustomSwitchCard from "@/components/common/customSwitchCard/customSwitchCard";
import useHostEditStore from "@/store/useHostEditStore";
import React, { useEffect, useState } from "react";

import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import { DeliveryProviderEnum, PermissionTypeEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage, roundOffPrice } from "@/utils/utilFUncs";
import { useForm } from "react-hook-form";

// Define the type for table rows
type DeliveryZoneRowType = {
  _id: string;
  provider: DeliveryProviderEnum;
  minimumOrderValue: number;
  radius: number;
  costCovered: number;
};

interface DeliveryZoneFormData {
  deliveryAllowed: boolean;
  provider: DeliveryProviderEnum;
  deliveryFee: number;
  minimumOrderValue: number;
  costCovered: number;
  radius: number;
}

const HostDeliveryConfigForm: React.FC = () => {
  // Config
  const { deliveryConfig, setDeliveryConfig } = useHostEditStore();
  const { setToastData } = useGlobalStore();
  const { meUser } = useUserStore();
  const [actionLoading, setActionLoading] = useState(false);
  // States
  const [conformationModal, setConfirmationModal] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DeliveryZoneRowType | null>(
    null
  );

  // Form Setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DeliveryZoneFormData>({
    defaultValues: {
      provider: DeliveryProviderEnum.UberEats,
      minimumOrderValue: NaN,
      costCovered: NaN,
      radius: NaN,
    },
  });

  // Form Values
  const minOrdVal = watch("minimumOrderValue");
  const coveredCosts = watch("costCovered");
  const delRadius = watch("radius");

  // Use Effects
  useEffect(() => {
    if ((deliveryConfig.deliveryZone?.length ?? 0) > 0) {
      const delConfig = deliveryConfig.deliveryZone![0];
      setSelectedZone({
        _id: delConfig._id,
        costCovered: delConfig.costCovered ?? 0,
        minimumOrderValue: delConfig.minimumOrderValue ?? 0,
        provider: DeliveryProviderEnum.UberEats,
        radius: delConfig.radius ?? 0,
      });
      setValue("minimumOrderValue", delConfig.minimumOrderValue ?? 0);
      setValue("costCovered", delConfig.costCovered ?? 0);
      setValue("radius", delConfig.radius ?? 0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryConfig]);

  useEffect(() => {
    const canUpdateRestaurant = hasAccess(
      meUser?.permissions ?? [],
      PermissionTypeEnum.UpdateHost
    );

    setShowEditButton(canUpdateRestaurant);
  }, [meUser?.permissions]);

  const handleFormSuccess = (data: any) => {
    if (selectedZone) {
      // Handle update success
      const updatedZones =
        deliveryConfig.deliveryZone?.map((zone) =>
          zone._id === selectedZone._id ? { ...zone, ...data } : zone
        ) || [];

      setDeliveryConfig({
        ...deliveryConfig,
        deliveryZone: updatedZones,
      });
      setToastData({
        message: "Delivery zone updated successfully",
        type: "success",
      });
    } else {
      // Handle add success
      setDeliveryConfig({
        ...deliveryConfig,
        deliveryZone: [...(deliveryConfig.deliveryZone || []), data],
      });
      setToastData({
        message: "Delivery zone saved successfully",
        type: "success",
      });
    }
  };

  const handleFormError = (errorMessage: string) => {
    setToastData({
      message: errorMessage,
      type: "error",
    });
  };

  const handleDeliveryToggle = async () => {
    try {
      setActionLoading(true);
      const response = await sdk.updateRestaurantProvideDelivery();

      if (response?.updateRestaurantProvideDelivery) {
        setDeliveryConfig({
          ...deliveryConfig,
          provideDelivery: !deliveryConfig.provideDelivery,
        });
        setToastData({
          message: "Delivery status updated successfully",
          type: "success",
        });
        setActionLoading(false);
        setConfirmationModal(false);
      } else {
        setToastData({
          message: "Failed to update delivery status",
          type: "error",
        });
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddZone = async (data: DeliveryZoneFormData) => {
    try {
      if (parseFloat(data.radius.toString()) > 8) {
        setToastData({
          message: "Delivery radius cannot be more than 8 miles",
          type: "error",
        });
        return;
      }
      setLoading(true);
      const response = await sdk.addDeliveryZone({
        input: {
          costCovered: roundOffPrice(parseFloat(data.costCovered.toString())),
          minimumOrderValue: roundOffPrice(
            parseFloat(data.minimumOrderValue.toString())
          ),
          provider: DeliveryProviderEnum.UberEats,
          radius: parseFloat(data.radius.toString()),
        },
      });

      if (response?.addDeliveryZone) {
        handleFormSuccess({ _id: response.addDeliveryZone, ...data });
        // onClose();
      }
    } catch (error) {
      console.log(error);
      handleFormError(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateZone = async (data: DeliveryZoneFormData) => {
    if (!selectedZone) return;

    try {
      setLoading(true);
      const response = await sdk.updateDeliveryZone({
        input: {
          _id: selectedZone._id,
          costCovered: roundOffPrice(parseFloat(data.costCovered.toString())),
          minimumOrderValue: roundOffPrice(
            parseFloat(data.minimumOrderValue.toString())
          ),
          provider: DeliveryProviderEnum.UberEats,
          radius: parseFloat(data.radius.toString()),
        },
      });

      if (response?.updateDeliveryZone) {
        handleFormSuccess({ ...selectedZone, ...data });
      }
    } catch (error) {
      handleFormError(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: DeliveryZoneFormData) => {
    // if (data.costCovered > 7) {
    //   setToastData({
    //     message: "Cost covered cannot be more than $7",
    //     type: "error",
    //   });
    //   return;
    // }
    if (data.radius > 8) {
      setToastData({
        message:
          "Delivery radius from the host can not be more than 8 miles",
        type: "error",
      });
      return;
    }
    if (selectedZone) {
      handleUpdateZone(data);
    } else {
      handleAddZone(data);
    }
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 4) {
      input = input.slice(0, 6);
    }
    e.target.value = input;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 space-y-3 w-full ">
      <p className="text-xs text-gray-600 italic">
        Note: All the delivery orders are fulfilled by UberEats (3rd Party
        Delivery Partner)
      </p>
      <CustomSwitchCard
        label="Delivery"
        title="Delivery"
        caption="Enable delivery orders for this host"
        switchChecked={deliveryConfig.provideDelivery ?? false}
        // onSwitchChange={handleDeliveryToggle}
        onSwitchChange={() => setConfirmationModal(true)}
        disabled={!showEditButton}
      />

      {/* Delivery Zones Table */}
      <div className="mt-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full bg-white rounded-xl space-y-6"
        >
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
              How much do you want to cover for delivery. You can not cover more
              than $7 per order.
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
              loading={loading}
              disabled={
                selectedZone === null
                  ? Number.isNaN(minOrdVal) ||
                    Number.isNaN(coveredCosts) ||
                    Number.isNaN(delRadius)
                  : Number(coveredCosts) ===
                      Number(selectedZone?.costCovered ?? 0) &&
                    Number(minOrdVal) ===
                      Number(selectedZone?.minimumOrderValue ?? 0) &&
                    Number(delRadius) === Number(selectedZone?.radius ?? 0)
              }
            >
              {selectedZone ? "Update" : "Save"} Zone Details
            </CButton>
          </div>
        </form>
      </div>

      <ReusableModal
        isOpen={conformationModal}
        onClose={() => setConfirmationModal(false)}
        title="Are you sure"
        comments="Are you sure you want to change the delivery status?"
      >
        <div className="flex justify-end space-x-4">
          <CButton
            type="button"
            variant={ButtonType.Primary}
            onClick={handleDeliveryToggle}
            loading={actionLoading}
          >
            Yes
          </CButton>
        </div>
      </ReusableModal>
    </div>
  );
};

export default HostDeliveryConfigForm;
