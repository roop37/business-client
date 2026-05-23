import { create } from "zustand";

type GstDetails = {
  gstin: string;
  registeredBusinessName: string;
  gstRegistrationType: string;
};

type OnboardingStates = {
  // STEP 1
  businessName: string;
  setBusinessName: (e: string) => void;
  businessType: string;
  setBusinessType: (e: string) => void;

  businessRegistrationNumber: string;
  setBusinessRegistrationNumber: (e: string) => void;
  businessPhone: string;
  setBusinessPhone: (e: string) => void;
  businessEmail: string;
  setBusinessEmail: (e: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (e: string) => void;
  averageEventSize: string;
  setAverageEventSize: (e: string) => void;
  gstNumber: string;
  setGstNumber: (e: string) => void;

  //STEP 2
  addressLine1: string;
  setAddressLine1: (address: string) => void;
  addressLine2: string;
  setAddressLine2: (address: string) => void;
  city: string;
  setCity: (city: string) => void;
  state: { id: string; value: string } | null;
  setState: (state: { id: string; value: string } | null) => void;
  pincode: string;
  setPincode: (pincode: string) => void;
  place: { displayName: string; placeId: string };
  setPlace: (place: { displayName: string; placeId: string }) => void;
  cords: [number, number];
  setCords: (coords: [number, number]) => void;
};

const useOnboardingStore = create<OnboardingStates>((set) => ({
  // STEP 1
  businessName: "",
  setBusinessName: (e) => set({ businessName: e }),
  businessType: "",
  setBusinessType: (e) => set({ businessType: e }),

  businessRegistrationNumber: "",
  setBusinessRegistrationNumber: (e) => set({ businessRegistrationNumber: e }),
  businessPhone: "",
  setBusinessPhone: (e) => set({ businessPhone: e }),
  businessEmail: "",
  setBusinessEmail: (e) => set({ businessEmail: e }),
  websiteUrl: "",
  setWebsiteUrl: (e) => set({ websiteUrl: e }),
  averageEventSize: "",
  setAverageEventSize: (e) => set({ averageEventSize: e }),
  gstNumber: "",
  setGstNumber: (e) => set({ gstNumber: e }),

  //STEP 2
  addressLine1: "",
  setAddressLine1: (address) => set({ addressLine1: address }),
  addressLine2: "",
  setAddressLine2: (address) => set({ addressLine2: address }),
  city: "",
  setCity: (city) => set({ city }),
  state: null,
  setState: (state) => set({ state }),
  pincode: "",
  setPincode: (pincode) => set({ pincode }),
  place: { displayName: "", placeId: "" },
  setPlace: (place) => set({ place }),
  cords: [0, 0],
  setCords: (cords) => set({ cords }),
}));

export default useOnboardingStore;
