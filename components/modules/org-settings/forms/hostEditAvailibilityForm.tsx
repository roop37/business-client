import Select from "react-select";
import AsyncSelect from "react-select/async";

import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import FullPageModal from "@/components/common/modal/fullPageModal";
import {
  Availability,
  formatAvailability,
} from "@/components/common/timingAvailibility/interface";
import AvailabilityComponent from "@/components/common/timingAvailibility/timingAvailibility";
import { PermissionTypeEnum } from "@/generated/graphql";
import { initAvailability } from "@/lib/commonConstants";
import useGlobalStore from "@/store/global";
import useMasterStore from "@/store/masters";
import useUserStore from "@/store/user";
import useHostEditStore from "@/store/useHostEditStore";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage } from "@/utils/utilFUncs";
import debounce from "lodash.debounce";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaClock, FaSpinner } from "react-icons/fa";
import ReusableModal from "@/components/common/modal/modal";
import Link from "next/link";

interface IFormInput {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: { id: string; value: string } | null;
  zipcode: number;
  location: PlacesType;
  timeZone: timeZoneType;
}
type PlacesType = {
  label: string;
  value: string;
};
type timeZoneType = {
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

const HostEditAvailabilityForm: React.FC = () => {
  const [coords, setCoords] = useState<number[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  const [availability, setAvailability] =
    useState<Availability[]>(initAvailability);

  const [selectedPlace, setSelectedPlace] = useState<PlacesType | null>(null);
  const debouncedLoadOptions = debounce(loadOptions, 800);

  const {
    addressLine1,
    addressLine2,
    city,
    state,
    zipcode,
    cords,
    place,
    timeZone,
    availabilityHours,
    setAddressLine1,
    setAddressLine2,
    setCity,
    setState,
    setCords,
    setPlace,
    setTimeZone,
    setAvailabilityHours,
    setZipcode,
    isHostAvaibiltyEdit,
    setIsHostAvaibiltyEdit,
  } = useHostEditStore();

  const { meUser } = useUserStore();

  const { timezonesOptions, statesOptions } = useMasterStore();

  useEffect(() => {
    // Deep clone availabilityHours when setting local state
    const clonedAvailability = availabilityHours.map((day) => ({
      ...day,
      hours: day.hours.map((hour) => ({
        start: { ...hour.start },
        end: { ...hour.end },
      })),
    }));
    setAvailability(clonedAvailability);
    setCoords([...cords]);
  }, [availabilityHours, cords]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      addressLine1: addressLine1 || "",
      addressLine2: addressLine2 || "",
      city: city || "",
      state: state || "",
      zipcode: zipcode || "",
      cords: cords || "",
      place: place || "",
      timeZone: timeZone || "",
      availabilityHours: availabilityHours,
    },
  });

  const handleInputChange = (field: keyof IFormInput, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };
  const { setToastData } = useGlobalStore();

  const [formState, setFormState] = useState<IFormInput>({
    addressLine1,
    addressLine2,
    city,
    state,
    zipcode,
    location: { label: place?.displayName ?? "", value: place?.placeId ?? "" },
    timeZone: { label: timeZone?.value ?? "", value: timeZone?.id ?? "" },
  });

  const [showEditButton, setShowEditButton] = useState(false);

  useEffect(() => {
    const canUpdateRestaurant = hasAccess(
      meUser?.permissions ?? [],
      PermissionTypeEnum.UpdateHost
    );

    setShowEditButton(canUpdateRestaurant);
  }, [meUser?.permissions]);

  useEffect(() => {
    setSelectedPlace({
      label: place?.displayName,
      value: place?.placeId,
    });
  }, [place]);

  useEffect(() => {}, []);
  const onPlaceChange = async (option: PlacesType | null) => {
    setSelectedPlace(option);
    setSearchLoading(true);

    setFormState((prev) => ({
      ...prev,
      location: option ?? { label: "", value: "" },
    }));
    try {
      const d = await sdk.PlaceDetails({
        placeId: option?.value ?? "",
      });

      if (d && d.getPlaceDetails) {
        // Set coordinates
        setCoords([d.getPlaceDetails.latitude, d.getPlaceDetails.longitude]);

        // Set addressLine1
        if (d.getPlaceDetails.address) {
          setValue("addressLine1", d.getPlaceDetails.address);
        }

        // Set addressLine1
        if (d.getPlaceDetails.address) {
          setValue("addressLine2", "");
        }

        // Set city
        if (d.getPlaceDetails.city) {
          setValue("city", d.getPlaceDetails.city);
        }

        // Set zipcode
        if (d.getPlaceDetails.zipcode) {
          const zipcodeValue = parseFloat(d.getPlaceDetails.zipcode);
          setValue("zipcode", zipcodeValue);
        }

        // Set state
        const foundState = statesOptions.find((state) => {
          return (
            d.getPlaceDetails &&
            d.getPlaceDetails.state &&
            state.label.trim().toLowerCase() ===
              d.getPlaceDetails.state.trim().toLowerCase()
          );
        });

        if (foundState) {
          setFormState((prev) => ({
            ...prev,
            state: {
              id: foundState.value,
              value: foundState.label,
            },
          }));
          setValue("state", {
            id: foundState.value,
            value: foundState.label,
          });
          // setState({
          //   id: foundState.value,
          //   value: foundState.label,
          // });
        }
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formattedAvailability = formatAvailability(availability);
      const parseIntZip = parseInt(formState.zipcode.toString());

      const hasAvailabilityChanged =
        JSON.stringify(formatAvailability(availabilityHours)) !==
        JSON.stringify(formattedAvailability);

      const response = await sdk.updateRestaurantDetails({
        input: {
          address: {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 ? data.addressLine2 : null,
            city: data.city,
            state: {
              stateId: data.state?.id || "",
              stateName: data.state?.value || "",
            },
            zipcode: parseIntZip,
            place: {
              displayName: selectedPlace?.label ?? "",
              placeId: selectedPlace?.value ?? "",
            },

            coordinate: {
              coordinates: coords,
            },
          },
          availability: formattedAvailability,
          timezone: {
            timezoneId: formState.timeZone?.value,
            timezoneName: formState.timeZone?.label,
          },
        },
      });

      if (response && response.updateRestaurantDetails) {
        setAddressLine1(data.addressLine1);
        setAddressLine2(data.addressLine2);
        setState({
          id: formState.state?.id || "",
          value: formState.state?.value || "",
        });
        setCity(data.city);
        setZipcode(data.zipcode);
        setTimeZone({
          id: formState.timeZone?.value,
          value: formState.timeZone?.label,
        });

        setCords([coords[0], coords[1]]);
        setAvailabilityHours(availability);
        setPlace({
          displayName: selectedPlace?.label ?? "",
          placeId: selectedPlace?.value ?? "",
        });

        setIsHostAvaibiltyEdit(false);
        setToastData({
          message: "Venue details updated successfully",
          type: "success",
        });

        if (hasAvailabilityChanged) {
          setShowSyncModal(true);
        }
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    }
  };

  const resetLocation = () => {
    // Reset to original address data
    setSelectedPlace({
      label: place?.displayName ?? "",
      value: place?.placeId ?? "",
    });
    setCoords(cords);

    // Reset form values
    setValue("addressLine1", addressLine1);
    setValue("addressLine2", addressLine2);
    setValue("city", city);
    setValue(
      "state",
      state ? { id: state.id, value: state.value } : { id: "", value: "" }
    );
    setValue("zipcode", zipcode);
    setCoords(cords);

    // Reset form state
    setFormState((prev) => ({
      ...prev,
      addressLine1,
      addressLine2,
      city,
      state,
      zipcode,
      location: {
        label: place?.displayName ?? "",
        value: place?.placeId ?? "",
      },
    }));
  };

  return (
    <div className="bg-white  rounded-xl shadow-sm border border-gray-300 w-full  relative">
      {showEditButton ? (
        <div className="absolute p-4 top-0 right-2 z-10">
          <div className="flex justify-end">
            <CButton
              variant={ButtonType.Text}
              onClick={() => {
                // Deep clone current state for originalData
                const newOriginalData = {
                  addressLine1,
                  addressLine2,
                  city,
                  state: state ? { ...state } : null,
                  zipcode,
                  location: {
                    label: place?.displayName ?? "",
                    value: place?.placeId ?? "",
                  },
                  timeZone: {
                    label: timeZone?.value ?? "",
                    value: timeZone?.id ?? "",
                  },
                  availability: availabilityHours.map((day) => ({
                    ...day,
                    hours: day.hours.map((hour) => ({
                      start: { ...hour.start },
                      end: { ...hour.end },
                    })),
                  })),
                  coords: [...cords],
                  selectedPlace: selectedPlace ? { ...selectedPlace } : null,
                };

                setOriginalData(newOriginalData);

                setIsHostAvaibiltyEdit(true);
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
            <h2 className="text-gray-900">Address Line 1</h2>
            <p className="text-sm text-gray-600">
              {addressLine1 ? addressLine1 : "No address line 1 specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">Address Line 2</h2>
            <p className="text-sm text-gray-600">
              {addressLine2 ? addressLine2 : "No address line 2 specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">City</h2>
            <p className="text-sm text-gray-600">
              {city ? city : "No city specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">State</h2>
            <p className="text-sm text-gray-600">
              {state ? state.value : "No state specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">Zipcode</h2>
            <p className="text-sm text-gray-600">
              {zipcode
                ? zipcode.toString().length < 5
                  ? `0${zipcode}`
                  : `${zipcode}`
                : "No zipcode specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">Place</h2>
            <p className="text-sm text-gray-600">
              {place ? place.displayName : "No place specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="border mt-3 rounded-xl h-64   flex items-center justify-center">
          <iframe
            src={`https://maps.google.com/maps?q=${coords[0]}, ${coords[1]}&z=15&output=embed`}
            className="w-full h-full"
          ></iframe>
        </div>
        <hr />
        <div className="flex justify-between  items-center  ">
          <div>
            <h2 className="text-gray-900">Time Zone</h2>
            <p className="text-sm text-gray-600">
              {timeZone ? timeZone.value : "No time zone specified"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex flex-col">
          <h2 className="text-sm text-gray-900 flex items-center space-x-2">
            <span>Available Hours</span>
          </h2>
          <div className="text-sm text-gray-600 mt-2 space-y-2">
            {availabilityHours.map((item: any, index: any) => (
              <div key={index} className="p-4 bg-gray-100 rounded-xl shadow-sm">
                <div className="flex items-center mb-2">
                  <p className="font-medium text-gray-800">{item.day}</p>
                </div>
                {item.active && item.hours.length > 0 ? (
                  item.hours.map((hour: any, hourIndex: any) => (
                    <div
                      key={hourIndex}
                      className="flex items-center space-x-2"
                    >
                      <FaClock className="text-gray-500" />
                      <p className="text-gray-700">{`Open: ${hour.start.label}`}</p>
                      <p className="text-gray-700">{`Close: ${hour.end.label}`}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-gray-400" />
                    <p className="text-gray-500">Closed</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <FullPageModal
        isOpen={isHostAvaibiltyEdit}
        onClose={() => {
          if (originalData) {
            // Reset form state with deep cloned original data
            setFormState({
              addressLine1: originalData.addressLine1,
              addressLine2: originalData.addressLine2,
              city: originalData.city,
              state: originalData.state ? { ...originalData.state } : null,
              zipcode: originalData.zipcode,
              location: { ...originalData.location },
              timeZone: { ...originalData.timeZone },
            });

            // Reset availability states with deep cloned original data
            const clonedOriginalAvailability = originalData.availability.map(
              (day: any) => ({
                ...day,
                hours: day.hours.map((hour: any) => ({
                  start: { ...hour.start },
                  end: { ...hour.end },
                })),
              })
            );

            setAvailability(clonedOriginalAvailability);
            setAvailabilityHours(clonedOriginalAvailability);

            // Reset other states
            setSelectedPlace(
              originalData.selectedPlace
                ? { ...originalData.selectedPlace }
                : null
            );
            setCoords([...originalData.coords]);
            reset(originalData);
          }

          setIsHostAvaibiltyEdit(false);
        }}
        title="Edit Location Details"
        actionButtonLabel="Update"
        onActionButtonClick={() => {}}
      >
        <form
          className="space-y-4 md:space-y-3 w-full max-w-3xl mx-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="col-span-2">
            <div className="flex justify-between items-center">
              <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                Search Location
              </label>
              {selectedPlace &&
                !coords.every((coord, index) => coord === cords[index]) && (
                  <CButton
                    type="button"
                    variant={ButtonType.Text}
                    onClick={resetLocation}
                  >
                    Reset to Default
                  </CButton>
                )}
            </div>
            <div className="flex">
              <AsyncSelect
                className="mt-1 text-sm rounded-xl w-full focus:outline-none text-left"
                classNamePrefix="react-select"
                placeholder="Search location"
                value={selectedPlace}
                menuPlacement="auto"
                loadOptions={debouncedLoadOptions}
                onChange={onPlaceChange}
              />
              {searchLoading && (
                <div className="flex ml-2 items-center h-10">
                  <FaSpinner className="animate-spin text-primary" />
                </div>
              )}
            </div>
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
              <div>
                <label
                  htmlFor="addressLine1"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Address Line 1
                </label>
                <input
                  type="text"
                  {...register("addressLine1", {
                    required: "Address line 1 is required",
                  })}
                  id="addressLine1"
                  className="input input-primary"
                  placeholder="Enter address line 1"
                />
                {errors.addressLine1 && (
                  <p className="text-red-500 text-sm">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="addressLine2"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Address Line 2
                </label>
                <input
                  type="text"
                  {...register("addressLine2")}
                  id="addressLine2"
                  className="input input-primary"
                  placeholder="Enter address line 2"
                />
                {errors.addressLine2 && (
                  <p className="text-red-500 text-sm">
                    {errors.addressLine2.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  {...register("city", { required: "City is required" })}
                  id="city"
                  className="input input-primary"
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-left text-gray-700">
                  State
                </label>
                <Select
                  classNames={{
                    option: (state) =>
                      `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent  ${
                        state.isSelected ? "!bg-primary text-white" : ""
                      }`,
                  }}
                  options={statesOptions.map((el) => ({
                    id: el.value,
                    value: el.label,
                  }))}
                  getOptionLabel={(e) => e.value}
                  getOptionValue={(e) => e.id}
                  className="mt-1 text-sm rounded-xl w-full focus:outline-none text-left"
                  classNamePrefix="react-select"
                  placeholder="Select State"
                  value={formState.state}
                  onChange={(option) => {
                    handleInputChange("state", option);
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="zipcode"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Zipcode
                </label>
                <input
                  type="text"
                  {...register("zipcode", {
                    required: "Zipcode is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Zipcode must contain only digits",
                    },
                    maxLength: {
                      value: 5,
                      message: "Zipcode cannot exceed 5 digits",
                    },
                  })}
                  id="zipcode"
                  className="input input-primary"
                  placeholder="Enter zipcode"
                  maxLength={5}
                  onChange={(e) => {
                    handleInputChange("zipcode", e.target.value);
                  }}
                />
                {errors.zipcode && (
                  <p className="text-red-500 text-sm">
                    {errors.zipcode.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="timeZone"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Timezone
            </label>
            <Select
              classNames={{
                option: (state) =>
                  `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent  ${
                    state.isSelected ? "!bg-primary text-white" : ""
                  }`,
              }}
              options={timezonesOptions.map((el) => ({
                label: el.label,
                value: el.value,
              }))}
              getOptionLabel={(e) => e.label}
              getOptionValue={(e) => e.value}
              className="mt-1 text-sm rounded-xl w-full focus:outline-none text-left"
              classNamePrefix="react-select"
              placeholder="Select Time Zone"
              value={formState.timeZone}
              onChange={(option) => {
                handleInputChange("timeZone", option);
              }}
            />

            {timeZone?.value &&
            timeZone.value.split(" ")[0] !==
              Intl.DateTimeFormat().resolvedOptions().timeZone ? (
              <>
                {
                  <p className="my-1 text-xs font-normal text-left text-black/70 flex flex-col">
                    <span>Date & Time according to your selected timezone</span>
                    <span>
                      {DateTime.fromISO(new Date().toISOString(), {
                        zone: timeZone.value.split(" ")[0],
                      }).toFormat("MM/dd/yyyy hh:mm a")}
                    </span>
                  </p>
                }
              </>
            ) : null}

            {errors.timeZone && (
              <p className="text-red-500 text-sm">{errors.timeZone.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Availability Hours
            </label>
            <AvailabilityComponent
              availability={availability}
              setAvailability={setAvailability}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <CButton
              className="w-full"
              variant={ButtonType.Primary}
              onClick={handleSubmit(onSubmit)}
            >
              Save
            </CButton>
          </div>
        </form>
      </FullPageModal>

      {showSyncModal && (
        <ReusableModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          title="Sync Availability"
          comments="Synchronize availability settings across all menus, categories, and items for your host."
        >
          <div className="flex flex-col items-end space-y-4">
            <p className="text-gray-700">
              {`To apply the host's availability settings to all menus,
              categories, and items, please use the bulk update feature
              available on the Menu Management page.`}
            </p>
            <Link
              href="/menu/menu-builder/menu"
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-md px-4 py-2 transition-colors"
            >
              Go to Menu Management
            </Link>
          </div>
        </ReusableModal>
      )}
    </div>
  );
};

export default HostEditAvailabilityForm;
