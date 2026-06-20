import {
  Badge,
  Card,
  OwnerButton,
  PageHeader,
  inrFormat,
} from "@/components/common/owner";
import CustomSwitch from "@/components/common/customSwitch/customSwitch";
import MainLayout from "@/components/layouts/mainBodyLayout";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import {
  fetchAutomations,
  setAutomationActive,
  suggestAutomation,
  type AutomationView,
} from "@/utils/automationClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { getPresetRange } from "@/components/common/reports";
import {
  ArrowUpRight,
  ChevronRight,
  Lightbulb,
  Radio,
  Send,
  Sparkles,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Never";

const AutomationsPage = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const [items, setItems] = useState<AutomationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [liveEvents, setLiveEvents] = useState<
    { _id: string; title: string; sold: number }[]
  >([]);
  const [topEvents, setTopEvents] = useState<{ name: string; net: number }[]>([]);

  useEffect(() => {
    fetchAutomations()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Performance strip — proof the automations are boosting sales: what's live
  // right now + the top-performing events (last 30 days).
  useEffect(() => {
    (async () => {
      try {
        const ev: any = await sdk.getMyEvents();
        const now = Date.now();
        const live = (ev?.getMyEvents ?? [])
          .filter((e: any) => {
            const s = String(e.status ?? "").toUpperCase();
            // "Live now" = ONLY a PUBLISHED event currently within its run
            // window. An unpublished (PENDING/DRAFT) or COMPLETED/CANCELLED
            // event must never show here — that was surfacing "Untitled
            // Event / 0 sold" for events that weren't actually live.
            if (s !== "PUBLISHED") return false;
            const start = e.startDate ? new Date(e.startDate).getTime() : null;
            const end = e.endDate ? new Date(e.endDate).getTime() : null;
            return (start === null || start <= now) && (end === null || end >= now);
          })
          .map((e: any) => ({
            _id: e._id,
            title: e.title || "Untitled event",
            sold: (e.tickets ?? []).reduce(
              (s: number, t: any) => s + Number(t.ticketSold ?? 0),
              0
            ),
          }));
        setLiveEvents(live);
      } catch {
        /* widget is optional */
      }
      try {
        const { startDate, endDate } = getPresetRange("last30");
        const res: any = await sdk.getHostReport({
          input: { type: "EVENT_COMPARISON", startDate, endDate },
        });
        const table = res?.getHostReport?.tables?.[0];
        const rows = (table?.rows ?? [])
          .map((r: any) => {
            const m = new Map(r.cells.map((c: any) => [c.key, c.value]));
            return { name: String(m.get("event") ?? ""), net: Number(m.get("net") ?? 0) };
          })
          .filter((x: any) => x.net > 0)
          .slice(0, 4);
        setTopEvents(rows);
      } catch {
        /* widget is optional */
      }
    })();
  }, []);

  // Optimistic toggle that REVERTS on failure and surfaces the error — the
  // previous version updated state without a catch, so a failed mutation left
  // the switch lying about the real server state.
  const toggle = async (a: AutomationView, next: boolean) => {
    setBusyKey(a.key);
    setItems((cur) =>
      cur.map((x) => (x.key === a.key ? { ...x, active: next } : x))
    );
    try {
      const updated = await setAutomationActive(a.key, next);
      setItems((cur) => cur.map((x) => (x.key === a.key ? updated : x)));
      setToastData({
        type: "success",
        message: `${a.title} ${next ? "turned on" : "turned off"}.`,
      });
    } catch (err) {
      setItems((cur) =>
        cur.map((x) => (x.key === a.key ? { ...x, active: !next } : x))
      );
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusyKey(null);
    }
  };

  const submitSuggestion = async () => {
    const text = suggestion.trim();
    if (text.length < 10) {
      setToastData({
        type: "error",
        message: "Tell us a little more — at least a sentence.",
      });
      return;
    }
    setSuggesting(true);
    try {
      await suggestAutomation(text);
      setSuggestion("");
      setToastData({
        type: "success",
        message: "Thanks! Your idea reached our team — we review every suggestion.",
      });
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="min-w-0">
      <PageHeader
        title="Automations"
        subtitle="Always-on flows that grow your sales while you focus on the event."
      />

      {/* Wide marketing-style explainer → product page. Whole card is the link. */}
      <a href="/product/automations" className="mb-6 block">
        <div
          className="flex flex-col items-stretch gap-5 overflow-hidden rounded-owner-lg p-6 text-white transition hover:opacity-95 md:flex-row md:items-center"
          style={{ background: "linear-gradient(135deg, #0f1729 0%, #1f2a44 100%)" }}
        >
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Automations
            </div>
            <h2 className="mt-1 text-xl font-semibold leading-tight md:text-2xl">
              Recipes that run the boring stuff
            </h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-6 text-white/80">
              Auto-open Phase 2 when Phase 1 sells out. Auto-send 24-hour
              reminders. Auto-recycle a refunded ticket to the waitlist.{" "}
              <span className="font-medium text-white/95">
                Set once, never again.
              </span>
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#bef264]">
              Learn more <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="hidden shrink-0 md:block">
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-white/10 text-[#bef264]">
              <Sparkles size={34} />
            </span>
          </div>
        </div>
      </a>

      {liveEvents.length > 0 || topEvents.length > 0 ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-2 text-[14px] font-semibold text-owner-fg-1">
              <Radio size={16} className="text-owner-blue-500" /> Live now
            </div>
            {liveEvents.length ? (
              <div className="mt-3 space-y-2">
                {liveEvents.slice(0, 4).map((ev) => (
                  <button
                    key={ev._id}
                    type="button"
                    onClick={() => router.push(`/events/${ev._id}/manage`)}
                    className="flex w-full items-center justify-between gap-3 rounded-owner-sm px-1 py-1 text-left text-[13px] hover:bg-owner-bg-subtle"
                  >
                    <span className="truncate text-owner-fg-1">{ev.title}</span>
                    <span className="shrink-0 text-owner-fg-4">
                      {ev.sold.toLocaleString("en-IN")} sold
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-owner-fg-4">
                No events running right now.
              </p>
            )}
          </Card>
          <Card>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-owner-fg-1">
                <TrendingUp size={16} className="text-owner-blue-500" /> Top
                performing events
              </div>
              <button
                type="button"
                onClick={() => router.push("/reports/automation-performance")}
                className="text-[12.5px] font-semibold text-owner-blue-500 hover:underline"
              >
                Automation report
              </button>
            </div>
            {topEvents.length ? (
              <div className="mt-3 space-y-2">
                {topEvents.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 text-[13px]"
                  >
                    <span className="truncate text-owner-fg-1">{ev.name}</span>
                    <span className="shrink-0 font-medium tabular-nums text-owner-fg-1">
                      {inrFormat(ev.net)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-owner-fg-4">
                No sales yet — turn on an automation to boost them.
              </p>
            )}
          </Card>
        </div>
      ) : null}

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

                <CustomSwitch
                  checked={a.active}
                  disabled={busyKey === a.key}
                  onChange={() => toggle(a, !a.active)}
                  label={a.active ? "Turn off" : "Turn on"}
                  className="shrink-0"
                />
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

      {/* Suggest an automation — hosts pitch the boring task they want gone;
          the team reviews and builds the most-requested ones. */}
      <Card className="mt-6 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-owner-md bg-owner-bg-subtle text-owner-blue-500">
            <Lightbulb size={17} />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-owner-fg-1">Suggest an automation</h3>
            <p className="text-[13px] text-owner-fg-3">
              Tell us the repetitive task you want gone — we build the ones
              hosts ask for most.
            </p>
          </div>
        </div>
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          rows={3}
          placeholder="e.g. When an event hits 80% sold, auto-send a 'selling fast' WhatsApp to my followers."
          className="w-full resize-y rounded-owner-md border border-owner-border bg-owner-bg px-3 py-2 text-[13px] text-owner-fg-1 outline-none transition focus:border-owner-blue-200"
        />
        <div className="flex justify-end">
          <OwnerButton
            type="button"
            size="sm"
            leadingIcon={<Send size={14} />}
            disabled={suggesting}
            onClick={submitSuggestion}
          >
            {suggesting ? "Sending…" : "Send suggestion"}
          </OwnerButton>
        </div>
      </Card>
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
