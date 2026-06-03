import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import CustomSwitchCard from "@/components/common/customSwitchCard/customSwitchCard";
import { PermissionTypeEnum, TeamRole, UserRole } from "@/generated/graphql";
import { useHostTypeLabel } from "@/hooks/useHostTypeLabel";
import useAddTeamMemberFormStore from "@/store/addTeamMemberStore";
import useGlobalStore from "@/store/global";
import useUserManagementStore from "@/store/userManagement";
import { sdk } from "@/utils/graphqlClient";
import {
  extractErrorMessage,
  formatPermissionType,
  isValidNameAlphabetic,
  sanitizeText,
} from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import {
  CheckIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

const userRoleOptions = [
  { value: TeamRole.Owner, label: "Owner" },
  { value: TeamRole.Manager, label: "Manager" },
  { value: TeamRole.Marketing, label: "Marketing" },
  { value: TeamRole.Staff, label: "Staff" },
];

const defaultPermissionsByRole: Record<string, PermissionTypeEnum[]> = {
  [TeamRole.Owner]: Object.values(PermissionTypeEnum),
  [TeamRole.Manager]: [
    PermissionTypeEnum.Events,
    PermissionTypeEnum.Tickets,
    PermissionTypeEnum.Orders,
    PermissionTypeEnum.Customers,
    PermissionTypeEnum.Offers,
    PermissionTypeEnum.Reports,
    PermissionTypeEnum.PayoutManagement,
    PermissionTypeEnum.TeamManagement,
  ],
  [TeamRole.Marketing]: [
    PermissionTypeEnum.Marketing,
    PermissionTypeEnum.Customers,
    PermissionTypeEnum.Offers,
    PermissionTypeEnum.Reports,
    PermissionTypeEnum.DownloadReports,
  ],
  [TeamRole.Staff]: [
    PermissionTypeEnum.Events,
    PermissionTypeEnum.Tickets,
    PermissionTypeEnum.Orders,
    PermissionTypeEnum.Customers,
  ],
};

const AddTeamMemberForm = () => {
  const [btnLoading, setBtnLoading] = useState(false);
  const hostLabel = useHostTypeLabel();
  const { setToastData } = useGlobalStore();
  const { isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen } =
    useUserManagementStore();
  const { form, setFormValue, resetForm } = useAddTeamMemberFormStore();

  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState<
    {
      type: string;
      id: string;
      isTicked: boolean;
      preselect: TeamRole[];
    }[]
  >([]);

  const formatPermissions = (
    permissions: {
      type: string;
      id: string;
      isTicked: boolean;
      preselect: TeamRole[];
    }[],
  ): any[] => {
    return permissions.map((permission) => ({
      type: permission.type,
      status: permission.isTicked,
      id: permission.id,
    }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (
        !isValidNameAlphabetic(form.firstName) ||
        !isValidNameAlphabetic(form.lastName)
      ) {
        setToastData({
          message: "Please use only alphabets for first and last names.",
          type: "error",
        });
        return;
      }

      if (
        sanitizeText(form.firstName).length > 20 ||
        sanitizeText(form.lastName).length > 20
      ) {
        setToastData({
          message: "First and Last name should be of maximum 20 characters",
          type: "error",
        });
        return;
      }

      if (!form.role) {
        setToastData({
          message: "Please select a valid role to proceed.",
          type: "error",
        });
        return;
      }

      setBtnLoading(true);
      const formattedPermissions = formatPermissions(permissions);

      const res = await sdk.addTeamMember({
        AddTeamMemberInput: {
          firstName: sanitizeText(form.firstName),
          lastName: sanitizeText(form.lastName),
          email: form.email,
          phone: form.phone,
          role: UserRole.Host,
          teamRole: form.role.value as TeamRole,
          restaurants: [],
          accountPreferences: {
            sms: form.sms,
            email: form.emailPref,
            whatsapp: false,
          },
          permissions: formattedPermissions,
        },
      });

      if (res) {
        setToastData({
          type: "success",
          message: "Team Member Added Successfully",
        });
        setIsAddTeamMemberModalOpen(false);
        resetForm();
        setShowPermissions(false);
      }

      setBtnLoading(false);
    } catch (error: any) {
      setBtnLoading(false);
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  useEffect(() => {
    const selectedRole = form.role?.value as TeamRole | undefined;
    const roleDefaults = defaultPermissionsByRole[selectedRole || ""] ?? [];
    setPermissions((prevPermissions) =>
      prevPermissions.map((permission) => ({
        ...permission,
        isTicked: permission.preselect?.length && selectedRole
          ? permission.preselect.includes(selectedRole)
          : roleDefaults.includes(permission.type as PermissionTypeEnum),
      })),
    );
  }, [form.role]);

  const fetchPermissions = async () => {
    try {
      const response = await sdk.getAllPermissions();
      const roleDefaults = defaultPermissionsByRole[form.role?.value || ""] ?? [];
      const selectedRole = form.role?.value as TeamRole | undefined;
      const formattedPermissions = response.getAllPermissions.map(
        (permission: {
          type: PermissionTypeEnum;
          _id: string;
          preselect: TeamRole[];
        }) => ({
          type: permission.type,
          id: permission._id,
          isTicked: permission.preselect?.length && selectedRole
            ? permission.preselect.includes(selectedRole)
            : roleDefaults.includes(permission.type),
          preselect: permission.preselect,
        }),
      );
      setPermissions(formattedPermissions);
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    }
  };
  const handlePermissionChange = (type: string) => {
    setPermissions((prevPermissions) =>
      prevPermissions.map((permission) =>
        permission.type === (type as PermissionTypeEnum)
          ? { ...permission, isTicked: !permission.isTicked }
          : permission,
      ),
    );
  };

  useEffect(() => {
    if (isAddTeamMemberModalOpen) {
      setShowPermissions(false);
    }
    fetchPermissions();
  }, [isAddTeamMemberModalOpen]);

  const handleBack = () => {
    setShowPermissions(false);
  };

  const handleContinueClick = () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone ||
      !form.role
    ) {
      setToastData({
        message: "Please fill out all required fields.",
        type: "error",
      });
      return;
    }

    if (
      !isValidNameAlphabetic(form.firstName) ||
      !isValidNameAlphabetic(form.lastName)
    ) {
      setToastData({
        message: "Please use only alphabets for first and last names.",
        type: "error",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      setToastData({
        message: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    setShowPermissions(true);
  };

  return (
    <motion.div
      className="z-10 flex min-h-full w-full max-w-5xl flex-col gap-5 text-[var(--owner-fg-1)]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7eadc] text-[var(--owner-blue-500)]">
            {showPermissions ? <ShieldCheckIcon size={20} /> : <UserPlusIcon size={20} />}
          </span>
          <div>
            <h1 className="text-2xl font-semibold">
              {showPermissions ? "Assign permissions" : "Add team member"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6f6255]">
              {showPermissions
                ? `Choose the areas this user can access for the current ${hostLabel.lower}.`
                : "Send an invite and define the role before selecting permissions."}
            </p>
          </div>
        </div>
      </div>

      {!showPermissions ? (
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 rounded-lg border border-[var(--owner-border)] bg-white p-5 md:grid-cols-2">
            <label className="block text-sm font-medium">
              First Name *
              <input
                type="text"
                className="input input-primary mt-1"
                placeholder="Enter first name"
                value={form.firstName}
                onChange={(event) => setFormValue("firstName", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Last Name *
              <input
                type="text"
                className="input input-primary mt-1"
                placeholder="Enter last name"
                value={form.lastName}
                onChange={(event) => setFormValue("lastName", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Email *
              <input
                type="email"
                className="input input-primary mt-1"
                placeholder="name@example.com"
                value={form.email}
                onChange={(event) => setFormValue("email", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Phone Number *
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="input input-primary mt-1"
                placeholder="10 digit mobile number"
                value={form.phone}
                onChange={(event) => {
                  const value = event.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= 10) {
                    setFormValue("phone", value);
                  }
                }}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onPaste={(event) => {
                  event.preventDefault();
                  const numbersOnly = event.clipboardData
                    .getData("text")
                    .replace(/[^0-9]/g, "")
                    .slice(0, 10);
                  setFormValue("phone", numbersOnly);
                }}
              />
            </label>
          </div>

          <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-5">
            <div className="mb-3 text-sm font-semibold">Role *</div>
            <div className="grid gap-3 md:grid-cols-4">
              {userRoleOptions.map((option) => {
                const selected = form.role?.value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormValue("role", option)}
                    className={`flex min-h-20 items-start justify-between rounded-lg border p-3 text-left transition ${
                      selected
                        ? "border-[var(--owner-blue-500)] bg-white shadow-sm"
                        : "border-[var(--owner-border)] bg-[var(--owner-bg)] hover:border-[var(--owner-blue-500)]"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#6f6255]">
                        {defaultPermissionsByRole[option.value]?.length ?? 0} default permissions
                      </span>
                    </span>
                    {selected ? <CheckIcon size={16} className="text-[var(--owner-blue-500)]" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <CustomSwitchCard
              classNameDiv="h-full"
              label="SMS Notifications"
              title="SMS Notifications"
              caption="Allow operational SMS updates for this team member."
              switchChecked={form.sms}
              onSwitchChange={() => setFormValue("sms", !form.sms)}
            />
            <CustomSwitchCard
              classNameDiv="h-full"
              label="Email Notifications"
              title="Email Notifications"
              caption="Allow operational email updates for this team member."
              switchChecked={form.emailPref}
              onSwitchChange={() => setFormValue("emailPref", !form.emailPref)}
            />
          </div>

          <CButton
            loading={btnLoading}
            variant={ButtonType.Primary}
            type="button"
            className="w-full"
            onClick={handleContinueClick}
          >
            Continue to Permissions
          </CButton>
        </form>
      ) : (
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            {permissions.map((permission) => (
              <CustomSwitchCard
                key={permission.id}
                label={formatPermissionType(
                  permission.type as PermissionTypeEnum,
                )}
                title={formatPermissionType(
                  permission.type as PermissionTypeEnum,
                )}
                caption={`Controls access for this ${hostLabel.lower} area.`}
                switchChecked={permission.isTicked}
                onSwitchChange={() => handlePermissionChange(permission.type)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <CButton
              loading={btnLoading}
              variant={ButtonType.Outlined}
              type="button"
              className="w-full"
              onClick={handleBack}
            >
              Back
            </CButton>
            <CButton
              loading={btnLoading}
              variant={ButtonType.Primary}
              type="submit"
              className="w-full"
            >
              Send Invite
            </CButton>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default AddTeamMemberForm;
