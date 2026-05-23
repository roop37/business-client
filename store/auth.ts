import { create } from "zustand";

type AuthStates = {
  userId: string;
  _id: string;
  firstName: string;
  lastName: string;
  status: string;
  email: string;
  phone: string;
  taxRate: { id: string, name: string, salesTax: number } | null;

  setUserId: (e: string) => void;
  setUser_Id: (e: string) => void;
  setFirstName: (e: string) => void;
  setLastName: (e: string) => void;
  setStatus: (e: string) => void;
  setEmail: (e: string) => void;
  setPhone: (e: string) => void;
  setTaxRate: (e: { id: string, name: string, salesTax: number }) => void;

};

const useAuthStore = create<AuthStates>((set) => ({
  userId: "",
  _id: "",
  firstName: "",
  lastName: "",
  status: "",
  email: "",
  phone: "",
  taxRate: null,


  setUserId: (e: string) => set({ userId: e }),
  setUser_Id: (e: string) => set({ _id: e }),
  setFirstName: (e: string) => set({ firstName: e }),
  setLastName: (e: string) => set({ lastName: e }),
  setStatus: (e: string) => set({ status: e }),
  setEmail: (e: string) => set({ email: e }),
  setPhone: (e: string) => set({ phone: e }),
  setTaxRate: (e: { id: string, name: string, salesTax: number }) => set({ taxRate: e }),

}));

export default useAuthStore;
