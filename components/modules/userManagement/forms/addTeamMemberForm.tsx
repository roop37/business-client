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

  // Single-card layout: header + body sit inside one rounded white
  // surface with internal dashed dividers between sections. The previous
  // version stacked 4–5 separate card blocks (white, beige, beige,
  // beige) which read as a scattered list of disconnected fragments —
  // the user reported it "broken into pieces, multiple breaks and
  // scattered, not looking good."
  return (
    <motion.div
      className="z-10 flex min-h-full w-full max-w-3xl flex-col gap-4 text-[var(--owner-fg-1)]"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--owner-border)] bg-white shadow-[0_8px_28px_rgba(43,35,25,0.06)]">
        <header className="flex items-start gap-3 border-b border-[var(--owner-border-soft,#ece2d2)] bg-[#fbf6ec] px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--owner-blue-500)] shadow-[inset_0_0_0_1px_var(--owner-border)]">
            {showPermissions ? <ShieldCheckIcon size={18} /> : <UserPlusIcon size={18} />}
          </span>
          <div>
            <h1 className="text-[20px] font-semibold leading-tight">
              {showPermissions ? "Assign permissions" : "Add team member"}
            </h1>
            <p className="mt-1 max-w-xl text-[13px] leading-5 text-[#6f6255]">
              {showPermissions
                ? `Choose the areas this user can access for the current ${hostLabel.lower}.`
                : "Send an invite and define the role before selecting permissions."}
            </p>
          </div>
        </header>

        {!showPermissions ? (
          <form onSubmit={onSubmit}>
            <section className="px-5 py-5">
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a7f74]">
                Contact details
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-[12.5px] font-medium text-[#3d362e]">
                  First Name <span className="text-[#b3261e]">*</span>
                  <input
                    type="text"
                    className="input input-primary mt-1"
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={(event) => setFormValue("firstName", event.target.value)}
                  />
                </label>
                <label className="block text-[12.5px] font-medium text-[#3d362e]">
                  Last Name <span className="text-[#b3261e]">*</span>
                  <input
                    type="text"
                    className="input input-primary mt-1"
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChange={(event) => setFormValue("lastName", event.target.value)}
                  />
                </label>
                <label className="block text-[12.5px] font-medium text-[#3d362e]">
                  Email <span className="text-[#b3261e]">*</span>
                  <input
                    type="email"
                    className="input input-primary mt-1"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(event) => setFormValue("email", event.target.value)}
                  />
                </label>
                <label className="block text-[12.5px] font-medium text-[#3d362e]">
                  Phone Number <span className="text-[#b3261e]">*</span>
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
            </section>

            <div className="mx-5 border-t border-dashed border-[var(--owner-border)]" />

            <section className="px-5 py-5">
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a7f74]">
                Role <span className="text-[#b3261e]">*</span>
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                {userRoleOptions.map((option) => {
                  const selected = form.role?.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormValue("role", option)}
                      className={`flex min-h-[72px] items-start justify-between rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)] shadow-[0_0_0_2px_var(--owner-blue-050)]"
                          : "border-[var(--owner-border)] bg-white hover:border-[var(--owner-blue-500)]"
                      }`}
                    >
                      <span>
                        <span className="block text-[13.5px] font-semibold">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-[11.5px] leading-4 text-[#6f6255]">
                          {defaultPermissionsByRole[option.value]?.length ?? 0} default permissions
                        </span>
                      </span>
                      {selected ? (
                        <CheckIcon size={14} className="text-[var(--owner-blue-500)]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="mx-5 border-t border-dashed border-[var(--owner-border)]" />

            <section className="px-5 py-5">
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a7f74]">
                Notification preferences
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <CustomSwitchCard
                  classNameDiv="h-full"
                  label="SMS Notifications"
                  title="SMS Notifications"
                  caption="Operational SMS updates for this team member."
                  switchChecked={form.sms}
                  onSwitchChange={() => setFormValue("sms", !form.sms)}
                />
                <CustomSwitchCard
                  classNameDiv="h-full"
                  label="Email Notifications"
                  title="Email Notifications"
                  caption="Operational email updates for this team member."
                  switchChecked={form.emailPref}
                  onSwitchChange={() => setFormValue("emailPref", !form.emailPref)}
                />
              </div>
            </section>

            <footer className="border-t border-[var(--owner-border-soft,#ece2d2)] bg-[#fbf6ec] px-5 py-4">
              <CButton
                loading={btnLoading}
                variant={ButtonType.Primary}
                type="button"
                className="w-full"
                onClick={handleContinueClick}
              >
                Continue to Permissions
              </CButton>
            </footer>
          </form>
        ) : (
          <form onSubmit={onSubmit}>
            <section className="px-5 py-5">
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a7f74]">
                Access controls
              </h2>
              <div className="grid gap-2.5 md:grid-cols-2">
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
            </section>
            <footer className="flex flex-col gap-2 border-t border-[var(--owner-border-soft,#ece2d2)] bg-[#fbf6ec] px-5 py-4 sm:flex-row">
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
            </footer>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default AddTeamMemberForm;
