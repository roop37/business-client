import { Availability } from "@/components/common/timingAvailibility/interface";
import {
  BeverageCategory,
  DeliveryZone,
  FoodType,
  MeatType,
  RestaurantCategory,
} from "@/generated/graphql";
import { create } from "zustand";

interface OnlineOrderTimingConfig {
  startAfterMinutes: number | null | undefined;
  endBeforeMinutes: number | null | undefined;
}

interface FulfillmentConfig {
  prepTime: number | null | undefined;
  largeOrderTreshold: number | null | undefined;
  largeOrderExtraTime: number | null | undefined;
  deliveryTime: number | null | undefined;
}

interface DeliveryConfig {
  provideDelivery: boolean | null | undefined;
  deliveryZone: DeliveryZone[] | null | undefined;
}

interface HostConfigs {
  pickup: boolean | null | undefined;
  onlineOrdering: boolean | null | undefined;
  allowTips: boolean | null | undefined;
  scheduleOrders: boolean | null | undefined;
  showItemFilters: boolean | null | undefined;
  giftCardEnabled: boolean | null | undefined;
}
type HostEditForm = {
  id: string;
  setId: (name: string) => void;

  //STEP 1
  hostName: string;
  setHostName: (name: string) => void;
  brandingLogo: string;
  setBrandingLogo: (name: string) => void;
  hostWebsite: string;
  setHostWebsite: (website: string) => void;
  hostType: string;
  setHostType: (type: string) => void;
  hostCategory: RestaurantCategory[];
  setHostCategory: (category: RestaurantCategory[]) => void;
  dineInCapacity: string;
  setDineInCapacity: (capacity: string) => void;

  cuisine: { id: string; value: string }[];
  setCuisine: (cuisine: { id: string; value: string }[]) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;

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
  cords: [number, number];
  setCords: (coords: [number, number]) => void;
  timeZone: { id: string; value: string } | null;
  setTimeZone: (timezone: { id: string; value: string } | null) => void;
  availabilityHours: Availability[];
  setAvailabilityHours: (hours: Availability[]) => void;

  //STEP 3
  instagramLink: string;
  setInstagramLink: (link: string) => void;
  facebookLink: string;
  setFacebookLink: (link: string) => void;
  googleMapsLink: string;
  setGoogleMapsLink: (link: string) => void;

  beverageCategory: BeverageCategory[];
  setBeverageCategory: (category: BeverageCategory[]) => void;
  foodType: FoodType[];
  setFoodType: (type: FoodType[]) => void;
  meatType?: MeatType;
  setMeatType: (type: MeatType) => void;

  //STEP 4 - Online Order Timing Configuration
  onlineOrderTimingConfig: OnlineOrderTimingConfig;
  setOnlineOrderTimingConfig: (config: OnlineOrderTimingConfig) => void;

  //STEP 5 - Fulfillment Configuration
  fulfillmentConfig: FulfillmentConfig;
  setFulfillmentConfig: (config: FulfillmentConfig) => void;

  //STEP 6 - Delivery and Host Configurations
  deliveryConfig: DeliveryConfig;
  setDeliveryConfig: (config: DeliveryConfig) => void;
  hostConfigs: HostConfigs;
  setHostConfigs: (config: HostConfigs) => void;

  isHostBasicEdit: boolean;
  setIsHostBasicEdit: (isHostAvaibiltyEdit: boolean) => void;
  isHostAvaibiltyEdit: boolean;
  setIsHostAvaibiltyEdit: (isHostAvaibiltyEdit: boolean) => void;
  isHostAdditionalEdit: boolean;
  setIsHostAdditionalEdit: (isHostAdditionalEdit: boolean) => void;

  reset: () => void;
};

const HostEditStore = create<HostEditForm>((set) => ({
  id: "",
  setId: (_id) => set({ id: _id }),

  //STEP 1
  hostName: "",
  setHostName: (name) => set({ hostName: name }),
  brandingLogo: "",
  setBrandingLogo: (name) => set({ brandingLogo: name }),
  hostWebsite: "",
  setHostWebsite: (website) => set({ hostWebsite: website }),
  hostType: "",
  setHostType: (type) => set({ hostType: type }),
  hostCategory: [],
  setHostCategory: (category) => set({ hostCategory: category }),
  dineInCapacity: "",
  setDineInCapacity: (capacity) => set({ dineInCapacity: capacity }),

  cuisine: [],
  setCuisine: (cuisine) => set({ cuisine }),
  email: "",
  setEmail: (email) => set({ email }),
  phone: "",
  setPhone: (phone) => set({ phone }),

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
  timeZone: null,
  setTimeZone: (timeZone) => set({ timeZone }),
  availabilityHours: [],
  setAvailabilityHours: (hours) => set({ availabilityHours: hours }),

  //STEP 3
  instagramLink: "",
  setInstagramLink: (link) => set({ instagramLink: link }),
  facebookLink: "",
  setFacebookLink: (link) => set({ facebookLink: link }),
  googleMapsLink: "",
  setGoogleMapsLink: (link) => set({ googleMapsLink: link }),

  beverageCategory: [],
  setBeverageCategory: (category) => set({ beverageCategory: category }),
  foodType: [],
  setFoodType: (type) => set({ foodType: type }),
  meatType: undefined,
  setMeatType: (type) => set({ meatType: type }),

  //STEP 4 - Online Order Timing Configuration
  onlineOrderTimingConfig: {
    startAfterMinutes: 0,
    endBeforeMinutes: 30,
  },
  setOnlineOrderTimingConfig: (config) =>
    set({ onlineOrderTimingConfig: config }),

  //STEP 5 - Fulfillment Configuration
  fulfillmentConfig: {
    prepTime: 25,
    largeOrderTreshold: 75,
    largeOrderExtraTime: 25,
    deliveryTime: 45,
  },
  setFulfillmentConfig: (config) => set({ fulfillmentConfig: config }),

  //STEP 6 - Delivery and Host Configurations
  deliveryConfig: {
    provideDelivery: false,
    deliveryZone: [],
  },
  setDeliveryConfig: (config) => set({ deliveryConfig: config }),

  hostConfigs: {
    pickup: false,
    allowTips: false,
    onlineOrdering: false,
    scheduleOrders: false,
    showItemFilters: true,
    giftCardEnabled: true,
  },
  setHostConfigs: (config) => set({ hostConfigs: config }),

  isHostBasicEdit: false,
  setIsHostBasicEdit: (bol: boolean) =>
    set({ isHostBasicEdit: bol }),

  isHostAvaibiltyEdit: false,
  setIsHostAvaibiltyEdit: (bol: boolean) =>
    set({ isHostAvaibiltyEdit: bol }),

  isHostAdditionalEdit: false,
  setIsHostAdditionalEdit: (bol: boolean) =>
    set({ isHostAdditionalEdit: bol }),

  reset: () => set(initialState),
}));

//INITIAL RESET VALUES
const initialState: HostEditForm = {
  id: "",
  setId: (_id) => {},

  //STEP 1
  hostName: "",
  setHostName: (name) => {},
  brandingLogo: "",
  setBrandingLogo: (logo) => {},
  hostWebsite: "",
  setHostWebsite: (website) => {},
  hostType: "",
  setHostType: (type) => {},
  hostCategory: [],
  setHostCategory: (category) => {},
  dineInCapacity: "",
  setDineInCapacity: (capacity) => {},

  cuisine: [],
  setCuisine: (cuisine) => {},
  email: "",
  setEmail: (email) => {
    email;
  },
  phone: "",
  setPhone: (phone) => {
    phone;
  },

  //STEP 2
  addressLine1: "",
  setAddressLine1: (address) => {},
  addressLine2: "",
  setAddressLine2: (address) => {},
  city: "",
  setCity: (city) => {},
  state: null,
  setState: (state) => {},
  zipcode: 0,
  setZipcode: (zipcode) => {},
  place: { displayName: "", placeId: "" },
  setPlace: (place) => {},
  cords: [0, 0],
  setCords: (cords) => {},
  timeZone: null,
  setTimeZone: (timeZone) => {},
  availabilityHours: [],
  setAvailabilityHours: (hours) => {},

  //STEP 3
  instagramLink: "",
  setInstagramLink: (link) => {},
  facebookLink: "",
  setFacebookLink: (link) => {},
  googleMapsLink: "",
  setGoogleMapsLink: (link) => {},

  beverageCategory: [],
  setBeverageCategory: (category) => {},
  foodType: [],
  setFoodType: (type) => {},
  meatType: undefined,
  setMeatType: (type) => {},
  //STEP 4 - Online Order Timing Configuration
  onlineOrderTimingConfig: {
    startAfterMinutes: 0,
    endBeforeMinutes: 30,
  },
  setOnlineOrderTimingConfig: (config) => {},

  //STEP 5 - Fulfillment Configuration
  fulfillmentConfig: {
    prepTime: 25,
    largeOrderTreshold: 75,
    largeOrderExtraTime: 25,
    deliveryTime: 45,
  },
  setFulfillmentConfig: (config) => {},

  //STEP 6 - Delivery and Host Configurations
  deliveryConfig: {
    provideDelivery: false,
    deliveryZone: [],
  },
  setDeliveryConfig: (config) => {},

  hostConfigs: {
    pickup: false,
    allowTips: false,
    onlineOrdering: false,
    scheduleOrders: false,
    showItemFilters: true,
    giftCardEnabled: true,
  },
  setHostConfigs: (config) => {},

  isHostBasicEdit: false,
  setIsHostBasicEdit: () => {},

  isHostAvaibiltyEdit: false,
  setIsHostAvaibiltyEdit: () => {},

  isHostAdditionalEdit: false,
  setIsHostAdditionalEdit: () => {},

  reset: () => {},
};

export default HostEditStore;
