import { create } from "zustand";

type UpdateState = {
  update: boolean;
  setUpdate: (data: boolean) => void;
};

const useStateUpdateStore = create<UpdateState>((set) => ({
  update: true,
  setUpdate: (data: boolean) => set({ update: data }),
}));

export default useStateUpdateStore;
