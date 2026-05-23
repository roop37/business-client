import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import useAuthStore from "@/store/auth";
import useGlobalStore from "@/store/global";
import useMasterStore from "@/store/masters";
import useOnboardingStore from "@/store/onboarding";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import Select from "react-select";
import AsyncSelect from "react-select/async";

interface IFormInput {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: { id: string; value: string } | null;
  pincode: string;
  location: PlacesType;
}

type PlacesType = {
  label: string;
  value: string;
};

const loadOptions = (
  inputValue: string,
  callback: (options: PlacesType[]) => void
) => {
  sdk.AllPlaces({ input: inputValue }).then((d) => {
    callback(
      d.getPlacesList.map((el: { displayName: string; placeId: string }) => ({
        label: el.displayName,
        value: el.placeId,
      }))
    );
  });
};

const UserLocation = () => {
  const [searchLoading, setSearchLoading] = useState(false);

  const { setToastData } = useGlobalStore();
  const router = useRouter();
  const { statesOptions } = useMasterStore();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<IFormInput>();

  const {
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    cords,
    place,
    businessType,
    businessName,

    setAddressLine1,
    setAddressLine2,
    setCity,
    setState,
    setPincode,
    setCords,
    setPlace,
  } = useOnboardingStore();

  const { userId } = useAuthStore();

  useEffect(() => {
    setValue("addressLine1", addressLine1);
    setValue("addressLine2", addressLine2);
    setValue("city", city);
    setValue("state", state);
    setValue("pincode", pincode);
    if (place?.displayName && place?.placeId) {
      setSelectedPlace({ label: place.displayName, value: place.placeId });
      setValue("location", { label: place.displayName, value: place.placeId });
    }
    if (cords[0] !== 0 && cords[1] !== 0) {
      setCoords(cords);
    }
  }, [
    setValue,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    place,
    cords,
  ]);

  const [selectedPlace, setSelectedPlace] = useState<PlacesType | null>(null);
  const [coords, setCoords] = useState<number[]>([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const onSubmit = async (data: IFormInput) => {
    try {
      setBtnLoading(true);
      if (!data.state) {
        return;
      }

      // Check if business details are filled
      if (!businessType || !businessName) {
        setToastData({
          message: "Please fill business details first.",
          type: "error",
        });
        router.push("/onboarding/user/business-details");
        return;
      }

      // Submit location details
      const input: any = {
        address: {
          addressLine1: data.addressLine1,
          addressLine2: data?.addressLine2 ? data?.addressLine2 : null,
          city: data.city,
          state: data.state.value,
          pincode: data.pincode,
          place: {
            displayName: selectedPlace?.label ?? "",
            placeId: selectedPlace?.value ?? "",
          },
          coordinate: {
            type: "Point",
            coordinates: coords,
          },
        },
      };

      const locationResponse = await sdk.businessOnboarding({ input });

      if (locationResponse.businessOnboarding) {
        setToastData({
          message: "Business location saved.",
          type: "success",
        });
        router.replace("/onboarding/user/business-additional-details");
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

  const debouncedLoadOptions = debounce(loadOptions, 800);
  const resetLocation = () => {
    // Reset place-related states
    setSelectedPlace(null);
    setCoords([]);

    // Reset form values
    setValue("location", { label: "", value: "" });
    setValue("addressLine1", "");
    setValue("addressLine2", "");
    setValue("city", "");
    setValue("state", null);
    setValue("pincode", "");

    // Reset store values
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState(null);
    setPincode("");
    setPlace({ displayName: "", placeId: "" });
    setCords([0, 0]);
  };

  return (
    <motion.div
      className="z-10 w-full bg-transparent max-w-4xl flex flex-col items-center space-y-5 text-center relative"
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
      <div className="w-full max-w-4xl rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg)]/90 p-6 shadow-[0_24px_60px_rgba(56,45,34,0.08)]">
        <form
          className="space-y-6 w-full p-2 md:p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="col-span-2">
            <div className="flex justify-between">
              <label
                htmlFor="location"
                className="block mb-2 text-sm font-medium text-left text-gray-700"
              >
                Search Location
              </label>
              {selectedPlace && (
                <button
                  type="button"
                  onClick={resetLocation}
                  className="text-primary hover:underline cursor-pointer text-xs mt-1"
                >
                  Reset Location
                </button>
              )}
            </div>
            <div className="flex">
              <AsyncSelect
                id="location"
                {...register("location", { required: "Location is required" })}
                className="mt-1 text-sm rounded-xl w-full focus:outline-none text-left"
                classNamePrefix="react-select"
                placeholder="Search location"
                value={selectedPlace}
                menuPlacement="auto"
                maxMenuHeight={200}
                noOptionsMessage={() => "Search for your desired location"}
                onChange={async (option) => {
                  setSearchLoading(true);

                  setSelectedPlace({
                    label: option?.label ?? "",
                    value: option?.value ?? "",
                  });
                  setPlace({
                    displayName: option?.label ?? "",
                    placeId: option?.value ?? "",
                  });
                  try {
                    const d = await sdk.PlaceDetails({
                      placeId: option?.value ?? "",
                    });

                    if (d.getPlaceDetails) {
                      setCoords([
                        d.getPlaceDetails.latitude,
                        d.getPlaceDetails.longitude,
                      ]);
                      setCords([
                        d.getPlaceDetails.latitude,
                        d.getPlaceDetails.longitude,
                      ]);

                      // Set addressLine1
                      if (d.getPlaceDetails.address) {
                        setValue("addressLine1", d.getPlaceDetails.address);
                        setAddressLine1(d.getPlaceDetails.address);
                      } else {
                        setValue("addressLine1", "");
                        setAddressLine1("");
                      }

                      if (d.getPlaceDetails.address) {
                        setValue("addressLine2", "");
                        setAddressLine2("");
                      } else {
                        setValue("addressLine2", "");
                        setAddressLine2("");
                      }

                      // Set city
                      if (d.getPlaceDetails.city) {
                        setValue("city", d.getPlaceDetails.city);
                        setCity(d.getPlaceDetails.city);
                      } else {
                        setValue("city", "");
                        setCity("");
                      }

                      // Set pincode
                      if (d.getPlaceDetails.zipcode) {
                        setValue("pincode", d.getPlaceDetails.zipcode);
                        setPincode(d.getPlaceDetails.zipcode);
                      } else {
                        setValue("pincode", "");
                        setPincode("");
                      }

                      // Set state
                      const foundState = statesOptions.find((state) => {
                        return (
                          d?.getPlaceDetails?.state &&
                          state.label.trim().toLowerCase() ===
                            d.getPlaceDetails.state.trim().toLowerCase()
                        );
                      });

                      if (foundState) {
                        setValue("state", {
                          id: foundState.value,
                          value: foundState.label,
                        });
                        setState({
                          id: foundState.value,
                          value: foundState.label,
                        });
                      } else {
                        setValue("state", null);
                        setState(null);
                      }
                    }
                  } catch (error) {
                    console.error("Error fetching place details:", error);
                  } finally {
                    setSearchLoading(false);
                  }

                  setValue("location", {
                    value: option?.value ?? "",
                    label: option?.label ?? "",
                  });
                }}
                loadOptions={debouncedLoadOptions}
              />
              {searchLoading && (
                <div className="flex ml-2 items-center h-10">
                  <FaSpinner className="animate-spin text-primary" />
                </div>
              )}
            </div>

            <p className="text-gray-500 text-xs mt-1 mx-1 text-start">
              After selecting a location all other details will be auto filled.
            </p>

            {errors.location && (
              <p className="text-red-500 text-sm text-start">
                {errors.location.message}
              </p>
            )}
          </div>

          <div
            className={`grid ${
              coords.length === 2 ? "grid-cols-10" : "grid-cols-7"
            } gap-2 transition-all`}
          >
            {coords.length === 2 ? (
              <div className="col-span-10 md:col-span-3 px-2 py-2 rounded-2xl h-[15rem] md:h-auto">
                <iframe
                  src={`https://maps.google.com/maps?q=${coords[0]}, ${coords[1]}&z=10&output=embed`}
                  className="w-full h-full rounded-2xl"
                ></iframe>
              </div>
            ) : null}
            <div className="col-span-10 md:col-span-7 flex flex-col space-y-4">
              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                  Address Line 1
                </label>
                <input
                  type="text"
                  {...register("addressLine1", {
                    required: "Address Line 1 is required",
                  })}
                  className="input input-primary"
                  placeholder="Address Line 1"
                  onChange={(e) => setAddressLine1(e.target.value)}
                />
                {errors.addressLine1 && (
                  <p className="text-red-500 text-sm text-start">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                  Address Line 2
                </label>
                <input
                  type="text"
                  {...register("addressLine2", {})}
                  className="input input-primary"
                  placeholder="Address Line 2 (optional)"
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
                {errors.addressLine2 && (
                  <p className="text-red-500 text-sm text-start">
                    {errors.addressLine2.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="col-span-3 flex-1">
                  <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    {...register("city", { required: "City is required" })}
                    className="input input-primary"
                    placeholder="City"
                    onChange={(e) => setCity(e.target.value)}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm text-start">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="col-span-2 flex-1">
                  <label
                    htmlFor="state"
                    className="block mb-2 text-sm font-medium text-left text-gray-700"
                  >
                    State
                  </label>
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: "State is required" }}
                    render={({ field }) => (
                      <Select
                        classNames={{
                          control: (state) =>
                            `${
                              state.isDisabled
                                ? "!opacity-40 !cursor-not-allowed !bg-white !font-normal"
                                : ""
                            }`,
                          option: (state) =>
                            `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent text-left ${
                              state.isSelected ? "!bg-primary text-white" : ""
                            }  `,
                          placeholder: (state) =>
                            `text-sm text-left font-normal`,
                          singleValue: (state) =>
                            `text-sm text-left font-noraml`,
                        }}
                        {...field}
                        id="state"
                        options={statesOptions.map((el) => ({
                          id: el.value,
                          value: el.label,
                        }))}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        menuPortalTarget={
                          typeof window !== "undefined" &&
                          typeof document !== "undefined"
                            ? document.body
                            : null
                        }
                        menuShouldScrollIntoView={false}
                        getOptionLabel={(e) => e.value}
                        getOptionValue={(e) => e.id}
                        classNamePrefix="react-select"
                        placeholder="Select State"
                        value={state ?? undefined}
                        onChange={(option) => {
                          setValue("state", option);
                          setState({
                            id: option?.id ?? "",
                            value: option?.value ?? "",
                          });
                        }}
                      />
                    )}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm text-start">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                  Pincode
                </label>
                <input
                  type="text"
                  {...register("pincode", {
                    pattern: {
                      value: /^\d{6}$/,
                      message: "Pincode must be 6 digits",
                    },
                    required: "Pincode is required",
                  })}
                  className="input input-primary"
                  placeholder="Pincode"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    e.target.value = value;
                    setPincode(value);
                  }}
                />
                {errors.pincode && (
                  <p className="text-red-500 text-sm text-start">
                    {errors.pincode.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="w-full max-w-4xl  bg-transparent">
        <div className="flex space-x-2">
          <CButton
            loading={btnLoading}
            variant={ButtonType.Secondary}
            type="submit"
            onClick={() => router.push("/onboarding/user/business-details")}
            className="w-full"
          >
            Back
          </CButton>
          <CButton
            loading={btnLoading}
            variant={ButtonType.Primary}
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="w-full"
          >
            Continue
          </CButton>
        </div>
      </div>
    </motion.div>
  );
};

export default UserLocation;
