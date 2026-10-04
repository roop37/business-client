"use client";

import ReusableModal from "@/components/common/modal/modal";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { Check, Copy, Download, Loader2, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

const formatDate = (iso?: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
};

// Per-guest activity trail — the "who did what, when" log within a list.
const activityLine = (en: GuestlistEntry): string => {
  const parts: string[] = [];
  if (en.createdAt) parts.push(`Joined ${formatDate(en.createdAt)}`);
  if (en.checkedIn && en.checkedInAt)
    parts.push(`Checked in ${formatDate(en.checkedInAt)}`);
  if (en.status === "REVOKED" && en.revokedAt)
    parts.push(`Removed ${formatDate(en.revokedAt)}`);
  return parts.join(" · ");
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "going", label: "Going" },
  { id: "checkedin", label: "Checked in" },
  { id: "removed", label: "Removed" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];

type GuestlistConfig = {
  _id: string;
  contributorType: "HOST" | "COLLABORATOR" | "ARTIST";
  contributorId: string;
  contributorName?: string | null;
  cap?: number | null;
  isPublic: boolean;
  code: string;
  isActive: boolean;
  // Owner-controlled: may the contributor administer their own list.
  manageEnabled?: boolean;
  // Owner hard-close: does the list accept new joins.
  isOpen?: boolean;
};

type GuestlistEntry = {
  _id: string;
  guestlistId: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  checkedIn: boolean;
  checkedInAt?: string | null;
  createdAt?: string | null;
  revokedAt?: string | null;
};

// The customer app where guests open a join link.
const JOIN_BASE = "https://hoizr.com/guestlist";

interface Props {
  open?: boolean;
  onClose?: () => void;
  eventId: string;
  guestlistEnabled: boolean;
  guestlistAutoAccept: boolean;
  /** Event-wide room cap (sum of accepted across all lists). Owner-set. */
  guestlistMaxCapacity?: number | null;
  /** Refresh the parent overview after a settings change. */
  onSettingsChanged?: () => void;
  /** Render inline (no modal overlay) — used as a tab pane on the event hub. */
  inline?: boolean;
  /** When true the viewer is a collaborator (sees only their own list, no
   *  owner-only controls). Default false = event owner. */
  isCollaboratorView?: boolean;
}

const GuestlistManagerModal: React.FC<Props> = ({
  open = false,
  onClose,
  eventId,
  guestlistEnabled,
  guestlistAutoAccept,
  guestlistMaxCapacity = null,
  onSettingsChanged,
  inline = false,
  isCollaboratorView = false,
}) => {
  const { setToastData } = useGlobalStore();
  const isOwner = !isCollaboratorView;
  const [enabled, setEnabled] = useState(guestlistEnabled);
  const [autoAccept, setAutoAccept] = useState(guestlistAutoAccept);
  const [maxCap, setMaxCap] = useState<string>(
    guestlistMaxCapacity != null ? String(guestlistMaxCapacity) : ""
  );
  const [lists, setLists] = useState<GuestlistConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [entries, setEntries] = useState<GuestlistEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  // Which list's guests to show in the table ("all" = every list on the event).
  const [listFilter, setListFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setEnabled(guestlistEnabled);
    setAutoAccept(guestlistAutoAccept);
  }, [guestlistEnabled, guestlistAutoAccept, open]);

  const loadLists = useCallback(async () => {
    if (!open && !inline) return;
    setLoading(true);
    try {
      const resp = await sdk.eventGuestlists({ eventId });
      setLists(resp?.eventGuestlists ?? []);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [open, inline, eventId, setToastData]);

  // All guests across every list on the event (server scopes a collaborator to
  // their own lists). One query powers the unified table + its filters.
  const loadEntries = useCallback(async () => {
    if ((!open && !inline) || !enabled) {
      setEntries([]);
      return;
    }
    setEntriesLoading(true);
    try {
      const resp = await sdk.guestlistEntries({ eventId });
      setEntries(resp?.guestlistEntries ?? []);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setEntriesLoading(false);
    }
  }, [open, inline, enabled, eventId, setToastData]);

  // Fresh data every time the panel mounts (FullPageModal unmounts on close, so
  // mount === open) and whenever the guestlist is toggled on.
  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const saveSettings = async (next: {
    enabled: boolean;
    autoAccept: boolean;
    maxCapacity?: number | null;
  }) => {
    setBusy(true);
    try {
      await sdk.setEventGuestlistSettings({
        input: {
          eventId,
          guestlistEnabled: next.enabled,
          guestlistAutoAccept: next.autoAccept,
          guestlistMaxCapacity:
            next.maxCapacity === undefined ? undefined : next.maxCapacity,
        },
      });
      setEnabled(next.enabled);
      setAutoAccept(next.autoAccept);
      onSettingsChanged?.();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  // Persist the event-wide room cap on blur/enter. Empty input = no cap (null).
  const saveMaxCapacity = async () => {
    const trimmed = maxCap.trim();
    const parsed = trimmed === "" ? null : Math.max(0, Math.trunc(Number(trimmed) || 0));
    await saveSettings({ enabled, autoAccept, maxCapacity: parsed });
  };

  // Owner-only per-list controls: management permission + hard-close.
  const setListFlag = async (
    list: GuestlistConfig,
    patch: { manageEnabled?: boolean; isOpen?: boolean }
  ) => {
    setBusy(true);
    try {
      await sdk.upsertGuestlist({
        input: {
          eventId,
          contributorType: list.contributorType,
          contributorId: list.contributorId,
          ...patch,
        },
      });
      await loadLists();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const createHostList = async () => {
    setBusy(true);
    try {
      await sdk.upsertGuestlist({
        input: {
          eventId,
          contributorType: "HOST",
          contributorId: "self",
          contributorName: "You (host)",
          isPublic: false,
        },
      });
      await loadLists();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const togglePublic = async (list: GuestlistConfig) => {
    setBusy(true);
    try {
      await sdk.upsertGuestlist({
        input: {
          eventId,
          contributorType: list.contributorType,
          contributorId: list.contributorId,
          isPublic: !list.isPublic,
        },
      });
      await loadLists();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async (code: string) => {
    const url = `${JOIN_BASE}/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
    } catch {
      setToastData({ type: "error", message: "Couldn't copy the link" });
    }
  };

  // Server-generated CSV (returns a download URL). Scoped to one list, or the
  // whole event when guestlistId is omitted — matches the current table filter.
  const downloadCsv = async (guestlistId?: string) => {
    setDownloading(true);
    try {
      const resp = await sdk.guestlistEntriesCsv({ eventId, guestlistId });
      const url = resp?.guestlistEntriesCsv;
      if (url) window.open(url, "_blank", "noopener");
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setDownloading(false);
    }
  };

  const act = async (entryId: string, action: "approve" | "revoke") => {
    setBusy(true);
    try {
      if (action === "approve") {
        await sdk.approveGuestlistEntry({ entryId });
      } else {
        await sdk.revokeGuestlistEntry({ entryId });
      }
      setToastData({
        type: "success",
        message: action === "approve" ? "Guest approved" : "Guest removed",
      });
      await loadEntries();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const hasHostList = lists.some((l) => l.contributorType === "HOST");
  const listById = new Map(lists.map((l) => [l._id, l] as const));
  const listLabel = (l?: GuestlistConfig): string =>
    l?.contributorName ||
    (l?.contributorType === "HOST" ? "You (host)" : l?.contributorType || "—");

  // Status counts + visible rows respect the current list filter, so switching
  // lists rescopes both the chips and the table.
  const scoped =
    listFilter === "all"
      ? entries
      : entries.filter((e) => e.guestlistId === listFilter);
  const counts: Record<FilterId, number> = {
    all: scoped.length,
    pending: scoped.filter((e) => e.status === "PENDING").length,
    going: scoped.filter((e) => e.status === "ACCEPTED" && !e.checkedIn).length,
    checkedin: scoped.filter((e) => e.checkedIn).length,
    removed: scoped.filter((e) => e.status === "REVOKED").length,
  };
  const q = search.trim().toLowerCase();
  const visibleEntries = scoped.filter((en) => {
    if (filter === "pending" && en.status !== "PENDING") return false;
    if (filter === "going" && !(en.status === "ACCEPTED" && !en.checkedIn))
      return false;
    if (filter === "checkedin" && !en.checkedIn) return false;
    if (filter === "removed" && en.status !== "REVOKED") return false;
    if (q) {
      const hay = [en.guestName, en.guestEmail, en.guestPhone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Event-level settings card (owner only).
  const settingsCard = (
    <div className="space-y-3 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4">
      <label className="flex items-center justify-between gap-3">
        <span>
          <span className="font-medium">Enable guestlist</span>
          <span className="block text-xs text-[var(--owner-fg-3)]">
            Lets you, collaborators and artists invite guests.
          </span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          disabled={busy}
          onChange={(e) =>
            saveSettings({ enabled: e.target.checked, autoAccept })
          }
          className="h-5 w-5 accent-[var(--owner-blue-500)]"
        />
      </label>
      <label className="flex items-center justify-between gap-3">
        <span>
          <span className="font-medium">Auto-accept joins</span>
          <span className="block text-xs text-[var(--owner-fg-3)]">
            Off = each join waits for approval in the guests table.
          </span>
        </span>
        <input
          type="checkbox"
          checked={autoAccept}
          disabled={busy || !enabled}
          onChange={(e) =>
            saveSettings({ enabled, autoAccept: e.target.checked })
          }
          className="h-5 w-5 accent-[var(--owner-blue-500)]"
        />
      </label>
      <label className="flex items-center justify-between gap-3">
        <span>
          <span className="font-medium">Total guest cap</span>
          <span className="block text-xs text-[var(--owner-fg-3)]">
            Max guests across all lists. Blank = no overall limit.
          </span>
        </span>
        <input
          type="number"
          min={0}
          value={maxCap}
          disabled={busy || !enabled}
          onChange={(e) => setMaxCap(e.target.value)}
          onBlur={saveMaxCapacity}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="—"
          className="w-24 rounded-md border border-[var(--owner-border)] bg-[var(--owner-bg)] px-2 py-1.5 text-sm"
        />
      </label>
    </div>
  );

  // Compact list cards — config + share links per list (no inline guests; the
  // unified table below holds every guest).
  const listsSection = (
    <div className="space-y-3">
      {isOwner && !hasHostList ? (
        <button
          type="button"
          disabled={busy}
          onClick={createHostList}
          className="w-full rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Create my guestlist
        </button>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-8 text-[var(--owner-fg-3)]">
          <Loader2 className="animate-spin" size={18} />
        </div>
      ) : lists.length === 0 ? (
        <p className="text-xs text-[var(--owner-fg-3)]">
          No lists yet. Create yours, or add collaborators/artists to give them
          their own.
        </p>
      ) : (
        lists.map((list) => (
          <div
            key={list._id}
            className={`rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-3 ${
              list.isOpen === false ? "opacity-70" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="font-medium">
                {listLabel(list)}
                <span className="ml-2 rounded-full bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--owner-fg-3)]">
                  {list.contributorType}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--owner-fg-3)]">
                  {list.cap != null ? `Cap ${list.cap}` : "No cap"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    list.isPublic
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-3)]"
                  }`}
                >
                  {list.isPublic ? "Public" : "Private · link only"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    list.isOpen === false
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-[var(--owner-blue-050)] text-[var(--owner-blue-500)]"
                  }`}
                >
                  {list.isOpen === false ? "Closed to new joins" : "Open to joins"}
                </span>
                {list.contributorType !== "HOST" &&
                list.manageEnabled === false ? (
                  <span className="rounded-full bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--owner-fg-3)]">
                    Organizer-managed
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isOwner ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setListFlag(list, { isOpen: list.isOpen === false })
                  }
                  title={
                    list.isOpen === false
                      ? "Closed to new joins — tap to reopen"
                      : "Open to new joins — tap to hard-close"
                  }
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                    list.isOpen === false
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-3)]"
                  }`}
                >
                  {list.isOpen === false ? "Closed" : "Open"}
                </button>
              ) : null}
              {isOwner && list.contributorType !== "HOST" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setListFlag(list, {
                      manageEnabled: list.manageEnabled === false,
                    })
                  }
                  title={
                    list.manageEnabled === false
                      ? "You manage this list — tap to let the contributor manage it"
                      : "Contributor can manage — tap to manage it yourself"
                  }
                  className="rounded-md border border-[var(--owner-border)] px-2.5 py-1.5 text-xs font-medium hover:border-[#c89d75]"
                >
                  {list.manageEnabled === false
                    ? "Org-managed"
                    : "Contributor can manage"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => copyLink(list.code)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--owner-border)] px-2.5 py-1.5 text-xs font-medium hover:border-[#c89d75]"
              >
                {copied === list.code ? <Check size={13} /> : <Copy size={13} />}
                {copied === list.code ? "Copied" : "Copy link"}
              </button>
              {isOwner || list.manageEnabled !== false ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => togglePublic(list)}
                  className="rounded-md border border-[var(--owner-border)] px-2.5 py-1.5 text-xs font-medium hover:border-[#c89d75]"
                >
                  {list.isPublic ? "Make private" : "Make public"}
                </button>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );

  // The unified guests table — shown directly (no expand) with status chips, a
  // per-list filter and search. This is the centrepiece the host works from.
  const guestsPanel = (
    <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--owner-border)] px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Guests</div>
          <div className="text-xs text-[var(--owner-fg-3)]">
            {scoped.length} {scoped.length === 1 ? "guest" : "guests"} ·{" "}
            {listFilter === "all"
              ? "all lists"
              : listLabel(listById.get(listFilter))}
          </div>
        </div>
        <button
          type="button"
          disabled={downloading || scoped.length === 0}
          onClick={() =>
            downloadCsv(listFilter === "all" ? undefined : listFilter)
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--owner-border)] px-3 py-1.5 text-xs font-medium hover:border-[#c89d75] disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Download size={13} />
          )}
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--owner-border)] px-4 py-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              filter === f.id
                ? "bg-[var(--owner-blue-500)] text-white"
                : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-3)]"
            }`}
          >
            {f.label} ({counts[f.id] ?? 0})
          </button>
        ))}
        {lists.length > 1 ? (
          <select
            value={listFilter}
            onChange={(e) => setListFilter(e.target.value)}
            className="rounded-md border border-[var(--owner-border)] bg-[var(--owner-bg)] px-2.5 py-1 text-xs"
          >
            <option value="all">All lists</option>
            {lists.map((l) => (
              <option key={l._id} value={l._id}>
                {listLabel(l)}
              </option>
            ))}
          </select>
        ) : null}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone"
          className="ml-auto min-w-[160px] flex-1 rounded-md border border-[var(--owner-border)] bg-transparent px-2.5 py-1.5 text-xs placeholder:text-[var(--owner-fg-3)]"
        />
      </div>

      {entriesLoading ? (
        <div className="flex items-center justify-center py-16 text-[var(--owner-fg-3)]">
          <Loader2 className="animate-spin" size={18} />
        </div>
      ) : scoped.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-[var(--owner-fg-3)]">
          No guests yet. Share a join link to start filling the list.
        </p>
      ) : visibleEntries.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-[var(--owner-fg-3)]">
          No guests match this filter.
        </p>
      ) : (
        <div className="max-h-[58dvh] overflow-auto overscroll-contain">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--owner-bg)]">
              <tr className="border-b border-[var(--owner-border)] text-left text-xs text-[var(--owner-fg-3)]">
                <th className="px-4 py-2.5 font-medium">Guest</th>
                <th className="px-4 py-2.5 font-medium">List</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                  Activity
                </th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleEntries.map((en) => {
                const l = listById.get(en.guestlistId);
                return (
                  <tr
                    key={en._id}
                    className="border-b border-[var(--owner-border-soft)] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="truncate font-medium">
                        {en.guestName || "Guest"}
                      </div>
                      <div className="truncate text-xs text-[var(--owner-fg-3)]">
                        {[en.guestPhone, en.guestEmail]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[var(--owner-fg-2)]">
                        {listLabel(l)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          en.checkedIn
                            ? "bg-blue-500/10 text-blue-600"
                            : en.status === "ACCEPTED"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : en.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {en.checkedIn
                          ? "Checked in"
                          : en.status === "ACCEPTED"
                          ? "Going"
                          : en.status === "PENDING"
                          ? "Pending"
                          : "Removed"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-[var(--owner-fg-3)] md:table-cell">
                      {activityLine(en) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* A collaborator can't act on an org-managed list —
                            the server rejects it, so hide the dead controls
                            (matches the Make-public gating on the list card). */}
                        {isOwner || l?.manageEnabled !== false ? (
                          <>
                            {en.status === "PENDING" ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => act(en._id, "approve")}
                                className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 disabled:opacity-50"
                              >
                                Approve
                              </button>
                            ) : null}
                            {en.status !== "REVOKED" ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => act(en._id, "revoke")}
                                className="inline-flex items-center gap-1 rounded-md border border-[var(--owner-border)] px-2 py-1 text-xs font-medium text-rose-600 hover:border-rose-300 disabled:opacity-50"
                              >
                                <X size={12} /> Remove
                              </button>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-xs text-[var(--owner-fg-3)]">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const content = (
    <div className="text-sm text-[var(--owner-fg-1)]">
      {!enabled ? (
        <div className="space-y-4">
          {isOwner ? settingsCard : null}
          <p className="text-xs text-[var(--owner-fg-3)]">
            Turn on the guestlist to create lists and share join links.
          </p>
        </div>
      ) : isOwner ? (
        // Owner: settings + list config on the left rail, the guests table on
        // the right — everything visible at once, no drilling in.
        <div className="grid gap-5 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-4">
            {settingsCard}
            {listsSection}
          </div>
          <div className="min-w-0">{guestsPanel}</div>
        </div>
      ) : (
        // Collaborator: their own list controls, then their guests table.
        <div className="space-y-5">
          {listsSection}
          {guestsPanel}
        </div>
      )}
    </div>
  );

  if (inline) return content;
  return (
    <ReusableModal
      isOpen={open}
      onClose={onClose ?? (() => undefined)}
      title="Guestlist"
      comments="Invite guests for free. They get a golden ticket that scans at the door."
      width="lg"
      isHighIndex
    >
      {content}
    </ReusableModal>
  );
};

export default GuestlistManagerModal;
