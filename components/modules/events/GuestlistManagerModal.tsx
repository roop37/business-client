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
  open: boolean;
  onClose: () => void;
  eventId: string;
  guestlistEnabled: boolean;
  guestlistAutoAccept: boolean;
  /** Refresh the parent overview after a settings change. */
  onSettingsChanged?: () => void;
}

const GuestlistManagerModal: React.FC<Props> = ({
  open,
  onClose,
  eventId,
  guestlistEnabled,
  guestlistAutoAccept,
  onSettingsChanged,
}) => {
  const { setToastData } = useGlobalStore();
  const [enabled, setEnabled] = useState(guestlistEnabled);
  const [autoAccept, setAutoAccept] = useState(guestlistAutoAccept);
  const [lists, setLists] = useState<GuestlistConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<GuestlistEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(guestlistEnabled);
    setAutoAccept(guestlistAutoAccept);
  }, [guestlistEnabled, guestlistAutoAccept, open]);

  const loadLists = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const resp = await sdk.eventGuestlists({ eventId });
      setLists(resp?.eventGuestlists ?? []);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [open, eventId, setToastData]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const saveSettings = async (next: {
    enabled: boolean;
    autoAccept: boolean;
  }) => {
    setBusy(true);
    try {
      await sdk.setEventGuestlistSettings({
        input: {
          eventId,
          guestlistEnabled: next.enabled,
          guestlistAutoAccept: next.autoAccept,
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

  const toggleActive = async (list: GuestlistConfig) => {
    setBusy(true);
    try {
      await sdk.upsertGuestlist({
        input: {
          eventId,
          contributorType: list.contributorType,
          contributorId: list.contributorId,
          isActive: !list.isActive,
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

  const openEntries = async (listId: string) => {
    if (expandedId === listId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(listId);
    setEntriesLoading(true);
    setFilter("all");
    setSearch("");
    try {
      const resp = await sdk.guestlistEntries({ eventId, guestlistId: listId });
      setEntries(resp?.guestlistEntries ?? []);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setEntriesLoading(false);
    }
  };

  // Server-generated CSV (returns a download URL). Scoped to one list.
  const downloadCsv = async (listId: string) => {
    setDownloading(listId);
    try {
      const resp = await sdk.guestlistEntriesCsv({ eventId, guestlistId: listId });
      const url = resp?.guestlistEntriesCsv;
      if (url) window.open(url, "_blank", "noopener");
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setDownloading(null);
    }
  };

  const act = async (
    entryId: string,
    action: "approve" | "revoke",
    listId: string
  ) => {
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
      // Re-pull this list's entries.
      const resp = await sdk.guestlistEntries({ eventId, guestlistId: listId });
      setEntries(resp?.guestlistEntries ?? []);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const hasHostList = lists.some((l) => l.contributorType === "HOST");

  return (
    <ReusableModal
      isOpen={open}
      onClose={onClose}
      title="Guestlist"
      comments="Invite guests for free. They get a golden ticket that scans at the door."
      width="lg"
      isHighIndex
    >
      <div className="space-y-5 text-sm text-[var(--owner-fg-1)]">
        {/* Settings */}
        <div className="space-y-3 rounded-lg border border-[var(--owner-border)] p-4">
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
                Off = each join waits for approval below.
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
        </div>

        {!enabled ? (
          <p className="text-xs text-[var(--owner-fg-3)]">
            Turn on the guestlist to create lists and share join links.
          </p>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-[var(--owner-fg-3)]">
                <Loader2 className="animate-spin" size={18} />
              </div>
            ) : (
              <>
                {!hasHostList ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={createHostList}
                    className="rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Create my guestlist
                  </button>
                ) : null}

                {lists.length === 0 ? (
                  <p className="text-xs text-[var(--owner-fg-3)]">
                    No lists yet. Create yours, or add collaborators/artists to
                    give them their own.
                  </p>
                ) : null}

                {lists.map((list) => (
                  <div
                    key={list._id}
                    className={`rounded-lg border border-[var(--owner-border)] ${
                      list.isActive ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <div className="font-medium">
                          {list.contributorName ||
                            (list.contributorType === "HOST"
                              ? "You (host)"
                              : list.contributorType)}
                          <span className="ml-2 rounded-full bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--owner-fg-3)]">
                            {list.contributorType}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--owner-fg-3)]">
                          {list.cap != null ? `Cap ${list.cap}` : "No cap"} ·{" "}
                          {list.isPublic ? "Public" : "Private link only"}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => toggleActive(list)}
                          title={
                            list.isActive
                              ? "Guestlist on — tap to turn off"
                              : "Guestlist off — tap to turn on"
                          }
                          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                            list.isActive
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-3)]"
                          }`}
                        >
                          {list.isActive ? "On" : "Off"}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyLink(list.code)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--owner-border)] px-2.5 py-1.5 text-xs font-medium hover:border-[#c89d75]"
                        >
                          {copied === list.code ? (
                            <Check size={13} />
                          ) : (
                            <Copy size={13} />
                          )}
                          {copied === list.code ? "Copied" : "Copy link"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => togglePublic(list)}
                          className="rounded-md border border-[var(--owner-border)] px-2.5 py-1.5 text-xs font-medium hover:border-[#c89d75]"
                        >
                          {list.isPublic ? "Make private" : "Make public"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEntries(list._id)}
                          className="rounded-md border border-[var(--owner-border)] px-2.5 py-1.5 text-xs font-medium hover:border-[#c89d75]"
                        >
                          {expandedId === list._id ? "Hide guests" : "View guests"}
                        </button>
                        <button
                          type="button"
                          disabled={downloading === list._id}
                          onClick={() => downloadCsv(list._id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--owner-border)] px-2.5 py-1.5 text-xs font-medium hover:border-[#c89d75] disabled:opacity-50"
                        >
                          {downloading === list._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Download size={13} />
                          )}
                          CSV
                        </button>
                      </div>
                    </div>

                    {expandedId === list._id ? (
                      <div className="border-t border-[var(--owner-border)] p-3">
                        {entriesLoading ? (
                          <div className="flex items-center justify-center py-4 text-[var(--owner-fg-3)]">
                            <Loader2 className="animate-spin" size={16} />
                          </div>
                        ) : entries.length === 0 ? (
                          <p className="py-2 text-xs text-[var(--owner-fg-3)]">
                            No guests yet.
                          </p>
                        ) : (
                          (() => {
                            const counts: Record<string, number> = {
                              all: entries.length,
                              pending: entries.filter(
                                (e) => e.status === "PENDING"
                              ).length,
                              going: entries.filter(
                                (e) => e.status === "ACCEPTED" && !e.checkedIn
                              ).length,
                              checkedin: entries.filter((e) => e.checkedIn)
                                .length,
                              removed: entries.filter(
                                (e) => e.status === "REVOKED"
                              ).length,
                            };
                            const q = search.trim().toLowerCase();
                            const visible = entries.filter((en) => {
                              if (filter === "pending" && en.status !== "PENDING")
                                return false;
                              if (
                                filter === "going" &&
                                !(en.status === "ACCEPTED" && !en.checkedIn)
                              )
                                return false;
                              if (filter === "checkedin" && !en.checkedIn)
                                return false;
                              if (filter === "removed" && en.status !== "REVOKED")
                                return false;
                              if (q) {
                                const hay = [
                                  en.guestName,
                                  en.guestEmail,
                                  en.guestPhone,
                                ]
                                  .filter(Boolean)
                                  .join(" ")
                                  .toLowerCase();
                                if (!hay.includes(q)) return false;
                              }
                              return true;
                            });
                            return (
                              <>
                                <div className="mb-3 flex flex-wrap items-center gap-1.5">
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
                                  <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search name, email, phone"
                                    className="ml-auto min-w-[150px] flex-1 rounded-md border border-[var(--owner-border)] bg-transparent px-2.5 py-1 text-xs placeholder:text-[var(--owner-fg-3)]"
                                  />
                                </div>
                                {visible.length === 0 ? (
                                  <p className="py-2 text-xs text-[var(--owner-fg-3)]">
                                    No guests match this filter.
                                  </p>
                                ) : (
                                  <div className="divide-y divide-[var(--owner-border-soft)]">
                                    {visible.map((en) => (
                                      <div
                                        key={en._id}
                                        className="flex items-center justify-between gap-3 py-2"
                                      >
                                        <div className="min-w-0">
                                          <div className="truncate text-sm font-medium">
                                            {en.guestName || "Guest"}
                                          </div>
                                          <div className="truncate text-xs text-[var(--owner-fg-3)]">
                                            {[en.guestPhone, en.guestEmail]
                                              .filter(Boolean)
                                              .join(" · ")}
                                          </div>
                                          {activityLine(en) ? (
                                            <div className="mt-0.5 truncate text-[11px] text-[var(--owner-fg-3)] opacity-80">
                                              {activityLine(en)}
                                            </div>
                                          ) : null}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                          <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
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
                                              : en.status}
                                          </span>
                                          {en.status === "PENDING" ? (
                                            <button
                                              type="button"
                                              disabled={busy}
                                              onClick={() =>
                                                act(en._id, "approve", list._id)
                                              }
                                              className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 disabled:opacity-50"
                                            >
                                              Approve
                                            </button>
                                          ) : null}
                                          {en.status !== "REVOKED" ? (
                                            <button
                                              type="button"
                                              disabled={busy}
                                              onClick={() =>
                                                act(en._id, "revoke", list._id)
                                              }
                                              className="inline-flex items-center gap-1 rounded-md border border-[var(--owner-border)] px-2 py-1 text-xs font-medium text-rose-600 hover:border-rose-300 disabled:opacity-50"
                                            >
                                              <X size={12} /> Remove
                                            </button>
                                          ) : null}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </ReusableModal>
  );
};

export default GuestlistManagerModal;
