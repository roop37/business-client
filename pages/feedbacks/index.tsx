import { Card, PageHeader, StatTile } from "@/components/common/owner";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { sdk } from "@/utils/graphqlClient";
import {
  fetchHostEventFeedback,
  type HostEventFeedbackRow,
} from "@/utils/feedbackClient";
import { fetchMyEventsForOffline, type OfflineEvent } from "@/utils/offlineTicketClient";
import { Star } from "lucide-react";
import { GetServerSideProps } from "next";
import React, { useEffect, useMemo, useState } from "react";

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";

const Stars = ({ rating }: { rating?: number | null }) => {
  const r = Math.round(rating ?? 0);
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= r ? "fill-amber-400 text-amber-400" : "text-owner-fg-4"}
        />
      ))}
    </span>
  );
};

const FeedbacksPage = () => {
  const [items, setItems] = useState<HostEventFeedbackRow[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [events, setEvents] = useState<OfflineEvent[]>([]);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEventsForOffline().then(setEvents).catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchHostEventFeedback(eventId || undefined)
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
        setAvg(r.averageRating ?? null);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  const eventTitleById = useMemo(
    () => new Map(events.map((e) => [e._id, e.title])),
    [events]
  );

  return (
    <div className="min-w-0">
      <PageHeader
        title="Feedbacks"
        subtitle="What your customers said about your events."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Total reviews" value={total.toLocaleString("en-IN")} />
        <StatTile label="Average rating" value={avg != null ? `${avg} / 5` : "—"} />
        <StatTile
          label="With comments"
          value={items.filter((i) => i.comment).length.toLocaleString("en-IN")}
        />
      </div>

      <div className="mb-4 flex items-center justify-end">
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="h-9 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] text-owner-fg-1 outline-none focus:border-owner-blue-200"
        >
          <option value="">All events</option>
          {events.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Card>
          <p className="text-sm text-owner-fg-4">Loading feedback…</p>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-owner-fg-4">
            No feedback yet. Customers are asked for a review the day after each event.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((f) => (
            <Card key={f._id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Stars rating={f.rating} />
                    <span className="text-sm font-medium text-owner-fg-1">
                      {f.customerName}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-owner-fg-4">
                    {f.eventTitle ?? eventTitleById.get(f.eventId ?? "") ?? "Event"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-owner-fg-4">
                  {fmtDate(f.createdAt)}
                </span>
              </div>
              {f.comment ? (
                <p className="text-[14px] leading-relaxed text-owner-fg-2">
                  “{f.comment}”
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

FeedbacksPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default FeedbacksPage;

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
