import { create } from "zustand";

type ProfileStates = {
  id: string;
  setid: (e: string) => void;

  // STEP 1
  businessType: string;
  setBusinessType: (e: string) => void;
  businessName: string;
  setBusinessName: (e: string) => void;

  dob: Date | null;
  setdob: (e: Date | null) => void;

  //STEP 2
  addressLine1: string;
  setAddressLine1: (address: string) => void;
  addressLine2: string;
  setAddressLine2: (address: string) => void;
  city: string;
  setCity: (city: string) => void;
  state: { id: string; value: string } | null;
  setState: (state: { id: string; value: string } | null) => void;
  zipcode: number;
  setZipcode: (zipcode: number) => void;
  place: { displayName: string; placeId: string };
  setPlace: (place: { displayName: string; placeId: string }) => void;
  cords: number[];
  setCords: (coords: number[]) => void;

  // //STEP 3
  // ein: string;
  // setEin: (location: string) => void;
};

const useProfileStore = create<ProfileStates>((set) => ({
  id: "",
  setid: (e: string) => set({ id: e }),

  // STEP 1
  businessType: "",
  setBusinessType: (e: string) => set({ businessType: e }),
  businessName: "",
  setBusinessName: (e: string) => set({ businessName: e }),

  dob: null,
  setdob: (e: Date | null) => set({ dob: e }),

  //STEP 2
  addressLine1: "",
  setAddressLine1: (address) => set({ addressLine1: address }),
  addressLine2: "",
  setAddressLine2: (address) => set({ addressLine2: address }),
  city: "",
  setCity: (city) => set({ city }),
  state: null,
  setState: (state) => set({ state }),
  zipcode: 0,
  setZipcode: (zipcode) => set({ zipcode }),
  place: { displayName: "", placeId: "" },
  setPlace: (place) => set({ place }),
  cords: [0, 0],
  setCords: (cords) => set({ cords }),

  // //STEP 3
  // ein: "",
  // setEin: (ein) => set({ ein }),
}));

export default useProfileStore;
