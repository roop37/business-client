import {
  Badge,
  Card,
  OwnerButton,
  OwnerTable,
  PageHeader,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import EmptyStateView from "@/components/common/emptyTableView/emptyTableView";
import FullPageModal from "@/components/common/modal/fullPageModal";
import ReusableModal from "@/components/common/modal/modal";
import CustomJoyrideTooltip from "@/components/joyride";
import MainLayout from "@/components/layouts/mainBodyLayout";
import AddTeamMemberForm from "@/components/modules/userManagement/forms/addTeamMemberForm";
import EditTeamMemberPermissionForm from "@/components/modules/userManagement/forms/editTeamMemberPermissionForm";
import EditTeamMemberRoleForm from "@/components/modules/userManagement/forms/editTeamMemberRoleForm";
import { TeamsRowType } from "@/components/modules/userManagement/interface";
import { PermissionTypeEnum, UserStatus } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import useUserManagementStore from "@/store/userManagement";
import { sdk } from "@/utils/graphqlClient";
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
import {
  Filter,
  Megaphone,
  MoreVertical,
  Pencil,
  ScanLine,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";

type NextPageWithLayout = React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

type UserRepo = {
  _id: string;
  firstName: string;
  status: string;
};

type RoleFilter = "all" | "Owner" | "Manager" | "Marketing" | "Staff";

const roleCards = [
  {
    role: "Owner",
    title: "Owner",
    description: "Full workspace control",
    Icon: ShieldCheck,
    tone: "info" as BadgeTone,
  },
  {
    role: "Manager",
    title: "Manager",
    description: "Events, tickets, and reports",
    Icon: UserCheck,
    tone: "success" as BadgeTone,
  },
  {
    role: "Marketing",
    title: "Marketer",
    description: "Campaigns and audience tools",
    Icon: Megaphone,
    tone: "warning" as BadgeTone,
  },
  {
    role: "Staff",
    title: "Door staff",
    description: "Scanner and check-in access",
    Icon: ScanLine,
    tone: "neutral" as BadgeTone,
  },
];

const walkthroughDone = (userId?: string, tour = "teams") => {
  if (typeof window === "undefined" || !userId) return true;
  return localStorage.getItem(`hoizr.walkthrough.${userId}.${tour}`) === "done";
};

const markWalkthroughDone = (userId?: string, tour = "teams") => {
  if (typeof window === "undefined" || !userId) return;
  localStorage.setItem(`hoizr.walkthrough.${userId}.${tour}`, "done");
};

const memberName = (member: TeamsRowType) =>
  [member.firstName, member.lastName].filter(Boolean).join(" ") ||
  "Unnamed member";

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
    const fetchData = async () => {
      setLoadingMeUser(true);
      try {
        const response = await sdk.MeUser();
        if (response?.meUser) {
          useUserStore.getState().setMeUser(response.meUser);
          setShowWalkthrough(!walkthroughDone(response.meUser._id, "teams"));
        }
      } catch (error) {
        setToastData({ message: extractErrorMessage(error), type: "error" });
      } finally {
        setLoadingMeUser(false);
      }
    };

    fetchData();
  }, [setToastData]);

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

  const roleSummary = useMemo(
    () =>
      roleCards.map((card) => ({
        ...card,
        count: data.filter((member) => roleMatches(member, card.role)).length,
      })),
    [data]
  );

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
            markWalkthroughDone(meUser._id, "teams");
            setShowWalkthrough(false);
          }
        }}
        tooltipComponent={CustomJoyrideTooltip}
      />

      <PageHeader
        title="Teams"
        subtitle="Invite host team members, assign roles, and keep permissions aligned with the current workspace."
        actions={
          <OwnerButton leadingIcon={<UserPlus size={16} />} onClick={handleAddMember}>
            Invite member
          </OwnerButton>
        }
      />

      <div className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleSummary.map(({ title, description, count, Icon, tone }) => (
          <Card key={title} padding={22}>
            <div className="mb-8 flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
                <Icon size={20} />
              </span>
              <span className="text-[28px] font-semibold leading-none text-owner-fg-1 tabular-nums">
                {count}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={tone}>{title}</Badge>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-owner-fg-4">
              {description}
            </p>
          </Card>
        ))}
      </div>

      <OwnerTable
        rowCount={filteredMembers.length}
        loading={loading}
        empty={
          <EmptyStateView
            title="No team members found, start by adding your first team member."
            buttonOnClick={handleAddMember}
            buttonTitle="Invite member"
          />
        }
        className="mb-6"
      >
        <OwnerTable.Toolbar>
          <OwnerTable.SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by member, email, phone, or role"
            className="flex-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <OwnerButton variant="secondary" leadingIcon={<Filter size={16} />}>
              Filter
            </OwnerButton>
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
        </OwnerTable.Toolbar>

        <OwnerTable.Head>
          <OwnerTable.HeaderCell width="32%">Member</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Role</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Permissions</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Last active</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Status</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Actions</OwnerTable.HeaderCell>
        </OwnerTable.Head>

        <OwnerTable.Body>
          {filteredMembers.map((member, index) => {
            const name = memberName(member);
            const status = member.onboardingStatus as UserStatus;
            const isActive = status === UserStatus.Active;
            return (
              <OwnerTable.Row key={member._id || `${member.email}-${index}`}>
                <OwnerTable.Cell>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, hsl(${
                          index * 47
                        }, 70%, 60%), hsl(${index * 47 + 40}, 70%, 50%))`,
                      }}
                    >
                      {initialsFor(name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-owner-fg-1">
                        {name}
                      </div>
                      <div className="mt-1 truncate text-[12px] text-owner-fg-4">
                        {member.email || "No email"}
                      </div>
                    </div>
                  </div>
                </OwnerTable.Cell>
                <OwnerTable.Cell>
                  <Badge tone={roleTone(member.role)}>{roleLabel(member.role)}</Badge>
                </OwnerTable.Cell>
                <OwnerTable.Cell muted>
                  {isActive ? "Workspace access" : "Pending invite"}
                </OwnerTable.Cell>
                <OwnerTable.Cell muted>Not tracked</OwnerTable.Cell>
                <OwnerTable.Cell>
                  <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
                </OwnerTable.Cell>
                <OwnerTable.Cell align="right">
                  <div className="flex justify-end gap-2">
                    {isActive ? (
                      <>
                        <button
                          type="button"
                          aria-label="Edit role"
                          onClick={() => onEditRole(member._id ?? "")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-owner-sm border border-owner-border bg-owner-bg text-owner-fg-3 transition hover:bg-owner-bg-subtle hover:text-owner-blue-500"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label="Edit permissions"
                          onClick={() => onEditPermissions(member._id ?? "")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-owner-sm border border-owner-border bg-owner-bg text-owner-fg-3 transition hover:bg-owner-bg-subtle hover:text-owner-blue-500"
                        >
                          <MoreVertical size={15} />
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      aria-label="Delete member"
                      onClick={() => handleDeleteMember(member._id ?? "")}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-owner-sm border border-owner-border bg-owner-bg text-owner-fg-3 transition hover:bg-owner-danger-bg hover:text-owner-danger-text"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </OwnerTable.Cell>
              </OwnerTable.Row>
            );
          })}
        </OwnerTable.Body>

        <OwnerTable.Footer
          summary={`${filteredMembers.length.toLocaleString("en-IN")} of ${data.length.toLocaleString("en-IN")} members`}
        />
      </OwnerTable>

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
