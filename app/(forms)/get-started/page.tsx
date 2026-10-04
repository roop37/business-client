import type { Metadata } from "next";
import ConversationalForm from "@/components/forms/ConversationalForm";

export const metadata: Metadata = {
  title: { absolute: "Get started with Hoizr" },
  description: "Tell us what you're building. We'll shape the right Hoizr setup for your events.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/get-started" },
};

export default function GetStartedPage() {
  return <ConversationalForm formType="onboarding" />;
}
