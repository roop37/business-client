import React, { ReactNode } from "react";
import OnboardingJourneyLayout from "./onboardingJourneyLayout";

const OnboardingRestaurantLayout = ({ children }: { children: ReactNode }) => {
  return <OnboardingJourneyLayout>{children}</OnboardingJourneyLayout>;
};

export default OnboardingRestaurantLayout;
