import { create } from "zustand";

// Hoizr host onboarding store. Filename kept for backwards compatibility — the
// store now models a Host (Venue or Event Organizer), not a restaurant.

type HostOnboardingStates = {
  id: string;
  setId: (name: string) => void;

  // STEP 1 — Host type
  hostType: string;
  setHostType: (type: string) => void;
  venueType: string;
  setVenueType: (type: string) => void;

  // STEP 2 — Basic info
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  description: string;
  setDescription: (description: string) => void;
  logo: string;
  setLogo: (logo: string) => void;

  // STEP 3 — Address
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

  // STEP 4 — Additional details (all optional)
  businessRegistrationNumber: string;
  setBusinessRegistrationNumber: (value: string) => void;
  averageEventSize: string;
  setAverageEventSize: (size: string) => void;
  gstNumber: string;
  setGstNumber: (gst: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
};

const HostOnboardingStore = create<HostOnboardingStates>((set) => ({
  id: "",
  setId: (_id) => set({ id: _id }),

  // STEP 1
  hostType: "",
  setHostType: (type) => set({ hostType: type }),
  venueType: "",
  setVenueType: (type) => set({ venueType: type }),

  // STEP 2
  name: "",
  setName: (name) => set({ name }),
  email: "",
  setEmail: (email) => set({ email }),
  phone: "",
  setPhone: (phone) => set({ phone }),
  description: "",
  setDescription: (description) => set({ description }),
  logo: "",
  setLogo: (logo) => set({ logo }),

  // STEP 3
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

  // STEP 4
  businessRegistrationNumber: "",
  setBusinessRegistrationNumber: (businessRegistrationNumber) =>
    set({ businessRegistrationNumber }),
  averageEventSize: "",
  setAverageEventSize: (size) => set({ averageEventSize: size }),
  gstNumber: "",
  setGstNumber: (gst) => set({ gstNumber: gst }),
  websiteUrl: "",
  setWebsiteUrl: (url) => set({ websiteUrl: url }),
}));

export default HostOnboardingStore;
