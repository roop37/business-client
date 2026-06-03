"use client";

import ReusableModal from "@/components/common/modal/modal";
import { useHostTypeLabel } from "@/hooks/useHostTypeLabel";
import UserBasicInformationForm from "@/components/modules/profile/forms/userBasicInformationForm";
import IdentityVerificationForm from "@/components/modules/profile/forms/identityVerificationForm";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import useUserStore from "@/store/user";
import { uploadHostAsset } from "@/utils/cloudinaryUpload";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  Bell,
  Building2,
  ShieldCheck,
  Upload,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SettingsTab = "account" | "security" | "brand" | "alerts";

type TabDef = {
  id: SettingsTab;
  label: string;
  Icon: LucideIcon;
};

const TABS: TabDef[] = [
  { id: "account", label: "Account", Icon: UserCircle2 },
  { id: "security", label: "Security", Icon: ShieldCheck },
  { id: "brand", label: "Organisation", Icon: Building2 },
  { id: "alerts", label: "Alerts", Icon: Bell },
];

type BrandForm = {
  name: string;
  description: string;
  email: string;
  phone: string;
  logo: string;
  websiteUrl: string;
};

const emptyBrand: BrandForm = {
  name: "",
  description: "",
  email: "",
  phone: "",
  logo: "",
  websiteUrl: "",
};

const SettingsModal = () => {
  const {
    settingsModalOpen,
    settingsModalTab,
    openSettingsModal,
    closeSettingsModal,
    setToastData,
  } = useGlobalStore();
  const hostLabel = useHostTypeLabel();
  const { selectedHostId, setHostLogo, setSelectedHost } = useHostsStore();
  const { meUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>(settingsModalTab);
  const [brand, setBrand] = useState<BrandForm>(emptyBrand);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync the active tab when the modal is (re)opened. Pinning to a
  // ref-captured value means subsequent setActiveTab calls aren't
  // overwritten if `settingsModalTab` in the store changes underneath.
  useEffect(() => {
    if (settingsModalOpen) {
      setActiveTab(settingsModalTab);
    }
  }, [settingsModalOpen, settingsModalTab]);

  const loadBrand = useCallback(async () => {
    if (!selectedHostId) return;
    setBrandLoading(true);
    try {
      const res = await sdk.restaurantDetails();
      const d = res?.restaurantDetails as any;
      if (!d) return;
      setBrand({
        name: d.name ?? "",
        description: d.description ?? "",
        email: d.email ?? "",
        phone: d.phone ?? "",
        logo: d.logo ?? "",
        websiteUrl: d.website ?? d.websiteUrl ?? "",
      });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setBrandLoading(false);
    }
  }, [selectedHostId, setToastData]);

  useEffect(() => {
    if (!settingsModalOpen) return;
    if (activeTab !== "brand") return;
    loadBrand();
  }, [settingsModalOpen, activeTab, loadBrand]);

  const handleLogoSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedHostId) return;
    setLogoUploading(true);
    try {
      const result = await uploadHostAsset({
        file,
        kind: "host-logo",
        hostId: selectedHostId,
        previousUrl: brand.logo || null,
      });
      const nextUrl = result.secureUrl;
      setBrand((prev) => ({ ...prev, logo: nextUrl }));
      setHostLogo(nextUrl);
      setToastData({ type: "success", message: "Logo updated" });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSaveBrand = async () => {
    if (!selectedHostId) return;
    setBrandSaving(true);
    try {
      await (sdk as any).updateHostBasicInformation({
        input: {
          _id: selectedHostId,
          name: brand.name,
          description: brand.description,
          email: brand.email,
          phone: brand.phone,
          logo: brand.logo,
          website: brand.websiteUrl,
        },
      });
      setSelectedHost(brand.name);
      setToastData({ type: "success", message: "Saved" });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setBrandSaving(false);
    }
  };

  const headerSubtitle = useMemo(() => {
    const greeting = meUser?.firstName ? `Hi ${meUser.firstName}` : "Welcome";
    return `${greeting} · ${hostLabel.noun} workspace`;
  }, [hostLabel.noun, meUser?.firstName]);

  return (
    <ReusableModal
      isOpen={settingsModalOpen}
      onClose={closeSettingsModal}
      title="Settings"
      width="lg"
    >
      <p className="mb-4 text-[12.5px] text-owner-fg-3">{headerSubtitle}</p>
      <div className="flex w-full flex-col gap-4 md:flex-row md:gap-5">
        <nav
          aria-label="Settings sections"
          className="md:w-44 md:shrink-0"
        >
          <div className="flex flex-row gap-1 overflow-x-auto md:flex-col">
            {TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Keep the store in sync so the next time the modal
                    // opens via a different trigger it remembers where
                    // the user was.
                    openSettingsModal(tab.id);
                  }}
                  className={`inline-flex items-center gap-2 rounded-owner-md px-3 py-2 text-left text-[13.5px] font-medium transition ${
                    active
                      ? "bg-owner-blue-050 text-owner-blue-500"
                      : "text-owner-fg-2 hover:bg-owner-bg-subtle"
                  }`}
                >
                  <tab.Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-h-[420px] flex-1 border-t border-owner-border-soft pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
          {activeTab === "account" ? <UserBasicInformationForm /> : null}
          {activeTab === "security" ? <IdentityVerificationForm /> : null}
          {activeTab === "brand" ? (
            <div className="space-y-4">
              <h3 className="text-[15px] font-semibold text-owner-fg-1">
                {hostLabel.noun} brand
              </h3>
              {brandLoading ? (
                <p className="text-sm text-owner-fg-3">Loading…</p>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    {brand.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logo}
                        alt="Logo"
                        className="h-14 w-14 rounded-owner-md border border-owner-border object-cover"
                      />
                    ) : (
                      <div className="grid h-14 w-14 place-items-center rounded-owner-md border border-dashed border-owner-border text-owner-fg-4">
                        <Building2 size={20} />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={logoUploading}
                        className="owner-btn owner-btn--secondary owner-btn--sm"
                      >
                        <Upload size={14} />
                        {logoUploading ? "Uploading…" : "Replace logo"}
                      </button>
                      <span className="text-[11px] text-owner-fg-4">
                        PNG, JPG · 512×512 or larger
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                  </div>

                  <BrandField
                    label={`${hostLabel.noun} name`}
                    value={brand.name}
                    onChange={(v) => setBrand((p) => ({ ...p, name: v }))}
                  />
                  <BrandField
                    label="Bio / description"
                    value={brand.description}
                    onChange={(v) =>
                      setBrand((p) => ({ ...p, description: v }))
                    }
                    multiline
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <BrandField
                      label="Public email"
                      value={brand.email}
                      onChange={(v) => setBrand((p) => ({ ...p, email: v }))}
                      type="email"
                    />
                    <BrandField
                      label="Phone"
                      value={brand.phone}
                      onChange={(v) => setBrand((p) => ({ ...p, phone: v }))}
                    />
                  </div>
                  <BrandField
                    label="Website"
                    value={brand.websiteUrl}
                    onChange={(v) =>
                      setBrand((p) => ({ ...p, websiteUrl: v }))
                    }
                    type="url"
                    placeholder="https://"
                  />

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveBrand}
                      disabled={brandSaving || !brand.name.trim()}
                      className="owner-btn owner-btn--primary"
                    >
                      {brandSaving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}
          {activeTab === "alerts" ? (
            <div className="space-y-3">
              <h3 className="text-[15px] font-semibold text-owner-fg-1">
                Alerts
              </h3>
              <p className="text-sm text-owner-fg-3">
                Notification preferences for this workspace are coming soon.
                Until then we send: ticket sale milestones, scanner offline
                warnings, refund requests, and the daily summary.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </ReusableModal>
  );
};

const BrandField = ({
  label,
  value,
  onChange,
  type = "text",
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="mb-1 block text-[12.5px] font-medium text-owner-fg-2">
      {label}
    </span>
    {multiline ? (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 py-2 text-[13.5px] text-owner-fg-1 outline-none focus:border-owner-blue-200 focus:shadow-[0_0_0_3px_var(--owner-blue-050)]"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13.5px] text-owner-fg-1 outline-none focus:border-owner-blue-200 focus:shadow-[0_0_0_3px_var(--owner-blue-050)]"
      />
    )}
  </label>
);

export default SettingsModal;
