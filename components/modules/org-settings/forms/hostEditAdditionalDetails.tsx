import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import FullPageModal from "@/components/common/modal/fullPageModal";
import { BeverageCategory, FoodType, MeatType } from "@/generated/graphql";
import {
  formatBeverageCategory,
  formatFoodType,
  formatMeatType,
} from "@/lib/hostUtilConstants";
import useGlobalStore from "@/store/global";
import useHostEditStore from "@/store/useHostEditStore";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

interface IFormInput {
  instagramLink?: string;
  facebookLink?: string;
  googleMapsLink?: string;
  beverageCategory?: { value: BeverageCategory; label: string }[];
  foodType?: { value: FoodType; label: string }[];
  meatType?: { value: MeatType; label: string };
}

const HostEditAdditionalDetails: React.FC = () => {
  const {
    instagramLink,
    facebookLink,
    googleMapsLink,
    beverageCategory,
    foodType,
    meatType,
    setInstagramLink,
    setFacebookLink,
    setGoogleMapsLink,
    setBeverageCategory,
    setFoodType,
    setMeatType,
    setIsHostAdditionalEdit,
    isHostAdditionalEdit,
  } = useHostEditStore();
  const [originalData, setOriginalData] = useState<any>(null);

  const [btnLoading, setBtnLoading] = useState(false);
  const { setToastData } = useGlobalStore();
  const beverageCategoryOptions = Object.values(BeverageCategory).map(
    (val) => ({
      value: val,
      label: formatBeverageCategory(val),
    })
  );

  const foodTypeOptions = Object.values(FoodType).map((val) => ({
    value: val,
    label: formatFoodType(val),
  }));

  const meatTypeOptions = Object.values(MeatType).map((val) => ({
    value: val,
    label: formatMeatType(val),
  }));

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    register,
    reset,
  } = useForm<IFormInput>({
    defaultValues: {
      instagramLink,
      facebookLink,
      googleMapsLink,
      beverageCategory: beverageCategory?.map((value) => ({
        value,
        label: formatBeverageCategory(value),
      })),
      foodType: foodType?.map((value) => ({
        value,
        label: formatFoodType(value),
      })),
      meatType: meatType
        ? { value: meatType, label: formatMeatType(meatType) }
        : undefined,
    },
  });

  useEffect(() => {
    setValue("instagramLink", instagramLink);
    setValue("facebookLink", facebookLink);
    setValue("googleMapsLink", googleMapsLink);
    setValue(
      "beverageCategory",
      beverageCategory?.map((value) => ({
        value,
        label: formatBeverageCategory(value),
      }))
    );
    setValue(
      "foodType",
      foodType?.map((value) => ({
        value,
        label: formatFoodType(value),
      }))
    );
    setValue(
      "meatType",
      meatType
        ? { value: meatType, label: formatMeatType(meatType) }
        : undefined
    );
  }, [
    instagramLink,
    facebookLink,
    googleMapsLink,
    beverageCategory,
    foodType,
    meatType,
    setValue,
  ]);

  const onSubmit = async (data: IFormInput) => {
    setBtnLoading(true);
    try {
      const updateInput: any = {};
      let HasChanges = false;

      if (facebookLink !== data.facebookLink) {
        updateInput.socialInfo = {
          ...updateInput.socialInfo,
          facebook: data.facebookLink || "",
        };
        HasChanges = true;
      }

      if (instagramLink !== data.instagramLink) {
        updateInput.socialInfo = {
          ...updateInput.socialInfo,
          instagram: data.instagramLink || "",
        };
        HasChanges = true;
      }

      if (googleMapsLink !== data.googleMapsLink) {
        updateInput.socialInfo = {
          ...updateInput.socialInfo,
          googleMapsLink: data.googleMapsLink || "",
        };
        HasChanges = true;
      }
      if (
        JSON.stringify(beverageCategory) !==
        JSON.stringify(data.beverageCategory?.map((option) => option.value))
      ) {
        updateInput.beverageCategory =
          data.beverageCategory?.map((option) => option.value) || [];
        HasChanges = true;
      }
      if (
        JSON.stringify(foodType) !==
        JSON.stringify(data.foodType?.map((option) => option.value))
      ) {
        updateInput.foodType =
          data.foodType?.map((option) => option.value) || [];
        HasChanges = true;
      }
      if (meatType !== data.meatType?.value) {
        updateInput.meatType = data.meatType?.value || MeatType.Halal;
        HasChanges = true;
      }

      if (HasChanges) {
        const res = await sdk.updateRestaurantDetails({ input: updateInput });

        if (res.updateRestaurantDetails) {
          setFacebookLink(data.facebookLink || "");
          setInstagramLink(data.instagramLink || "");
          setGoogleMapsLink(data.googleMapsLink || "");
          setBeverageCategory(
            data.beverageCategory?.map((option) => option.value) || []
          );
          setFoodType(data.foodType?.map((option) => option.value) || []);
          setMeatType(data.meatType?.value || MeatType.Halal);
          setInstagramLink(data.instagramLink || "");
          setToastData({
            message: "Venue Additional Information Updated Successfully",
            type: "success",
          });

          setIsHostAdditionalEdit(false);
        }
      } else {
        setIsHostAdditionalEdit(false);
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
      console.error("Error updating host details:", error);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 w-full ">
      <div className="flex justify-end">
        <CButton
          variant={ButtonType.Text}
          onClick={() => {
            setOriginalData({
              instagramLink,
              facebookLink,
              googleMapsLink,
              beverageCategory: beverageCategory?.map((value) => ({
                value,
                label: formatBeverageCategory(value),
              })),
              foodType: foodType?.map((value) => ({
                value,
                label: formatFoodType(value),
              })),
              meatType: meatType
                ? { value: meatType, label: formatMeatType(meatType) }
                : undefined,
            });
            setIsHostAdditionalEdit(true);
            reset();
          }}
        >
          Edit
        </CButton>
      </div>

      <div className="space-y-2">
        <div className="">
          <h3 className=" text-gray-900">Instagram Link</h3>
          <p className="text-sm text-gray-600">
            {instagramLink || "No Instagram link specified"}
          </p>
        </div>
        <hr />
        <div className="">
          <h3 className=" text-gray-900">Facebook Link</h3>
          <p className="text-sm text-gray-600">
            {facebookLink || "No Facebook link specified"}
          </p>
        </div>
        <hr />
        <div className="">
          <h3 className=" text-gray-900">Google Maps Link</h3>
          <p className="text-sm text-gray-600">
            {googleMapsLink || "No Google Maps link specified"}
          </p>
        </div>
        <hr />
        <div className="">
          <h3 className=" text-gray-900">Beverage Category</h3>
          <p className="text-sm text-gray-600">
            {beverageCategory && beverageCategory.length > 0
              ? beverageCategory.map(formatBeverageCategory).join(", ")
              : "No beverage category specified"}
          </p>
        </div>
        <hr />
        <div className="">
          <h3 className=" text-gray-900">Food Type</h3>
          <p className="text-sm text-gray-600">
            {foodType && foodType.length > 0
              ? foodType.map(formatFoodType).join(", ")
              : "No food type specified"}
          </p>
        </div>
        <hr />
        <div>
          <h3 className=" text-gray-900">Meat Type</h3>
          <p className="text-sm text-gray-600">{formatMeatType(meatType)}</p>
        </div>
      </div>

      <FullPageModal
        actionButtonLabel=""
        onActionButtonClick={() => {}}
        title="Edit Venue Details"
        isOpen={isHostAdditionalEdit}
        onClose={() => {
          if (originalData) {
            // Reset form to original values
            setValue("instagramLink", originalData.instagramLink);
            setValue("facebookLink", originalData.facebookLink);
            setValue("googleMapsLink", originalData.googleMapsLink);
            setValue("beverageCategory", originalData.beverageCategory);
            setValue("foodType", originalData.foodType);
            setValue("meatType", originalData.meatType);
            reset(originalData);
          }
          reset();
          setIsHostAdditionalEdit(false);
        }}
      >
        <form
          className="space-y-4 md:space-y-3 w-full max-w-2xl mx-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              htmlFor="instagramLink"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Instagram Link
            </label>
            <input
              type="text"
              {...register("instagramLink")}
              id="instagramLink"
              className="input input-primary"
              placeholder="Enter Instagram link"
            />
            <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
              For example: `instagram.com/username`.
            </p>
            {errors.instagramLink && (
              <p className="text-red-500 text-sm">
                {errors.instagramLink.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="facebookLink"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Facebook Link
            </label>
            <input
              type="text"
              {...register("facebookLink")}
              id="facebookLink"
              className="input input-primary"
              placeholder="Enter Facebook link"
            />
            <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
              For example: `facebook.com/username` or
              `facebook.com/pages/username`.
            </p>
            {errors.facebookLink && (
              <p className="text-red-500 text-sm">
                {errors.facebookLink.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="googleMapsLink"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Google Maps Link
            </label>
            <input
              type="text"
              {...register("googleMapsLink")}
              id="googleMapsLink"
              className="input input-primary"
              placeholder="Enter Google Maps link"
            />
            <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
              For example: `https://maps.google.com/?q=your-location`.
            </p>
            {errors.googleMapsLink && (
              <p className="text-red-500 text-sm">
                {errors.googleMapsLink.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="beverageCategory"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Beverage Category
            </label>
            <Controller
              name="beverageCategory"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  noOptionsMessage={() => null}
                  closeMenuOnSelect={false}
                  options={beverageCategoryOptions}
                  classNamePrefix="react-select"
                />
              )}
            />
            <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
              You can select multiple Beverage categories for your host
            </p>
            {errors.beverageCategory && (
              <p className="text-red-500 text-sm">
                {errors.beverageCategory.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="foodType"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Food Type
            </label>
            <Controller
              name="foodType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  noOptionsMessage={() => null}
                  closeMenuOnSelect={false}
                  options={foodTypeOptions}
                  classNamePrefix="react-select"
                />
              )}
            />
            <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
              You can select multiple food types for your host
            </p>
            {errors.foodType && (
              <p className="text-red-500 text-sm">{errors.foodType.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="meatType"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Meat Type
            </label>
            <Controller
              name="meatType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={meatTypeOptions}
                  classNamePrefix="react-select"
                />
              )}
            />
            {errors.meatType && (
              <p className="text-red-500 text-sm">{errors.meatType.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <CButton
              variant={ButtonType.Primary}
              loading={btnLoading}
              type="submit"
              className="w-full"
            >
              Update
            </CButton>
          </div>
        </form>
      </FullPageModal>
    </div>
  );
};

export default HostEditAdditionalDetails;
