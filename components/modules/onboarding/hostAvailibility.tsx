import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import { HoizrHostType } from "@/lib/hoizrConstants";
import useGlobalStore from "@/store/global";
import useMasterStore from "@/store/masters";
import HostOnboardingStore from "@/store/hostOnboarding";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

const Select = dynamic(() => import("react-select"), { ssr: false });
const AsyncSelect = dynamic(() => import("react-select/async"), { ssr: false });

interface HostLocationForm {
  addressLine1: string;
  addressLine2: string;
  city: string;
  location: PlacesType;
  state: { id: string; value: string } | null;
  pincode: string;
}

type PlacesType = {
  label: string;
  value: string;
};

const HostAddress = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const { statesOptions } = useMasterStore();
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlacesType | null>(null);
  const [coords, setCoords] = useState<number[]>([]);
  const [manualLocationOpen, setManualLocationOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<HostLocationForm>({ defaultValues: {} });

  const {
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    cords,
    place,
    hostType,
    setAddressLine1,
    setAddressLine2,
    setCity,
    setState,
    setPincode,
    setCords,
    setPlace,
  } = HostOnboardingStore();

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
    if (addressLine1 || city || place?.placeId) {
      setManualLocationOpen(true);
    }
  }, [addressLine1, addressLine2, city, cords, pincode, place, setValue, state]);

  const isEventOrganizer =
    hostType === HoizrHostType.EventOrg ||
    /event[_\s-]*org|event organizer|organizer/i.test(hostType ?? "");

  const loadOptions = (
    inputValue: string,
    callback: (options: PlacesType[]) => void
  ) => {
    sdk.AllPlaces({ input: inputValue }).then((response) => {
      callback(
        response.getPlacesList.map((item: { displayName: string; placeId: string }) => ({
          label: item.displayName,
          value: item.placeId,
        }))
      );
    });
  };

  const debouncedLoadOptions = debounce(loadOptions, 800);

  const resetLocation = () => {
    setSelectedPlace(null);
    setCoords([]);
    setValue("location", { label: "", value: "" });
    setValue("addressLine1", "");
    setValue("addressLine2", "");
    setValue("city", "");
    setValue("state", null);
    setValue("pincode", "");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState(null);
    setPincode("");
    setPlace({ displayName: "", placeId: "" });
    setCords([0, 0]);
    setManualLocationOpen(false);
  };

  const onSubmit = async (data: HostLocationForm) => {
    try {
      setBtnLoading(true);
      if (!data.state) {
        setToastData({
          type: "error",
          message: "Please select a state before continuing.",
        });
        return;
      }

      const input = {
        address: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          state: data.state.value,
          pincode: data.pincode,
          place: selectedPlace
            ? {
                displayName: selectedPlace.label,
                placeId: selectedPlace.value,
              }
            : undefined,
          coordinate:
            coords.length === 2
              ? {
                  type: "Point",
                  coordinates: coords,
                }
              : undefined,
        },
      };

      const saveResponse = await sdk.hostOnboarding({ input });
      if (!saveResponse.hostOnboarding) {
        throw new Error("Unable to save host location.");
      }

      setToastData({
        type: "success",
        message: "Location saved.",
      });
      router.push("/onboarding-host/host-additional-info");
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
      className="z-10 flex h-full min-h-0 w-full max-w-[820px] flex-col items-center bg-transparent text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg)]/96 shadow-[0_12px_32px_rgba(56,45,34,0.08)]">
        <div className="shrink-0 border-b border-[var(--owner-border)] px-4 py-4 text-left md:px-5">
          <p className="text-xs font-semibold uppercase text-[var(--owner-blue-500)]">
            Step 2/3
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Pin the operating location.
          </h2>
          <p className="mt-1 text-sm leading-5 text-gray-600">
            Search a place once and Hoizr will prefill address details where
            possible.
          </p>
        </div>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4 md:px-5">
          <div>
            <div className="flex justify-between items-center gap-2">
              <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                {isEventOrganizer ? "Business Address" : "Venue Location"}
              </label>
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
                onChange={async (option: any) => {
                  setSearchLoading(true);
                  setSelectedPlace({
                    label: option?.label ?? "",
                    value: option?.value ?? "",
                  });
                  setManualLocationOpen(true);
                  setPlace({
                    displayName: option?.label ?? "",
                    placeId: option?.value ?? "",
                  });

                  try {
                    const details = await sdk.PlaceDetails({
                      placeId: option?.value ?? "",
                    });

                    if (details.getPlaceDetails) {
                      const data = details.getPlaceDetails;
                      setCoords([data.latitude, data.longitude]);
                      setCords([data.latitude, data.longitude]);
                      setValue("addressLine1", data.address ?? "");
                      setAddressLine1(data.address ?? "");
                      setValue("addressLine2", "");
                      setAddressLine2("");
                      setValue("city", data.city ?? "");
                      setCity(data.city ?? "");
                      setValue("pincode", data.zipcode ?? "");
                      setPincode(data.zipcode ?? "");

                      const foundState = statesOptions.find(
                        (stateOption) =>
                          data.state &&
                          stateOption.label.trim().toLowerCase() ===
                            data.state.trim().toLowerCase()
                      );

                      if (foundState) {
                        const normalizedState = {
                          id: foundState.value,
                          value: foundState.label,
                        };
                        setValue("state", normalizedState);
                        setState(normalizedState);
                      } else {
                        setValue("state", null);
                        setState(null);
                      }
                    }
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

            <div className="flex justify-between items-center mt-1">
              <p className="text-gray-500 text-xs text-start">
                Search first. If the business is not listed, use manual entry below.
              </p>
              <button
                type="button"
                onClick={() => setManualLocationOpen(true)}
                className="text-primary hover:underline cursor-pointer text-xs"
              >
                Enter manually
              </button>
              {selectedPlace && (
                <button
                  type="button"
                  onClick={resetLocation}
                  className="text-primary hover:underline cursor-pointer text-xs"
                >
                  Reset location
                </button>
              )}
            </div>

            {errors.location && (
              <p className="text-red-500 text-sm text-start">
                {errors.location.message}
              </p>
            )}
          </div>

          {manualLocationOpen ? (
          <div className={`grid ${coords.length === 2 ? "grid-cols-10" : "grid-cols-7"} gap-4`}>
            {coords.length === 2 && (
              <div className="col-span-10 h-[13rem] overflow-hidden rounded-xl border border-[var(--owner-border)] bg-white/60 md:col-span-3 md:h-auto">
                <iframe
                  src={`https://maps.google.com/maps?q=${coords[0]}, ${coords[1]}&z=10&output=embed`}
                  className="h-full w-full"
                />
              </div>
            )}

            <div className="col-span-10 flex flex-col space-y-3.5 md:col-span-7">
              <div>
                <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                  Address Line 1
                </label>
                <input
                  type="text"
                  {...register("addressLine1", { required: "Address Line 1 is required" })}
                  className="input input-primary"
                  placeholder="Address Line 1"
                  onChange={(event) => setAddressLine1(event.target.value)}
                />
                {errors.addressLine1 && (
                  <p className="text-red-500 text-sm text-start">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                  Address Line 2
                </label>
                <input
                  type="text"
                  {...register("addressLine2")}
                  className="input input-primary"
                  placeholder="Address Line 2 (optional)"
                  onChange={(event) => setAddressLine2(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    {...register("city", { required: "City is required" })}
                    className="input input-primary"
                    placeholder="City"
                    onChange={(event) => setCity(event.target.value)}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm text-start">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                    State
                  </label>
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: "State is required" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={statesOptions}
                        value={state ? { label: state.value, value: state.id } : null}
                        onChange={(option: any) => {
                          const nextState = option
                            ? { id: option.value, value: option.label }
                            : null;
                          setValue("state", nextState);
                          setState(nextState);
                        }}
                        classNamePrefix="react-select"
                        className="text-left text-sm"
                        placeholder="Select state"
                      />
                    )}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm text-start">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    {...register("pincode", {
                      required: "Pincode is required",
                    })}
                    className="input input-primary"
                    placeholder="Pincode"
                    onChange={(event) => setPincode(event.target.value)}
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-sm text-start">
                      {errors.pincode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] px-4 py-5 text-left text-sm text-gray-600">
              Pick a search result to prefill the address. If it is not found,
              choose <strong>Enter manually</strong> and fill the business address.
            </div>
          )}

          </div>

          <div className="grid shrink-0 gap-3 border-t border-[var(--owner-border)] bg-[var(--owner-bg)]/96 px-4 py-3 sm:grid-cols-2 md:px-5">
            <CButton
              loading={btnLoading}
              variant={ButtonType.Secondary}
              type="button"
              onClick={() => router.push("/onboarding-host/host-type")}
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
              Continue
            </CButton>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default HostAddress;
