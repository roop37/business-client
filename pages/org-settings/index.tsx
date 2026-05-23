import {
  Badge,
  Card,
  OwnerButton,
  PageHeader,
} from "@/components/common/owner";
import MainLayout from "@/components/layouts/mainBodyLayout";
import Loader from "@/components/loader";
import { PermissionTypeEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import { uploadHostAsset } from "@/utils/cloudinaryUpload";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  Bell,
  CreditCard,
  Instagram,
  Link2,
  MessageCircleMore,
  MoreHorizontal,
  Plus,
  Save,
  ShieldCheck,
  Upload,
  Wifi,
} from "lucide-react";
import { GetServerSideProps } from "next";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type HostSettingsForm = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  logo: string;
  venueType: string;
  averageEventSize: string;
  businessRegistrationNumber: string;
  gstNumber: string;
  websiteUrl: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

type SettingsTab =
  | "brand"
  | "location"
  | "hours"
  | "records"
  | "bank"
  | "integrations"
  | "alerts"
  | "support";

type OpeningHour = {
  day: string;
  start: string;
  end: string;
  enabled: boolean;
};

type AlertPreference = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

const emptyForm: HostSettingsForm = {
  _id: "",
  name: "",
  email: "",
  phone: "",
  description: "",
  logo: "",
  venueType: "",
  averageEventSize: "",
  businessRegistrationNumber: "",
  gstNumber: "",
  websiteUrl: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
};

const settingsTabs: Array<{ value: SettingsTab; label: string }> = [
  { value: "brand", label: "Brand details" },
  { value: "location", label: "Venue & location" },
  // Hidden for launch per Roop 2026-05-16: Opening hours / Fees & tax /
  // Bank account / Integrations. Their content stays in the file
  // (rendered conditionally) so we can re-enable in v1.5 by adding
  // them back to this array. Don't delete the markup below.
  { value: "alerts", label: "Alerts" },
  { value: "support", label: "Support" },
];

const defaultOpeningHours: OpeningHour[] = [
  { day: "Monday", start: "11:00 AM", end: "10:00 PM", enabled: true },
  { day: "Tuesday", start: "11:00 AM", end: "10:00 PM", enabled: true },
  { day: "Wednesday", start: "11:00 AM", end: "11:30 PM", enabled: true },
  { day: "Thursday", start: "11:00 AM", end: "11:30 PM", enabled: true },
  { day: "Friday", start: "11:00 AM", end: "01:00 AM", enabled: true },
  { day: "Saturday", start: "12:00 PM", end: "01:00 AM", enabled: true },
  { day: "Sunday", start: "Closed", end: "", enabled: false },
];

const defaultAlertPreferences: AlertPreference[] = [
  {
    id: "sell-through",
    label: "Event sell-through alert",
    description: "Notify the owner when any live event crosses 80% sold.",
    enabled: true,
  },
  {
    id: "scanner-offline",
    label: "Scanner offline",
    description: "Flag entry devices that disconnect during check-in windows.",
    enabled: true,
  },
  {
    id: "refunds",
    label: "Refund requested",
    description: "Send an alert whenever a refund or charge dispute is raised.",
    enabled: true,
  },
  {
    id: "daily-summary",
    label: "Daily summary",
    description: "End-of-day snapshot for sales, scans and failed payments.",
    enabled: true,
  },
  {
    id: "weekly-digest",
    label: "Weekly digest",
    description: "Weekly report for campaigns, payouts and repeat buyers.",
    enabled: false,
  },
];

// Host-logo upload goes through the central cloudinaryUpload helper
// (see utils/cloudinaryUpload.ts) so assets land in the
// `hoizr/{env}/hosts/{hostId}/logo/...` folder and the previous logo
// is destroyed server-side once the new upload succeeds.

const buildPublicHandle = (name: string) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return slug ? `@${slug}` : "@yourvenue";
};

const formatOwnerContact = (email: string) => email.trim() || "Not set";

const formatLocationLine = (form: HostSettingsForm) => {
  const parts = [form.city, form.state].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location pending";
};

const HostSettings: React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
} = () => {
  const { meUser } = useUserStore();
  const { setSelectedSideBarMenu, setToastData } = useGlobalStore();
  const [form, setForm] = useState<HostSettingsForm>(emptyForm);
  const [initialForm, setInitialForm] = useState<HostSettingsForm>(emptyForm);
  const [activeTab, setActiveTab] = useState<SettingsTab>("brand");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [openingHours, setOpeningHours] =
    useState<OpeningHour[]>(defaultOpeningHours);
  const [alertPreferences, setAlertPreferences] = useState<AlertPreference[]>(
    defaultAlertPreferences
  );

  const canUpdateHost = useMemo(
    () => hasAccess(meUser?.permissions ?? [], PermissionTypeEnum.UpdateHost),
    [meUser?.permissions]
  );

  const setField = (key: keyof HostSettingsForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const loadHost = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sdk.restaurantDetails();
      const host = response.restaurantDetails;
      if (!host?._id) {
        setToastData({ type: "error", message: "Host details not found." });
        return;
      }

      const nextForm: HostSettingsForm = {
        _id: host._id ?? "",
        name: host.name ?? "",
        email: host.email ?? "",
        phone: host.phone ?? "",
        description: host.description ?? "",
        logo: host.logo ?? "",
        venueType: host.venueType ?? "",
        averageEventSize: host.averageEventSize ?? "",
        businessRegistrationNumber: host.businessRegistrationNumber ?? "",
        gstNumber: host.gstNumber ?? "",
        websiteUrl: host.websiteUrl ?? "",
        addressLine1: host.address?.addressLine1 ?? "",
        addressLine2: host.address?.addressLine2 ?? "",
        city: host.address?.city ?? "",
        state: host.address?.state ?? "",
        pincode: host.address?.pincode ?? "",
      };

      setForm(nextForm);
      setInitialForm(nextForm);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [setToastData]);

  useEffect(() => {
    setSelectedSideBarMenu("Settings");
    loadHost();
  }, [loadHost, setSelectedSideBarMenu]);

  const handleLogoFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToastData({ type: "error", message: "Please upload an image file." });
      return;
    }
    if (!form._id) {
      setToastData({
        type: "error",
        message: "Host context is still loading, retry in a moment.",
      });
      return;
    }
    setUploadingLogo(true);
    try {
      const result = await uploadHostAsset({
        kind: "host-logo",
        hostId: form._id,
        file,
        previousUrl: form.logo,
      });
      setField("logo", result.secureUrl);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setUploadingLogo(false);
    }
  };

  const saveHost = async () => {
    if (!form._id) return;
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setToastData({
        type: "error",
        message: "Host name, email, and phone are required.",
      });
      return;
    }

    setSaving(true);
    try {
      const addressReady =
        form.addressLine1.trim() &&
        form.city.trim() &&
        form.state.trim() &&
        form.pincode.trim();

      await sdk.updateHost({
        input: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          description: form.description.trim() || undefined,
          logo: form.logo || undefined,
          venueType: form.venueType.trim() || undefined,
          averageEventSize: form.averageEventSize.trim() || undefined,
          businessRegistrationNumber:
            form.businessRegistrationNumber.trim() || undefined,
          gstNumber: form.gstNumber.trim() || undefined,
          websiteUrl: form.websiteUrl.trim() || undefined,
          address: addressReady
            ? {
                addressLine1: form.addressLine1.trim(),
                addressLine2: form.addressLine2.trim() || undefined,
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),
              }
            : undefined,
        },
      });

      setToastData({ type: "success", message: "Host settings updated." });
      await loadHost();
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const resetEditableFields = () => {
    setForm(initialForm);
  };

  const toggleOpeningHour = (day: string) => {
    setOpeningHours((current) =>
      current.map((item) =>
        item.day === day
          ? {
              ...item,
              enabled: !item.enabled,
              start: item.enabled ? "Closed" : "11:00 AM",
              end: item.enabled ? "" : "10:00 PM",
            }
          : item
      )
    );
  };

  const toggleAlertPreference = (id: string) => {
    setAlertPreferences((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  if (loading) return <Loader />;

  const saveFooter = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <OwnerButton
        variant="ghost"
        onClick={resetEditableFields}
        disabled={saving}
      >
        Cancel
      </OwnerButton>
      <OwnerButton
        leadingIcon={<Save size={16} />}
        disabled={!canUpdateHost || saving}
        onClick={saveHost}
      >
        {saving ? "Saving..." : "Save changes"}
      </OwnerButton>
    </div>
  );

  return (
    <div className="min-w-0">
      <PageHeader
        title="Settings"
        subtitle="Manage your venue, payouts, fees and integrations."
      />

      {!canUpdateHost ? (
        <Card className="mb-6 border-owner-warning-bg bg-owner-warning-bg/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] text-owner-warning-text">
              You do not have permission to update host settings.
            </p>
            <Badge tone="warning">Read only</Badge>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="flex h-fit flex-col gap-1.5">
          {settingsTabs.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-owner-md px-5 py-4 text-left text-[14px] font-semibold transition ${
                  active
                    ? "bg-owner-blue-050 text-owner-blue-500 shadow-owner-sm"
                    : "text-owner-fg-2 hover:bg-owner-bg-subtle hover:text-owner-fg-1"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {activeTab === "brand" ? (
            <SettingsPanel
              title="Brand details"
              subtitle="Shown to fans on listings, tickets, and emails."
              footer={saveFooter}
            >
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div
                    className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-owner-lg bg-owner-bg-subtle text-[30px] font-semibold text-owner-blue-500"
                    style={
                      form.logo
                        ? {
                            backgroundImage: `url(${form.logo})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleLogoFile(event.dataTransfer.files?.[0]);
                    }}
                  >
                    {!form.logo ? (
                      <span>{getInitials(form.name)}</span>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4">
                    <label
                      className={`owner-btn owner-btn--secondary ${
                        !canUpdateHost || uploadingLogo
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      <Upload size={16} />
                      {uploadingLogo ? "Uploading..." : "Upload logo"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canUpdateHost || uploadingLogo}
                        className="sr-only"
                        onChange={(event) =>
                          handleLogoFile(event.target.files?.[0])
                        }
                      />
                    </label>
                    <p className="text-[13px] text-owner-fg-4">
                      PNG or SVG. Min 512 x 512.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Display name"
                    value={form.name}
                    onChange={(value) => setField("name", value)}
                    disabled={!canUpdateHost}
                  />
                  <DisplayField
                    label="Public handle"
                    value={buildPublicHandle(form.name)}
                  />
                  <DisplayField
                    label="Owner contact"
                    value={formatOwnerContact(form.email)}
                  />
                  <TextField
                    label="Support number"
                    value={form.phone}
                    onChange={(value) => setField("phone", value)}
                    disabled={!canUpdateHost}
                  />
                  <TextField
                    label="Website"
                    value={form.websiteUrl}
                    onChange={(value) => setField("websiteUrl", value)}
                    disabled={!canUpdateHost}
                  />
                  <TextField
                    label="Venue type"
                    value={form.venueType}
                    onChange={(value) => setField("venueType", value)}
                    disabled={!canUpdateHost}
                  />
                  <TextareaField
                    label="About"
                    value={form.description}
                    onChange={(value) => setField("description", value)}
                    disabled={!canUpdateHost}
                  />
                </div>
              </div>
            </SettingsPanel>
          ) : null}

          {activeTab === "location" ? (
            <SettingsPanel
              title="Venue & location"
              subtitle="Where fans find this host, and which space powers ticketing."
              footer={saveFooter}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Address line 1"
                  value={form.addressLine1}
                  onChange={(value) => setField("addressLine1", value)}
                  disabled={!canUpdateHost}
                  className="md:col-span-2"
                />
                <TextField
                  label="Address line 2"
                  value={form.addressLine2}
                  onChange={(value) => setField("addressLine2", value)}
                  disabled={!canUpdateHost}
                  className="md:col-span-2"
                />
                <TextField
                  label="City"
                  value={form.city}
                  onChange={(value) => setField("city", value)}
                  disabled={!canUpdateHost}
                />
                <TextField
                  label="State"
                  value={form.state}
                  onChange={(value) => setField("state", value)}
                  disabled={!canUpdateHost}
                />
                <TextField
                  label="Pincode"
                  value={form.pincode}
                  onChange={(value) => setField("pincode", value)}
                  disabled={!canUpdateHost}
                />
                <DisplayField label="Primary market" value={formatLocationLine(form)} />
              </div>

              {/* Event spaces section intentionally removed (Roop 2026-05-16). */}
            </SettingsPanel>
          ) : null}

          {activeTab === "hours" ? (
            <SettingsPanel
              title="Opening hours"
              subtitle="Default hours used for listings, support windows and venue pages."
            >
              <div className="divide-y divide-owner-border-soft">
                {openingHours.map((item) => (
                  <div
                    key={item.day}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="text-[14px] font-semibold text-owner-fg-1">
                        {item.day}
                      </div>
                      <div className="mt-1 text-[13px] text-owner-fg-4">
                        {item.enabled ? `${item.start} - ${item.end}` : "Closed"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="owner-toggle owner-focus-ring"
                        data-on={item.enabled ? "true" : "false"}
                        aria-pressed={item.enabled}
                        onClick={() => toggleOpeningHour(item.day)}
                      />
                      <span className="text-[13px] font-medium text-owner-fg-3">
                        {item.enabled ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SettingsPanel>
          ) : null}

          {activeTab === "records" ? (
            <SettingsPanel
              title="Fees & tax"
              subtitle="Business records used for invoices, settlements and tax exports."
              footer={saveFooter}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <DisplayField label="Platform fee" value="3.5% + taxes" />
                <DisplayField label="Payment gateway fee" value="2.0% + GST" />
                <DisplayField label="GST rate" value="18%" />
                <TextField
                  label="GST number"
                  value={form.gstNumber}
                  onChange={(value) => setField("gstNumber", value)}
                  disabled={!canUpdateHost}
                />
                <TextField
                  label="Business registration number"
                  value={form.businessRegistrationNumber}
                  onChange={(value) =>
                    setField("businessRegistrationNumber", value)
                  }
                  disabled={!canUpdateHost}
                />
                <DisplayField label="Buyer convenience fee" value="Optional per event" />
              </div>
            </SettingsPanel>
          ) : null}

          {activeTab === "bank" ? (
            <SettingsPanel
              title="Bank account"
              subtitle="Payout account used for settlement runs and invoice reconciliation."
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-owner-lg border border-owner-border-soft bg-owner-bg-subtle/45 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
                      <CreditCard size={22} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-owner-fg-1">
                          HDFC Bank - Current Account
                        </span>
                        <Badge tone="success" icon={<ShieldCheck size={13} />}>
                          Verified
                        </Badge>
                      </div>
                      <p className="mt-1 text-[13px] text-owner-fg-4">
                        Payouts settle here every Monday for completed event orders.
                      </p>
                    </div>
                  </div>
                  <OwnerButton variant="secondary">Change account</OwnerButton>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <DisplayField label="Account holder" value={form.name || "Primary business account"} />
                  <DisplayField label="Account number" value="XXXX 3678" />
                  <DisplayField label="IFSC" value="HDFC0004421" />
                  <DisplayField label="Settlement city" value={formatLocationLine(form)} />
                </div>
              </div>
            </SettingsPanel>
          ) : null}

          {activeTab === "integrations" ? (
            <SettingsPanel
              title="Integrations"
              subtitle="Keep campaign, payout and analytics channels connected to Hoizr."
            >
              <div className="divide-y divide-owner-border-soft">
                <IntegrationRow
                  icon={<CreditCard size={18} />}
                  title="Razorpay"
                  description="Primary checkout and payout partner."
                  action={<Badge tone="success">Connected</Badge>}
                />
                <IntegrationRow
                  icon={<MessageCircleMore size={18} />}
                  title="WhatsApp Business"
                  description="Broadcast and drip messaging for campaigns."
                  action={<OwnerButton variant="secondary">Connect</OwnerButton>}
                />
                <IntegrationRow
                  icon={<Instagram size={18} />}
                  title="Instagram"
                  description="Profile sync for social proof and traffic attribution."
                  action={<Badge tone="neutral">Optional</Badge>}
                />
                <IntegrationRow
                  icon={<Wifi size={18} />}
                  title="Google Tag Manager"
                  description="Pixel and funnel tracking for paid acquisition."
                  action={<OwnerButton variant="secondary">Connect</OwnerButton>}
                />
                <IntegrationRow
                  icon={<Link2 size={18} />}
                  title="Mailchimp"
                  description="Audience sync for imported CRM segments."
                  action={<Badge tone="info">Needs review</Badge>}
                />
              </div>
            </SettingsPanel>
          ) : null}

          {activeTab === "alerts" ? (
            <SettingsPanel
              title="Alerts"
              subtitle="Tune the operator notifications that keep live events healthy."
            >
              <div className="divide-y divide-owner-border-soft">
                {alertPreferences.map((item) => (
                  <AlertRow
                    key={item.id}
                    label={item.label}
                    description={item.description}
                    enabled={item.enabled}
                    onToggle={() => toggleAlertPreference(item.id)}
                  />
                ))}
              </div>
            </SettingsPanel>
          ) : null}

          {activeTab === "support" ? (
            <SettingsPanel
              title="Support"
              subtitle="The fastest ways to reach Hoizr when something goes wrong."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <SupportLink
                  channel="Discord"
                  description="Live chat with the Hoizr team + other hosts. Fastest for product questions."
                  cta="Join the server"
                  href="https://discord.gg/hoizr"
                />
                <SupportLink
                  channel="WhatsApp"
                  description="Operations-grade messaging for during-event issues. Reply within 30 min, 24×7."
                  cta="Open chat"
                  href="https://wa.me/919999999999"
                />
                <SupportLink
                  channel="Email"
                  description="For anything that needs a paper trail — refunds, payout reconciliation, KYC."
                  cta="support@hoizr.com"
                  href="mailto:support@hoizr.com"
                />
                <SupportLink
                  channel="Status page"
                  description="If the site feels slow or webhooks are quiet, check here first."
                  cta="status.hoizr.com"
                  href="https://status.hoizr.com"
                />
              </div>

              <div className="mt-6 rounded-owner-md border border-owner-border bg-owner-bg-subtle p-4 text-[13px] text-owner-fg-3">
                <strong className="text-owner-fg-1">Account verification?</strong>{" "}
                Brand-new businesses go through an internal verification pass that
                usually completes within 1 to 4 hours. If
                you&apos;re still seeing &ldquo;account is being verified&rdquo;
                much longer than that, ping us on Discord or email — we&apos;ll
                expedite it.
              </div>
            </SettingsPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const SettingsPanel = ({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => (
  <Card padding={0}>
    <div className="border-b border-owner-border-soft px-8 py-7">
      <h2 className="text-[20px] font-semibold leading-tight text-owner-fg-1">
        {title}
      </h2>
      <p className="mt-2 text-[14px] leading-6 text-owner-fg-4">{subtitle}</p>
    </div>
    <div className="px-8 py-8">{children}</div>
    {footer ? (
      <div className="border-t border-owner-border-soft px-8 py-5">{footer}</div>
    ) : null}
  </Card>
);

const fieldClassName =
  "mt-2 h-12 w-full rounded-owner-md border border-owner-border bg-owner-bg px-4 text-[14px] text-owner-fg-1 outline-none transition placeholder:text-owner-fg-4 focus:border-owner-blue-200 focus:ring-4 focus:ring-owner-blue-050 disabled:cursor-not-allowed disabled:bg-owner-bg-subtle disabled:text-owner-fg-3";

const TextField = ({
  label,
  value,
  onChange,
  disabled,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) => (
  <label className={`block min-w-0 ${className}`}>
    <span className="text-[13px] font-medium text-owner-fg-2">{label}</span>
    <input
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClassName}
    />
  </label>
);

const TextareaField = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <label className="block min-w-0 md:col-span-2">
    <span className="text-[13px] font-medium text-owner-fg-2">{label}</span>
    <textarea
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      className={`${fieldClassName} min-h-[112px] resize-y py-3`}
    />
  </label>
);

const DisplayField = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={`block min-w-0 ${className}`}>
    <span className="text-[13px] font-medium text-owner-fg-2">{label}</span>
    <div className={`${fieldClassName} flex items-center`}>{value}</div>
  </div>
);

const MiniSurface = ({
  title,
  meta,
}: {
  title: string;
  meta: string;
}) => (
  <div className="rounded-owner-md border border-owner-border bg-owner-bg px-4 py-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-[14px] font-semibold text-owner-fg-1">{title}</div>
        <div className="mt-1 text-[13px] text-owner-fg-4">{meta}</div>
      </div>
      <button
        type="button"
        className="rounded-owner-sm p-1.5 text-owner-fg-4 transition hover:bg-owner-bg-subtle hover:text-owner-fg-2"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  </div>
);

const SupportLink = ({
  channel,
  description,
  cta,
  href,
}: {
  channel: string;
  description: string;
  cta: string;
  href: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="block rounded-owner-md border border-owner-border bg-owner-bg p-4 transition hover:border-owner-blue-200 hover:bg-owner-bg-subtle"
  >
    <div className="text-[13.5px] font-semibold text-owner-fg-1">{channel}</div>
    <p className="mt-1 text-[12.5px] leading-relaxed text-owner-fg-3">
      {description}
    </p>
    <div className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-owner-blue-500">
      {cta} <span aria-hidden>→</span>
    </div>
  </a>
);

const IntegrationRow = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-owner-md bg-owner-bg-subtle text-owner-fg-2">
        {icon}
      </span>
      <div>
        <div className="text-[14px] font-semibold text-owner-fg-1">{title}</div>
        <div className="mt-1 text-[13px] leading-5 text-owner-fg-4">
          {description}
        </div>
      </div>
    </div>
    <div>{action}</div>
  </div>
);

const AlertRow = ({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) => (
  <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-owner-md bg-owner-bg-subtle text-owner-fg-2">
        <Bell size={17} />
      </span>
      <div>
        <div className="text-[14px] font-semibold text-owner-fg-1">{label}</div>
        <div className="mt-1 text-[13px] leading-5 text-owner-fg-4">
          {description}
        </div>
      </div>
    </div>
    <button
      type="button"
      className="owner-toggle owner-focus-ring"
      data-on={enabled ? "true" : "false"}
      aria-pressed={enabled}
      onClick={onToggle}
    />
  </div>
);

const getInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "HZ";
  return parts.map((part) => part[0]?.toUpperCase()).join("");
};

HostSettings.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default HostSettings;

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
    const journeyResponse = await sdk.MeUserJourney(
      {},
      {
        cookie: context.req.headers.cookie?.toString() ?? "",
      }
    );

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
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
