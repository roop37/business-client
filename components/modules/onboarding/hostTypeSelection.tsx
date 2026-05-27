import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import {
  HoizrHostType,
  HoizrVenueType,
  formatHoizrHostType,
  formatHoizrVenueType,
} from "@/lib/hoizrConstants";
import useGlobalStore from "@/store/global";
import HostOnboardingStore from "@/store/hostOnboarding";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, sanitizeText } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import {
  Building2,
  Check,
  ImagePlus,
  Megaphone,
  Sparkles,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";

const Select = dynamic(() => import("react-select"), { ssr: false });

interface HostTypeForm {
  hostType: string;
  venueType?: string;
  name: string;
  email: string;
  phone: string;
  description: string;
}

const HostTypeSelection = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const [btnLoading, setBtnLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const {
    hostType,
    setHostType,
    venueType,
    setVenueType,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    description,
    setDescription,
    logo,
    setLogo,
  } = HostOnboardingStore();

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HostTypeForm>();

  useEffect(() => {
    setValue("hostType", hostType);
    setValue("venueType", venueType);
    setValue("name", name);
    setValue("email", email);
    setValue("phone", phone);
    setValue("description", description);
    setPreviewUrl((current) => current || logo || null);
  }, [description, email, hostType, logo, name, phone, setValue, venueType]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setPreviewUrl(objectUrl);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 2,
  });

  const uploadLogo = async () => {
    if (!logoFile) {
      return previewUrl || undefined;
    }

    // Same shape as the host-basic-info onboarding step — see that
    // file's comment for why pending-onboarding gets its own folder.
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "choose-pos";
    const env = (process.env.NEXT_PUBLIC_HOIZR_ENV ?? "dev")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "") || "dev";
    const preset =
      process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_PRESET ?? "hoizr-uploads";

    const formData = new FormData();
    formData.append("file", logoFile);
    formData.append("upload_preset", preset);
    formData.append("folder", `hoizr/${env}/onboarding/host-logos`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    ).then((res) => res.json());

    return response?.secure_url;
  };

  const hostTypeOptions = Object.values(HoizrHostType).map((value) => ({
    value,
    label: formatHoizrHostType(value),
  }));

  // Side-by-side card descriptors for the Business Type picker.
  // Order is intentional: Venue first (most common), Event Organizer second.
  const hostTypeCards: {
    value: HoizrHostType;
    label: string;
    description: string;
    Icon: LucideIcon;
  }[] = [
    {
      value: HoizrHostType.Venue,
      label: "Venue",
      description:
        "Bar, club, restaurant, hotel, or any fixed venue running events on site.",
      Icon: Building2,
    },
    {
      value: HoizrHostType.EventOrg,
      label: "Event Organizer",
      description:
        "Independent organizer running events across one or more partner venues.",
      Icon: Megaphone,
    },
  ];

  const venueTypeOptions = Object.values(HoizrVenueType).map((value) => ({
    value,
    label: formatHoizrVenueType(value),
  }));

  const watchedHostType = watch("hostType");
  const isVenue = watchedHostType === HoizrHostType.Venue;
  const isEventOrg = watchedHostType === HoizrHostType.EventOrg;
  const hostCopy = isVenue
    ? {
        entity: "Venue",
        name: "Venue Name",
        email: "Venue Email",
        phone: "Venue Phone",
        namePlaceholder: "Enter venue name",
        emailPlaceholder: "Enter venue email",
        phonePlaceholder: "Enter venue phone",
        descriptionPlaceholder: "Describe your venue, ambience, capacity, and event fit",
        logo: "Venue Logo",
      }
    : isEventOrg
    ? {
        entity: "Organization",
        name: "Organization Name",
        email: "Organization Email",
        phone: "Organization Phone",
        namePlaceholder: "Enter organization name",
        emailPlaceholder: "Enter organization email",
        phonePlaceholder: "Enter organization phone",
        descriptionPlaceholder: "Describe your organization, event formats, and operating focus",
        logo: "Organization Logo",
      }
    : {
        entity: "Business",
        name: "Name",
        email: "Email",
        phone: "Phone",
        namePlaceholder: "Enter name",
        emailPlaceholder: "Enter email",
        phonePlaceholder: "Enter phone",
        descriptionPlaceholder: "Describe the business profile and operating focus",
        logo: "Logo",
      };

  const onSubmit = async (data: HostTypeForm) => {
    try {
      setBtnLoading(true);
      const uploadedLogo = await uploadLogo();
      const forceFreshHost = router.query.create?.toString() === "1";

      await sdk.hostOnboarding({
        input: {
          ...(forceFreshHost && { forceNew: true }),
          hostType: data.hostType,
          venueType: isVenue ? data.venueType || null : null,
          name: sanitizeText(data.name),
          email: sanitizeText(data.email),
          phone: data.phone,
          description: data.description,
          ...(uploadedLogo && { logo: uploadedLogo }),
        },
      });

      if (uploadedLogo) {
        setLogo(uploadedLogo);
      }

      setToastData({
        type: "success",
        message: "Host details saved.",
      });
      router.push("/onboarding-host/host-address");
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setBtnLoading(false);
    }
  };

  const onCopyContactDetails = async () => {
    try {
      const response = await sdk.MeContactDetails();
      if (!response.meContactDetails) {
        return;
      }

      setValue("email", response.meContactDetails.email ?? "");
      setValue("phone", response.meContactDetails.phone ?? "");
      setEmail(response.meContactDetails.email ?? "");
      setPhone(response.meContactDetails.phone ?? "");
    } catch (error) {
      setToastData({
        type: "error",
        message: "Unable to copy account contact details.",
      });
    }
  };

  return (
    <motion.div
      className="z-10 flex h-full min-h-0 w-full max-w-[760px] flex-col items-center bg-transparent text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg)]/96 shadow-[0_12px_32px_rgba(56,45,34,0.08)]">
        <div className="shrink-0 border-b border-[var(--owner-border)] px-4 py-4 text-left md:px-5">
          <p className="text-xs font-semibold uppercase text-[var(--owner-blue-500)]">
            Step 1/3
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Host details
          </h2>
          <p className="mt-1 text-sm leading-5 text-gray-600">
            Add the host type, contact, and basic public profile.
          </p>
        </div>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4 md:px-5">
          <div className="grid gap-3.5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-left text-sm font-medium text-gray-700">
                Business Type
              </label>
              <Controller
                name="hostType"
                control={control}
                rules={{ required: "Please select a host type" }}
                render={({ field }) => (
                  <div
                    role="radiogroup"
                    aria-label="Business Type"
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    {hostTypeCards.map((card) => {
                      const selected = field.value === card.value;
                      return (
                        <button
                          type="button"
                          key={card.value}
                          role="radio"
                          aria-checked={selected}
                          onClick={() => {
                            field.onChange(card.value);
                            setHostType(card.value);
                            if (card.value !== HoizrHostType.Venue) {
                              setValue("venueType", "");
                              setVenueType("");
                            }
                          }}
                          className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--owner-blue-500)] focus-visible:ring-offset-2 ${
                            selected
                              ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)]"
                              : "border-[var(--owner-border)] bg-[var(--owner-bg)] hover:border-[var(--owner-blue-400)] hover:bg-[var(--owner-bg-subtle)]"
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition ${
                              selected
                                ? "bg-[var(--owner-blue-500)] text-white"
                                : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-2)]"
                            }`}
                          >
                            <card.Icon size={18} strokeWidth={2} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[15px] font-semibold text-[var(--owner-fg-1)]">
                                {card.label}
                              </p>
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                  selected
                                    ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-500)]"
                                    : "border-[var(--owner-border-strong)] bg-transparent"
                                }`}
                                aria-hidden
                              >
                                {selected ? (
                                  <Check
                                    size={12}
                                    strokeWidth={3}
                                    className="text-white"
                                  />
                                ) : null}
                              </span>
                            </div>
                            <p className="mt-1 text-[12.5px] leading-5 text-[var(--owner-fg-3)]">
                              {card.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.hostType && (
                <p className="mt-1.5 text-sm text-red-500 text-start">
                  {errors.hostType.message}
                </p>
              )}
            </div>

            {isVenue && (
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-left text-sm font-medium text-gray-700">
                  Venue Type
                </label>
                <Controller
                  name="venueType"
                  control={control}
                  rules={{
                    validate: (value) =>
                      !isVenue || !!value || "Please select a venue type",
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={venueTypeOptions}
                      value={venueTypeOptions.find(
                        (option) => option.value === venueType
                      )}
                      onChange={(option: any) => {
                        const value = option?.value ?? "";
                        setValue("venueType", value);
                        setVenueType(value);
                      }}
                      classNamePrefix="react-select"
                      className="text-left text-sm"
                      placeholder="Select venue type"
                      menuPosition="fixed"
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : null
                      }
                      menuPlacement="auto"
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 60 }),
                      }}
                    />
                  )}
                />
                {errors.venueType && (
                  <p className="text-red-500 text-sm text-start">
                    {errors.venueType.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-left text-sm font-medium text-gray-700">
              {hostCopy.name}
            </label>
            <input
              type="text"
              {...register("name", { required: `${hostCopy.name} is required` })}
              className="input input-primary"
              placeholder={hostCopy.namePlaceholder}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-sm text-start">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-3.5 md:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-left text-sm font-medium text-gray-700">
                  {hostCopy.email}
                </label>
              </div>
              <input
                type="email"
                {...register("email", {
                  required: `${hostCopy.email} is required`,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                className="input input-primary"
                placeholder={hostCopy.emailPlaceholder}
                onChange={(event) => setEmail(event.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm text-start">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-left text-sm font-medium text-gray-700">
                  {hostCopy.phone}
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-[var(--owner-blue-500)] hover:underline"
                  onClick={onCopyContactDetails}
                >
                  Use existing contact
                </button>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                {...register("phone", {
                  required: `${hostCopy.phone} is required`,
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit phone number",
                  },
                  onChange: (event) => {
                    const value = event.target.value.replace(/\D/g, "").slice(0, 10);
                    event.target.value = value;
                    setPhone(value);
                  },
                })}
                className="input input-primary"
                placeholder={hostCopy.phonePlaceholder}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm text-start">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Controller
              name="description"
              control={control}
              rules={{
                required: "Description is required",
                validate: (value) => {
                  // The editor reports HTML; require some plain-text content.
                  const text = (value ?? "")
                    .replace(/<[^>]+>/g, " ")
                    .replace(/&nbsp;/gi, " ")
                    .trim();
                  return text.length > 0 || "Description is required";
                },
              }}
              render={({ field }) => (
                <RichTextEditor
                  label="Description"
                  value={field.value || ""}
                  onChange={(html) => {
                    field.onChange(html);
                    setDescription(html);
                  }}
                  minHeight={96}
                />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-sm text-start">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-left text-sm font-medium text-gray-700">
              {hostCopy.logo} <span className="text-gray-400">(optional)</span>
            </label>
            <div
              {...getRootProps()}
              className="group cursor-pointer rounded-xl border border-dashed border-[var(--owner-border-strong)] bg-gradient-to-br from-[var(--owner-bg)] to-[var(--owner-bg-subtle)] p-3 text-left transition-colors hover:border-[var(--owner-blue-500)]"
            >
              <input {...getInputProps()} />
              {previewUrl ? (
                <div className="flex items-center gap-3">
                  <Image
                    src={previewUrl}
                    alt="Logo preview"
                    width={56}
                    height={56}
                    className="h-12 w-12 rounded-lg border border-[var(--owner-border)] object-cover"
                  />
                  <div>
                    <span className="block text-sm font-medium text-[var(--owner-fg-1)]">
                      Logo ready
                    </span>
                    <span className="text-xs text-[var(--owner-fg-3)]">
                      Click or drop another file to replace it.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--owner-blue-500)] text-white shadow-[0_12px_26px_rgba(154,76,38,0.18)]">
                    <UploadCloud size={20} />
                  </span>
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--owner-fg-1)]">
                      Drop logo here
                      <Sparkles size={14} className="text-[var(--owner-blue-500)]" />
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--owner-fg-3)]">
                      PNG, JPG, WEBP or GIF up to 2MB. Optional, but it helps the workspace feel complete.
                    </span>
                  </div>
                  <ImagePlus className="ml-auto hidden text-[var(--owner-blue-500)] transition group-hover:scale-105 sm:block" size={20} />
                </div>
              )}
            </div>
          </div>
          </div>
          <div className="shrink-0 border-t border-[var(--owner-border)] bg-[var(--owner-bg)]/96 px-4 py-3 md:px-5">
          <CButton
            loading={btnLoading}
            variant={ButtonType.Primary}
            type="submit"
            className="w-full"
          >
            Continue
          </CButton>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default HostTypeSelection;
