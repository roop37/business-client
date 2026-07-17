import { Badge, OwnerButton, PageHeader } from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import DevelopersTabs from "@/components/developers/DevelopersTabs";
import MainLayout from "@/components/layouts/mainBodyLayout";
import { HostApiKeyType } from "@/generated/graphql";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { GetServerSideProps } from "next";
import { Copy, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type ApiKeyRow = {
  _id: string;
  keyType: HostApiKeyType;
  prefix: string;
  last4: string;
  allowedDomains: string[];
  label?: string | null;
  lastUsedAt?: any | null;
  revoked: boolean;
  createdAt?: any | null;
};

const inputCls =
  "w-full rounded-owner-md border border-owner-border bg-white px-3 py-2 text-sm text-owner-fg-1 focus:outline-none focus:ring-2 focus:ring-owner-primary/30";
const labelCls = "block text-xs font-medium text-owner-fg-3 mb-1";

// Shown once, right after creation — the raw key is never retrievable again.
const RawKeyModal: React.FC<{ raw: string; onClose: () => void }> = ({
  raw,
  onClose,
}) => {
  const { setToastData } = useGlobalStore();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-owner-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-owner-fg-1">Copy your API key now</h3>
        <p className="mt-1 text-sm text-owner-fg-3">
          This is the only time we’ll show it. Store it somewhere safe — if you
          lose it, revoke it and create a new one.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-owner-md border border-owner-border bg-owner-bg-2 px-3 py-2">
          <code className="flex-1 break-all text-sm text-owner-fg-1">{raw}</code>
          <button
            className="shrink-0 text-owner-fg-3 hover:text-owner-primary"
            title="Copy"
            onClick={async () => {
              await navigator.clipboard.writeText(raw);
              setToastData({ type: "success", message: "Key copied to clipboard" });
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

const CreateKeyForm: React.FC<{ onCreated: (raw: string) => void; onCancel: () => void }> = ({
  onCreated,
  onCancel,
}) => {
  const { setToastData } = useGlobalStore();
  const [saving, setSaving] = useState(false);
  const [keyType, setKeyType] = useState<HostApiKeyType>(HostApiKeyType.Secret);
  const [label, setLabel] = useState("");
  const [domains, setDomains] = useState("");

  const create = async () => {
    setSaving(true);
    try {
      const allowedDomains =
        keyType === HostApiKeyType.Publishable
          ? domains.split(",").map((d) => d.trim()).filter(Boolean)
          : undefined;
      const res = await sdk.CreateHostApiKey({
        keyType,
        label: label.trim() || undefined,
        allowedDomains,
      });
      onCreated(res.createHostApiKey.raw);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl rounded-owner-lg border border-owner-border bg-white p-5">
      <h3 className="text-base font-semibold text-owner-fg-1">New API key</h3>
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <label className={labelCls}>Key type</label>
          <select
            className={inputCls}
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as HostApiKeyType)}
          >
            <option value={HostApiKeyType.Secret}>Secret — server-side only</option>
            <option value={HostApiKeyType.Publishable}>
              Publishable — browser (domain-restricted)
            </option>
          </select>
          <p className="mt-1 text-xs text-owner-fg-3">
            {keyType === HostApiKeyType.Secret
              ? "Use only from your backend. Never expose it in browser code."
              : "Safe for browser use. Restricted to the domains you list below."}
          </p>
        </div>
        <div>
          <label className={labelCls}>Label (optional)</label>
          <input
            className={inputCls}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Main website"
          />
        </div>
        {keyType === HostApiKeyType.Publishable && (
          <div>
            <label className={labelCls}>Allowed domains (comma-separated)</label>
            <input
              className={inputCls}
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              placeholder="shop.acme.com, www.acme.com"
            />
          </div>
        )}
      </div>
      <div className="mt-5 flex gap-3">
        <OwnerButton onClick={create} disabled={saving}>
          {saving ? "Creating…" : "Create key"}
        </OwnerButton>
        <OwnerButton variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </OwnerButton>
      </div>
    </div>
  );
};

const Developers = () => {
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSideBarMenu("Developers");
  }, [setSelectedSideBarMenu]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await sdk.HostApiKeys();
      setKeys(res.hostApiKeys as ApiKeyRow[]);
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

  const revoke = async (id: string) => {
    try {
      await sdk.RevokeHostApiKey({ id });
      setToastData({ type: "success", message: "Key revoked" });
      load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    }
  };

  const columnHelper = createColumnHelper<ApiKeyRow>();
  const columns: ColumnDef<ApiKeyRow, any>[] = useMemo(
    () => [
      columnHelper.display({
        id: "key",
        header: "Key",
        cell: ({ row }) => (
          <span className="text-sm font-mono text-owner-fg-1">
            {row.original.prefix}••••{row.original.last4}
          </span>
        ),
      }),
      columnHelper.accessor("label", {
        header: "Label",
        enableSorting: false,
        cell: ({ row }) => <DataTableTextCell value={row.original.label ?? "—"} />,
      }),
      columnHelper.display({
        id: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge tone={row.original.keyType === HostApiKeyType.Secret ? "warning" : "info"}>
            {row.original.keyType === HostApiKeyType.Secret ? "Secret" : "Publishable"}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "domains",
        header: "Domains",
        cell: ({ row }) => (
          <DataTableTextCell
            value={
              row.original.keyType === HostApiKeyType.Publishable
                ? row.original.allowedDomains.join(", ") || "— (none set)"
                : "—"
            }
          />
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge tone={row.original.revoked ? "danger" : "success"}>
            {row.original.revoked ? "Revoked" : "Active"}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.revoked ? null : (
            <button
              className="text-owner-fg-3 hover:text-red-600"
              title="Revoke"
              onClick={() => revoke(row.original._id)}
            >
              <Trash2 size={16} />
            </button>
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
        title="API keys"
        subtitle="Sell tickets for your published events from your own website. Use a secret key on your server, or a publishable key + our embed on any page."
        actions={
          <OwnerButton leadingIcon={<Plus size={16} />} onClick={() => setCreating(true)}>
            New API key
          </OwnerButton>
        }
      />

      {creating && (
        <div className="mb-6">
          <CreateKeyForm
            onCreated={(raw) => {
              setCreating(false);
              setRawKey(raw);
              load();
            }}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      <DataTable
        totalRows={keys.length}
        columns={columns}
        data={keys}
        loading={loading}
        manualPagination={false}
        pageSize={keys.length || 1}
        pageCount={1}
        nextPage={() => {}}
        prevPage={() => {}}
        paginationData={{ pageIndex: 0, pageSize: keys.length || 1 }}
        pageSizeChangeHandler={() => {}}
      />

      <div className="mt-8 rounded-owner-lg border border-owner-border bg-owner-bg-2 p-5">
        <h3 className="text-sm font-semibold text-owner-fg-1">Embed checkout (iframe)</h3>
        <p className="mt-1 text-xs text-owner-fg-3">
          Drop this into any allowed domain, replacing the event id and your
          publishable key. Customers sign up and buy inside the frame.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-owner-md bg-owner-fg-1/5 p-3 text-xs text-owner-fg-1">
{`<iframe
  src="https://hoizr.com/embed/YOUR_EVENT_ID?pk=YOUR_PUBLISHABLE_KEY"
  width="100%" height="720" frameborder="0"></iframe>`}
        </pre>
      </div>

      {rawKey && <RawKeyModal raw={rawKey} onClose={() => setRawKey(null)} />}
    </div>
  );
};

Developers.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default Developers;

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
