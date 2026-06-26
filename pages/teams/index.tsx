import {
  Badge,
  OwnerButton,
  PageHeader,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FullPageModal from "@/components/common/modal/fullPageModal";
import ReusableModal from "@/components/common/modal/modal";
import CustomJoyrideTooltip from "@/components/joyride";
import MainLayout from "@/components/layouts/mainBodyLayout";
import AddTeamMemberForm from "@/components/modules/userManagement/forms/addTeamMemberForm";
import EditTeamMemberPermissionForm from "@/components/modules/userManagement/forms/editTeamMemberPermissionForm";
import EditTeamMemberRoleForm from "@/components/modules/userManagement/forms/editTeamMemberRoleForm";
import { TeamsRowType } from "@/components/modules/userManagement/interface";
import { PermissionTypeEnum, UserStatus, WalkthroughKey } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import useUserManagementStore from "@/store/userManagement";
import { useHostTypeLabel } from "@/hooks/useHostTypeLabel";
import { sdk } from "@/utils/graphqlClient";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import { hasAccess } from "@/utils/hasAccess";
import {
  extractErrorMessage,
  formatUserRole,
  formatUserStatus,
} from "@/utils/utilFUncs";
import { GetServerSideProps } from "next";
import React, { useEffect, useMemo, useState } from "react";
import Joyride, { STATUS } from "react-joyride";
import useAddTeamMemberFormStore from "../../store/addTeamMemberStore";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { MdOutlineManageAccounts } from "react-icons/md";

type NextPageWithLayout = React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

type UserRepo = {
  _id: string;
  firstName: string;
  status: string;
};

type RoleFilter = "all" | "Owner" | "Manager" | "Marketing" | "Staff";

const memberName = (member: TeamsRowType) =>
  [member.firstName, member.lastName].filter(Boolean).join(" ") ||
  "Unnamed member";

const roleLabel = (role?: string | null) => formatUserRole(role ?? "") || "Staff";

const roleTone = (role?: string | null): BadgeTone => {
  const label = roleLabel(role);
  if (label === "Owner") return "info";
  if (label === "Manager") return "success";
  if (label === "Marketing") return "warning";
  return "neutral";
};

const statusTone = (status?: UserStatus): BadgeTone => {
  if (status === UserStatus.Active) return "success";
  if (status === UserStatus.Blocked) return "danger";
  return "warning";
};

const statusLabel = (status?: UserStatus) =>
  formatUserStatus(status as UserStatus) || "Invited";

const roleMatches = (member: TeamsRowType, role: string) =>
  roleLabel(member.role).toLowerCase() === role.toLowerCase();

const Teams: NextPageWithLayout = () => {
  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();
  const { resetForm } = useAddTeamMemberFormStore();
  const { meUser } = useUserStore();
  const hostLabel = useHostTypeLabel();
  const {
    setIsEditTeamMember,
    setIsEditTeamMemberId,
    setIsEditTeamRole,
    isEditTeamRole,
    isEditTeamMember,
    isAddTeamMemberModalOpen,
    setIsAddTeamMemberModalOpen,
  } = useUserManagementStore();

  const [data, setData] = useState<TeamsRowType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMeUser, setLoadingMeUser] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [availableCaption, setAvailableCaption] = useState(
    "Are you sure you want to block the user?"
  );
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    setSelectedSideBarMenu("Team Management");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const response = await sdk.getTeamMembers();
        if (!response?.getTeamMembers) {
          setToastData({
            type: "error",
            message: "Unable to load team members, please try again later",
          });
          return;
        }

        setData(
          response.getTeamMembers.map((el) => ({
            _id: el?._id?._id ?? "",
            firstName: el?.firstName ?? "",
            lastName: el?.lastName ?? "",
            status: el?.status,
            email: el?.email ?? "",
            phone: el?.phone ?? "",
            role: el?.role ?? "STAFF",
            onboardingStatus: el?.status,
          }))
        );
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [isAddTeamMemberModalOpen, isEditTeamMember, setToastData]);

  useEffect(() => {
    if (!meUser?._id) {
      setLoadingMeUser(true);
      return;
    }
    setShowWalkthrough(
      !(meUser.completedWalkthroughs ?? []).includes(WalkthroughKey.Teams)
    );
    setLoadingMeUser(false);
  }, [meUser]);

  const onEditRole = (id: string) => {
    setIsEditTeamMember(true);
    setIsEditTeamMemberId(id);
    setIsEditTeamRole(true);
  };

  const onEditPermissions = (id: string) => {
    setIsEditTeamMember(true);
    setIsEditTeamMemberId(id);
    setIsEditTeamRole(false);
  };

  const handleDeleteMember = (_id: string) => {
    setShowDeleteConfirmationModal(true);
    setSelectedMemberId(_id);
    setAvailableCaption(
      "By clicking yes, the selected team member will be deleted. This action cannot be undone."
    );
  };

  const handleAddMember = () => {
    setIsAddTeamMemberModalOpen(true);
    resetForm();
  };

  const handleAddMemberModalClose = () => {
    setIsAddTeamMemberModalOpen(false);
  };

  const handleEditMemberModalClose = () => {
    setIsEditTeamMember(false);
    setIsEditTeamMemberId("");
    setIsEditTeamRole(false);
  };

  const handleManageTeamMemberModalClose = () => {
    setIsEditTeamMember(false);
    setIsEditTeamMemberId("");
    setIsEditTeamRole(false);
  };

  const handleDeleteCloseConfirmationModal = () => {
    setShowDeleteConfirmationModal(false);
    setSelectedMemberId("");
  };

  const handleDeleteConfirmation = async () => {
    setBtnLoading(true);
    try {
      const response = await sdk.deleteTeamMember({ id: selectedMemberId });
      if (response?.deleteTeamMember) {
        setData((prev) =>
          prev.filter((item) => item._id !== selectedMemberId)
        );
      }
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setBtnLoading(false);
      setShowDeleteConfirmationModal(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return data.filter((member) => {
      const roleOk =
        roleFilter === "all" || roleMatches(member, roleFilter);
      const haystack = [
        memberName(member),
        member.email,
        member.phone,
        roleLabel(member.role),
        statusLabel(member.onboardingStatus as UserStatus),
      ]
        .join(" ")
        .toLowerCase();
      return roleOk && (!search || haystack.includes(search));
    });
  }, [data, query, roleFilter]);

  const columnHelper = createColumnHelper<TeamsRowType>();
  const columns: ColumnDef<TeamsRowType, any>[] = useMemo(
    () => [
      columnHelper.accessor("firstName", {
        header: "Member",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          const name = memberName(row.original);
          return (
            <div className="flex flex-col">
              <DataTableTextCell value={name} className="font-semibold" />
              <span className="text-[12px] text-owner-fg-4">
                {row.original.email || "No email"}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("role", {
        header: "Role",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge tone={roleTone(row.original.role)}>
            {roleLabel(row.original.role)}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "permissions",
        header: "Permissions",
        cell: ({ row }) => {
          const isActive =
            (row.original.onboardingStatus as UserStatus) === UserStatus.Active;
          return (
            <DataTableTextCell
              value={isActive ? "Workspace access" : "Pending invite"}
            />
          );
        },
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.phone || "N/A"} />
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.onboardingStatus as UserStatus;
          return <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>;
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const member = row.original;
          const isActive =
            (member.onboardingStatus as UserStatus) === UserStatus.Active;
          return (
            <TooltipProvider>
              <div className="flex items-center justify-center gap-3">
                {isActive ? (
                  <>
                    <Tooltip>
                      <TooltipTrigger>
                        <MdOutlineEdit
                          className="text-primary text-lg cursor-pointer"
                          onClick={() => onEditRole(member._id ?? "")}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white max-w-xs">
                        <p>Edit role</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <MdOutlineManageAccounts
                          className="text-primary text-lg cursor-pointer"
                          onClick={() => onEditPermissions(member._id ?? "")}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white max-w-xs">
                        <p>Edit permissions</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : null}
                <Tooltip>
                  <TooltipTrigger>
                    <MdDeleteOutline
                      className="text-primary text-lg cursor-pointer"
                      onClick={() => handleDeleteMember(member._id ?? "")}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>Delete member</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper]
  );

  return (
    <div className="min-w-0">
      <Joyride
        steps={[
          {
            title: "Welcome to Team",
            content:
              "Manage team members and assign permissions so each user can access only the areas they need.",
            target: "body",
            placement: "center",
          },
          {
            title: "Create Team Member",
            content:
              "Use the add action here to invite a team member and choose their role and permissions.",
            target: "#team",
            placement: "top",
          },
        ]}
        scrollToFirstStep
        run={showWalkthrough && !loading && !loadingMeUser}
        continuous
        disableCloseOnEsc
        disableScrolling
        disableOverlayClose
        hideCloseButton
        callback={async (joyrideData) => {
          const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
          if (finishedStatuses.includes(joyrideData.status) && meUser) {
            setShowWalkthrough(false);
            useUserStore
              .getState()
              .markWalkthroughCompleteLocal(WalkthroughKey.Teams);
            try {
              await sdk.MarkWalkthroughDone({
                input: { walkthrough: WalkthroughKey.Teams },
              });
            } catch (error) {
              setToastData({
                message: extractErrorMessage(error),
                type: "error",
              });
            }
          }
        }}
        tooltipComponent={CustomJoyrideTooltip}
      />

      <PageHeader
        title="Teams"
        subtitle={`Invite ${hostLabel.lower} team members, assign roles, and keep permissions aligned with the current workspace.`}
        actions={
          <OwnerButton leadingIcon={<UserPlus size={16} />} onClick={handleAddMember}>
            Invite member
          </OwnerButton>
        }
      />

      <div className="mb-3 flex justify-end">
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
          className="h-10 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[14px] font-medium text-owner-fg-2 shadow-owner-sm"
        >
          <option value="all">All roles</option>
          <option value="Owner">Owner</option>
          <option value="Manager">Manager</option>
          <option value="Marketing">Marketing</option>
          <option value="Staff">Door staff</option>
        </select>
      </div>

      <div className="mb-6">
        <DataTable
          totalRows={filteredMembers.length}
          columns={columns}
          data={filteredMembers}
          loading={loading}
          manualPagination={false}
          hideDownloadButton
          pageSize={10}
          searchFilter={query}
          setSearchFilter={setQuery}
          addClickHandler={handleAddMember}
        />
      </div>

      <ReusableModal
        isOpen={showDeleteConfirmationModal}
        onClose={handleDeleteCloseConfirmationModal}
        title="Are you sure?"
        comments={availableCaption}
      >
        <div className="flex justify-end">
          <OwnerButton
            variant="danger"
            disabled={btnLoading}
            onClick={handleDeleteConfirmation}
          >
            {btnLoading ? "Deleting..." : "Yes, delete"}
          </OwnerButton>
        </div>
      </ReusableModal>

      <FullPageModal
        actionButtonLabel=""
        onActionButtonClick={() => {}}
        isOpen={isAddTeamMemberModalOpen}
        title="Add Team Member"
        onClose={handleAddMemberModalClose}
      >
        <div className="flex justify-center">
          <AddTeamMemberForm />
        </div>
      </FullPageModal>

      <ReusableModal
        width="ml"
        isOpen={isEditTeamMember && isEditTeamRole}
        title="Edit Team Member Role"
        onClose={handleEditMemberModalClose}
      >
        <div className="flex h-full justify-center">
          <EditTeamMemberRoleForm />
        </div>
      </ReusableModal>

      <FullPageModal
        actionButtonLabel=""
        onActionButtonClick={() => {}}
        isOpen={isEditTeamMember && !isEditTeamRole}
        title="Edit Team Member Permissions"
        onClose={handleManageTeamMemberModalClose}
      >
        <div className="flex justify-center">
          <EditTeamMemberPermissionForm />
        </div>
      </FullPageModal>
    </div>
  );
};

Teams.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default Teams;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  const tokenExists = cookieHeader.includes("accessToken=");

  if (!tokenExists) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const [userResponse, journeyResponse] = await Promise.all([
      sdk.MeCheckUser(
        {},
        {
          cookie: context.req.headers.cookie?.toString() ?? "",
        }
      ),
      sdk.MeUserJourney(
        {},
        {
          cookie: context.req.headers.cookie?.toString() ?? "",
        }
      ),
    ]);

    const journey = journeyResponse.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }

    const _vGate = verificationGateRedirect(journey);
    if (_vGate) return _vGate;

    if (userResponse?.meUser) {
      const { _id, firstName, status, permissions } = userResponse.meUser;
      const canAccessMenu = hasAccess(
        permissions,
        PermissionTypeEnum.TeamManagement
      );

      if (!canAccessMenu) {
        return {
          redirect: {
            destination: `/account/access-blocked?target=${PermissionTypeEnum.TeamManagement}`,
            permanent: false,
          },
        };
      }

      return {
        props: {
          repo: {
            _id,
            firstName,
            status,
          } satisfies UserRepo,
        },
      };
    }

    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
