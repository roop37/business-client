import { OwnerButton, PageHeader } from "@/components/common/owner";
import DevelopersTabs from "@/components/developers/DevelopersTabs";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { GetServerSideProps } from "next";
import { Check } from "lucide-react";
import React, { useEffect, useState } from "react";

const inputCls =
  "w-full rounded-owner-md border border-owner-border bg-white px-3 py-2 text-sm text-owner-fg-1 focus:outline-none focus:ring-2 focus:ring-owner-primary/30";
const labelCls = "block text-xs font-medium text-owner-fg-3 mb-1";

const BENEFITS = [
  "Your brand, your domain — Hoizr stays invisible to your buyers",
  "Your own look on the ticket page, emails, and checkout",
  "All the ticketing, scanning, and payouts you already rely on",
];

const Whitelabel = () => {
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSelectedSideBarMenu("Developers");
  }, [setSelectedSideBarMenu]);

  const submit = async () => {
    if (!orgName.trim() || !contactName.trim() || !email.trim()) {
      setToastData({ type: "error", message: "Organization, name and email are required" });
      return;
    }
    setSending(true);
    try {
      await sdk.CreateWhitelabelRequest({
        input: {
          orgName: orgName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
        },
      });
      setSent(true);
      setToastData({ type: "success", message: "Request sent — our team will reach out" });
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-w-0">
      <DevelopersTabs />
      <PageHeader
        title="Whitelabel"
        subtitle="Run the whole ticketing experience under your own brand. Whitelabel is set up with you one-on-one — tell us about your plans and our team takes it from there."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-owner-lg border border-owner-border bg-owner-bg-2 p-6">
          <h3 className="text-sm font-semibold text-owner-fg-1">What you get</h3>
          <ul className="mt-4 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-owner-fg-1">
                <Check size={16} className="mt-0.5 shrink-0 text-owner-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {sent ? (
          <div className="flex flex-col items-start justify-center rounded-owner-lg border border-owner-border bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-owner-primary/10">
              <Check size={20} className="text-owner-primary" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-owner-fg-1">Request received</h3>
            <p className="mt-1 text-sm text-owner-fg-3">
              Thanks — our team will be in touch shortly at {email}.
            </p>
          </div>
        ) : (
          <div className="rounded-owner-lg border border-owner-border bg-white p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Organization</label>
                <input className={inputCls} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Your name</label>
                <input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Phone (optional)</label>
                <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>What are you looking to build? (optional)</label>
                <textarea className={inputCls} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
            </div>
            <div className="mt-5">
              <OwnerButton onClick={submit} disabled={sending}>
                {sending ? "Sending…" : "Request whitelabel"}
              </OwnerButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Whitelabel.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default Whitelabel;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  try {
    const response = await sdk.MeUserJourney({}, { cookie: cookieHeader });
    const journey = response.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }
    const _vGate = verificationGateRedirect(journey);
    if (_vGate) return _vGate;
    return { props: {} };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};
