// Pure data + visible() predicates. No React. Copy follows the design
// MD's conversational tone + Hoizr brand contact canon.
import type { FormAnswers } from "./schema";

export type StepType =
  | "welcome"
  | "single-choice"
  | "multi-choice"
  | "text"
  | "textarea"
  | "multi-question"
  | "statement"
  | "review"
  | "success";

export type StepOption = { label: string; value: string; description?: string };

export type FormStep = {
  id: string;
  type: StepType;
  section?: string; // eyebrow
  question?: string;
  hint?: string;
  fieldKey?: string; // single-field steps
  fields?: string[]; // multi-question: schema keys
  options?: StepOption[];
  placeholder?: string;
  cta?: string; // continue-button label override
  optional?: boolean; // choice/text steps that may be skipped
  // success-step copy:
  successTitle?: string;
  successBody?: string;
  visible?: (answers: FormAnswers) => boolean;
};

const opts = (...labels: string[]): StepOption[] =>
  labels.map((label) => ({ label, value: label }));

const bigCrowd = (a: FormAnswers) => a.crowdSize === "700+";
const smallCrowd = (a: FormAnswers) => a.crowdSize !== "700+";

export const JOURNEYS: Record<"onboarding" | "partner", FormStep[]> = {
  onboarding: [
    {
      id: "welcome",
      type: "welcome",
      section: "Hoizr for organizers",
      question: "Run your events like a real nightlife brand.",
      hint: "Tell us what you're building. We'll shape the right Hoizr setup around it — under a minute.",
      cta: "Start",
    },
    {
      id: "who",
      type: "single-choice",
      section: "Identity",
      question: "Who are you building for?",
      fieldKey: "role",
      options: opts("Organizer", "Venue", "Promoter", "Artist", "Agency", "College / IP", "Other"),
    },
    {
      id: "creates",
      type: "single-choice",
      section: "Identity",
      question: "What kind of experiences do you usually create?",
      fieldKey: "createsWhat",
      options: opts("Club nights", "Concerts", "Comedy shows", "Pop-ups", "Private invite-only", "College events", "Festival-scale"),
    },
    {
      id: "city",
      type: "text",
      section: "Reach",
      question: "Which city do most of your nights run in?",
      hint: "Example: Mumbai, Pune, Bangalore.",
      fieldKey: "city",
      placeholder: "Mumbai",
    },
    {
      id: "frequency",
      type: "single-choice",
      section: "Reach",
      question: "How often do you put on events?",
      fieldKey: "frequency",
      options: opts("Every week", "A few times a month", "Monthly", "A few times a year", "One-offs"),
    },
    {
      id: "crowd",
      type: "single-choice",
      section: "Reach",
      question: "What's your usual crowd size?",
      fieldKey: "crowdSize",
      options: opts("Under 100", "100–300", "300–700", "700+"),
    },
    {
      id: "pain",
      type: "single-choice",
      section: "The problem",
      question: "What's your biggest pain right now?",
      hint: "Pick the one that stings most.",
      fieldKey: "pain",
      options: opts("Ticketing commission", "Guestlist chaos", "No repeat audience", "Promoter tracking", "Slow settlements", "Door check-in", "Marketing"),
    },
    {
      id: "contact",
      type: "multi-question",
      section: "You",
      question: "Where should we reach you?",
      hint: "A real human follows up within one working day.",
      fields: ["name", "email", "phone", "instagram"],
    },
    { id: "review", type: "review", section: "Review", question: "Look right?" },
    {
      id: "success-self",
      type: "success",
      successTitle: "You're on the list.",
      successBody: "We've got your details. A real human will reach out within one working day with the fastest path onto Hoizr.",
      visible: smallCrowd,
    },
    {
      id: "success-sales",
      type: "success",
      successTitle: "Let's talk properly.",
      successBody: "Events at your scale get white-glove onboarding. Our team will reach out personally within one working day to set you up.",
      visible: bigCrowd,
    },
  ],
  partner: [
    {
      id: "welcome",
      type: "welcome",
      section: "Partner with Hoizr",
      question: "Let's see how Hoizr can support your next drop.",
      hint: "This takes less than a minute.",
      cta: "Start",
    },
    {
      id: "fix",
      type: "single-choice",
      section: "The problem",
      question: "What are you trying to fix first?",
      fieldKey: "fixFirst",
      options: opts("Lower commission", "Faster settlements", "Own customer data", "Guestlist", "Promoter tracking", "Door ops", "Marketing"),
    },
    {
      id: "scale",
      type: "single-choice",
      section: "Scale",
      question: "How big is your usual event?",
      fieldKey: "eventScale",
      options: opts("Under 100", "100–300", "300–700", "700+"),
    },
    {
      id: "contact",
      type: "multi-question",
      section: "You",
      question: "Where should we reach you?",
      fields: ["name", "email", "phone", "company"],
    },
    {
      id: "message",
      type: "textarea",
      section: "You",
      question: "Anything you want us to know?",
      hint: "One line is enough. Optional.",
      fieldKey: "message",
      placeholder: "We run 4 club nights a month across Mumbai and Pune…",
      optional: true,
    },
    { id: "review", type: "review", section: "Review", question: "Look right?" },
    {
      id: "success",
      type: "success",
      successTitle: "Got it — we'll be in touch.",
      successBody: "A real human will follow up within one working day. Need us sooner? Reach out below.",
    },
  ],
};
