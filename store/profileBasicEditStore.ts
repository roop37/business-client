// import { create } from "zustand";

// interface BasicProfileInformation {
//     _id: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     phone: string;
//     twoFactorAuth: boolean;
//     setProfileData: (data: Partial<BasicProfileInformation>) => void;
// }

// export const useBasicProfileStore = create<BasicProfileInformation>((set) => ({
//     _id: "",
//     email: "",
//     firstName: "",
//     lastName: "",
//     phone: "",
//     twoFactorAuth: false,
//     setProfileData: (data) => set((state) => ({ ...state, ...data })),
// }));

import { create } from "zustand";

interface AccountPreferences {
  sms: boolean;
  email: boolean;
  whatsapp: boolean;
}

interface BasicProfileInformation {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  twoFactorAuth: boolean;
  accountPreferences: AccountPreferences;
  setProfileData: (data: Partial<BasicProfileInformation>) => void;
}

export const useBasicProfileStore = create<BasicProfileInformation>((set) => ({
  _id: "",
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  twoFactorAuth: false,
  accountPreferences: { sms: false, email: false, whatsapp: false },
  setProfileData: (data) => set((state) => ({ ...state, ...data })),
}));
