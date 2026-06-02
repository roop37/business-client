// @ts-nocheck
import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import FullPageModal from "@/components/common/modal/fullPageModal";
import {
  BeverageCategory,
  FoodType,
  MeatType,
  PermissionTypeEnum,
  RestaurantCategory,
  RestaurantDetailsInput,
  RestaurantType,
} from "@/generated/graphql";
import {
  formatBeverageCategory,
  formatFoodType,
  formatMeatType,
  formatRestaurantCategory,
  formatRestaurantType,
} from "@/lib/hostUtilConstants";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import useHostEditStore from "@/store/useHostEditStore";
import { uploadHostAsset } from "@/utils/cloudinaryUpload";
import { sdk } from "@/utils/graphqlClient";
import {
  extractErrorMessage,
  formatWebsiteUrlClickable,
  sanitizeText,
} from "@/utils/utilFUncs";
import { useDropzone } from "react-dropzone";

import useMasterStore from "@/store/masters";
import useUserStore from "@/store/user";
import { hasAccess } from "@/utils/hasAccess";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

const HostBasicInformationEditForm: React.FC = () => {
  const {
    hostName: restaurantName,
    brandingLogo,
    hostWebsite: hostWebsite,
    hostType: restaurantType,
    hostCategory: hostCategory,
    dineInCapacity,
    beverageCategory,
    foodType,
    meatType,
    setBeverageCategory,
    setFoodType,
    setMeatType,
    setHostName,
    setHostWebsite,
    setHostType,
    setHostCategory,
    setDineInCapacity,
    email,
    setEmail,
    phone,
    setPhone,
    setCuisine,
    cuisine,
    setBrandingLogo,
    isHostBasicEdit: editModalOpen,
    setIsHostBasicEdit: setEditModalOpen,
  } = useHostEditStore();

  const { setHostLogo, selectedHostId } = useHostsStore();

  const { meUser } = useUserStore();

  const { setToastData } = useGlobalStore();
  // const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showDineInCapacity, setShowDineInCapacity] = useState<boolean>(false);
  const [showEditButton, setShowEditButton] = useState(false);

  useEffect(() => {
    const canUpdateRestaurant = hasAccess(
      meUser?.permissions ?? [],
      PermissionTypeEnum.UpdateHost
    );

    setShowEditButton(canUpdateRestaurant);
  }, [meUser?.permissions]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      hostName: restaurantName || "",
      phone: phone || "",
      email: email || "",
      hostWebsite: hostWebsite || "",
      restaurantType: restaurantType || "",
      hostCategory: hostCategory || [],
      dineInCapacity: dineInCapacity || 0,
      cuisine: cuisine || [],
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

  const { cuisinesOptions } = useMasterStore();
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

  useEffect(() => {
    setPreviewUrl(brandingLogo);
    if (
      hostCategory.includes(RestaurantCategory.DineIn) ||
      hostCategory.includes(RestaurantCategory.PremiumDineIn)
    ) {
      setShowDineInCapacity(true);
    }
  }, [brandingLogo, hostCategory]);

  const { setSelectedHost } = useHostsStore();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const image = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        if (image.width > 1200 || image.height > 1200) {
          setToastData({
            message: "Logo size should be under 1200 x 1200 pixels",
            type: "error",
          });
          URL.revokeObjectURL(objectUrl); // clean up
          return; // stop further processing
        }

        // dimensions are ok
        setLogoFile(file);
        setPreviewUrl(objectUrl);
      };

      image.src = objectUrl;
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    //   validator(file) {
    //     const image = new window.Image();
    //     const objectUrl = URL.createObjectURL(file);
    //     image.src = objectUrl;
    //     console.log("objectURL",objectUrl)
    //     console.log(image.width)
    //      if (image.width > 200 || image.height > 200) {
    //       setToastData({
    //         message: "Image dimensions should be at most 200x200 pixels.",
    //         type: "error",
    //       });
    //   }
    //   return null;
    // },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 2,
  });

  const [originalData, setOriginalData] = useState({
    hostName: restaurantName || "",
    email: email || "",
    phone: phone || "",
    hostWebsite: hostWebsite || "",
    restaurantType: restaurantType || "",
    hostCategory: hostCategory || [],
    dineInCapacity: dineInCapacity || "",
    cuisine: cuisine || [],
    beverageCategory: beverageCategory || [],
    foodType: foodType || [],
    meatType: meatType || "",
  });

  useEffect(() => {
    setOriginalData({
      hostName: restaurantName || "",
      email: email || "",
      phone: phone || "",
      hostWebsite: hostWebsite || "",
      restaurantType: restaurantType || "",
      hostCategory: hostCategory || [],
      dineInCapacity: dineInCapacity || "",
      cuisine: cuisine || [],
      beverageCategory: beverageCategory || [],
      foodType: foodType || [],
      meatType: meatType || "",
    });

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
    restaurantName,
    email,
    phone,
    hostWebsite,
    restaurantType,
    hostCategory,
    dineInCapacity,
    cuisine,
    beverageCategory,
    foodType,
    meatType,
  ]);

  const onSubmit = async (data: any) => {
    try {
      setBtnLoading(true);
      const formattedWebsite = formatWebsiteUrlClickable(
        data.hostWebsite
      );

      if (sanitizeText(data.hostName).length > 150) {
        setToastData({
          message: "Venue name should be of maximum 150 characters",
          type: "error",
        });
        return;
      }

      const imgUrl = logoFile || previewUrl ? await handleLogoUpload() : null;
      const updateInput: RestaurantDetailsInput = {
        dineInCapacity: showDineInCapacity
          ? parseInt(data.dineInCapacity.toString())
          : null,
      };
      let HasChanges = false;

      if (restaurantName !== data.hostName) {
        updateInput.name = data.hostName;
        HasChanges = true;
      }

      if (phone !== data.phone) {
        updateInput.phone = data.phone;
        HasChanges = true;
      }
      if (email !== data.email) {
        updateInput.email = data.email;
        HasChanges = true;
      }
      if (hostWebsite !== formattedWebsite) {
        updateInput.website = formattedWebsite;
        HasChanges = true;
      }
      if (restaurantType !== data.restaurantType) {
        updateInput.type = data.restaurantType as RestaurantType;
        HasChanges = true;
      }

      if (
        cuisine !==
        data.cuisine.map((cuisine: any) => ({
          cuisineId: cuisine.id,
          cuisineName: cuisine.value,
        }))
      ) {
        updateInput.cuisine = data.cuisine.map((cuisine: any) => ({
          cuisineId: cuisine.id,
          cuisineName: cuisine.value,
        }));
        HasChanges = true;
      }

      if (
        JSON.stringify(hostCategory) !==
        JSON.stringify(data.hostCategory)
      ) {
        (updateInput.category = data.hostCategory.map(
          (cat: any) => cat.value as RestaurantCategory
        )),
          (HasChanges = true);
      }
      if (brandingLogo !== imgUrl) {
        updateInput.brandingLogo = imgUrl;
        HasChanges = true;
      }

      if (
        JSON.stringify(beverageCategory) !==
        JSON.stringify(
          data.beverageCategory?.map((option: any) => option.value)
        )
      ) {
        updateInput.beverageCategory =
          data.beverageCategory?.map((option: any) => option.value) || [];
        HasChanges = true;
      }
      if (
        JSON.stringify(foodType) !==
        JSON.stringify(data.foodType?.map((option: any) => option.value))
      ) {
        updateInput.foodType =
          data.foodType?.map((option: any) => option.value) || [];
        HasChanges = true;
      }
      if (meatType !== data.meatType?.value) {
        updateInput.meatType = data.meatType?.value || MeatType.Halal;
        HasChanges = true;
      }

      if (HasChanges) {
        const response = await sdk.updateRestaurantDetails({
          input: updateInput,
        });
        if (response && response.updateRestaurantDetails) {
          setHostName(data.hostName);
          setHostWebsite(formattedWebsite);
          setHostType(data.restaurantType);
          const normalizedCategory = Array.isArray(data.hostCategory)
            ? data.hostCategory.map((category: any) =>
                typeof category === "object" && category.value
                  ? category.value
                  : category
              )
            : [];
          setHostCategory(normalizedCategory);
          setDineInCapacity(
            showDineInCapacity ? data.dineInCapacity || 0 : undefined
          );
          setPreviewUrl(previewUrl);

          setSelectedHost(data.hostName);
          setPhone(data.phone);
          setEmail(data.email);

          setCuisine(data.cuisine);
          setBeverageCategory(
            data.beverageCategory?.map((option: any) => option.value) || []
          );
          setFoodType(data.foodType?.map((option: any) => option.value) || []);
          setMeatType(data.meatType?.value || MeatType.Halal);
          setToastData({
            message: "Basic Venue Details Updated successfully",
            type: "success",
          });
          setEditModalOpen(false);
        }
      } else {
        setEditModalOpen(false);
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

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    if (!selectedHostId) {
      setToastData({
        type: "error",
        message: "Venue context is still loading, retry in a moment.",
      });
      return;
    }
    const result = await uploadHostAsset({
      kind: "host-logo",
      hostId: selectedHostId,
      file: logoFile,
      previousUrl: previewUrl,
    });
    setPreviewUrl(result.secureUrl);
    setBrandingLogo(result.secureUrl);
    setHostLogo(result.secureUrl);
    return result.secureUrl;
  };

  const restaurantTypeOptions = Object.values(RestaurantType).map((val) => ({
    value: val.toString(),
    label: formatRestaurantType(val),
  }));

  const hostCategoryOptions = Object.values(RestaurantCategory).map(
    (val) => ({
      value: val.toString(),
      label: formatRestaurantCategory(val),
    })
  ) as { value: string; label: string }[];

  return (
    <div className="bg-white  rounded-xl shadow-sm border border-gray-300 w-full  relative">
      {showEditButton ? (
        <div className="absolute p-4 top-0 right-2 z-10">
          <div className="flex justify-end">
            <CButton
              variant={ButtonType.Text}
              onClick={() => {
                reset();
                setPreviewUrl(brandingLogo);
                setLogoFile(null);
                setEditModalOpen(true);
              }}
            >
              Update Details
            </CButton>
          </div>
        </div>
      ) : null}

      <div className="space-y-2 p-6 overflow-y-scroll max-h-[calc(100vh-10rem)]">
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Host Name</h3>
            <p className="text-sm text-gray-600">
              {restaurantName ? restaurantName : "No host name"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Host Email</h3>
            <p className="text-sm text-gray-600">
              {email ? email : "No host email"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between  items-center ">
          <div>
            <h3 className="text-gray-900">Host Phone</h3>
            <p className="text-sm text-gray-600">
              {phone ? `+1 ${phone}` : "No host phone"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Host Logo</h3>
            <p className="text-sm text-gray-600">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Host Logo"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain"
                />
              ) : brandingLogo ? (
                <Image
                  src={brandingLogo}
                  width={80}
                  height={80}
                  alt="Host Logo"
                  className="w-20 h-20 object-contain"
                />
              ) : (
                "No logo"
              )}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Website</h3>
            <p className="text-sm text-gray-600">
              {hostWebsite ? hostWebsite : "No website"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Type</h3>
            <p className="text-sm text-gray-600">
              {restaurantType
                ? formatRestaurantType(restaurantType as RestaurantType)
                : "No type specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Speciality</h3>
            <p className="text-sm text-gray-600">
              {cuisine && cuisine.length > 0
                ? cuisine.map((cui) => cui.value).join(", ")
                : "No speciality specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Category</h3>
            <p className="text-sm text-gray-600">
              {hostCategory && hostCategory.length > 0
                ? restaurantCategory
                    .map((category) => formatRestaurantCategory(category))
                    .join(", ")
                : "No category specified"}
            </p>
          </div>
        </div>

        <hr />
        {hostCategory.includes(RestaurantCategory.DineIn) ||
        hostCategory.includes(RestaurantCategory.PremiumDineIn) ? (
          <div className="flex justify-between items-center ">
            <div>
              <h3 className="text-gray-900">Dine-in Capacity</h3>
              <p className="text-sm text-gray-600">
                {dineInCapacity ? dineInCapacity : "No capacity specified"}
              </p>
            </div>
          </div>
        ) : null}
        <hr />
        <div className="flex justify-between items-center ">
          <div className="">
            <h3 className=" text-gray-900">Beverage Category</h3>
            <p className="text-sm text-gray-600">
              {beverageCategory && beverageCategory.length > 0
                ? beverageCategory.map(formatBeverageCategory).join(", ")
                : "No beverage category specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h3 className=" text-gray-900">Meat Type</h3>
            <p className="text-sm text-gray-600">{formatMeatType(meatType)}</p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div className="">
            <h3 className=" text-gray-900">Food Type</h3>
            <p className="text-sm text-gray-600">
              {foodType && foodType.length > 0
                ? foodType.map(formatFoodType).join(", ")
                : "No food type specified"}
            </p>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <FullPageModal
          actionButtonLabel=""
          onActionButtonClick={() => {}}
          title="Edit Venue"
          isOpen={editModalOpen}
          onClose={() => {
            reset();
            setPreviewUrl(brandingLogo);
            setLogoFile(null);
            setEditModalOpen(false);
          }}
        >
          <form
            className="space-y-4 md:space-y-3 mx-auto w-full max-w-4xl"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label
                htmlFor="restaurantName"
                className="block text-sm font-medium text-gray-700"
              >
                Host Name
              </label>
              <input
                type="text"
                id="restaurantName"
                {...register("hostName", {
                  required: "Host name is required",
                })}
                className="input"
                placeholder="Venue Name"
                defaultValue={restaurantName}
              />
              {errors.hostName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.hostName.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-left text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                id="email"
                className="input input-primary"
                placeholder="Enter your Email Address"
                defaultValue={email}
              />
              {errors.email && (
                <p className="text-red-500 text-sm text-start">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* <div className="col-span-2">
              <label
                htmlFor="phone"
                className="block mb-2 text-sm font-medium text-left text-gray-700"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-700 font-bold sm:text-sm">+1</span>
                </div>
                <input
                  type="number"
                  style={{
                    appearance: "textfield",
                  }}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Invalid phone number",
                    },
                  })}
                  id="phone"
                  maxLength={10}
                  className="input input-primary pl-10"
                  placeholder="Enter your Phone Number"
                  defaultValue={phone}
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
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm text-start">
                  {errors.phone.message}
                </p>
              )}
            </div> */}
            <div className="col-span-2">
              <label
                htmlFor="phone"
                className="block mb-2 text-sm font-medium text-left text-gray-700"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-700 font-bold sm:text-sm">+1</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  style={{
                    appearance: "textfield",
                  }}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Invalid phone number",
                    },
                    onChange: (e) => {
                      e.target.value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                    },
                  })}
                  id="phone"
                  className="input input-primary pl-10"
                  placeholder="Enter your Phone Number"
                  defaultValue={phone}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm text-start">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block mb-2 text-lg font-medium text-left text-gray-700">
                Logo (optional)
              </label>
              <div className="mb-4">
                {previewUrl ? (
                  <div className="flex items-center justify-between hover:bg-primary hover:bg-opacity-5 px-4 rounded-xl">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-gray-500 hover:text-red-500 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    {...getRootProps({
                      className:
                        "border-2 border-dashed border-gray-300 p-6 text-center rounded-xl cursor-pointer hover:bg-gray-100 relative",
                    })}
                  >
                    <input {...getInputProps()} className="hidden" />
                    <div className="text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-6 h-6 mx-auto"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7l3-3m0 0l3 3M6 4v12M21 11v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7M16 8l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">
                        Drag and drop a logo or{" "}
                        <span className="text-primary">browse file</span>
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
                  The logo should be in PNG, JPG, or JPEG format with a
                  recommended size of 200x200 pixels for best quality. The
                  maximum file size is 2MB.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="hostWebsite"
                className="block text-sm font-medium text-gray-700"
              >
                Host Website
              </label>
              <input
                type="text"
                id="hostWebsite"
                {...register("hostWebsite", {
                  pattern: {
                    value:
                      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w.-]*)*\/?$/,
                    message: "Invalid website URL",
                  },
                })}
                className="input"
                placeholder="Venue Website"
                defaultValue={hostWebsite}
              />
              <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
                {`If you don't have one, please add your desired domain`}
              </p>
              {errors.hostWebsite && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.hostWebsite.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="restaurantType"
                className="block text-sm font-medium text-gray-700"
              >
                Host Type
              </label>
              <Controller
                control={control}
                name="restaurantType"
                rules={{
                  required: "Host type is required",
                }}
                render={({ field }) => (
                  <Select
                    id="restaurantType"
                    options={restaurantTypeOptions}
                    classNames={{
                      option: (state) =>
                        `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent  ${
                          state.isSelected ? "!bg-primary text-white" : ""
                        }`,
                    }}
                    defaultValue={restaurantTypeOptions.find(
                      (option) => option.value === restaurantType
                    )}
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                  />
                )}
              />
              {errors.restaurantType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.restaurantType.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label
                htmlFor="hostCategory"
                className="block mb-2 text-sm font-medium text-left text-gray-700"
              >
                Host Speciality
              </label>
              <Controller
                name="cuisine"
                control={control}
                rules={{ required: "Speciality is required" }}
                render={({ field }) => (
                  <Select
                    classNames={{
                      option: (state) =>
                        `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent ${
                          state.isSelected ? "!bg-primary text-white" : ""
                        }`,
                      placeholder: (state) => `text-sm text-left font-normal`,
                      singleValue: (state) => `text-sm text-left font-normal`,
                    }}
                    {...field}
                    id="cuisine"
                    options={cuisinesOptions}
                    isMulti
                    noOptionsMessage={() => null}
                    closeMenuOnSelect={false}
                    getOptionLabel={(e) => e.value}
                    getOptionValue={(e) => e.id}
                    className="mt-1 text-sm rounded-xl w-full focus:outline-none text-left"
                    classNamePrefix="react-select"
                    placeholder="Select Speciality"
                    value={field.value}
                    onChange={(options) => {
                      const selectedOptions = options
                        ? options.map((option) => ({
                            id: option.id,
                            value: option.value,
                          }))
                        : [];
                      setValue("cuisine", selectedOptions);
                    }}
                  />
                )}
              />

              <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
                You can select multiple specialities for your host
              </p>
              {errors.hostCategory && (
                <p className="text-red-500 text-sm text-start">
                  {errors.hostCategory.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="hostCategory"
                className="block text-sm font-medium text-gray-700"
              >
                Host Category
              </label>
              <Controller
                control={control}
                name="hostCategory"
                rules={{
                  required: "Host category is required",
                }}
                render={({ field }) => (
                  <Select
                    id="hostCategory"
                    isMulti
                    noOptionsMessage={() => null}
                    closeMenuOnSelect={false}
                    classNames={{
                      option: (state) =>
                        `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent  ${
                          state.isSelected ? "!bg-primary text-white" : ""
                        }`,
                    }}
                    options={hostCategoryOptions}
                    defaultValue={hostCategoryOptions.filter((option) =>
                      hostCategory.includes(
                        option.value as RestaurantCategory
                      )
                    )}
                    onChange={(selected) => {
                      field.onChange(selected);
                      const selectedCategories = selected.map(
                        (option) => option.value
                      );
                      setShowDineInCapacity(
                        selectedCategories.includes(
                          RestaurantCategory.DineIn
                        ) ||
                          selectedCategories.includes(
                            RestaurantCategory.PremiumDineIn
                          )
                      );
                    }}
                  />
                )}
              />
              {errors.hostCategory && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.hostCategory.message}
                </p>
              )}
            </div>

            {showDineInCapacity ? (
              <div className="col-span-2">
                <label
                  htmlFor="dineInCapacity"
                  className="block mb-2 text-sm font-medium text-left text-gray-700"
                >
                  Dine-In Capacity
                </label>
                <input
                  type="number"
                  {...register("dineInCapacity")}
                  id="dineInCapacity"
                  className="input input-primary"
                  placeholder="Enter dine-in capacity"
                  defaultValue={dineInCapacity}
                  style={{
                    appearance: "textfield",
                  }}
                  inputMode="decimal"
                  step="0.01"
                  onChange={(e) => setValue("dineInCapacity", e.target.value)}
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
            ) : null}

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
                <p className="text-red-500 text-sm">
                  {errors.foodType.message}
                </p>
              )}
            </div>

            <div className="pb-8 ">
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
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    menuPlacement="top"
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    classNames={{
                      option: (state) =>
                        `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent ${
                          state.isSelected ? "!bg-primary text-white" : ""
                        }`,
                    }}
                  />
                )}
              />
              {errors.meatType && (
                <p className="text-red-500 text-sm">
                  {errors.meatType.message}
                </p>
              )}
            </div>

            <div className="flex justify-end ">
              <CButton
                type="submit"
                variant={ButtonType.Primary}
                className="w-full"
                disabled={btnLoading}
              >
                {btnLoading ? "Updating..." : "Update"}
              </CButton>
            </div>
          </form>
        </FullPageModal>
      )}
    </div>
  );
};

export default HostBasicInformationEditForm;
