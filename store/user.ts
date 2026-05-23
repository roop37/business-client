import { PermissionTypeEnum, WalkthroughStates } from "@/generated/graphql";
import { create } from "zustand";

// Define types for the API response data
type Permission = {
  status: boolean;
  type: PermissionTypeEnum;
};

type MeUserData = {
  _id: string;
  firstName: string;
  lastName: string;
  status: string;
  email: string;
  phone: string;
  ownerUserId?: string | null;
  permissions: Permission[];
  role: string;
  walkthroughStates: {
    walkthrough: WalkthroughStates;
    status: boolean;
  }[];
};

type UserStoreState = {
  meUser: MeUserData | null;
  setMeUser: (data: MeUserData | null) => void;
};

const useUserStore = create<UserStoreState>((set) => ({
  meUser: null,
  setMeUser: (data: MeUserData | null) => set({ meUser: data }),
}));

export default useUserStore;
