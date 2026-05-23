import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import useGlobalStore from "@/store/global";
import useMasterStore from "@/store/masters";
import useProfileStore from "@/store/profile";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import debounce from "lodash.debounce";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import Select from "react-select";
import AsyncSelect from "react-select/async";

interface IFormInput {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: { id: string; value: string } | null;
  zipcode: number;
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

const UserLocationForm: React.FC = () => {
  const [coords, setCoords] = useState<number[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<any>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: null,
    zipcode: 0,
    place: null,
    coords: [],
  });
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
    id,
    setAddressLine1,
    setAddressLine2,
    setCity,
    setState,
    setCords,
    setPlace,
    setZipcode,
  } = useProfileStore();

  const { statesOptions } = useMasterStore();
  const [isFullPageModalOpen, setIsFullPageModalOpen] = useState(false);

  useEffect(() => {
    setCoords(cords);
  }, [cords]);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      city: city,
      state: state || null,
      zipcode: zipcode || "",
      place: place || { label: "", value: "" },
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
  });

  useEffect(() => {
    setSelectedPlace({
      label: place?.displayName,
      value: place?.placeId,
    });
  }, [place]);

  const onPlaceChange = async (option: PlacesType | null) => {
    setSearchLoading(true);

    setSelectedPlace(option);
    setFormState((prev) => ({
      ...prev,
      location: option ?? { label: "", value: "" },
    }));
    try {
      const d = await sdk.PlaceDetails({
        placeId: option?.value ?? "",
      });

      if (d && d.getPlaceDetails) {
        setCords([d.getPlaceDetails.latitude, d.getPlaceDetails.longitude]);

        // Set addressLine1
        if (d.getPlaceDetails.address) {
          setValue("addressLine1", "");
          // setAddressLine1(d.getPlaceDetails.address);
        }

        if (d.getPlaceDetails.address) {
          setValue("addressLine2", "");
          // setAddressLine1(d.getPlaceDetails.address);
        }

        // Set city
        if (d.getPlaceDetails.city) {
          setValue("city", d.getPlaceDetails.city);
          // setCity(d.getPlaceDetails.city);
        }

        // Set zipcode
        if (d.getPlaceDetails.zipcode) {
          const zipcodeValue = parseFloat(d.getPlaceDetails.zipcode);
          setValue("zipcode", zipcodeValue);
          // setZipcode(zipcodeValue);
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
      const parseIntZip = parseInt(data.zipcode.toString());

      const response = await sdk.updateBusinessDetails({
        input: {
          _id: id,
          address: {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 ? data.addressLine2 : "",
            city: data.city,
            state: {
              stateId: formState.state?.id || "",
              stateName: formState.state?.value || "",
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
        },
      });

      if (response && response.updateBusinessDetails) {
        setAddressLine1(data.addressLine1);
        setAddressLine2(data.addressLine2);
        setState({
          id: formState.state?.id || "",
          value: formState.state?.value || "",
        });
        setCity(data.city);
        setZipcode(parseIntZip);
        setCords(coords);
        setPlace({
          displayName: selectedPlace?.label ?? "",
          placeId: selectedPlace?.value ?? "",
        });

        setIsFullPageModalOpen(false);
        setToastData({
          message: "Host details updated successfully",
          type: "success",
        });
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    }
  };

  return (
    <div
      className="mt-2"
      //  className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 w-full "
    >
      <div className="flex justify-end">
        <CButton
          variant={ButtonType.Text}
          onClick={() => {
            setOriginalFormData({
              addressLine1: addressLine1 || "",
              addressLine2: addressLine2 || "",
              city: city || "",
              state: state || null,
              zipcode: zipcode || 0,
              place: selectedPlace
                ? {
                    label: selectedPlace.label,
                    value: selectedPlace.value,
                  }
                : null,
              coords: coords || [],
            });
            setIsFullPageModalOpen(true);
          }}
        >
          Edit Billing Address
        </CButton>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">Address Line 1</h2>
            <p className="text-sm text-gray-600">
              {addressLine1 ? addressLine1 : "No Address Line 1"}
            </p>
          </div>
        </div>
        <hr />

        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">Address Line 2</h2>
            <p className="text-sm text-gray-600 ">
              {addressLine2 ? addressLine2 : "No Address Line 2"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">City</h2>
            <p className="text-sm text-gray-600">{city ? city : "No city"}</p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center  ">
          <div>
            <h2 className="text-gray-900">State</h2>
            <p className="text-sm text-gray-600">
              {state?.value ? state?.value : "No State"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center  ">
          <div>
            <h2 className="text-gray-900">Zipcode</h2>
            <p className="text-sm text-gray-600">
              {zipcode
                ? zipcode.toString().length < 5
                  ? `0${zipcode}`
                  : `${zipcode}`
                : "No zipcode"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center  ">
          <div>
            <h2 className="text-gray-900">Location</h2>
            <p className="text-sm text-gray-600">
              {place?.displayName ? place?.displayName : "No Location"}
            </p>
          </div>
        </div>

        <div className="border mt-3 rounded-xl h-64  flex items-center justify-center">
          <iframe
            src={`https://maps.google.com/maps?q=${coords[0]}, ${coords[1]}&z=15&output=embed`}
            className="w-full h-full"
          ></iframe>
        </div>
      </div>

      <ReusableModal
        isOpen={isFullPageModalOpen}
        // onClose={() => setIsFullPageModalOpen(false)}
        onClose={() => {
          // Reset form to original values
          setValue("addressLine1", originalFormData.addressLine1);
          setValue("addressLine2", originalFormData.addressLine2);
          setValue("city", originalFormData.city);
          setValue("zipcode", originalFormData.zipcode.toString());

          // Reset state selection
          handleInputChange("state", originalFormData.state);
          setFormState((prev) => ({
            ...prev,
            state: originalFormData.state,
          }));

          // Reset place selection
          setSelectedPlace(originalFormData.place);
          setFormState((prev) => ({
            ...prev,
            location: originalFormData.place ?? { label: "", value: "" },
          }));

          // Reset coordinates
          setCoords(originalFormData.coords);

          // Reset the form
          reset({
            addressLine1: originalFormData.addressLine1,
            addressLine2: originalFormData.addressLine2,
            city: originalFormData.city,
            state: originalFormData.state,
            zipcode: originalFormData.zipcode,
            place: originalFormData.place
              ? {
                  displayName: originalFormData.place.label,
                  placeId: originalFormData.place.value,
                }
              : undefined,
          });

          setIsFullPageModalOpen(false);
        }}
        title="Edit Location Details"
      >
        <form
          className="space-y-4 md:space-y-3 w-full max-w-3xl mx-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="col-span-2">
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Search Location
            </label>
            <div className="flex">
              <AsyncSelect
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure the dropdown appears above other elements
                  menu: (base) => ({
                    ...base,
                    maxHeight: "150px", // Fixed height for dropdown menu
                    overflowY: "auto", // Scrollable content within the dropdown
                  }),
                }}
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
              menuPortalTarget={
                typeof window !== "undefined" ? document.body : null
              }
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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
                pattern: {
                  value: /^\d{5}(-\d{4})?$/,
                  message: "Invalid zipcode format",
                },
                required: "Zipcode is required",
              })}
              className="input input-primary disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Zipcode"
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
              maxLength={5}
              // onChange={(e) => setZipcode(parseInt(e.target.value))}
              onChange={(e) => {
                handleInputChange("zipcode", e.target.value);
              }}
              // disabled={(getValues()["zipcode"]?.toString()?.length ?? 0) === 0}
            />
            {errors.zipcode && (
              <p className="text-red-500 text-sm">{errors.zipcode.message}</p>
            )}
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
      </ReusableModal>
    </div>
  );
};

export default UserLocationForm;
