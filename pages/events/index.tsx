import ConfirmModal from "@/components/common/confirm-modal";
import EventCard from "@/components/common/event/EventCard";
import { HoizrStatusPill } from "@/components/common/hoizr/HoizrSurface";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { useHostTypeLabel } from "@/hooks/useHostTypeLabel";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import { sdk } from "@/utils/graphqlClient";
import { eventDisplayStatus, extractErrorMessage } from "@/utils/utilFUncs";
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleDashedIcon,
  CopyIcon,
  DownloadIcon,
  type LucideIcon,
  MegaphoneIcon,
  MoreHorizontalIcon,
  PlusIcon,
  QrCodeIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  SearchIcon,
  Trash2Icon,
  UsersRoundIcon,
} from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type EventCardData = {
  _id: string;
  title?: string;
  status?: string;
  eventType?: string[];
  eventFlyer?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  isVisible?: boolean;
  ticketingEnabled?: boolean;
  tickets?: {
    ticketCapacity?: number;
    ticketSold?: number;
    ticketPrice?: number;
    ticketName?: string;
    ticketCategory?: string;
    ticketVisible?: boolean;
  }[];
  // Set when the row came from getMyCollaboratedEvents — the host is a
  // confirmed collaborator on this event but does NOT own it. UI uses
  // this to mark the card read-only and surface the Leave action.
  isCollaboratorView?: boolean;
  collaboratorEntry?: {
    canSeeMetrics?: boolean;
    canRunCampaigns?: boolean;
    canCreateOffers?: boolean;
    requestCustomerListAccess?: boolean;
  };
};

type Checklist = {
  logo: 0 | 1;
  adminverification: 0 | 1;
  payout: 0 | 1;
  event: 0 | 1;
  Scanner: 0 | 1;
  nextSteps: {
    key: string;
    title: string;
    description: string;
    actionHref?: string;
    blocksEventCreation: boolean;
    blocksPaidEvent: boolean;
  }[];
};

type ConfirmAction = {
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  tone?: "default" | "danger" | "warning";
  onConfirm: () => void | Promise<void>;
};

const normalizeStatus = (status?: string) =>
  String(status ?? "DRAFT").toLowerCase();

const formatDate = (value?: string) => {
  if (!value) return "Date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const rupee = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

type RangePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_1_week"
  | "last_1_month"
  | "last_year"
  | "custom";

const rangeOptions: { value: RangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Day" },
  { value: "last_1_week", label: "Last 1 Week" },
  { value: "last_1_month", label: "Last 1 Month" },
  { value: "last_year", label: "Last Year" },
  { value: "custom", label: "Custom" },
];

const statusOptions = [
  { value: "live", label: "Live" },
  { value: "drafts", label: "Drafts" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const addDays = (date: Date, amount: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

const addMonths = (date: Date, amount: number) => {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + amount);
  return copy;
};

const addYears = (date: Date, amount: number) => {
  const copy = new Date(date);
  copy.setFullYear(copy.getFullYear() + amount);
  return copy;
};

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateFromInput = (value: string, end = false) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return end ? endOfDay(date) : startOfDay(date);
};

const rangeForPreset = (preset: RangePreset) => {
  const today = startOfDay(new Date());
  if (preset === "today") {
    return { from: startOfDay(today), to: endOfDay(today) };
  }
  if (preset === "yesterday") {
    const yesterday = addDays(today, -1);
    return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
  }
  if (preset === "last_7_days") {
    return { from: startOfDay(addDays(today, -6)), to: endOfDay(today) };
  }
  if (preset === "last_1_week") {
    return { from: startOfDay(addDays(today, -7)), to: endOfDay(today) };
  }
  if (preset === "last_1_month") {
    return { from: startOfDay(addMonths(today, -1)), to: endOfDay(today) };
  }
  if (preset === "last_year") {
    return { from: startOfDay(addYears(today, -1)), to: endOfDay(today) };
  }
  return { from: null, to: null };
};

const formatRangeLabel = (from: Date | null, to: Date | null) => {
  if (!from && !to) return "All dates";
  if (from && to && toDateInputValue(from) === toDateInputValue(to)) {
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(from);
  }
  const formatterNoYear = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  });
  const formatterWithYear = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (from && to) {
    return `${formatterNoYear.format(from)} - ${formatterWithYear.format(to)}`;
  }
  if (from) return `${formatterWithYear.format(from)} onwards`;
  return `Until ${formatterWithYear.format(to as Date)}`;
};

const EventsPage = () => {
  const router = useRouter();
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const hostLabel = useHostTypeLabel();
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [readinessOpen, setReadinessOpen] = useState(false);
  // Render a generous first page (most hosts have <24 events total) so
  // the IntersectionObserver only matters for power users. Earlier
  // initial of 8 meant the sentinel was offscreen on small lists and
  // pagination never grew when users scrolled the list.
  const [visibleCount, setVisibleCount] = useState(24);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [rangePreset, setRangePreset] = useState<RangePreset>("custom");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const createHandledRef = useRef(false);

  const selectedHostId = useHostsStore((s) => s.selectedHostId);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Owned events + events where the current host is a confirmed
      // collaborator load in parallel. Collab events are decorated so
      // the UI can render the "Collaborator" badge + read-only state.
      const [eventResponse, collabResponse, checklistResponse] = await Promise.all([
        sdk.getMyEvents(),
        (sdk as any).getMyCollaboratedEvents().catch(() => ({ getMyCollaboratedEvents: [] })),
        sdk.eventOnboardingChecklist(),
      ]);
      const mine: EventCardData[] = eventResponse?.getMyEvents ?? [];
      const collabRaw =
        (collabResponse as { getMyCollaboratedEvents?: any[] })
          ?.getMyCollaboratedEvents ?? [];
      const collab: EventCardData[] = collabRaw.map((e: any) => {
        const myRow = (e.eventCollaborationBusiness ?? []).find(
          (c: any) => String(c.businessLinkId ?? "") === String(selectedHostId ?? "")
        );
        return {
          ...e,
          isCollaboratorView: true,
          collaboratorEntry: myRow
            ? {
                canSeeMetrics: myRow.canSeeMetrics !== false,
                canRunCampaigns: myRow.canRunCampaigns !== false,
                canCreateOffers: myRow.canCreateOffers !== false,
                requestCustomerListAccess: myRow.requestCustomerListAccess !== false,
              }
            : undefined,
        };
      });
      const dedupedCollab = collab.filter(
        (c) => !mine.some((m) => String(m._id) === String(c._id))
      );
      setEvents([...mine, ...dedupedCollab]);
      setChecklist(checklistResponse?.eventOnboardingChecklist ?? null);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [selectedHostId, setToastData]);

  useEffect(() => {
    setSelectedSideBarMenu("Events");
    fetchData();
  }, [fetchData, setSelectedSideBarMenu]);

  const handleCreateEvent = useCallback(async () => {
    const currentChecklist = checklist;
    if (currentChecklist?.logo === 0) {
      setReadinessOpen(true);
      setToastData({
        type: "error",
        message: `Upload a ${hostLabel.lower} logo before creating an event.`,
      });
      return;
    }

    setCreating(true);
    try {
      const response = await sdk.createEvent({
        input: {
          title: "Untitled Event",
        },
      });
      const id = response?.createEvent?._id;
      if (!id) throw new Error("Event draft was not created");
      router.push(`/events/${id}/create`);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setCreating(false);
    }
  }, [checklist, router, setToastData, hostLabel.lower]);

  useEffect(() => {
    if (
      loading ||
      !router.isReady ||
      router.query.create !== "1" ||
      createHandledRef.current
    ) {
      return;
    }
    createHandledRef.current = true;
    router.replace("/events", undefined, { shallow: true });
    handleCreateEvent();
  }, [handleCreateEvent, loading, router]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((count) => Math.min(count + 12, events.length));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [customFromDate, customToDate, events.length, rangePreset, searchQuery, statusFilter]);

  useEffect(() => {
    setVisibleCount(24);
  }, [customFromDate, customToDate, rangePreset, searchQuery, statusFilter]);

  const metrics = useMemo(() => {
    const live = events.filter((event) =>
      normalizeStatus(event.status).includes("published")
    ).length;
    const pending = events.filter((event) =>
      normalizeStatus(event.status).includes("pending")
    ).length;
    const drafted = events.filter((event) =>
      normalizeStatus(event.status).includes("draft")
    ).length;
    const completed = events.filter((event) =>
      normalizeStatus(event.status).includes("completed")
    ).length;
    return [
      { label: "Live Events", value: live, Icon: CalendarDaysIcon },
      { label: "Pending Events", value: pending + drafted, Icon: CircleDashedIcon },
      { label: "Completed Events", value: completed, Icon: CheckCircle2Icon },
    ];
  }, [events]);

  const readinessTotal =
    (checklist?.logo ?? 0) +
    (checklist?.adminverification ?? 0) +
    (checklist?.payout ?? 0) +
    (checklist?.event ?? 0) +
    (checklist?.Scanner ?? 0);
  const showReadiness = Boolean(checklist?.nextSteps?.length);
  const activeRange = useMemo<{ from: Date | null; to: Date | null }>(() => {
    // Date range is only meaningful for the "Past" tab. Live/Drafts/All
    // contain future-dated events that a retrospective range would
    // incorrectly hide.
    if (statusFilter !== "past") {
      return { from: null, to: null };
    }
    if (rangePreset === "custom" && (customFromDate || customToDate)) {
      return {
        from: dateFromInput(customFromDate),
        to: dateFromInput(customToDate || customFromDate, true),
      };
    }
    if (rangePreset !== "custom") {
      return rangeForPreset(rangePreset);
    }
    return { from: null, to: null };
  }, [customFromDate, customToDate, rangePreset, statusFilter]);
  const dateRangeLabel = formatRangeLabel(activeRange.from, activeRange.to);
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      const status = normalizeStatus(event.status);
      const statusMatches =
        statusFilter === "all" ||
        (statusFilter === "drafts" &&
          (status.includes("pending") || status.includes("draft"))) ||
        (statusFilter === "live" &&
          (status.includes("published") ||
            status.includes("live") ||
            status.includes("active"))) ||
        (statusFilter === "past" &&
          (status.includes("completed") ||
            status.includes("past") ||
            status.includes("ended"))) ||
        status.includes(statusFilter);
      const queryMatches =
        !query ||
        event.title?.toLowerCase().includes(query) ||
        event.city?.toLowerCase().includes(query) ||
        event.eventType?.some((type) => type.toLowerCase().includes(query));
      const start = event.startDate ? new Date(event.startDate) : null;
      const fromMatches = !activeRange.from || !start || start >= activeRange.from;
      const toMatches = !activeRange.to || !start || start <= activeRange.to;
      return statusMatches && queryMatches && fromMatches && toMatches;
    }).sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : -Infinity;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : -Infinity;
      return bTime - aTime;
    });
  }, [activeRange.from, activeRange.to, events, searchQuery, statusFilter]);
  const visibleEvents = filteredEvents.slice(0, visibleCount);

  const deleteEvent = async (id: string) => {
    try {
      await sdk.deleteEvent({ id });
      setToastData({ type: "success", message: "Event deleted" });
      fetchData();
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  /**
   * Clone the event into a fresh draft under the same host. Mirrors
   * the email-campaign duplicate flow — fastest path to launching a
   * recurring night without re-uploading flyer + lineup + tickets.
   * Lands in the events list (with a refresh) where the new draft
   * sits at the top of the list ready to edit.
   */
  const duplicateEvent = async (event: EventCardData) => {
    try {
      const response = await sdk.duplicateEvent({ id: event._id });
      const newId = response?.duplicateEvent?._id;
      setToastData({
        type: "success",
        message: "Event duplicated as a draft.",
      });
      if (newId) {
        router.push(`/events/${newId}/create`);
      } else {
        fetchData();
      }
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const requestDeleteEvent = (event: EventCardData) => {
    setConfirmAction({
      title: "Delete event?",
      description: (
        <>
          Delete <strong>{event.title || "this event"}</strong>. Events with ticket
          sales cannot be deleted, and deleted drafts cannot be restored.
        </>
      ),
      confirmLabel: "Delete event",
      tone: "danger",
      onConfirm: () => deleteEvent(event._id),
    });
  };

  const leaveCollab = async (eventId: string) => {
    try {
      await (sdk as any).respondToEventCollaboration({ eventId, accept: false });
      setEvents((current) => current.filter((e) => e._id !== eventId));
      setConfirmAction(null);
      setToastData({ type: "success", message: "You left the collaboration" });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const requestLeaveCollab = (event: EventCardData) => {
    setConfirmAction({
      title: "Leave this collaboration?",
      description: (
        <>
          You&apos;ll be removed from <strong>{event.title || "this event"}</strong>. It will
          disappear from your dashboard and the host who added you will be notified.
        </>
      ),
      confirmLabel: "Leave collaboration",
      tone: "warning",
      onConfirm: () => leaveCollab(event._id),
    });
  };

  return (
    <div className="min-w-0 space-y-6 pb-8 font-owner text-owner-fg-1">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="owner-page-title">Events</h1>
          <p className="owner-body mt-1 max-w-2xl">
            Create drafts, manage live listings, connect scanners, and launch
            event campaigns from here.
          </p>
        </div>
        <button
          id="event-create-button"
          type="button"
          disabled={creating}
          onClick={handleCreateEvent}
          className="owner-btn owner-btn--primary"
        >
          <PlusIcon size={16} strokeWidth={2.4} />
          {creating ? "Adding…" : "Add event"}
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-owner-lg border border-owner-border bg-owner-bg p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-owner-fg-3">{label}</p>
                <p className="mt-2 text-[26px] font-semibold tabular-nums tracking-[-0.015em] text-owner-fg-1">
                  {value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
                <Icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {showReadiness ? (
        <div className="overflow-hidden rounded-owner-lg border border-owner-border bg-owner-bg">
          <button
            type="button"
            onClick={() => setReadinessOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-owner-fg-1">
                Event setup path
              </p>
              <p className="mt-0.5 text-[12.5px] text-owner-fg-3">
                {readinessTotal}/5 setup checks complete
              </p>
            </div>
            <span className="owner-btn owner-btn--secondary owner-btn--sm">
              {readinessOpen ? "Hide" : "Show"}
            </span>
          </button>
          {readinessOpen ? (
            <div className="grid gap-3 border-t border-owner-border-soft bg-owner-bg-subtle p-4 md:grid-cols-2 xl:grid-cols-3">
              {(checklist?.nextSteps ?? []).map((step) => (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => {
                    if (step.actionHref) router.push(step.actionHref);
                  }}
                  className="rounded-owner-md border border-owner-border bg-owner-bg p-3 text-left text-sm transition hover:border-owner-blue-200"
                >
                  <p className="font-semibold text-owner-fg-1">{step.title}</p>
                  <p className="mt-1 text-[12.5px] leading-5 text-owner-fg-3">
                    {step.description}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-4">
        {/* Tabs + filter controls stay pinned to the top of the scroll
            area so the list below can scroll without the host losing
            context of which segment they're viewing. Negative margins +
            matching padding extend the translucent backdrop edge-to-
            edge inside the rounded-canvas frame. */}
        <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-4 border-b border-owner-border-soft bg-owner-bg/95 px-4 py-3 backdrop-blur lg:-mx-10 lg:flex-row lg:items-center lg:justify-between lg:px-10 sm:-mx-6 sm:px-6">
          <div className="inline-flex w-full max-w-max rounded-owner-lg border border-owner-border bg-owner-bg p-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                data-active={statusFilter === option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-owner-md px-6 py-3 text-[15px] font-semibold transition ${
                  statusFilter === option.value
                    ? "bg-owner-blue-050 text-owner-blue-500"
                    : "text-owner-fg-2 hover:text-owner-fg-1"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {statusFilter === "past" ? (
              <button
                type="button"
                onClick={() => setShowFilterPanel((open) => !open)}
                className="owner-btn owner-btn--secondary"
              >
                <SlidersHorizontalIcon size={16} />
                Filter
              </button>
            ) : null}
            <button type="button" className="owner-btn owner-btn--secondary">
              <DownloadIcon size={16} />
              Export
            </button>
          </div>
        </div>

        {statusFilter === "past" && showFilterPanel ? (
          <div className="rounded-owner-lg border border-owner-border bg-owner-bg p-4">
            <div className="grid gap-3 md:grid-cols-[220px_minmax(260px,1fr)]">
              <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-owner-fg-3">
                Range
                <div className="relative mt-1">
                  <select
                    value={rangePreset}
                    onChange={(event) =>
                      setRangePreset(event.target.value as RangePreset)
                    }
                    className="h-11 w-full appearance-none rounded-owner-md border border-owner-border bg-owner-bg px-3 pr-10 text-sm font-medium text-owner-fg-1 outline-none transition focus:border-owner-blue-200 focus:shadow-[0_0_0_3px_var(--owner-blue-050)]"
                  >
                    {rangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-owner-fg-4"
                  />
                </div>
              </label>

              <div className="rounded-owner-md border border-owner-border bg-owner-bg p-2">
                <div className="flex min-h-9 items-center justify-between gap-3 px-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <CalendarDaysIcon
                      size={15}
                      className="shrink-0 text-owner-fg-4"
                    />
                    <span className="truncate text-[13.5px] font-medium text-owner-fg-1">
                      {dateRangeLabel}
                    </span>
                  </div>
                  {rangePreset === "custom" ? (
                    <span className="shrink-0 rounded-owner-sm bg-owner-blue-050 px-2 py-1 text-[11px] font-semibold text-owner-blue-500">
                      Custom
                    </span>
                  ) : null}
                </div>
                {rangePreset === "custom" ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <input
                      type="date"
                      value={customFromDate}
                      onChange={(event) => setCustomFromDate(event.target.value)}
                      className="h-10 rounded-owner-sm border border-owner-border bg-owner-bg px-3 text-sm text-owner-fg-1 outline-none focus:border-owner-blue-200"
                    />
                    <input
                      type="date"
                      value={customToDate}
                      min={customFromDate || undefined}
                      onChange={(event) => setCustomToDate(event.target.value)}
                      className="h-10 rounded-owner-sm border border-owner-border bg-owner-bg px-3 text-sm text-owner-fg-1 outline-none focus:border-owner-blue-200"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <label className="relative block">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-owner-fg-4"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search events by name, venue, or DJ"
            className="h-14 w-full rounded-owner-lg border border-owner-border bg-owner-bg pl-12 pr-4 text-[15px] text-owner-fg-1 outline-none transition placeholder:text-owner-fg-4 focus:border-owner-blue-200 focus:shadow-[0_0_0_3px_var(--owner-blue-050)]"
          />
        </label>
      </div>

      {loading ? (
        <div className="rounded-owner-lg border border-owner-border bg-owner-bg p-6 text-sm text-owner-fg-3">
          Loading events…
        </div>
      ) : visibleEvents.length ? (
        <section>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleEvents.map((event) => (
              <EventListCard
                key={event._id}
                event={event}
                onDelete={() => requestDeleteEvent(event)}
                onLeaveCollab={() => requestLeaveCollab(event)}
                onDuplicate={() => duplicateEvent(event)}
              />
            ))}
            <div ref={sentinelRef} className="h-4" />
          </div>
        </section>
      ) : (
        <div className="rounded-owner-lg border border-dashed border-owner-border bg-owner-bg p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-[18px] font-semibold text-owner-fg-1">
                No events yet
              </h3>
              <p className="mt-1 text-[13.5px] text-owner-fg-3">
                Start with a draft. You can exit the creation journey at any
                step and continue later.
              </p>
            </div>
            <button
              type="button"
              disabled={creating}
              onClick={handleCreateEvent}
              className="owner-btn owner-btn--primary"
            >
              <PlusIcon size={15} strokeWidth={2.4} />
              Add event
            </button>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title ?? ""}
        description={confirmAction?.description ?? null}
        confirmLabel={confirmAction?.confirmLabel}
        tone={confirmAction?.tone}
        onCancel={() => setConfirmAction(null)}
        onConfirm={async () => {
          await confirmAction?.onConfirm();
        }}
      />
    </div>
  );
};

const getEventPriceLabel = (event: EventCardData) => {
  const paidPrices = (event.tickets ?? [])
    .filter(
      (ticket) =>
        ticket.ticketCategory !== "GUESTLIST" &&
        Number(ticket.ticketPrice ?? 0) > 0 &&
        (ticket.ticketVisible ?? true),
    )
    .map((ticket) => Number(ticket.ticketPrice ?? 0));

  if (!paidPrices.length) return "Guestlist";
  return `${rupee(Math.min(...paidPrices))} onwards`;
};

const EventListCard = ({
  event,
  onDelete,
  onLeaveCollab,
  onDuplicate,
}: {
  event: EventCardData;
  onDelete: () => void;
  onLeaveCollab: () => void;
  onDuplicate: () => void;
}) => {
  const router = useRouter();
  const openRunCampaignModal = useGlobalStore((s) => s.openRunCampaignModal);
  const status = normalizeStatus(event.status);
  const isDraftLike = status.includes("draft") || status.includes("pending");
  const isCompleted = status.includes("completed");
  const isCollab = !!event.isCollaboratorView;
  const collabPerms = event.collaboratorEntry;
  const openEvent = () => {
    // Drafts: resume the wizard so the host can finish creating. Collabs never
    // get the draft wizard.
    if (isDraftLike && !isCollab) {
      router.push(`/events/${event._id}/create`);
      return;
    }
    // Everything else (published / completed / paused / collaborator): land
    // directly on Manage Event — the single page that now holds config,
    // guest lists, and activity (orders/offline/customers). The old hub is gone.
    router.push(`/events/${event._id}/manage`);
  };

  return (
    <EventCard
      variant={isCollab ? "collaborator" : "default"}
      flyer={event.eventFlyer || undefined}
      dateLabel={formatDate(event.startDate)}
      title={event.title || "Untitled Event"}
      city={event.city || "City pending"}
      priceLabel={getEventPriceLabel(event)}
      placeholderIcon={<SparklesIcon size={28} className="text-owner-fg-4" />}
      topLeftBadge={
        isCollab ? (
          <>
            <UsersRoundIcon size={11} />
            Collaborator
          </>
        ) : null
      }
      topRightBadge={
        <HoizrStatusPill
          status={eventDisplayStatus(
            event.status,
            event.startDate,
            event.endDate
          )}
        />
      }
      note={
        isCollab ? (
          <p className="text-[12px] text-[#7E2BD6]">
            Read-only - added by the event organizer
          </p>
        ) : null
      }
      actions={
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {isCollab ? (
            <>
              <ActionButton
                label="View event"
                Icon={SettingsIcon}
                onClick={() => router.push(`/events/${event._id}/manage`)}
              />
              <ActionButton
                label="Metrics"
                Icon={QrCodeIcon}
                onClick={() => router.push(`/events/${event._id}/manage`)}
                disabled={!collabPerms?.canSeeMetrics}
              />
              <ActionButton
                label="Run a Campaign"
                Icon={MegaphoneIcon}
                onClick={() =>
                  openRunCampaignModal({
                    eventId: event._id,
                    title: event.title || "Untitled Event",
                  })
                }
                disabled={!collabPerms?.canRunCampaigns}
              />
              <ActionButton
                label="Leave collaboration"
                Icon={Trash2Icon}
                onClick={onLeaveCollab}
              />
            </>
          ) : isDraftLike ? (
            <>
              <ActionButton
                label="Continue"
                Icon={SettingsIcon}
                onClick={() => router.push(`/events/${event._id}/create`)}
              />
              <ActionButton
                label="Duplicate"
                Icon={CopyIcon}
                onClick={onDuplicate}
              />
              <ActionButton
                label="Delete"
                Icon={Trash2Icon}
                onClick={onDelete}
              />
            </>
          ) : (
            <>
              <ActionButton
                label="Manage"
                Icon={SettingsIcon}
                onClick={() =>
                  router.push(
                    isCompleted
                      ? `/events/${event._id}/manage`
                      : `/events/${event._id}/update`,
                  )
                }
              />
              <ActionButton
                label="Scanner"
                Icon={QrCodeIcon}
                onClick={() => router.push(`/events/${event._id}/scanners`)}
              />
              <ActionButton
                label="Run a Campaign"
                Icon={MegaphoneIcon}
                onClick={() =>
                  openRunCampaignModal({
                    eventId: event._id,
                    title: event.title || "Untitled Event",
                  })
                }
              />
              <ActionButton
                label="Duplicate"
                Icon={CopyIcon}
                onClick={onDuplicate}
              />
              <ActionButton label="Find Promoters" Icon={UsersRoundIcon} disabled />
              <ActionButton label="Find Artists" Icon={MoreHorizontalIcon} disabled />
            </>
          )}
        </div>
      }
      onClick={openEvent}
    />
  );
};

const ActionButton = ({
  label,
  Icon,
  onClick,
  disabled,
}: {
  label: string;
  Icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      onClick?.();
    }}
    disabled={disabled}
    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--owner-border)] bg-white px-3 py-2 font-semibold text-[var(--owner-fg-1)] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Icon size={15} />
    <span>{label}</span>
    {disabled ? <span className="text-xs font-normal">(coming soon)</span> : null}
  </button>
);

EventsPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default EventsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const response = await sdk.MeUserJourney(
      {},
      {
        cookie: context.req.headers.cookie?.toString() ?? "",
      }
    );
    const journey = response.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }
    return { props: {} };
  } catch (error) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
