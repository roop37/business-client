import { create } from "zustand";

type MasterStates = {
  statesOptions: { value: string; label: string }[];
  setMasterStates: (res: { value: string; label: string }[]) => void;
  timezonesOptions: any[];
  setMasterTimezones: (res: any) => void;
  cuisinesOptions: { id: string; value: string }[];
  setCuisinesOptions: (res: any) => void;
};

const useMasterStore = create<MasterStates>((set) => ({
  statesOptions: [],
  setMasterStates: (res) => set({ statesOptions: res }),
  timezonesOptions: [],
  setMasterTimezones: (res) => set({ timezonesOptions: res }),
  cuisinesOptions: [],
  setCuisinesOptions: (res) => set({ cuisinesOptions: res })
}));

export default useMasterStore;
