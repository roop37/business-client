import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import CustomSwitchCard from "@/components/common/customSwitchCard/customSwitchCard";
import ReusableModal from "@/components/common/modal/modal";
import { PermissionTypeEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import useUserStore from "@/store/user";
import useHostEditStore from "@/store/useHostEditStore";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage } from "@/utils/utilFUncs";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const HostFulfillmentForm: React.FC = () => {
  const {
    hostConfigs,
    fulfillmentConfig,
    setHostConfigs,
    setFulfillmentConfig,
    onlineOrderTimingConfig,
    setOnlineOrderTimingConfig,
  } = useHostEditStore();

  const { setToastData } = useGlobalStore();
  const { meUser } = useUserStore();
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);
  const [timingConfigBtnLoading, setTimingConfigBtnLoading] =
    useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);

  useEffect(() => {
    const canUpdateRestaurant = hasAccess(
      meUser?.permissions ?? [],
      PermissionTypeEnum.UpdateHost
    );

    setShowEditButton(canUpdateRestaurant);
  }, [meUser?.permissions]);

  const {
    setOnlineOrderingActive,
    selectedHostId,
    onlineOrderingActive,
  } = useHostsStore();
  const handleTimingConfigSubmit = async () => {
    setTimingConfigBtnLoading(true);
    try {
      const response = await sdk.updateOnlineOrderTimingConfig({
        input: {
          startAfterMinutes: parseInt(
            watchedValues.startAfterMinutes.toString()
          ),
          endBeforeMinutes: parseInt(watchedValues.endBeforeMinutes.toString()),
        },
      });

      if (response?.updateOnlineOrderTimingConfig) {
        setOnlineOrderTimingConfig({
          startAfterMinutes: watchedValues.startAfterMinutes,
          endBeforeMinutes: watchedValues.endBeforeMinutes,
        });
        setToastData({
          message: "Online order timing settings updated successfully",
          type: "success",
        });
      } else {
        setToastData({
          message: "Failed to update online order timing settings",
          type: "error",
        });
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setTimingConfigBtnLoading(false);
    }
  };

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationMssg, setConfirmationMssg] = useState<string>("");
  const [confirmedFor, setConfirmedFor] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      preparationTime: fulfillmentConfig.prepTime || 25,
      deliveryTime: fulfillmentConfig.deliveryTime || 45,
      largeOrderThreshold: fulfillmentConfig.largeOrderTreshold || 75,
      largeOrderExtraTime: fulfillmentConfig.largeOrderExtraTime || 25,
      startAfterMinutes: onlineOrderTimingConfig.startAfterMinutes || 0,
      endBeforeMinutes: onlineOrderTimingConfig.endBeforeMinutes || 30,
    },
  });

  // Watch form values for changes
  const watchedValues = watch();

  useEffect(() => {
    const hasChanged =
      watchedValues.preparationTime !== fulfillmentConfig.prepTime ||
      watchedValues.deliveryTime !== fulfillmentConfig.deliveryTime ||
      watchedValues.largeOrderThreshold !==
        fulfillmentConfig.largeOrderTreshold ||
      watchedValues.largeOrderExtraTime !==
        fulfillmentConfig.largeOrderExtraTime;

    setIsFormChanged(hasChanged);
  }, [watchedValues, fulfillmentConfig]);

  const handlePickupToggle = async () => {
    try {
      setActionLoading(true);
      const response = await sdk.updateRestaurantPickupStatus();

      if (response?.updateRestaurantPickupStatus) {
        setHostConfigs({
          ...hostConfigs,
          pickup: !hostConfigs.pickup,
        });
        setConfirmationModal(false);
        setConfirmationMssg("");
        setConfirmedFor("");
      } else {
        setToastData({
          message: "Failed to update pickup status",
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
  const handleScheduleOrdersToggle = async () => {
    try {
      setActionLoading(true);
      const response = await sdk.updateRestaurantScheduleOrders();

      if (response?.updateRestaurantScheduleOrders) {
        setHostConfigs({
          ...hostConfigs,
          scheduleOrders: !hostConfigs.scheduleOrders,
        });
        setConfirmationModal(false);
        setConfirmedFor("");
        setConfirmationMssg("");
      } else {
        setToastData({
          message: "Failed to update pickup status",
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

  const handleShowItemFiltersToggle = async () => {
    try {
      setActionLoading(true);
      const response = await sdk.updateRestaurantShowItemFilters();

      if (response?.updateRestaurantShowItemFilters) {
        setHostConfigs({
          ...hostConfigs,
          showItemFilters: !hostConfigs.showItemFilters,
        });
        setConfirmationModal(false);
        setConfirmedFor("");
        setConfirmationMssg("");
      } else {
        setToastData({
          message: "Failed to update item filters visibility",
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

  const handleGiftCardToggle = async () => {
    try {
      setActionLoading(true);
      const response = await sdk.updateRestaurantGiftCardEnabled();

      if (response?.updateRestaurantGiftCardEnabled) {
        setHostConfigs({
          ...hostConfigs,
          giftCardEnabled: !hostConfigs.giftCardEnabled,
        });
        setConfirmationModal(false);
        setConfirmedFor("");
        setConfirmationMssg("");
      } else {
        setToastData({
          message: "Failed to update gift card status",
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

  const handleOnlineOrderingToggle = async () => {
    try {
      setActionLoading(true);
      const response = await sdk.updateRestaurantOnlineOrderingStatus();

      if (response?.updateRestaurantOnlineOrderingStatus) {
        setOnlineOrderingActive(!hostConfigs.onlineOrdering);
        setHostConfigs({
          ...hostConfigs,
          onlineOrdering: !hostConfigs.onlineOrdering,
        });
        setConfirmationModal(false);
        setConfirmedFor("");
        setConfirmationMssg("");
      } else {
        setToastData({
          message: "Failed to update tips status",
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

  const handleTipsToggle = async () => {
    try {
      setActionLoading(true);
      const response = await sdk.updateRestaurantAllowTips();

      if (response?.updateRestaurantAllowTips) {
        setHostConfigs({
          ...hostConfigs,
          allowTips: !hostConfigs.allowTips,
        });
        setConfirmationModal(false);
        setConfirmedFor("");
        setConfirmationMssg("");
      } else {
        setToastData({
          message: "Failed to update tips status",
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

  const onSubmit = async (data: any) => {
    setBtnLoading(true);
    try {
      const response = await sdk.updateFulfillmentConfig({
        input: {
          prepTime: parseInt(data.preparationTime.toString()),
          deliveryTime: parseInt(data.deliveryTime.toString()),
          largeOrderTreshold: parseInt(data.largeOrderThreshold.toString()),
          largeOrderExtraTime: parseInt(data.largeOrderExtraTime.toString()),
        },
      });

      if (response?.updateFulfillmentConfig) {
        setFulfillmentConfig({
          deliveryTime: data.deliveryTime,
          largeOrderExtraTime: data.largeOrderExtraTime,
          largeOrderTreshold: data.largeOrderThreshold,
          prepTime: data.preparationTime,
        });
        setIsFormChanged(false);
        setToastData({
          message: "Fulfillment settings updated successfully",
          type: "success",
        });
      } else {
        setToastData({
          message: "Failed to update fulfillment settings",
          type: "error",
        });
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 space-y-6 w-full overflow-y-scroll max-h-[calc(100vh-9.5rem)]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <CustomSwitchCard
          label="Online Ordering"
          title="Online Ordering"
          caption="Enable online Ordering via choose customer website "
          switchChecked={hostConfigs.onlineOrdering ?? false}
          onSwitchChange={() => {
            setConfirmationModal(true);
            setConfirmationMssg(
              "Are you sure you want to change the online ordering status?"
            );
            setConfirmedFor("onlineOrdering");
          }}
          disabled={!showEditButton}
        />

        {/* Pickup */}
        <CustomSwitchCard
          label="Pickup"
          title="Pickup"
          caption="Enable pickup orders for this location"
          switchChecked={hostConfigs.pickup ?? false}
          // onSwitchChange={handlePickupToggle}
          onSwitchChange={() => {
            setConfirmationModal(true);
            setConfirmationMssg(
              "Are you sure you want to change the pickup status?"
            );
            setConfirmedFor("pickup");
          }}
          disabled={!showEditButton}
        />

        {/* Time Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
          {/* Preparation Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Preparation Time
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("preparationTime", {
                  required: "Preparation Time is required",
                  min: { value: 1, message: "Value must be at least 1" },
                  max: { value: 100, message: "Value must not exceed 100" },
                })}
                className="input input-primary pr-16 w-full"
                placeholder="25"
                step="0.01"
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
                disabled={!showEditButton}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                minutes
              </span>
            </div>
            {errors.preparationTime && (
              <p className="text-red-500 text-xs mt-1">
                {errors.preparationTime.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Delivery Time
            </label>
            <div className="relative ">
              <input
                type="number"
                {...register("deliveryTime", {
                  required: "Delivery Time is required",
                  min: { value: 1, message: "Value must be at least 1" },
                  max: { value: 100, message: "Value must not exceed 100" },
                })}
                className="input input-primary pr-16 w-full"
                placeholder="45"
                step="0.01"
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
                disabled={!showEditButton}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                minutes
              </span>
            </div>
            {errors.deliveryTime && (
              <p className="text-red-500 text-xs mt-1">
                {errors.deliveryTime.message}
              </p>
            )}
          </div>

          {/* Large Order Threshold */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Large Order Threshold
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("largeOrderThreshold", {
                  required: "Large Order Threshold is required",
                  min: { value: 1, message: "Value must be at least 1" },
                  max: { value: 100, message: "Value must not exceed 100" },
                })}
                className="input input-primary pr-12 w-full"
                placeholder="75"
                step="0.01"
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
                disabled={!showEditButton}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                items
              </span>
            </div>
            {errors.largeOrderThreshold && (
              <p className="text-red-500 text-xs mt-1">
                {errors.largeOrderThreshold.message}
              </p>
            )}
          </div>

          {/* Large Order Extra Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Large Order Extra Time
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("largeOrderExtraTime", {
                  required: "Large Order Extra Time is required",
                  min: { value: 1, message: "Value must be at least 1" },
                  max: { value: 100, message: "Value must not exceed 100" },
                })}
                className="input input-primary pr-16 w-full"
                placeholder="25"
                step="0.01"
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
                disabled={!showEditButton}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                minutes
              </span>
            </div>
            {errors.largeOrderExtraTime && (
              <p className="text-red-500 text-xs mt-1">
                {errors.largeOrderExtraTime.message}
              </p>
            )}
          </div>

          {/* Delivery Time */}
        </div>

        {/* Dine In
        <CustomSwitchCard
          label="Dine In"
          title="Dine In"
          caption="Enable dine-in orders for this location"
          switchChecked={false}
          onSwitchChange={() => {}}
        /> */}

        {/* Tips */}
        <CustomSwitchCard
          label="In House Tips"
          title="Tips"
          caption="Enable in-house tipping for this location"
          switchChecked={hostConfigs.allowTips ?? false}
          // onSwitchChange={handleTipsToggle}
          onSwitchChange={() => {
            setConfirmationModal(true);
            setConfirmationMssg(
              "Are you sure you want to change the In House Tips status?"
            );
            setConfirmedFor("inHouseTips");
          }}
          disabled={!showEditButton}
        />

        {/* Scheduling */}
        <CustomSwitchCard
          label="Scheduled Orders"
          title="Scheduling"
          caption="Allow customers to schedule orders for future dates"
          switchChecked={hostConfigs.scheduleOrders ?? false}
          // onSwitchChange={handleScheduleOrdersToggle}
          onSwitchChange={() => {
            setConfirmationModal(true);
            setConfirmationMssg(
              "Are you sure you want to change the Scheduling Orders status?"
            );
            setConfirmedFor("scheduleOrders");
          }}
          disabled={!showEditButton}
        />

        {/* Show Item Filters */}
        <CustomSwitchCard
          label="Item Filters"
          title="Show Item Filters"
          caption="Display dietary and preference filters on the online ordering menu"
          switchChecked={hostConfigs.showItemFilters ?? true}
          onSwitchChange={() => {
            setConfirmationModal(true);
            setConfirmationMssg(
              "Are you sure you want to change the Item Filters visibility?"
            );
            setConfirmedFor("showItemFilters");
          }}
          disabled={!showEditButton}
        />

        {/* Gift Card */}
        <CustomSwitchCard
          label="Gift Cards"
          title="Gift Cards"
          caption="Enable or disable gift card purchases for your host"
          switchChecked={hostConfigs.giftCardEnabled ?? true}
          onSwitchChange={() => {
            setConfirmationModal(true);
            setConfirmationMssg(
              "Are you sure you want to change the Gift Card status?",
            );
            setConfirmedFor("giftCard");
          }}
          disabled={!showEditButton}
        />

        {/* Submit Button - Only shown when form values have changed */}
        {isFormChanged && (
          <div>
            <CButton
              variant={ButtonType.Primary}
              type="submit"
              className="w-24"
              loading={btnLoading}
            >
              Save
            </CButton>
          </div>
        )}
        {/* Divider */}
        <div className="border-t border-gray-300 " />

        {/* Online Orders Timing Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">
            Online Orders Accepting Timings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start After Minutes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Start Taking Orders After
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register("startAfterMinutes", {
                    required: "Start time is required",
                    min: { value: 0, message: "Value must be at least 0" },
                    max: { value: 1440, message: "Value must not exceed 1440" },
                  })}
                  defaultValue={onlineOrderTimingConfig.startAfterMinutes || 0}
                  className="input input-primary pr-16 w-full"
                  placeholder="0"
                  step="1"
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
                  disabled={!showEditButton}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  minutes
                </span>
              </div>
              {errors.startAfterMinutes && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.startAfterMinutes.message}
                </p>
              )}
            </div>

            {/* End Before Minutes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Stop Taking Orders Before
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register("endBeforeMinutes", {
                    required: "End time is required",
                    min: { value: 0, message: "Value must be at least 0" },
                    max: { value: 1440, message: "Value must not exceed 1440" },
                  })}
                  defaultValue={onlineOrderTimingConfig.endBeforeMinutes || 30}
                  className="input input-primary pr-16 w-full"
                  placeholder="30"
                  step="1"
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
                  disabled={!showEditButton}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  minutes
                </span>
              </div>
              {errors.endBeforeMinutes && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.endBeforeMinutes.message}
                </p>
              )}
            </div>
          </div>

          {/* Timing Config Save Button */}
          {(watchedValues.startAfterMinutes !==
            onlineOrderTimingConfig.startAfterMinutes ||
            watchedValues.endBeforeMinutes !==
              onlineOrderTimingConfig.endBeforeMinutes) && (
            <div className="mt-4">
              <CButton
                variant={ButtonType.Primary}
                onClick={handleTimingConfigSubmit}
                className="w-24"
                loading={timingConfigBtnLoading}
              >
                Save
              </CButton>
            </div>
          )}
        </div>
      </form>
      <ReusableModal
        isOpen={confirmationModal}
        onClose={() => {
          setConfirmationModal(false);
          setConfirmationMssg("");
          setConfirmedFor("");
        }}
        title="Are you sure?"
        comments={confirmationMssg}
      >
        <div className="flex justify-end space-x-4">
          <CButton
            variant={ButtonType.Primary}
            loading={actionLoading}
            onClick={() => {
              switch (confirmedFor) {
                case "onlineOrdering":
                  handleOnlineOrderingToggle();
                  break;
                case "pickup":
                  handlePickupToggle();
                  break;
                case "inHouseTips":
                  handleTipsToggle();
                  break;
                case "scheduleOrders":
                  handleScheduleOrdersToggle();
                  break;
                case "showItemFilters":
                  handleShowItemFiltersToggle();
                  break;
                case "giftCard":
                  handleGiftCardToggle();
                  break;

                default:
                  setConfirmationModal(false);
                  setConfirmedFor("");
                  setConfirmationMssg("");
                  setToastData({
                    message: "Invalid Request,Please try again",
                    type: "error",
                  });
                  setActionLoading(false);
                  break;
              }
            }}
          >
            Yes
          </CButton>
        </div>
      </ReusableModal>
    </div>
  );
};

export default HostFulfillmentForm;
