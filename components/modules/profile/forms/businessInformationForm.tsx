import { formatHoizrBusinessType } from "@/lib/hoizrConstants";
import useProfileStore from "@/store/profile";
import React from "react";
import UserLocationForm from "./locationDetailsForm";

const BusinessInformationForm: React.FC = () => {
  const { businessType, businessName } = useProfileStore();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 w-full ">
      <div className="space-y-2">
        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">Business Name</h2>
            <p className="text-sm text-gray-600">
              {businessName ? businessName : "No business name"}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex justify-between items-center ">
          <div>
            <h2 className="text-gray-900">Business Type</h2>
            <p className="text-sm text-gray-600">
              {businessType
                ? formatHoizrBusinessType(businessType)
                : "No business type"}
            </p>
          </div>
        </div>
        <hr />
        <UserLocationForm />
      </div>
    </div>
  );
};

export default BusinessInformationForm;
