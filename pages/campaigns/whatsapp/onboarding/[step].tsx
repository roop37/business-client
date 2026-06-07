import NotFound from "@/components/common/notFound/notFound";
import OnboardingCampaignLayout from "@/components/layouts/campaignOnboarding";
import WhatsAppAudience from "@/components/modules/whatsappOnboarding/audience";
import WhatsAppBasicDetails from "@/components/modules/whatsappOnboarding/basicDetails";
import WhatsAppContentVariables from "@/components/modules/whatsappOnboarding/contentVariables";
import WhatsAppSchedule from "@/components/modules/whatsappOnboarding/schedule";
import WhatsAppTemplateSelect from "@/components/modules/whatsappOnboarding/templateSelect";
import { GetServerSideProps } from "next";

/**
 * Route hub for the WhatsApp campaign builder wizard.
 *
 * URL                                                Step
 * ─────────────────────────────────────────────────  ────────────────────────────
 * /campaigns/whatsapp/onboarding/basic               Step 1 — name + objective tag
 * /campaigns/whatsapp/onboarding/template-select     Step 2 — pick approved template
 * /campaigns/whatsapp/onboarding/template-edit       Step 3 — fill variables + media + CTA
 * /campaigns/whatsapp/onboarding/template-target     Step 4 — audience
 * /campaigns/whatsapp/onboarding/schedule            Step 5 — now / later → publish
 *
 * Steps share cross-step state through useWhatsAppCampaignStore so a
 * back/forward navigation preserves all draft fields. Each step
 * persists its slice to the server before advancing — refreshing the
 * tab mid-build doesn't lose progress beyond the current step.
 */

type WhatsAppOnboardingRepo = {
  step: string;
};

const STEP_MAP: Record<string, JSX.Element> = {
  basic: <WhatsAppBasicDetails />,
  "template-select": <WhatsAppTemplateSelect />,
  "template-edit": <WhatsAppContentVariables />,
  "template-target": <WhatsAppAudience />,
  schedule: <WhatsAppSchedule />,
};

const WhatsAppOnboardingPage = ({
  repo,
}: {
  repo?: WhatsAppOnboardingRepo;
}) => {
  const child = repo?.step ? STEP_MAP[repo.step] : null;
  return (
    <OnboardingCampaignLayout>
      {child ?? <NotFound />}
    </OnboardingCampaignLayout>
  );
};

export default WhatsAppOnboardingPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }
  const step = Array.isArray(context.params?.step)
    ? context.params?.step[0]
    : (context.params?.step as string | undefined);
  return {
    props: {
      repo: { step: step ?? "basic" },
    },
  };
};
