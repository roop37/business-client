import { Badge, Card, PageHeader, inrFormat } from "@/components/common/owner";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { sdk } from "@/utils/graphqlClient";
import {
  fetchAutomations,
  setAutomationActive,
  type AutomationView,
} from "@/utils/automationClient";
import { ChevronRight, Workflow } from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Never";

const AutomationsPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<AutomationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    fetchAutomations()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (a: AutomationView, next: boolean) => {
    setBusyKey(a.key);
    try {
      const updated = await setAutomationActive(a.key, next);
      setItems((cur) => cur.map((x) => (x.key === a.key ? updated : x)));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="min-w-0">
      <PageHeader
        title="Automations"
        subtitle="Always-on flows that grow your sales while you focus on the event."
      />

      {loading ? (
        <Card>
          <p className="text-sm text-owner-fg-4">Loading automations…</p>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-owner-fg-4">No automations available yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((a) => (
            <Card key={a.key} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.push(`/automations/${a.key}`)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-owner-md border border-owner-border bg-owner-bg-subtle text-owner-blue-500">
                    <Workflow size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-owner-fg-1">{a.title}</span>
                      <Badge tone={a.active ? "success" : "neutral"}>
                        {a.active ? "Active" : "Off"}
                      </Badge>
                    </span>
                    <span className="mt-0.5 block text-[13px] text-owner-fg-3 line-clamp-2">
                      {a.description}
                    </span>
                  </span>
                </button>

                <label className="flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={a.active}
                    disabled={busyKey === a.key}
                    onChange={(e) => toggle(a, e.target.checked)}
                  />
                  <span className="relative h-6 w-11 rounded-full bg-owner-border transition peer-checked:bg-owner-blue-500">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-owner-border-soft pt-3 text-[13px]">
                <Stat label="Last sent" value={fmtDate(a.lastSentAt)} />
                <Stat label="Total sent" value={a.totalSent.toLocaleString("en-IN")} />
                <Stat
                  label="Revenue attributed"
                  value={inrFormat(a.attributedRevenue)}
                />
                <Stat
                  label="Conversions"
                  value={a.attributedOrders.toLocaleString("en-IN")}
                />
                <button
                  type="button"
                  onClick={() => router.push(`/automations/${a.key}`)}
                  className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-owner-blue-500"
                >
                  Open <ChevronRight size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <span>
    <span className="block text-[11px] uppercase tracking-wide text-owner-fg-4">
      {label}
    </span>
    <span className="font-semibold text-owner-fg-1">{value}</span>
  </span>
);

AutomationsPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default AutomationsPage;

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
