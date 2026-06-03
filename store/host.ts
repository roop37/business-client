import { AddressInfo, DeliveryZone, EdgeDeviceInfo, HostType } from "@/generated/graphql";
import { create } from "zustand";

interface DeliveryConfig {
  provideDelivery: boolean | null | undefined;
  deliveryZone: DeliveryZone[] | null | undefined;
}

type HostStates = {
  hosts: any[];
  setHosts: (res: any) => void;
  selectedHost: string;
  setSelectedHost: (location: string) => void;
  selectedHostTaxRateId: string;
  setSelectedHostTaxRateId: (tax: string) => void;
  selectedHostId: string;
  setSelectedHostId: (tax: string) => void;
  selectedHostType: HostType | null;
  setSelectedHostType: (type: HostType | null) => void;
  refreshHostChange: boolean;
  setRefreshHostChange: (res: boolean) => void;
  onlineOrderingActive: boolean;
  setOnlineOrderingActive: (res: boolean) => void;
  hostLogo: string;
  setHostLogo: (res: string) => void;
  hostAddress: AddressInfo | null;
  setHostAddress: (res: AddressInfo) => void;

  ////////////////////
  hostAvailability: any[] | null;
  setHostAvailability: (hours: any[]) => void;

  hostEmail: string;
  setHostEmail: (res: string) => void;

  hostPhone: string;
  setHostPhone: (res: string) => void;
  instagramLink: string;
  setInstagramLink: (link: string) => void;
  facebookLink: string;
  setFacebookLink: (link: string) => void;
  googleMapsLink: string;
  setGoogleMapsLink: (link: string) => void;

  timezone: string;
  setTimezone: (timezone: string) => void;

  deliveryConfig?: DeliveryConfig | null;
  setDeliveryConfig: (config?: DeliveryConfig) => void;

  hasEdgeDevice: boolean;
  setHasEdgeDevice: (hasDevice: boolean) => void;
};

const useHostsStore = create<HostStates>((set) => ({
  selectedHost: "",
  setSelectedHost: (selectedHost) => set({ selectedHost }),
  selectedHostTaxRateId: "",
  setSelectedHostTaxRateId: (selectedHostTaxRateId) =>
    set({ selectedHostTaxRateId }),
  selectedHostId: "",
  setSelectedHostId: (selectedHostId) => set({ selectedHostId }),
  selectedHostType: null,
  setSelectedHostType: (selectedHostType) => set({ selectedHostType }),
  hosts: [],
  setHosts: (res) => set({ hosts: res }),
  refreshHostChange: false,
  setRefreshHostChange: (res) => set({ refreshHostChange: res }),
  onlineOrderingActive: false,
  setOnlineOrderingActive: (res) => set({ onlineOrderingActive: res }),
  hostLogo: "",
  setHostLogo: (logo) => set({ hostLogo: logo }),
  hostAddress: null,
  setHostAddress: (address) => set({ hostAddress: address }),

  /////////////////
  hostAvailability: [],
  setHostAvailability: (hours) => set({ hostAvailability: hours }),
  hostEmail: "",
  setHostEmail: (email) => set({ hostEmail: email }),
  hostPhone: "",
  setHostPhone: (phone) => set({ hostPhone: phone }),
  instagramLink: "",
  setInstagramLink: (link) => set({ instagramLink: link }),
  facebookLink: "",
  setFacebookLink: (link) => set({ facebookLink: link }),
  googleMapsLink: "",
  setGoogleMapsLink: (link) => set({ googleMapsLink: link }),

  timezone: "",
  setTimezone: (timezone) => set({ timezone }),

  deliveryConfig: {
    provideDelivery: false,
    deliveryZone: [],
  },
  setDeliveryConfig: (config) => set({ deliveryConfig: config }),

  hasEdgeDevice: false,
  setHasEdgeDevice: (hasDevice) => set({ hasEdgeDevice: hasDevice }),
}));

export default useHostsStore;
