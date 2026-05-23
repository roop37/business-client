import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import CustomSwitch from "@/components/common/customSwitch/customSwitch";
import ReusableModal from "@/components/common/modal/modal";
import useAuthStore from "@/store/auth";
import useGlobalStore from "@/store/global";
import { useBasicProfileStore } from "@/store/profileBasicEditStore";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import React, { useEffect, useState } from "react";
import { MdOutlineEdit } from "react-icons/md";

const UserBasicInformationForm: React.FC = () => {
  const {
    firstName,
    lastName,
    email,
    phone,
    accountPreferences,
    setProfileData,
  } = useBasicProfileStore();

  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false); // To manage the alert modal state
  const [acountPrefType, setAcountPrefType] = useState<
    "sms" | "email" | "whatsapp"
  >("email");
  const [updatePrefto, setUpdatePrefto] = useState(false);
  const [editField, setEditField] = useState<"firstName" | "lastName">(
    "firstName"
  );
  const [updatedPreferences, setUpdatedPreferences] =
    useState(accountPreferences);

  useEffect(() => {
    setFormState({
      firstName,
      lastName,
    });
    setUpdatedPreferences(accountPreferences);
  }, [firstName, lastName, accountPreferences]);

  const handleInputChange = (
    field: "firstName" | "lastName",
    value: string
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const { setToastData } = useGlobalStore();
  const { setFirstName } = useAuthStore();

  // Function to handle account preferences change
  const handlePreferenceChange = async (
    key: "sms" | "email" | "whatsapp",
    value: boolean
  ) => {
    setUpdatedPreferences((prev) => ({ ...prev, [key]: value }));

    try {
      const response = await sdk.updateUserDetails({
        input: {
          accountPreferences: { ...updatedPreferences, [key]: value },
        },
      });

      if (response && response.updateUserDetails) {
        useBasicProfileStore.setState((state) => ({
          accountPreferences: { ...state.accountPreferences, [key]: value },
        }));
        setUpdatePrefto(false);
        setAcountPrefType("email");
        setIsAlertOpen(false);
        setToastData({
          message: "Account preferences updated successfully!",
          type: "success",
        });
      }
    } catch (error) {
      setUpdatedPreferences((prev) => ({ ...prev, [key]: !value }));
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const handleNameUpdate = async () => {
    try {
      const response = await sdk.updateUserDetails({
        input: {
          [editField]: formState[editField],
        },
      });
      if (response?.updateUserDetails) {
        setProfileData({ [editField]: formState[editField] });
        if (editField === "firstName") setFirstName(formState[editField]);
        setIsModalOpen(false);
        setToastData({
          message: "Name updated successfully!",
          type: "success",
        });
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    }
  };

  const openAlertModal = (action: "update" | "preference") => {
    setIsAlertOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300  w-full ">
      <div className="space-y-2">
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">First Name</h3>
            <p className="text-sm text-gray-600">
              {firstName ? firstName : "No first name"}
            </p>
          </div>
          <MdOutlineEdit
            className="text-primary text-lg cursor-pointer"
            onClick={() => {
              setEditField("firstName");
              setIsModalOpen(true);
            }}
          />
        </div>
        <hr />
        {/* Last Name */}
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Last Name</h3>
            <p className="text-sm text-gray-600">
              {lastName ? lastName : "No last name"}
            </p>
          </div>
          <MdOutlineEdit
            className="text-primary text-lg cursor-pointer"
            onClick={() => {
              setEditField("lastName");
              setIsModalOpen(true);
            }}
          />
        </div>
        <hr />

        {/* Email */}
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Email</h3>
            <p className="text-sm text-gray-600">{email}</p>
          </div>
        </div>
        <hr />

        {/* Phone */}
        <div className="flex justify-between items-center ">
          <div>
            <h3 className="text-gray-900">Phone</h3>
            <p className="text-sm text-gray-600">
              {phone ? phone : "No phone number"}
            </p>
          </div>
        </div>
        <hr />

        {/* Account Preferences */}
        <div>
          <h3 className="text-gray-900">Account Preferences</h3>
          <div className="flex flex-col items-start justify-between mt-3 w-full space-y-4">
            <div className="flex items-center justify-between space-x-3 w-full">
              <label htmlFor="sms" className="text-xs text-gray-700">
                SMS Notifications
              </label>
              <CustomSwitch
                label="Update SMS Preferences"
                checked={updatedPreferences.sms}
                onChange={() => {
                  setIsAlertOpen(true);
                  setAcountPrefType("sms");
                  setUpdatePrefto(!updatedPreferences.sms);
                  // handlePreferenceChange(
                  //   "sms",
                  //   !updatedPreferences.sms
                  // )
                }}
              />
            </div>
            <div className="flex justify-between items-center space-x-3 w-full">
              <label htmlFor="email" className="text-xs text-gray-700">
                Email Notifications
              </label>
              <CustomSwitch
                label="Update Email Preferences"
                checked={updatedPreferences.email}
                onChange={() => {
                  setIsAlertOpen(true);
                  setAcountPrefType("email");
                  setUpdatePrefto(!updatedPreferences.email);
                }}
              />
            </div>
            <div className="flex justify-between items-center space-x-3 w-full">
              <label htmlFor="whatsapp" className="text-xs text-gray-700">
                WhatsApp Notifications
              </label>
              <CustomSwitch
                label="Update WhatsApp Preferences"
                checked={updatedPreferences.whatsapp}
                onChange={() => {
                  setIsAlertOpen(true);
                  setAcountPrefType("whatsapp");
                  setUpdatePrefto(!updatedPreferences.whatsapp);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for editing names */}
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit ${editField === "firstName" ? "First Name" : "Last Name"}`}
      >
        <input
          type="text"
          value={formState[editField]}
          onChange={(e) => handleInputChange(editField, e.target.value)}
          className="input input-primary"
        />
        <CButton
          type="submit"
          className="w-full mt-4"
          variant={ButtonType.Primary}
          onClick={handleNameUpdate}
        >
          Update
        </CButton>
      </ReusableModal>

      {/* Alert Modal */}
      <ReusableModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Confirm Update"
      >
        <p>Are you sure you want to update the user details?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <CButton
            variant={ButtonType.Primary}
            onClick={() => {
              handlePreferenceChange(acountPrefType, updatePrefto);
            }}
          >
            Yes, Update
          </CButton>
        </div>
      </ReusableModal>
    </div>
  );
};

export default UserBasicInformationForm;
