import ConfirmModal from "@/components/common/confirm-modal";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  CheckCircle2Icon,
  ClipboardCopyIcon,
  Edit3Icon,
  HistoryIcon,
  KeyRoundIcon,
  Loader2Icon,
  MailIcon,
  MessageCircleIcon,
  PlusIcon,
  PowerIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  Trash2Icon,
  Undo2Icon,
  XIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type Scanner = {
  _id: string;
  name: string;
  scannerName: string;
  scannerType: string;
  email: string;
  phone?: string | null;
  eventId: string;
  totalScanned?: number;
  lastLoginAt?: string | null;
  isActive: boolean;
  createdAt?: string;
};

type FormState = {
  name: string;
  scannerName: string;
  scannerType: string;
  email: string;
  phone: string;
};

type ConfirmAction = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "default" | "danger" | "warning";
  onConfirm: () => void | Promise<void>;
};

type ScanRow = {
  orderId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  ticketCount: number;
  ticketNames: string[];
  checkedInAt?: string | null;
  scannerId?: string | null;
  scannerName?: string | null;
};

const SCANNER_TYPE_PRESETS = [
  "main_door",
  "back_door",
  "door_1",
  "door_2",
  "vip",
  "press",
  "staff",
];

const labelForType = (raw: string) =>
  raw
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const emptyForm: FormState = {
  name: "",
  scannerName: "",
  scannerType: "main_door",
  email: "",
  phone: "",
};

const SCAN_PAGE_SIZE = 25;

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const EventScanners = ({ eventId }: { eventId: string }) => {
  const { setToastData } = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [accessCodeView, setAccessCodeView] = useState<{
    code: string;
    scannerName: string;
    email: string;
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [scanRows, setScanRows] = useState<ScanRow[]>([]);
  const [scanTotal, setScanTotal] = useState(0);
  const [scanPage, setScanPage] = useState(1);
  const [scansLoading, setScansLoading] = useState(false);
  const [reverseTarget, setReverseTarget] = useState<ScanRow | null>(null);
  const [reverseReason, setReverseReason] = useState("");
  const [reversing, setReversing] = useState(false);

  const customSelectedType = useMemo(() => {
    if (!form.scannerType) return false;
    return !SCANNER_TYPE_PRESETS.includes(form.scannerType);
  }, [form.scannerType]);

  const load = async () => {
    setLoading(true);
    try {
      const data: any = await sdk.listScannersForEvent({ eventId });
      setScanners(data.listScannersForEvent ?? []);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const loadScans = async () => {
    setScansLoading(true);
    try {
      const data: any = await sdk.hostListEventScans({
        eventId,
        page: scanPage,
        pageSize: SCAN_PAGE_SIZE,
      });
      setScanRows(data.hostListEventScans?.items ?? []);
      setScanTotal(data.hostListEventScans?.total ?? 0);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setScansLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) loadScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, scanPage]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (scanner: Scanner) => {
    setEditingId(scanner._id);
    setForm({
      name: scanner.name,
      scannerName: scanner.scannerName,
      scannerType: scanner.scannerType,
      email: scanner.email,
      phone: scanner.phone ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName) {
      setToastData({ type: "error", message: "Name is required" });
      return;
    }
    if (editingId === null) {
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setToastData({ type: "error", message: "A valid email is required" });
        return;
      }
    }

    setSubmitting(true);
    try {
      if (editingId === null) {
        const result: any = await sdk.createScanner({
          input: {
            eventId,
            name: trimmedName,
            scannerName: form.scannerName.trim() || trimmedName,
            scannerType: form.scannerType.trim() || "main_door",
            email: trimmedEmail,
            phone: form.phone.trim() || undefined,
          },
        });
        const created = result.createScanner;
        setAccessCodeView({
          code: created.accessCode,
          scannerName: created.scanner.scannerName,
          email: created.scanner.email,
        });
        setToastData({ type: "success", message: "Scanner created" });
      } else {
        await sdk.updateScanner({
          input: {
            scannerId: editingId,
            scannerName: form.scannerName.trim() || form.name.trim(),
            scannerType: form.scannerType.trim() || "main_door",
            phone: form.phone.trim() || undefined,
          },
        });
        setToastData({ type: "success", message: "Scanner updated" });
      }
      closeModal();
      await load();
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const regenerateScannerAccessCode = async (scanner: Scanner) => {
    try {
      const result: any = await sdk.regenerateScannerAccessCode({
        scannerId: scanner._id,
      });
      setAccessCodeView({
        code: result.regenerateScannerAccessCode.accessCode,
        scannerName: scanner.scannerName,
        email: scanner.email,
      });
      setToastData({ type: "success", message: "Access code regenerated" });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const requestRegenerate = (scanner: Scanner) => {
    setConfirmAction({
      title: "Regenerate scanner code?",
      description: (
        <>
          This will replace the access code for{" "}
          <strong>{scanner.scannerName}</strong>. Their old code stops working
          immediately, and this cannot be undone.
        </>
      ),
      confirmLabel: "Regenerate",
      tone: "warning",
      onConfirm: () => regenerateScannerAccessCode(scanner),
    });
  };

  const toggleScannerActive = async (scanner: Scanner) => {
    try {
      await sdk.updateScanner({
        input: { scannerId: scanner._id, isActive: !scanner.isActive },
      });
      await load();
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const requestToggleActive = (scanner: Scanner) => {
    const nextState = !scanner.isActive;
    setConfirmAction({
      title: nextState ? "Enable scanner?" : "Disable scanner?",
      description: (
        <>
          {nextState ? "Enable" : "Disable"}{" "}
          <strong>{scanner.scannerName}</strong> for this event.{" "}
          {nextState
            ? "They will be able to scan tickets again."
            : "They will stop being able to scan tickets until re-enabled."}
        </>
      ),
      confirmLabel: nextState ? "Enable scanner" : "Disable scanner",
      tone: nextState ? "default" : "warning",
      onConfirm: () => toggleScannerActive(scanner),
    });
  };

  const deleteScanner = async (scanner: Scanner) => {
    try {
      await sdk.deleteScanner({ scannerId: scanner._id });
      setToastData({ type: "success", message: "Scanner removed" });
      await load();
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const requestDelete = (scanner: Scanner) => {
    setConfirmAction({
      title: "Remove scanner?",
      description: (
        <>
          Remove <strong>{scanner.scannerName}</strong> from this event. They
          will no longer be able to scan tickets; add them again later if access
          is needed.
        </>
      ),
      confirmLabel: "Remove scanner",
      tone: "danger",
      onConfirm: () => deleteScanner(scanner),
    });
  };

  const requestRevokeAll = () => {
    setConfirmAction({
      title: "Revoke every scanner session?",
      description:
        "Every active scanner for this event will be forced to log in again. Scanner records remain in place.",
      confirmLabel: "Revoke sessions",
      tone: "danger",
      onConfirm: async () => {
        const response: any = await sdk.hostRevokeAllScannersForEvent({
          eventId,
        });
        const touched = response.hostRevokeAllScannersForEvent ?? 0;
        setToastData({
          type: "success",
          message: `${touched} scanner session${touched === 1 ? "" : "s"} revoked`,
        });
        await load();
      },
    });
  };

  const submitReverseCheckIn = async () => {
    if (!reverseTarget) return;
    const reason = reverseReason.trim();
    if (!reason) {
      setToastData({
        type: "error",
        message: "Reason is required to reverse a check-in",
      });
      return;
    }
    setReversing(true);
    try {
      await sdk.hostReverseCheckIn({
        orderId: reverseTarget.orderId,
        reason,
      });
      setToastData({ type: "success", message: "Check-in reversed" });
      setReverseTarget(null);
      setReverseReason("");
      await Promise.all([load(), loadScans()]);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setReversing(false);
    }
  };

  const scanTotalPages = Math.max(1, Math.ceil(scanTotal / SCAN_PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Scanners</h2>
          <p className="mt-1 text-sm text-[var(--owner-fg-3)]">
            Create credentialed scanner accounts for door staff. Each scanner
            logs into the Hoizr Scanner app with email + access code.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={requestRevokeAll}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
          >
            <ShieldAlertIcon size={16} />
            Revoke sessions
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--owner-fg-1)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)]"
          >
            <PlusIcon size={16} />
            Add scanner
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--owner-border)] bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--owner-fg-3)]">
            <Loader2Icon size={16} className="animate-spin" />
            Loading scanners…
          </div>
        ) : scanners.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--owner-fg-3)]">
            No scanners added yet. Add one to give door staff access.
          </div>
        ) : (
          <div className="divide-y divide-[var(--owner-bg-subtle)]">
            {scanners.map((scanner) => (
              <div
                key={scanner._id}
                className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_120px_200px] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">
                      {scanner.scannerName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--owner-fg-3)]">
                      {labelForType(scanner.scannerType)}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-[var(--owner-fg-3)]">
                    {scanner.name}
                  </div>
                </div>
                <div className="min-w-0 text-xs text-[var(--owner-fg-3)]">
                  <div className="truncate">{scanner.email}</div>
                  {scanner.phone ? (
                    <div className="truncate">{scanner.phone}</div>
                  ) : null}
                </div>
                <div className="text-xs">
                  <div>{scanner.totalScanned ?? 0} scans</div>
                  <div className="text-[var(--owner-fg-3)]">
                    Last login {formatDate(scanner.lastLoginAt)}
                  </div>
                </div>
                <div className="flex flex-wrap justify-start gap-1.5 md:justify-end">
                  <button
                    type="button"
                    onClick={() => requestToggleActive(scanner)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border ${
                      scanner.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-[var(--owner-border)] text-[var(--owner-fg-3)]"
                    }`}
                    title={scanner.isActive ? "Disable" : "Enable"}
                  >
                    <PowerIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestRegenerate(scanner)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--owner-border)]"
                    title="Regenerate access code"
                  >
                    <KeyRoundIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(scanner)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--owner-border)]"
                    title="Edit"
                  >
                    <Edit3Icon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestDelete(scanner)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-700"
                    title="Remove"
                  >
                    <Trash2Icon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[var(--owner-border)] bg-white">
        <div className="flex flex-col gap-3 border-b border-[var(--owner-border)] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HistoryIcon size={16} className="text-[var(--owner-blue-500)]" />
              Admission audit
            </div>
            <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
              Every checked-in order with the scanner that admitted it.
            </p>
          </div>
          <button
            type="button"
            onClick={loadScans}
            className="inline-flex items-center justify-center rounded-md border border-[var(--owner-border)] px-3 py-2 text-xs font-semibold"
          >
            Refresh
          </button>
        </div>
        {scansLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--owner-fg-3)]">
            <Loader2Icon size={16} className="animate-spin" />
            Loading admissions...
          </div>
        ) : scanRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[var(--owner-fg-3)]">
            No admissions scanned yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--owner-border)] text-left text-xs text-[var(--owner-fg-3)]">
                    <th className="px-4 py-2 font-semibold">Customer</th>
                    <th className="px-4 py-2 font-semibold">Tickets</th>
                    <th className="px-4 py-2 font-semibold">Scanner</th>
                    <th className="px-4 py-2 font-semibold">Checked in</th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scanRows.map((row) => (
                    <tr
                      key={row.orderId}
                      className="border-b border-[var(--owner-border-soft)] last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {row.customerName || "Guest"}
                        </div>
                        <div className="text-xs text-[var(--owner-fg-3)]">
                          {row.customerPhone || `Order ${row.orderId.slice(-8)}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{row.ticketCount} ticket{row.ticketCount === 1 ? "" : "s"}</div>
                        <div className="max-w-[280px] truncate text-xs text-[var(--owner-fg-3)]">
                          {row.ticketNames.join(", ") || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.scannerName || "Scanner"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {formatDate(row.checkedInAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setReverseTarget(row);
                            setReverseReason("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
                        >
                          <Undo2Icon size={13} />
                          Reverse
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {scanTotalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-[var(--owner-border)] px-4 py-3 text-xs text-[var(--owner-fg-3)]">
                <span>
                  Page {scanPage} of {scanTotalPages} · {scanTotal} admissions
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={scanPage <= 1}
                    onClick={() => setScanPage((current) => Math.max(1, current - 1))}
                    className="rounded-md border border-[var(--owner-border)] px-3 py-1.5 font-semibold disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={scanPage >= scanTotalPages}
                    onClick={() =>
                      setScanPage((current) =>
                        Math.min(scanTotalPages, current + 1)
                      )
                    }
                    className="rounded-md border border-[var(--owner-border)] px-3 py-1.5 font-semibold disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
          <div className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-[var(--owner-bg)] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--owner-border)] px-5 py-4">
              <div className="text-sm font-semibold">
                {editingId === null ? "Add scanner" : "Edit scanner"}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)]"
              >
                <XIcon size={16} />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              <label className="block text-sm font-medium">
                Person&apos;s Name *
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => {
                      const next = { ...current, name: event.target.value };
                      if (!current.scannerName.trim()) {
                        next.scannerName = event.target.value;
                      }
                      return next;
                    })
                  }
                  className="input input-primary mt-1 h-10 w-full px-3 text-sm"
                  placeholder="e.g. Riya Sharma"
                />
              </label>
              <label className="block text-sm font-medium">
                Display (scanner) name
                <input
                  value={form.scannerName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      scannerName: event.target.value,
                    }))
                  }
                  className="input input-primary mt-1 h-10 w-full px-3 text-sm"
                  placeholder="Defaults to person's name"
                />
              </label>
              <div className="block text-sm font-medium">
                Scanner type
                <div className="mt-1 flex flex-wrap gap-2">
                  {SCANNER_TYPE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          scannerType: preset,
                        }))
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        form.scannerType === preset
                          ? "border-[var(--owner-blue-500)] bg-white"
                          : "border-[var(--owner-border)] bg-[var(--owner-bg)]"
                      }`}
                    >
                      {labelForType(preset)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        scannerType: customSelectedType
                          ? current.scannerType
                          : "",
                      }))
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      customSelectedType
                        ? "border-[var(--owner-blue-500)] bg-white"
                        : "border-[var(--owner-border)] bg-[var(--owner-bg)]"
                    }`}
                  >
                    Custom…
                  </button>
                </div>
                {customSelectedType || form.scannerType === "" ? (
                  <input
                    value={form.scannerType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        scannerType: event.target.value.replace(/\s+/g, "_"),
                      }))
                    }
                    placeholder="Custom type (e.g. side_gate)"
                    className="input input-primary mt-2 h-10 w-full px-3 text-sm"
                  />
                ) : null}
              </div>
              <label className="block text-sm font-medium">
                Email * <span className="text-xs text-[var(--owner-fg-3)]">(login id)</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  disabled={editingId !== null}
                  className="input input-primary mt-1 h-10 w-full px-3 text-sm disabled:opacity-60"
                />
                {editingId !== null ? (
                  <span className="mt-1 block text-xs text-[var(--owner-fg-3)]">
                    Email cannot be changed after creation.
                  </span>
                ) : null}
              </label>
              <label className="block text-sm font-medium">
                Phone (optional)
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  className="input input-primary mt-1 h-10 w-full px-3 text-sm"
                />
              </label>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--owner-border)] px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-lg border border-[var(--owner-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)] disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2Icon size={14} className="animate-spin" />
                ) : editingId === null ? (
                  "Create scanner"
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {reverseTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
          <div className="w-full max-w-md rounded-lg bg-[var(--owner-bg)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">
                  Reverse check-in
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--owner-fg-3)]">
                  This marks order {reverseTarget.orderId.slice(-8)} as not
                  checked in and records the reason for audit.
                </p>
              </div>
              <button
                type="button"
                disabled={reversing}
                onClick={() => setReverseTarget(null)}
                className="grid h-9 w-9 place-items-center rounded-md border border-[var(--owner-border)]"
              >
                <XIcon size={16} />
              </button>
            </div>
            <label className="mt-4 block text-sm font-medium">
              Reason *
              <textarea
                autoFocus
                rows={3}
                value={reverseReason}
                onChange={(event) => setReverseReason(event.target.value)}
                placeholder="Example: scanned wrong order at the door"
                className="mt-1 w-full rounded-md border border-[var(--owner-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--owner-blue-500)]"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={reversing}
                onClick={() => setReverseTarget(null)}
                className="rounded-lg border border-[var(--owner-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reversing}
                onClick={submitReverseCheckIn}
                className="inline-flex min-w-[132px] items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {reversing ? (
                  <Loader2Icon size={14} className="animate-spin" />
                ) : null}
                Reverse check-in
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {accessCodeView ? (
        <AccessCodeOnceModal
          code={accessCodeView.code}
          scannerName={accessCodeView.scannerName}
          email={accessCodeView.email}
          onClose={() => setAccessCodeView(null)}
        />
      ) : null}
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

const AccessCodeOnceModal = ({
  code,
  scannerName,
  email,
  onClose,
}: {
  code: string;
  scannerName: string;
  email: string;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
      <div className="w-full max-w-md rounded-lg bg-[var(--owner-bg)] p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ShieldCheckIcon size={18} />
          Save this access code now
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--owner-fg-3)]">
          This is the only time the access code is shown.{" "}
          <span className="font-semibold">Send it securely to {scannerName}</span>
          {" "}({email}). They will use email + this code to log in to the
          Hoizr Scanner app.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--owner-border)] bg-white px-4 py-3">
          <span className="flex-1 font-mono text-2xl tracking-[0.25em]">
            {code}
          </span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--owner-border)] bg-[var(--owner-bg)] px-3 text-xs font-semibold"
          >
            {copied ? (
              <>
                <CheckCircle2Icon size={14} className="text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <ClipboardCopyIcon size={14} />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Quick-share shortcuts so the host can hand the access code to
            the scanner without leaving this modal. The message body
            mirrors what the scanner needs to log in (email + code). */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hi ${scannerName}, here is your Hoizr Scanner login:\nEmail: ${email}\nAccess code: ${code}\n\nOpen the Hoizr Scanner app and sign in with these.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--owner-border)] bg-white px-3 text-xs font-semibold text-[var(--owner-fg-1)] hover:border-[var(--owner-blue-500)]"
          >
            <MessageCircleIcon size={14} />
            Share via WhatsApp
          </a>
          <a
            href={`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
              `Your Hoizr Scanner login`
            )}&body=${encodeURIComponent(
              `Hi ${scannerName},\n\nYour Hoizr Scanner credentials:\nEmail: ${email}\nAccess code: ${code}\n\nOpen the Hoizr Scanner app and sign in with these. Keep the code secret — it gives access to scan tickets at the door.\n\n— Hoizr`
            )}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--owner-border)] bg-white px-3 text-xs font-semibold text-[var(--owner-fg-1)] hover:border-[var(--owner-blue-500)]"
          >
            <MailIcon size={14} />
            Email to scanner
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[var(--owner-fg-1)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)]"
        >
          I have saved the code
        </button>
      </div>
    </div>
  );
};
