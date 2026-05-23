import { create } from "zustand";

type UserManagementState = {
    isAddTeamMemberModalOpen: boolean;
    setIsAddTeamMemberModalOpen: (open: boolean) => void;

    isEditTeamMember: boolean;
    setIsEditTeamMember: (edit: boolean) => void;

    isEditHostTeamMember: boolean;
    setisEditHostTeamMember: (edit: boolean) => void;

    isEditTeamMemberId: string | null;
    setIsEditTeamMemberId: (id: string | null) => void;

    isEditTeamRole: boolean;
    setIsEditTeamRole: (editRole: boolean) => void;

    resetEditStates: () => void;
};

const useUserManagementStore = create<UserManagementState>((set) => ({
    isAddTeamMemberModalOpen: false,
    setIsAddTeamMemberModalOpen: (open: boolean) =>
        set({ isAddTeamMemberModalOpen: open }),

    isEditTeamMember: false,
    setIsEditTeamMember: (edit: boolean) =>
        set({ isEditTeamMember: edit }),

    isEditHostTeamMember: false,
    setisEditHostTeamMember: (edit: boolean) =>
        set({ isEditHostTeamMember: edit }),

    isEditTeamMemberId: null,
    setIsEditTeamMemberId: (id: string | null) =>
        set({ isEditTeamMemberId: id }),

    isEditTeamRole: false,
    setIsEditTeamRole: (editRole: boolean) =>
        set({ isEditTeamRole: editRole }),

    resetEditStates: () =>
        set({
            isEditTeamMember: false,
            isEditTeamMemberId: null,
            isEditTeamRole: false,
        }),
}));

export default useUserManagementStore;
