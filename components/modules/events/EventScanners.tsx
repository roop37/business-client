import ConfirmModal from "@/components/common/confirm-modal";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
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

// Scanner login email is DERIVED from the name and never user-editable:
// `<slug(name)>@scan.hoizr.com`. The server re-derives this authoritatively;
// we show the same value read-only so the host sees the login id up front.
const SCANNER_EMAIL_DOMAIN = "scan.hoizr.com";
const deriveScannerEmail = (name: string) => {
  const local = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  return local ? `${local}@${SCANNER_EMAIL_DOMAIN}` : "";
};

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
    if (!trimmedName) {
      setToastData({ type: "error", message: "Name is required" });
      return;
    }
    // Email is derived from the name (server is authoritative); guard that the
    // name yields a usable login local-part before submitting.
    const derivedEmail = deriveScannerEmail(trimmedName);
    if (editingId === null && !derivedEmail) {
      setToastData({
        type: "error",
        message: "Use letters or numbers in the name (it becomes the login id).",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId === null) {
        const result: any = await sdk.createScanner({
          input: {
            eventId,
            name: trimmedName,
            // "Description" maps to the display/scanner name; falls back to name.
            scannerName: form.scannerName.trim() || trimmedName,
            scannerType: form.scannerType.trim() || "main_door",
            // Derived + read-only; server re-derives authoritatively.
            email: derivedEmail,
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

  const scannerColumnHelper = createColumnHelper<Scanner>();
  const scannerColumns: ColumnDef<Scanner, any>[] = useMemo(
    () => [
      scannerColumnHelper.accessor("scannerName", {
        header: "Scanner",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-owner-fg-1">
                {row.original.scannerName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-owner-bg-subtle px-2 py-0.5 text-xs font-medium text-owner-fg-3">
                {labelForType(row.original.scannerType)}
              </span>
            </div>
            <span className="text-[12px] text-owner-fg-4">
              {row.original.name}
            </span>
          </div>
        ),
      }),
      scannerColumnHelper.accessor("email", {
        header: "Contact",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <DataTableTextCell value={row.original.email} />
            {row.original.phone ? (
              <span className="text-[12px] text-owner-fg-4">
                {row.original.phone}
              </span>
            ) : null}
          </div>
        ),
      }),
      scannerColumnHelper.accessor("totalScanned", {
        header: "Scans",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
              {row.original.totalScanned ?? 0}
            </span>
            <span className="text-[12px] text-owner-fg-4">
              Last login {formatDate(row.original.lastLoginAt)}
            </span>
          </div>
        ),
      }),
      scannerColumnHelper.accessor("isActive", {
        header: "Status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
              row.original.isActive
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {row.original.isActive ? "Active" : "Disabled"}
          </span>
        ),
      }),
      scannerColumnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const scanner = row.original;
          return (
            <TooltipProvider>
              <div className="flex items-center justify-center gap-3">
                <Tooltip>
                  <TooltipTrigger>
                    <PowerIcon
                      size={16}
                      className={`cursor-pointer ${
                        scanner.isActive ? "text-emerald-600" : "text-primary"
                      }`}
                      onClick={() => requestToggleActive(scanner)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>{scanner.isActive ? "Disable" : "Enable"}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <KeyRoundIcon
                      size={16}
                      className="text-primary cursor-pointer"
                      onClick={() => requestRegenerate(scanner)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>Regenerate access code</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Edit3Icon
                      size={16}
                      className="text-primary cursor-pointer"
                      onClick={() => openEditModal(scanner)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Trash2Icon
                      size={16}
                      className="text-red-600 cursor-pointer"
                      onClick={() => requestDelete(scanner)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>Remove</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scannerColumnHelper]
  );

  const scanColumnHelper = createColumnHelper<ScanRow>();
  const scanColumns: ColumnDef<ScanRow, any>[] = useMemo(
    () => [
      scanColumnHelper.accessor("customerName", {
        header: "Customer",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-owner-fg-1">
              {row.original.customerName || "Guest"}
            </span>
            <span className="text-[12px] text-owner-fg-4">
              {row.original.customerPhone ||
                `Order ${row.original.orderId.slice(-8)}`}
            </span>
          </div>
        ),
      }),
      scanColumnHelper.accessor("ticketCount", {
        header: "Tickets",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm text-owner-fg-1">
              {row.original.ticketCount} ticket
              {row.original.ticketCount === 1 ? "" : "s"}
            </span>
            <span className="max-w-[280px] truncate text-[12px] text-owner-fg-4">
              {row.original.ticketNames.join(", ") || "-"}
            </span>
          </div>
        ),
      }),
      scanColumnHelper.accessor("scannerName", {
        header: "Scanner",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.scannerName || "Scanner"} />
        ),
      }),
      scanColumnHelper.accessor("checkedInAt", {
        header: "Checked in",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell value={formatDate(row.original.checkedInAt)} />
        ),
      }),
      scanColumnHelper.display({
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <TooltipProvider>
            <div className="flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger>
                  <Undo2Icon
                    size={16}
                    className="text-amber-700 cursor-pointer"
                    onClick={() => {
                      setReverseTarget(row.original);
                      setReverseReason("");
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-xs">
                  <p>Reverse check-in</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scanColumnHelper]
  );

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

      <DataTable
        totalRows={scanners.length}
        columns={scannerColumns}
        data={scanners}
        loading={loading}
        manualPagination={false}
        hideDownloadButton
        pageSize={10}
        addClickHandler={openCreateModal}
      />

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
        <div className="p-4">
          <DataTable
            totalRows={scanTotal}
            columns={scanColumns}
            data={scanRows}
            loading={scansLoading}
            manualPagination={true}
            hideDownloadButton
            pageSize={SCAN_PAGE_SIZE}
            pageCount={scanTotalPages}
            nextPage={() => {
              if (scanPage < scanTotalPages)
                setScanPage((current) => current + 1);
            }}
            prevPage={() => {
              if (scanPage > 1) setScanPage((current) => current - 1);
            }}
            paginationData={{
              pageIndex: scanPage - 1,
              pageSize: SCAN_PAGE_SIZE,
            }}
          />
        </div>
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
                Name *
                <input
                  value={form.name}
                  disabled={editingId !== null}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="input input-primary mt-1 h-10 w-full px-3 text-sm disabled:opacity-60"
                  placeholder="e.g. Riya Sharma"
                />
              </label>
              {editingId === null ? (
                <label className="block text-sm font-medium">
                  Login email
                  <input
                    value={deriveScannerEmail(form.name) || `…@${SCANNER_EMAIL_DOMAIN}`}
                    readOnly
                    disabled
                    className="input input-primary mt-1 h-10 w-full px-3 text-sm opacity-70"
                  />
                  <span className="mt-1 block text-xs text-[var(--owner-fg-3)]">
                    Auto-created from the name — this is the scanner&apos;s login id and can&apos;t be changed.
                  </span>
                </label>
              ) : null}
              <label className="block text-sm font-medium">
                Description (optional)
                <input
                  value={form.scannerName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      scannerName: event.target.value,
                    }))
                  }
                  className="input input-primary mt-1 h-10 w-full px-3 text-sm"
                  placeholder="e.g. Evening shift, VIP entrance"
                />
              </label>
              <div className="block text-sm font-medium">
                Door / gate (optional)
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
                    placeholder="Custom (e.g. side_gate)"
                    className="input input-primary mt-2 h-10 w-full px-3 text-sm"
                  />
                ) : null}
              </div>
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
