import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import CustomSwitchCard from "@/components/common/customSwitchCard/customSwitchCard";
import { PermissionTypeEnum, UserRole } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useUserManagementStore from "@/store/userManagement";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, formatPermissionType } from "@/utils/utilFUncs";
import React, { useEffect, useState } from "react";

const EditTeamMemberPermissionForm: React.FC = () => {
  const { isEditTeamMemberId, resetEditStates, setIsEditTeamMember } =
    useUserManagementStore();
  const { setToastData } = useGlobalStore();
  const [permissionsList, setPermissionsList] = useState<
    { id: string; type: string; status: boolean }[]
  >([]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await sdk.updateSubuserPermissions({
        input: {
          id: isEditTeamMemberId ?? "",
          permissions: permissionsList,
        },
      });
      setToastData({
        message: "Successfully updated user permission",
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

  const handlePermissionChange = (type: string) => {
    setPermissionsList((prevPermissions) =>
      prevPermissions.map((permission) =>
        permission.type === type
          ? { ...permission, status: !permission.status }
          : permission
      )
    );
  };

  const handleEditMemberModalClose = () => {
    setIsEditTeamMember(false);
  };

  useEffect(() => {
    getUser();
  }, [isEditTeamMemberId]);

  const getUser = async () => {
    if (isEditTeamMemberId) {
      try {
        const [userResponse, permissionsResponse] = await Promise.all([
          sdk.getUser({ id: isEditTeamMemberId }),
          sdk.getAllPermissions(),
        ]);
        const userPermissions = userResponse.getUser?.permissions ?? [];
        const userPermissionMap = new Map<
          string,
          { id: string; status: boolean }
        >(
          userPermissions.map((permission) => [
            permission.type,
            {
              id: permission.id,
              status: permission.status,
            },
          ])
        );
        setPermissionsList(
          permissionsResponse.getAllPermissions
            .filter((permission) =>
              permission.preselect?.includes(UserRole.Host)
            )
            .map((permission) => {
              const existing = userPermissionMap.get(permission.type);
              return {
                id: existing?.id || permission._id,
                type: permission.type as PermissionTypeEnum,
                status: existing?.status ?? false,
              };
            })
        );
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4">
      <div className="max-w-4xl mx-auto space-y-4 w-full">
        <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4">
          <h3 className="text-lg font-semibold">Edit permissions</h3>
          <p className="mt-1 text-sm text-[#6f6255]">
            Enable only the host areas this team member should use.
          </p>
        </div>
        {permissionsList.map((permission) => (
          <CustomSwitchCard
            key={permission.id}
            label={formatPermissionType(permission.type)}
            switchChecked={permission.status}
            onSwitchChange={() => handlePermissionChange(permission.type)}
            title={formatPermissionType(permission.type)}
            caption={`Do you want the user to have access to ${formatPermissionType(
              permission.type
            )}?`}
          />
        ))}

        <div className="flex justify-end mt-4">
          <CButton
            variant={ButtonType.Primary}
            type="submit"
            className="w-full"
          >
            Update User Permissions
          </CButton>
        </div>
      </div>
    </form>
  );
};

export default EditTeamMemberPermissionForm;
