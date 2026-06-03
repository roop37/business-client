import { AddressInfo, HostType } from "@/generated/graphql";
import { create } from "zustand";

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
  hostLogo: string;
  setHostLogo: (res: string) => void;
  hostAddress: AddressInfo | null;
  setHostAddress: (res: AddressInfo) => void;

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
  hostLogo: "",
  setHostLogo: (logo) => set({ hostLogo: logo }),
  hostAddress: null,
  setHostAddress: (address) => set({ hostAddress: address }),

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
}));

export default useHostsStore;
