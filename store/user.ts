import { PermissionTypeEnum, WalkthroughKey } from "@/generated/graphql";
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
  completedWalkthroughs: WalkthroughKey[];
};

type UserStoreState = {
  meUser: MeUserData | null;
  setMeUser: (data: MeUserData | null) => void;
  markWalkthroughCompleteLocal: (key: WalkthroughKey) => void;
};

const useUserStore = create<UserStoreState>((set) => ({
  meUser: null,
  setMeUser: (data: MeUserData | null) => set({ meUser: data }),
  markWalkthroughCompleteLocal: (key: WalkthroughKey) =>
    set((state) => {
      if (!state.meUser) return state;
      if (state.meUser.completedWalkthroughs.includes(key)) return state;
      return {
        meUser: {
          ...state.meUser,
          completedWalkthroughs: [...state.meUser.completedWalkthroughs, key],
        },
      };
    }),
}));

export default useUserStore;
