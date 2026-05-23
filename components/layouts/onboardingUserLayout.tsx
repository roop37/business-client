import React, { ReactNode } from "react";
import OnboardingJourneyLayout from "./onboardingJourneyLayout";

const OnboardingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <OnboardingJourneyLayout includeTimezones>
      {children}
    </OnboardingJourneyLayout>
  );
};

export default OnboardingLayout;
