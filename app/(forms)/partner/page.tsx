import type { Metadata } from "next";
import ConversationalForm from "@/components/forms/ConversationalForm";

export const metadata: Metadata = {
  title: { absolute: "Partner with Hoizr" },
  description: "See how Hoizr can support your next drop — ticketing, fan CRM, guestlists, and the door.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/partner" },
};

export default function PartnerPage() {
  return <ConversationalForm formType="partner" />;
}
