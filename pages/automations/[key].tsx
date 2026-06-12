import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  inrFormat,
} from "@/components/common/owner";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { sdk } from "@/utils/graphqlClient";
import {
  fetchAutomation,
  setAutomationActive,
  setAutomationChannel,
  type AutomationView,
} from "@/utils/automationClient";
import { ArrowLeft, Loader2, Mail, MessageCircle, Bell } from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import CustomSwitch from "@/components/common/customSwitch/customSwitch";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";

const CHANNEL_META: Record<
  string,
  { label: string; icon: React.ReactNode; field: keyof AutomationView }
> = {
  email: { label: "Email", icon: <Mail size={16} />, field: "emailEnabled" },
  whatsapp: {
    label: "WhatsApp",
    icon: <MessageCircle size={16} />,
    field: "whatsappEnabled",
  },
  push: { label: "Push notification", icon: <Bell size={16} />, field: "pushEnabled" },
};

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Never";

const AutomationDetailPage = () => {
  const router = useRouter();
  const key = typeof router.query.key === "string" ? router.query.key : "";
  const [a, setA] = useState<AutomationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const { setToastData } = useGlobalStore();

  useEffect(() => {
    if (!key) return;
    fetchAutomation(key)
      .then(setA)
      .catch(() => setA(null))
      .finally(() => setLoading(false));
  }, [key]);

  const toggleActive = async (next: boolean) => {
    setBusy("active");
    try {
      setA(await setAutomationActive(key, next));
      setToastData({
        type: "success",
        message: next ? "Automation turned on." : "Automation turned off.",
      });
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const toggleChannel = async (channel: string, next: boolean) => {
    setBusy(channel);
    try {
      setA(await setAutomationChannel(key, channel, next));
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-10 text-owner-fg-4">
        <Loader2 className="animate-spin" size={18} /> Loading…
      </div>
    );
  }
  if (!a) {
    return <div className="p-10 text-owner-fg-4">Automation not found.</div>;
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => router.push("/automations")}
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-owner-fg-3 hover:text-owner-fg-1"
      >
        <ArrowLeft size={15} /> Automations
      </button>

      <PageHeader
        title={a.title}
        subtitle={a.description}
        actions={
          <div className="flex items-center gap-2 text-sm">
            <span className="text-owner-fg-3">{a.active ? "Active" : "Off"}</span>
            <CustomSwitch
              checked={a.active}
              disabled={busy === "active"}
              onChange={() => toggleActive(!a.active)}
              label={a.active ? "Turn off" : "Turn on"}
            />
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total sent (lifetime)" value={a.totalSent.toLocaleString("en-IN")} />
        <StatTile label="Conversions" value={a.attributedOrders.toLocaleString("en-IN")} />
        <StatTile label="Revenue attributed" value={inrFormat(a.attributedRevenue)} />
        <StatTile label="Last sent" value={fmtDate(a.lastSentAt)} />
      </div>

      <Card className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-owner-fg-1">Channels</h3>
        <p className="mb-2 text-[13px] text-owner-fg-3">
          Choose how this automation reaches your customers. Only active when the
          automation is on.
        </p>
        {a.channels.map((ch) => {
          const meta = CHANNEL_META[ch];
          if (!meta) return null;
          const enabled = Boolean(a[meta.field]);
          const free = a.freeChannels.includes(ch);
          return (
            <div
              key={ch}
              className="flex items-center justify-between border-t border-owner-border-soft py-3 first:border-t-0"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-owner-md border border-owner-border bg-owner-bg-subtle text-owner-fg-2">
                  {meta.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-owner-fg-1">
                    {meta.label}
                    <Badge tone={free ? "success" : "info"}>
                      {free ? "Free" : "Uses marketing credit"}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-owner-fg-4">
                    {free
                      ? "Included free for your account."
                      : "Each message is charged from your marketing credit."}
                  </p>
                </div>
              </div>
              <CustomSwitch
                checked={enabled}
                disabled={busy === ch}
                onChange={() => toggleChannel(ch, !enabled)}
                label={`${meta.label} ${enabled ? "on" : "off"}`}
              />
            </div>
          );
        })}
      </Card>
    </div>
  );
};

AutomationDetailPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default AutomationDetailPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  try {
    const journeyResponse = await sdk.MeUserJourney({}, { cookie: cookieHeader });
    const journey = journeyResponse.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }
    return { props: {} };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};
