import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import { TeamRole } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useUserManagementStore from "@/store/userManagement";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";

type FormData = {
  role: TeamRole | "";
};

const userRoleOptions = [
  { value: TeamRole.Owner, label: "Owner" },
  { value: TeamRole.Manager, label: "Manager" },
  { value: TeamRole.Marketing, label: "Marketing" },
  { value: TeamRole.Staff, label: "Staff" },
];

const EditTeamMemberRoleForm: React.FC = () => {
  const {
    isEditTeamMemberId,
    resetEditStates,
    setIsEditTeamMember,
    setIsEditTeamRole,
  } = useUserManagementStore();
  const { setToastData } = useGlobalStore();

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      role: "",
    },
  });

  const onSubmit = async (formData: FormData) => {
    try {
      await sdk.updateSubuserRole({
        input: {
          id: isEditTeamMemberId ?? "",
          role: formData.role || undefined,
        },
      });
      setToastData({
        message: "Successfully updated user role",
        type: "success",
      });
      handleEditMemberModalClose();
      resetEditStates();
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    }
  };

  const handleEditMemberModalClose = () => {
    setIsEditTeamMember(false);
    setIsEditTeamRole(false);
  };

  useEffect(() => {
    getUser();
  }, [isEditTeamMemberId]);

  const getUser = async () => {
    if (isEditTeamMemberId) {
      try {
        const res = await sdk.getUser({ id: isEditTeamMemberId });
        if (res.getUser) {
          const role = res.getUser.teamRole || "";
          setValue("role", role);
          reset({ role });
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4">
          <h3 className="text-lg font-semibold">Edit role</h3>
          <p className="mt-1 text-sm text-[#6f6255]">
            Role changes update the default access level for this host.
          </p>
        </div>
        <div className="w-full">
          <label
            htmlFor="role"
            className="block mb-2 text-sm font-medium text-left text-gray-700"
          >
            Role
          </label>
          <Select
            classNames={{
              option: (state) =>
                `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent ${
                  state.isSelected ? "!bg-primary text-white" : ""
                }`,
            }}
            id="role"
            menuPortalTarget={
              typeof window !== "undefined" ? document.body : null
            }
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({
                ...base,
                overflowY: "auto",
              }),
            }}
            options={userRoleOptions}
            classNamePrefix="react-select"
            placeholder="Select role"
            value={userRoleOptions.find(
              (option) => option.value === watch("role")
            )}
            onChange={(selectedOption) =>
              setValue("role", (selectedOption as any)?.value)
            }
          />
        </div>

        <div className="flex justify-end mt-4">
          <CButton
            variant={ButtonType.Primary}
            type="submit"
            className="w-full"
          >
            Update User Role
          </CButton>
        </div>
      </div>
    </form>
  );
};

export default EditTeamMemberRoleForm;
