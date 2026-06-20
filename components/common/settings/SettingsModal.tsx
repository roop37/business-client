"use client";

import ReusableModal from "@/components/common/modal/modal";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { useHostTypeLabel } from "@/hooks/useHostTypeLabel";
import UserBasicInformationForm from "@/components/modules/profile/forms/userBasicInformationForm";
import IdentityVerificationForm from "@/components/modules/profile/forms/identityVerificationForm";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import { uploadHostAsset } from "@/utils/cloudinaryUpload";
import { endpoint, sdk } from "@/utils/graphqlClient";
import { GraphQLClient } from "graphql-request";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  Building2,
  History,
  Loader2,
  MapPin,
  ShieldCheck,
  Sliders,
  Upload,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";
import { fetchActivityLogs, type ActivityLogRow } from "@/utils/activityLogClient";
import { useCallback, useEffect, useRef, useState } from "react";

type SettingsTab = "account" | "security" | "brand" | "activity";
type BrandSection = "org" | "address" | "additional";

type TabDef = {
  id: SettingsTab;
  label: string;
  Icon: LucideIcon;
};

const TABS: TabDef[] = [
  { id: "account", label: "Account", Icon: UserCircle2 },
  { id: "security", label: "Security", Icon: ShieldCheck },
  { id: "brand", label: "Organisation", Icon: Building2 },
  { id: "activity", label: "Activity Log", Icon: History },
];

type BrandForm = {
  // Organisation
  name: string;
  description: string;
  email: string;
  phone: string;
  logo: string;
  websiteUrl: string;
  venueType: string;
  // Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  // Additional
  businessRegistrationNumber: string;
  gstNumber: string;
  averageEventSize: string;
  gallery: string[];
};

const emptyBrand: BrandForm = {
  name: "",
  description: "",
  email: "",
  phone: "",
  logo: "",
  websiteUrl: "",
  venueType: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  businessRegistrationNumber: "",
  gstNumber: "",
  averageEventSize: "",
  gallery: [],
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
  const [activeTab, setActiveTab] = useState<SettingsTab>(settingsModalTab);
  const [brandSection, setBrandSection] = useState<BrandSection>("org");
  const [brand, setBrand] = useState<BrandForm>(emptyBrand);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (settingsModalOpen) {
      setActiveTab(settingsModalTab);
    }
  }, [settingsModalOpen, settingsModalTab]);

  const loadBrand = useCallback(async () => {
    if (!selectedHostId) return;
    setBrandLoading(true);
    try {
      // Source of truth is `getHostsByBusiness`. The previous code path
      // (`sdk.restaurantDetails`) doesn't exist in the current SDK — it
      // was a legacy method cast through `(sdk as any)`, which is why
      // this tab silently failed to load until now.
      const res = await sdk.getHostsByBusiness();
      const host = (res?.getHostsByBusiness ?? []).find(
        (h) => h._id === selectedHostId,
      );
      if (!host) return;
      // The codegen `getHostsByBusiness` operation doesn't select `gallery`,
      // so fetch it raw to seed the uploader (otherwise a save would wipe an
      // existing gallery). Additive + best-effort.
      let gallery: string[] = [];
      try {
        const gq = await new GraphQLClient(endpoint, {
          credentials: "include",
        }).request<{
          getHostsByBusiness: { _id: string; gallery?: string[] | null }[];
        }>(`query { getHostsByBusiness { _id gallery } }`);
        gallery =
          gq.getHostsByBusiness?.find((h) => h._id === selectedHostId)
            ?.gallery ?? [];
      } catch {
        /* ignore — gallery stays empty if it can't load */
      }
      setBrand({
        name: host.name ?? "",
        description: host.description ?? "",
        email: host.email ?? "",
        phone: host.phone ?? "",
        logo: host.logo ?? "",
        websiteUrl: host.websiteUrl ?? "",
        venueType: host.venueType ?? "",
        addressLine1: host.address?.addressLine1 ?? "",
        addressLine2: host.address?.addressLine2 ?? "",
        city: host.address?.city ?? "",
        state: host.address?.state ?? "",
        pincode: host.address?.pincode ?? "",
        businessRegistrationNumber: host.businessRegistrationNumber ?? "",
        gstNumber: host.gstNumber ?? "",
        averageEventSize: host.averageEventSize ?? "",
        gallery,
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

  const handleGallerySelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedHostId) return;
    if (brand.gallery.length >= 5) {
      setToastData({
        type: "error",
        message: "You can add up to 5 gallery photos.",
      });
      return;
    }
    setGalleryUploading(true);
    try {
      const result = await uploadHostAsset({
        file,
        kind: "host-settings",
        hostId: selectedHostId,
      });
      setBrand((prev) => ({
        ...prev,
        gallery: [...prev.gallery, result.secureUrl].slice(0, 5),
      }));
      setToastData({ type: "success", message: "Photo added" });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (url: string) =>
    setBrand((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((u) => u !== url),
    }));

  const handleSaveBrand = async () => {
    if (!selectedHostId) return;
    setBrandSaving(true);
    try {
      await sdk.updateHost({
        input: {
          name: brand.name,
          description: brand.description,
          email: brand.email,
          phone: brand.phone,
          logo: brand.logo,
          websiteUrl: brand.websiteUrl,
          venueType: brand.venueType,
          businessRegistrationNumber: brand.businessRegistrationNumber,
          gstNumber: brand.gstNumber,
          averageEventSize: brand.averageEventSize,
          gallery: brand.gallery,
          address: {
            addressLine1: brand.addressLine1,
            addressLine2: brand.addressLine2,
            city: brand.city,
            state: brand.state,
            pincode: brand.pincode,
          },
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

  return (
    <ReusableModal
      isOpen={settingsModalOpen}
      onClose={closeSettingsModal}
      title="Settings"
      width="lg"
    >
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
              {/* Sub-tab strip: mirrors the business onboarding step
                  structure — Organisation basics, then Address, then
                  Additional settings. Each section saves into the same
                  `brand` form and shares the single Save button at the
                  bottom so the user isn't tempted to commit partial state. */}
              <div className="flex gap-1 rounded-[12px] bg-owner-bg-subtle p-1">
                {(
                  [
                    { id: "org", label: "Organisation", Icon: Building2 },
                    { id: "address", label: "Address", Icon: MapPin },
                    {
                      id: "additional",
                      label: "Additional",
                      Icon: Sliders,
                    },
                  ] as const
                ).map((s) => {
                  const active = brandSection === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setBrandSection(s.id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[12.5px] font-medium transition ${
                        active
                          ? "bg-owner-bg text-owner-fg-1 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                          : "text-owner-fg-3 hover:text-owner-fg-1"
                      }`}
                    >
                      <s.Icon size={13} />
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {brandLoading ? (
                <p className="text-sm text-owner-fg-3">Loading…</p>
              ) : (
                <>
                  {brandSection === "org" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {brand.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={brand.logo}
                            alt="Logo"
                            // `object-contain` — see sidebar BrandMark
                            // comment; wide wordmark logos shouldn't get
                            // cropped to a square when uploaded.
                            className="h-14 w-14 rounded-owner-md border border-owner-border bg-white object-contain"
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
                        onChange={(v) =>
                          setBrand((p) => ({ ...p, name: v }))
                        }
                      />

                      <div>
                        {/* Not a <label> — contentEditable divs aren't
                            labelable elements and clicking the text
                            wouldn't focus the editor. The RichTextEditor
                            handles its own label slot via its `label`
                            prop. */}
                        <RichTextEditor
                          label="Bio / description"
                          value={brand.description}
                          onChange={(v) =>
                            setBrand((p) => ({ ...p, description: v }))
                          }
                          minHeight={140}
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <BrandField
                          label="Public email"
                          value={brand.email}
                          onChange={(v) =>
                            setBrand((p) => ({ ...p, email: v }))
                          }
                          type="email"
                        />
                        <BrandField
                          label="Phone"
                          value={brand.phone}
                          onChange={(v) =>
                            setBrand((p) => ({ ...p, phone: v }))
                          }
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

                      {/* Venue gallery — up to 5 photos shown on the public
                          venue page. Saved with the rest of the brand form. */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-medium text-owner-fg-2">
                            Venue gallery
                            <span className="ml-1 text-[11px] font-normal text-owner-fg-4">
                              (up to 5 photos)
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            disabled={
                              galleryUploading || brand.gallery.length >= 5
                            }
                            className="owner-btn owner-btn--secondary owner-btn--sm"
                          >
                            <Upload size={14} />
                            {galleryUploading ? "Uploading…" : "Add photo"}
                          </button>
                        </div>
                        {brand.gallery.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {brand.gallery.map((url) => (
                              <div
                                key={url}
                                className="relative aspect-square overflow-hidden rounded-owner-md border border-owner-border bg-owner-bg-subtle"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt="Venue photo"
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(url)}
                                  aria-label="Remove photo"
                                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-[12px] leading-none text-white hover:bg-black/80"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-owner-fg-4">
                            These photos appear on your public venue page.
                          </p>
                        )}
                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleGallerySelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : null}

                  {brandSection === "address" ? (
                    <div className="space-y-3">
                      <BrandField
                        label="Address line 1"
                        value={brand.addressLine1}
                        onChange={(v) =>
                          setBrand((p) => ({ ...p, addressLine1: v }))
                        }
                      />
                      <BrandField
                        label="Address line 2"
                        value={brand.addressLine2}
                        onChange={(v) =>
                          setBrand((p) => ({ ...p, addressLine2: v }))
                        }
                        placeholder="(optional)"
                      />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <BrandField
                          label="City"
                          value={brand.city}
                          onChange={(v) =>
                            setBrand((p) => ({ ...p, city: v }))
                          }
                        />
                        <BrandField
                          label="State"
                          value={brand.state}
                          onChange={(v) =>
                            setBrand((p) => ({ ...p, state: v }))
                          }
                        />
                        <BrandField
                          label="Pincode"
                          value={brand.pincode}
                          onChange={(v) =>
                            setBrand((p) => ({ ...p, pincode: v }))
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  {brandSection === "additional" ? (
                    <div className="space-y-3">
                      <BrandField
                        label="Venue type"
                        value={brand.venueType}
                        onChange={(v) =>
                          setBrand((p) => ({ ...p, venueType: v }))
                        }
                        placeholder="e.g. Nightclub, Comedy room, Outdoor lawn"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <BrandField
                          label="Business registration number"
                          value={brand.businessRegistrationNumber}
                          onChange={(v) =>
                            setBrand((p) => ({
                              ...p,
                              businessRegistrationNumber: v,
                            }))
                          }
                        />
                        <BrandField
                          label="GST number"
                          value={brand.gstNumber}
                          onChange={(v) =>
                            setBrand((p) => ({ ...p, gstNumber: v }))
                          }
                          placeholder="22AAAAA0000A1Z5"
                        />
                      </div>
                      <BrandField
                        label="Average event size"
                        value={brand.averageEventSize}
                        onChange={(v) =>
                          setBrand((p) => ({ ...p, averageEventSize: v }))
                        }
                        placeholder="e.g. 200–400"
                      />
                    </div>
                  ) : null}

                  <div className="flex justify-end pt-3">
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
          {activeTab === "activity" ? <ActivitySettingsTab /> : null}
        </div>
      </div>
    </ReusableModal>
  );
};

/**
 * Activity Log — moved here from the standalone /teams/activity-log page so
 * the whole audit trail lives in Settings. Compact, lazy-loaded list (newest
 * first); the full filterable table still exists at the route if needed.
 */
const ActivitySettingsTab = () => {
  const [rows, setRows] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchActivityLogs(
          { pageNumber: 1, rowsPerPage: 50 },
          undefined,
          { key: "createdAt", sortType: "Desc" }
        );
        if (alive) setRows(data.activityLogs ?? []);
      } catch (e) {
        if (alive) setError(extractErrorMessage(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const fmt = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date(iso))
      : "";

  return (
    <div className="space-y-3">
      <h3 className="text-[15px] font-semibold text-owner-fg-1">Activity log</h3>
      <p className="text-sm text-owner-fg-3">
        Recent actions across your workspace — newest first.
      </p>
      {error ? (
        <p className="rounded-owner-md border border-owner-danger-bg bg-owner-danger-bg px-3 py-2 text-sm text-owner-danger-text">
          {error}
        </p>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-owner-fg-4" />
        </div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-owner-fg-4">
          No activity yet.
        </p>
      ) : (
        <div className="max-h-[360px] divide-y divide-owner-border-soft overflow-y-auto rounded-owner-md border border-owner-border">
          {rows.map((r) => (
            <div key={r._id} className="px-3.5 py-2.5">
              <p className="text-sm text-owner-fg-1">{r.description}</p>
              <p className="mt-0.5 text-xs text-owner-fg-4">{fmt(r.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BrandField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="mb-1 block text-[12.5px] font-medium text-owner-fg-2">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13.5px] text-owner-fg-1 outline-none focus:border-owner-blue-200 focus:shadow-[0_0_0_3px_var(--owner-blue-050)]"
    />
  </label>
);

export default SettingsModal;
