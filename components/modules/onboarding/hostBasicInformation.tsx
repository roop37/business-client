import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import useGlobalStore from "@/store/global";
import HostOnboardingStore from "@/store/hostOnboarding";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, sanitizeText } from "@/utils/utilFUncs";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";

interface HostBasicForm {
  name: string;
  email: string;
  phone: string;
  description: string;
}

const HostBasicInformation = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const [btnLoading, setBtnLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const {
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
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<HostBasicForm>();

  useEffect(() => {
    setValue("name", name);
    setValue("email", email);
    setValue("phone", phone);
    setValue("description", description);
    setPreviewUrl((current) => current || logo || null);
  }, [description, email, logo, name, phone, setValue]);

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

    // First-time onboarding: the host record doesn't exist yet, so we
    // can't scope by hostId. Drop the asset under the env root's
    // pending-onboarding bucket — once the host is created, future
    // logo updates flow through `uploadHostAsset` and live under the
    // proper `hoizr/{env}/hosts/{hostId}/logo/` folder.
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

  const onSubmit = async (data: HostBasicForm) => {
    try {
      setBtnLoading(true);
      const uploadedLogo = await uploadLogo();

      await sdk.hostOnboarding({
        input: {
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
      className="hoizr-rise z-10 flex w-full max-w-[760px] flex-col items-center space-y-5 bg-transparent text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <div className="hoizr-glass w-full rounded-[28px] p-5 md:p-7">
        <div className="mb-6 text-left">
          <p className="text-xs font-semibold uppercase text-[var(--owner-blue-500)]">
            Step 2
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Add the public business profile.
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            This is what your team will recognize across events, payouts, and
            campaign tools.
          </p>
        </div>
        <form
          className="w-full space-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Venue/Org Name
            </label>
            <input
              type="text"
              {...register("name", { required: "Venue/Org name is required" })}
              className="input input-primary"
              placeholder="Enter venue or org name"
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-sm text-start">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-left text-sm font-medium text-gray-700">
                Venue/Org Email
              </label>
              <button
                type="button"
                className="text-xs text-[var(--owner-blue-500)] hover:underline"
                onClick={onCopyContactDetails}
              >
                Use existing contact
              </button>
            </div>
            <input
              type="email"
              {...register("email", {
                required: "Venue/Org email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              className="input input-primary"
              placeholder="Enter venue or org email"
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm text-start">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-left text-sm font-medium text-gray-700">
              Venue/Org Phone
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              {...register("phone", {
                required: "Venue/Org phone is required",
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
              placeholder="Enter venue or org phone"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm text-start">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Description
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              rows={4}
              className="input input-primary"
              placeholder="Describe your venue or organization"
              onChange={(event) => setDescription(event.target.value)}
            />
            {errors.description && (
              <p className="text-red-500 text-sm text-start">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-left text-gray-700">
              Venue/Org Logo <span className="text-gray-400">(optional)</span>
            </label>
            <div
              {...getRootProps()}
              className="border border-dashed border-[var(--owner-border-strong)] rounded-xl p-6 text-left cursor-pointer hover:border-[var(--owner-blue-500)] transition-colors"
            >
              <input {...getInputProps()} />
              {previewUrl ? (
                <div className="flex items-center gap-4">
                  <Image
                    src={previewUrl}
                    alt="Logo preview"
                    width={72}
                    height={72}
                    className="rounded-lg object-cover"
                  />
                  <span className="text-sm text-gray-600">
                    Click to replace logo
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-600">
                  Drop a logo here, or click to upload.
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CButton
              loading={btnLoading}
              variant={ButtonType.Secondary}
              type="button"
              className="w-full"
              onClick={() => router.push("/onboarding-host/host-type")}
            >
              Back
            </CButton>
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

export default HostBasicInformation;
