// store/useAddTeamMemberFormStore.ts
import { create } from "zustand";

interface IFormInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: { value: string; label: string } | null;
  restaurant: { value: string; label: string }[];
  sms: boolean;
  emailPref: boolean;
}

interface AddTeamMemberFormState {
  form: IFormInput;
  setFormValue: (field: keyof IFormInput, value: any) => void;
  resetForm: () => void;
}

const useAddTeamMemberFormStore = create<AddTeamMemberFormState>((set) => ({
  form: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: null,
    restaurant: [],
    sms: false,
    emailPref: false,
  },
  setFormValue: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
    })),
  resetForm: () =>
    set({
      form: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: null,
        restaurant: [],
        sms: false,
        emailPref: false,
      },
    }),
}));

export default useAddTeamMemberFormStore;
