import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

type AccountType = "SAVINGS" | "CURRENT";
type PayoutEntityType =
  | "INDIVIDUAL"
  | "PRIVATE_LIMITED"
  | "PUBLIC_LIMITED"
  | "LLP"
  | "PARTNERSHIP"
  | "SOLE_PROPRIETORSHIP"
  | "TRUST"
  | "NGO";
type GstRegistrationType =
  | "REGULAR"
  | "COMPOSITION"
  | "CASUAL_TAXABLE_PERSON"
  | "UNREGISTERED";

interface IFormInput {
  entityName: string;
  entityType: PayoutEntityType;
  panNumber: string;
  taxDeductionAccountNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType: AccountType;
  upiId?: string;
  isGstRegistered: boolean;
  gstin?: string;
  gstRegistrationType?: GstRegistrationType;
  registeredBusinessName?: string;
  gstRegistrationDate?: string;
}

const accountTypeOptions: { value: AccountType; label: string }[] = [
  { value: "SAVINGS", label: "Savings" },
  { value: "CURRENT", label: "Current" },
];

const entityTypeOptions: { value: PayoutEntityType; label: string }[] = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "PRIVATE_LIMITED", label: "Private Limited" },
  { value: "PUBLIC_LIMITED", label: "Public Limited" },
  { value: "LLP", label: "LLP" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "SOLE_PROPRIETORSHIP", label: "Sole Proprietorship" },
  { value: "TRUST", label: "Trust" },
  { value: "NGO", label: "NGO" },
];

const gstRegistrationTypeOptions: {
  value: GstRegistrationType;
  label: string;
}[] = [
  { value: "REGULAR", label: "Regular" },
  { value: "COMPOSITION", label: "Composition" },
  { value: "CASUAL_TAXABLE_PERSON", label: "Casual Taxable Person" },
  { value: "UNREGISTERED", label: "Unregistered" },
];

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AddPayoutModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const { setToastData } = useGlobalStore();
  const [submitting, setSubmitting] = useState(false);
  const [ifscLookupLoading, setIfscLookupLoading] = useState(false);
  // Pending form snapshot waiting for the Section 24(IX) declaration to be
  // accepted. Hosts who declare themselves UNREGISTERED or COMPOSITION must
  // explicitly acknowledge their own GST liability before we save — required
  // by GST law (Section 24(IX)) for e-commerce suppliers below the ₹20L
  // turnover threshold.
  const [pendingDeclarationData, setPendingDeclarationData] =
    useState<IFormInput | null>(null);

  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      entityName: "",
      entityType: "INDIVIDUAL",
      panNumber: "",
      taxDeductionAccountNumber: "",
      contactEmail: "",
      contactPhone: "",
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      accountType: "SAVINGS",
      upiId: "",
      isGstRegistered: false,
      gstin: "",
      gstRegistrationType: "REGULAR",
      registeredBusinessName: "",
      gstRegistrationDate: "",
    },
  });

  const ifsc = watch("ifscCode");
  const isGstRegistered = watch("isGstRegistered");

  const handleIfscBlur = async () => {
    const code = (getValues("ifscCode") || "").toUpperCase();
    if (!IFSC_REGEX.test(code)) return;
    try {
      setIfscLookupLoading(true);
      const res = await fetch(`https://ifsc.razorpay.com/${code}`);
      if (!res.ok) return;
      const lookup = await res.json();
      if (lookup?.BANK) {
        setValue("bankName", lookup.BANK, { shouldValidate: true });
      }
      if (lookup?.BRANCH) {
        setValue("branchName", lookup.BRANCH, { shouldValidate: true });
      }
    } catch {
      // IFSC lookup is best-effort — fall back to manual entry on failure.
    } finally {
      setIfscLookupLoading(false);
    }
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  // Gate the actual save behind the Section 24(IX) declaration when the
  // host is telling us they are NOT GST-registered (or composition — they
  // can't itemise GST on B2C invoices either). For REGULAR / CASUAL hosts
  // the modal is skipped and the save proceeds immediately.
  const requiresGstDeclaration = (data: IFormInput): boolean =>
    !data.isGstRegistered || data.gstRegistrationType === "COMPOSITION";

  const onSubmit = async (data: IFormInput) => {
    if (data.accountNumber !== data.confirmAccountNumber) {
      setToastData({
        type: "error",
        message: "Account numbers do not match",
      });
      return;
    }
    if (requiresGstDeclaration(data)) {
      setPendingDeclarationData(data);
      return;
    }
    await persistPayout(data);
  };

  const persistPayout = async (data: IFormInput) => {
    try {
      setSubmitting(true);
      const input: any = {
        entityName: data.entityName.trim(),
        entityType: data.entityType,
        panNumber: data.panNumber.trim().toUpperCase(),
        taxDeductionAccountNumber:
          data.taxDeductionAccountNumber?.trim().toUpperCase() || undefined,
        contactEmail: data.contactEmail?.trim() || undefined,
        contactPhone: data.contactPhone?.trim() || undefined,
        accountHolderName: data.accountHolderName.trim(),
        accountNumber: data.accountNumber.trim(),
        ifscCode: data.ifscCode.trim().toUpperCase(),
        bankName: data.bankName.trim(),
        branchName: data.branchName?.trim() || undefined,
        accountType: data.accountType,
        upiId: data.upiId?.trim() || undefined,
        isGstRegistered: data.isGstRegistered,
        gstin: data.isGstRegistered
          ? data.gstin?.trim().toUpperCase()
          : undefined,
        gstRegistrationType: data.isGstRegistered
          ? data.gstRegistrationType
          : undefined,
        registeredBusinessName: data.isGstRegistered
          ? data.registeredBusinessName?.trim()
          : undefined,
        gstRegistrationDate:
          data.isGstRegistered && data.gstRegistrationDate
            ? data.gstRegistrationDate
            : undefined,
        // AUDIT-005 — the modal already gates the save behind the
        // Section 24(IX) declaration; pass the acceptance through so
        // the server can persist the audit trail (acceptedAt, version,
        // IP, UA) on the Payout row.
        section24DeclarationAccepted: requiresGstDeclaration(data)
          ? true
          : undefined,
        section24DeclarationVersion: requiresGstDeclaration(data)
          ? "v1-2026-05-18"
          : undefined,
      };

      const res = await (sdk as any).addHostPayoutAccount({ input });
      if (res?.addHostPayoutAccount) {
        setToastData({
          type: "success",
          message:
            "Payout submitted. We'll verify it within 1 to 4 hours.",
        });
        reset();
        onCreated();
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={closeAndReset}
      title="Add Payout Account"
      width="ml"
      comments="Funds from paid events are settled to the primary verified account. Verification typically takes 1 to 4 hours."
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-left text-sm font-semibold text-gray-900">
            Basic Information
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                Entity Name
              </label>
              <input
                type="text"
                className="input input-primary"
                placeholder="Enter entity name"
                {...register("entityName", {
                  required: "Entity name is required",
                })}
              />
              {errors.entityName && (
                <p className="text-red-500 text-sm">
                  {errors.entityName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                Entity Type
              </label>
              <Controller
                name="entityType"
                control={control}
                rules={{ required: "Entity type is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={entityTypeOptions}
                    value={entityTypeOptions.find(
                      (option) => option.value === field.value
                    )}
                    onChange={(option) => field.onChange(option?.value)}
                    classNamePrefix="react-select"
                    placeholder="Select entity type"
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                )}
              />
              {errors.entityType && (
                <p className="text-red-500 text-sm">
                  {errors.entityType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                PAN Number
              </label>
              <input
                type="text"
                className="input input-primary"
                placeholder="e.g. ABCDE1234F"
                {...register("panNumber", {
                  required: "PAN number is required",
                  pattern: {
                    value: PAN_REGEX,
                    message: "Enter a valid PAN number",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
              />
              {errors.panNumber && (
                <p className="text-red-500 text-sm">
                  {errors.panNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                Tax Deduction Account Number
              </label>
              <input
                type="text"
                className="input input-primary"
                placeholder="Optional"
                {...register("taxDeductionAccountNumber", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-left text-sm font-semibold text-gray-900">
            Contact Information
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                Contact Email
              </label>
              <input
                type="email"
                className="input input-primary"
                placeholder="contact@example.com"
                {...register("contactEmail")}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                Contact Phone
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="input input-primary"
                placeholder="9876543210"
                {...register("contactPhone", {
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10 digit phone number",
                  },
                  onChange: (event) => {
                    event.target.value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  },
                })}
              />
              {errors.contactPhone && (
                <p className="text-red-500 text-sm">
                  {errors.contactPhone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          <h3 className="text-left text-sm font-semibold text-gray-900">
            Bank Account Details
          </h3>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
            Account Holder Name
          </label>
          <input
            type="text"
            className="input input-primary"
            placeholder="As per bank records"
            {...register("accountHolderName", {
              required: "Account holder name is required",
            })}
          />
          {errors.accountHolderName && (
            <p className="text-red-500 text-sm">
              {errors.accountHolderName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
              Account Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              className="input input-primary"
              placeholder="Enter account number"
              {...register("accountNumber", {
                required: "Account number is required",
                pattern: {
                  value: /^[0-9]{6,18}$/,
                  message: "Enter a valid account number",
                },
              })}
            />
            {errors.accountNumber && (
              <p className="text-red-500 text-sm">
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
              Confirm Account Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              className="input input-primary"
              placeholder="Re-enter account number"
              autoComplete="off"
              onPaste={(e) => e.preventDefault()}
              {...register("confirmAccountNumber", {
                required: "Please confirm the account number",
                validate: (value) =>
                  value === getValues("accountNumber") ||
                  "Account numbers do not match",
              })}
            />
            {errors.confirmAccountNumber && (
              <p className="text-red-500 text-sm">
                {errors.confirmAccountNumber.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
            IFSC Code
          </label>
          <input
            type="text"
            className="input input-primary"
            placeholder="e.g. HDFC0001234"
            {...register("ifscCode", {
              required: "IFSC code is required",
              pattern: {
                value: IFSC_REGEX,
                message: "Enter a valid IFSC code",
              },
              onBlur: handleIfscBlur,
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase();
              },
            })}
          />
          {ifscLookupLoading ? (
            <p className="text-gray-500 text-xs mt-1">Looking up bank…</p>
          ) : null}
          {errors.ifscCode && (
            <p className="text-red-500 text-sm">{errors.ifscCode.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
              Bank Name
            </label>
            <input
              type="text"
              className="input input-primary"
              placeholder="Auto-filled from IFSC"
              {...register("bankName", {
                required: "Bank name is required",
              })}
            />
            {errors.bankName && (
              <p className="text-red-500 text-sm">{errors.bankName.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
              Branch Name
            </label>
            <input
              type="text"
              className="input input-primary"
              placeholder="Auto-filled from IFSC"
              {...register("branchName", {
                required: "Branch name is required",
              })}
            />
            {errors.branchName && (
              <p className="text-red-500 text-sm">
                {errors.branchName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
            Account Type
          </label>
          <Controller
            name="accountType"
            control={control}
            rules={{ required: "Account type is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={accountTypeOptions}
                value={accountTypeOptions.find(
                  (option) => option.value === field.value
                )}
                onChange={(option) => field.onChange(option?.value)}
                classNamePrefix="react-select"
                placeholder="Select account type"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
              />
            )}
          />
          {errors.accountType && (
            <p className="text-red-500 text-sm">{errors.accountType.message}</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
            UPI ID <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            className="input input-primary"
            placeholder="yourname@upi"
            {...register("upiId", {
              pattern: {
                value: /^[\w.\-]{2,}@[a-zA-Z]{2,}$/,
                message: "Enter a valid UPI ID",
              },
            })}
          />
          <p className="text-gray-500 text-xs mt-1 text-left">
            Used as a fallback if bank settlement fails.
          </p>
          {errors.upiId && (
            <p className="text-red-500 text-sm">{errors.upiId.message}</p>
          )}
        </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <label className="flex items-center gap-3 text-left text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              {...register("isGstRegistered")}
            />
            This entity is GST registered
          </label>

          {isGstRegistered ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                  GSTIN
                </label>
                <input
                  type="text"
                  className="input input-primary"
                  placeholder="e.g. 07AABCU9603R1ZM"
                  {...register("gstin", {
                    required: isGstRegistered ? "GSTIN is required" : false,
                    pattern: {
                      value: GSTIN_REGEX,
                      message: "Enter a valid GSTIN",
                    },
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                />
                {errors.gstin && (
                  <p className="text-red-500 text-sm">
                    {errors.gstin.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                  Registration Type
                </label>
                <Controller
                  name="gstRegistrationType"
                  control={control}
                  rules={{
                    required: isGstRegistered
                      ? "Registration type is required"
                      : false,
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={gstRegistrationTypeOptions}
                      value={gstRegistrationTypeOptions.find(
                        (option) => option.value === field.value
                      )}
                      onChange={(option) => field.onChange(option?.value)}
                      classNamePrefix="react-select"
                      placeholder="Select registration type"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                  Registered Business Name
                </label>
                <input
                  type="text"
                  className="input input-primary"
                  placeholder="As per GST certificate"
                  {...register("registeredBusinessName", {
                    required: isGstRegistered
                      ? "Registered business name is required"
                      : false,
                  })}
                />
                {errors.registeredBusinessName && (
                  <p className="text-red-500 text-sm">
                    {errors.registeredBusinessName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-left">
                  GST Registration Date
                </label>
                <input
                  type="date"
                  className="input input-primary"
                  {...register("gstRegistrationDate")}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <CButton
            variant={ButtonType.Secondary}
            type="button"
            onClick={closeAndReset}
          >
            Cancel
          </CButton>
          <CButton
            variant={ButtonType.Primary}
            type="submit"
            loading={submitting}
            onClick={handleSubmit(onSubmit)}
          >
            Submit for Verification
          </CButton>
        </div>
      </form>

      <GstSection24DeclarationModal
        isOpen={pendingDeclarationData !== null}
        submitting={submitting}
        onCross={() => setPendingDeclarationData(null)}
        onAccept={async () => {
          if (!pendingDeclarationData) return;
          const snapshot = pendingDeclarationData;
          setPendingDeclarationData(null);
          await persistPayout(snapshot);
        }}
      />
    </ReusableModal>
  );
};

/**
 * Section 24(IX) CGST Act declaration. Hosts below the ₹20L turnover
 * threshold may operate on Hoizr without GST registration provided they
 * accept this declaration acknowledging their own tax liability and
 * indemnifying Hoizr against any tax claim that would otherwise arise.
 *
 * Two buttons: "I/We accept" (proceeds with save) and a Cross/Close
 * (aborts the save and returns to the form).
 */
const GstSection24DeclarationModal: React.FC<{
  isOpen: boolean;
  submitting: boolean;
  onAccept: () => void | Promise<void>;
  onCross: () => void;
}> = ({ isOpen, submitting, onAccept, onCross }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4 py-6">
      <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="text-base font-semibold text-gray-900">
            GST Section 24(IX) declaration
          </div>
          <button
            type="button"
            onClick={onCross}
            aria-label="Close"
            disabled={submitting}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm leading-6 text-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Required acknowledgement for unregistered / composition hosts
          </p>
          <p className="mt-3">
            <strong>I/We, Organizer,</strong> do confirm and acknowledge that I
            am/We are a supplier providing services through an e-commerce
            platform as per <strong>Section 24(IX)</strong> of the Central Goods
            and Services Tax Act, 2017, under the prevalent GST regime
            (&ldquo;<strong>GST Laws</strong>&rdquo;) and confirm that I/We are
            not registered under the GST Act, since our annual turnover is below
            the threshold limit of <strong>₹20 Lakhs</strong> (supplier supply
            only services).
          </p>
          <p className="mt-3">
            I/We confirm that any applicable taxes collected on the Tickets
            booked through <strong>Hoizr Pvt Ltd&apos;s</strong> platform i.e.
            <em> www.hoizr.com</em> and/or its mobile application and/or other
            sales channels is our liability and the same shall be duly
            discharged by us.
          </p>
          <p className="mt-3">
            I/We acknowledge that information furnished above are true to the
            best of my/our knowledge and that we shall be bound by the acts of
            duly constituted attorney. In case any of the above information is
            found to be incorrect at a later date, my membership with your
            platform shall stand cancelled and any payment or unprocessed bill
            shall be withheld by you on the basis of the statements given herein
            above. I/We request you to permit and allow our event to be listed
            on your platform. I/We shall indemnify and hold harmless you and
            your officers, representatives, affiliates, successors and assigns
            against all costs, penalties, damages, or losses or any other
            charges, penalties, or liabilities incurred in relation to any claim
            raised pursuant to the following:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>
              Breach, violation or non-compliance of any of the provisions
              contained in this declaration.
            </li>
            <li>
              Any act of omission or commission pursuant to which any of the
              representations given become untrue.
            </li>
            <li>Violation of any applicable law including GST laws.</li>
            <li>Non-compliance with GST laws.</li>
            <li>
              Any investigations, inquiries, summons or inspections conducted by
              any authority.
            </li>
          </ul>
          <p className="mt-3">
            I/We also undertake the responsibility to inform all subsequent
            changes in the constitution or working of my/our business entity
            having membership with your platform, affecting the accuracy of the
            answers given will be promptly communicated to you.
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
          <CButton
            variant={ButtonType.Secondary}
            type="button"
            onClick={onCross}
            disabled={submitting}
          >
            Cross
          </CButton>
          <CButton
            variant={ButtonType.Primary}
            type="button"
            loading={submitting}
            onClick={() => {
              void onAccept();
            }}
          >
            I/We accept
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default AddPayoutModal;
