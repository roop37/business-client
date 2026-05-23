import { UserStatus } from "@/generated/graphql";

export type TeamsRowType = {
  _id?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
  onboardingStatus: string;
};
