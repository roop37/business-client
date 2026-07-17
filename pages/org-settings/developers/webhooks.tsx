import { Badge, OwnerButton, PageHeader } from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import DevelopersTabs from "@/components/developers/DevelopersTabs";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { HostWebhookEventType } from "@/generated/graphql";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { GetServerSideProps } from "next";
import { Copy, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type WebhookRow = {
  _id: string;
  url: string;
  secretLast6: string;
  enabledEvents: HostWebhookEventType[];
  active: boolean;
  label?: string | null;
  lastDeliveryAt?: any | null;
  createdAt?: any | null;
};

const ALL_EVENTS: { value: HostWebhookEventType; label: string; hint: string }[] = [
  { value: HostWebhookEventType.OrderPaid, label: "order.paid", hint: "A ticket order was paid" },
  { value: HostWebhookEventType.OrderRefunded, label: "order.refunded", hint: "An order was fully refunded" },
  { value: HostWebhookEventType.OrderCancelled, label: "order.cancelled", hint: "An order was cancelled" },
];

const inputCls =
  "w-full rounded-owner-md border border-owner-border bg-white px-3 py-2 text-sm text-owner-fg-1 focus:outline-none focus:ring-2 focus:ring-owner-primary/30";
const labelCls = "block text-xs font-medium text-owner-fg-3 mb-1";

const SecretModal: React.FC<{ secret: string; onClose: () => void }> = ({ secret, onClose }) => {
  const { setToastData } = useGlobalStore();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-owner-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-owner-fg-1">Copy your signing secret</h3>
        <p className="mt-1 text-sm text-owner-fg-3">
          Use this to verify the <code>X-Hoizr-Signature</code> header on every
          delivery. We show it once — store it safely.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-owner-md border border-owner-border bg-owner-bg-2 px-3 py-2">
          <code className="flex-1 break-all text-sm text-owner-fg-1">{secret}</code>
          <button
            className="shrink-0 text-owner-fg-3 hover:text-owner-primary"
            title="Copy"
            onClick={async () => {
              await navigator.clipboard.writeText(secret);
              setToastData({ type: "success", message: "Secret copied" });
            }}
          >
            <Copy size={16} />
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <OwnerButton onClick={onClose}>I’ve saved it</OwnerButton>
        </div>
      </div>
    </div>
  );
};

const CreateWebhookForm: React.FC<{ onCreated: (secret: string) => void; onCancel: () => void }> = ({
  onCreated,
  onCancel,
}) => {
  const { setToastData } = useGlobalStore();
  const [saving, setSaving] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [events, setEvents] = useState<HostWebhookEventType[]>([
    HostWebhookEventType.OrderPaid,
  ]);

  const toggle = (e: HostWebhookEventType) =>
    setEvents((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));

  const create = async () => {
    if (!url.trim().startsWith("https://")) {
      setToastData({ type: "error", message: "Endpoint must be an https URL" });
      return;
    }
    if (events.length === 0) {
      setToastData({ type: "error", message: "Pick at least one event" });
      return;
    }
    setSaving(true);
    try {
      const res = await sdk.CreateHostWebhook({
        input: { url: url.trim(), enabledEvents: events, label: label.trim() || undefined },
      });
      onCreated(res.createHostWebhook.secret);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl rounded-owner-lg border border-owner-border bg-white p-5">
      <h3 className="text-base font-semibold text-owner-fg-1">New webhook endpoint</h3>
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <label className={labelCls}>Endpoint URL (https)</label>
          <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.yoursite.com/hoizr/webhook" />
        </div>
        <div>
          <label className={labelCls}>Label (optional)</label>
          <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Production" />
        </div>
        <div>
          <label className={labelCls}>Events to send</label>
          <div className="space-y-2">
            {ALL_EVENTS.map((e) => (
              <label key={e.value} className="flex items-center gap-2 text-sm text-owner-fg-1">
                <input type="checkbox" checked={events.includes(e.value)} onChange={() => toggle(e.value)} />
                <span className="font-mono">{e.label}</span>
                <span className="text-owner-fg-3">— {e.hint}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <OwnerButton onClick={create} disabled={saving}>
          {saving ? "Creating…" : "Create webhook"}
        </OwnerButton>
        <OwnerButton variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </OwnerButton>
      </div>
    </div>
  );
};

const Webhooks = () => {
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const [rows, setRows] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSideBarMenu("Developers");
  }, [setSelectedSideBarMenu]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await sdk.HostWebhooks();
      setRows(res.hostWebhooks as WebhookRow[]);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const del = async (id: string) => {
    try {
      await sdk.DeleteHostWebhook({ id });
      setToastData({ type: "success", message: "Webhook deleted" });
      load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    }
  };

  const rotate = async (id: string) => {
    try {
      const res = await sdk.RotateHostWebhookSecret({ id });
      setSecret(res.rotateHostWebhookSecret.secret);
      load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    }
  };

  const columnHelper = createColumnHelper<WebhookRow>();
  const columns: ColumnDef<WebhookRow, any>[] = useMemo(
    () => [
      columnHelper.accessor("url", {
        header: "Endpoint",
        enableSorting: false,
        cell: ({ row }) => <DataTableTextCell value={row.original.url} />,
      }),
      columnHelper.display({
        id: "events",
        header: "Events",
        cell: ({ row }) => (
          <span className="text-xs font-mono text-owner-fg-1">
            {row.original.enabledEvents
              .map((e) => e.toLowerCase().replace("_", "."))
              .join(", ")}
          </span>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge tone={row.original.active ? "success" : "neutral"}>
            {row.original.active ? "Active" : "Paused"}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <button
              className="text-xs text-owner-fg-3 hover:text-owner-primary"
              onClick={() => rotate(row.original._id)}
            >
              Rotate secret
            </button>
            <button
              className="text-owner-fg-3 hover:text-red-600"
              title="Delete"
              onClick={() => del(row.original._id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper]
  );

  return (
    <div className="min-w-0">
      <DevelopersTabs />
      <PageHeader
        title="Webhooks"
        subtitle="Get a signed POST to your server the moment an order is paid or refunded — so your system stays in sync without polling."
        actions={
          <OwnerButton leadingIcon={<Plus size={16} />} onClick={() => setCreating(true)}>
            Add endpoint
          </OwnerButton>
        }
      />

      {creating && (
        <div className="mb-6">
          <CreateWebhookForm
            onCreated={(s) => {
              setCreating(false);
              setSecret(s);
              load();
            }}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      <DataTable
        totalRows={rows.length}
        columns={columns}
        data={rows}
        loading={loading}
        manualPagination={false}
        pageSize={rows.length || 1}
        pageCount={1}
        nextPage={() => {}}
        prevPage={() => {}}
        paginationData={{ pageIndex: 0, pageSize: rows.length || 1 }}
        pageSizeChangeHandler={() => {}}
      />

      <div className="mt-8 rounded-owner-lg border border-owner-border bg-owner-bg-2 p-5">
        <h3 className="text-sm font-semibold text-owner-fg-1">Verifying a delivery</h3>
        <p className="mt-1 text-xs text-owner-fg-3">
          Every request carries <code>X-Hoizr-Signature: sha256=…</code>, an HMAC
          of the raw body using your signing secret, plus <code>X-Hoizr-Event</code>{" "}
          and <code>X-Hoizr-Delivery</code> (unique per delivery — use it to
          de-duplicate retries). Recompute the HMAC and compare before trusting.
        </p>
      </div>

      {secret && <SecretModal secret={secret} onClose={() => setSecret(null)} />}
    </div>
  );
};

Webhooks.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default Webhooks;

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
