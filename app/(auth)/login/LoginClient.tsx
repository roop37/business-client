"use client";

import AuthLogo from "@/components/common/auth/AuthLogo";
import AuthBrandPanel from "@/components/common/auth/AuthBrandPanel";
import AuthPrimaryButton from "@/components/common/auth/AuthPrimaryButton";
import { AuthTextField } from "@/components/common/auth/AuthTextField";
import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, sanitizeText } from "@/utils/utilFUncs";
import {
  ArrowRightIcon,
  Mail,
  StoreIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface IFormInput {
  email: string;
  otp?: string;
}

export enum UserOnboardingStatusMessage {
  completed = "Account Completed",
  blocked = "Your account is blocked.",
  paymentPending = "Your payment details are pending.",
  internalVerificationPending = "Verification pending.",
  onboardingPending = "Your onboarding details are pending",
  restaurantOnboardingPending = "Venue onboarding pending",
}

export const LoginClient: FC = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [btnloading, setBtnLoading] = useState(false);
  const [timer, setTimer] = useState<number>(20);
  const [showResendButton, setShowResendButton] = useState<boolean>(false);
  const [otpId, setOTPId] = useState<string>("");

  const [multiAccountLoading, setMultiAccountLoading] = useState(false);
  const [showMultiAccount, setShowMultiAccount] = useState(false);
  const [multiAccounts, setMultiAccounts] = useState<
    { _id: string; businessName: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const { email } = data;
    setEmail(email);

    const isPhoneNumber = /^\d{10}$/.test(email);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isPhoneNumber && !isEmail) {
      setToastData({
        type: "error",
        message: "Please enter a valid email address or phone number",
      });
      return;
    }
    try {
      setBtnLoading(true);
      const response = await sdk.userLogin({ input: sanitizeText(email) });

      if (response.userLogin !== null) {
        setShowModal(true);
        if (response.userLogin !== "") {
          setToastData({
            message: "Verification code sent successfully",
            type: "success",
          });
        }
        setBtnLoading(false);
        setOTPId(response.userLogin);
        setTimer(30);
        setShowResendButton(false);

        const countdown = setInterval(() => {
          setTimer((prev) => {
            if (prev === 1) {
              clearInterval(countdown);
              setShowResendButton(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      setBtnLoading(false);
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const resendOtp = async () => {
    await onSubmit({ email: sanitizeText(email) });
    setOtp("");
    setToastData({
      message: "Verification code sent successfully",
      type: "success",
    });
  };

  const onSubmitOtp: SubmitHandler<IFormInput> = async () => {
    try {
      setBtnLoading(true);

      const response = await sdk.userLoginVerification({
        input: {
          otpId: otpId,
          emailOrNumber: email,
          otp: otp,
        },
      });

      if (response && response.userLoginVerification) {
        setBtnLoading(false);

        setShowModal(false);
        setToastData({
          message: "Verification successful!",
          type: "success",
        });
        router.replace("/dashboard");
      }
    } catch (error) {
      setBtnLoading(false);
      const errorMessage = extractErrorMessage(error);

      if (errorMessage === "multi-account") {
        setShowMultiAccount(true);
      } else {
        setToastData({
          type: "error",
          message: errorMessage,
        });
        setOtp("");
      }
    }
  };

  useEffect(() => {
    const fetchFunc = async () => {
      setShowModal(false);
      setOTPId("");
      setOtp("");

      try {
        setMultiAccountLoading(true);
        const { getHostsByBusiness } = await sdk.getHostsByBusiness();

        if (!getHostsByBusiness) {
          setToastData({
            type: "error",
            message: "An unknown error occured, please try again later",
          });
          return;
        }

        setMultiAccounts(
          getHostsByBusiness.map((e) => ({
            _id: e._id.toString(),
            businessName: e.name ?? "Untitled business",
          }))
        );
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        setToastData({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setMultiAccountLoading(false);
      }
    };

    if (showMultiAccount) {
      fetchFunc();
    } else {
      setMultiAccountLoading(false);
      setMultiAccounts([]);
    }
    // setToastData is stable across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMultiAccount]);

  const handleAccountSelect = async (id: string) => {
    try {
      setMultiAccountLoading(true);

      const { setHostIdAsCookie } = await sdk.SetHostIdAsCookie({
        hostId: id,
      });

      if (!setHostIdAsCookie) {
        setToastData({
          type: "error",
          message: "An unknown error occured, please try again later",
        });
        return;
      }

      setShowMultiAccount(false);
      router.replace("/dashboard");
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setMultiAccountLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--owner-bg)] text-[var(--owner-fg-1)] lg:h-screen lg:overflow-hidden">
        <div className="grid min-h-screen lg:h-screen lg:min-h-0 lg:grid-cols-[66%_34%]">
          <div className="flex min-h-screen items-center bg-[var(--owner-bg)] px-6 py-8 md:px-10 lg:h-screen lg:min-h-0 lg:overflow-hidden xl:px-16">
            <div className="mx-auto w-full max-w-[640px]">
              <div className="lg:hidden">
                <Link href="/" aria-label="Go to Hoizr landing page">
                  <AuthLogo width={148} />
                </Link>
              </div>
              <div className="mt-10 lg:mt-0">
                <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">
                  Welcome Back
                </h1>
                <p className="mt-4 text-[17px] leading-7 text-[var(--owner-fg-3)]">
                  Sign in below to manage events, campaigns, collaborators,
                  payouts, and more.
                </p>
              </div>

              <div className="mt-11">
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                  <AuthTextField
                    label="Email or Mobile Number"
                    id="email"
                    type="text"
                    icon={Mail}
                    registration={register("email", {
                      required: "Email or Mobile Number is required",
                    })}
                    placeholder="Enter your email or mobile number"
                    error={errors.email?.message}
                  />

                  <div className="pt-5">
                    <AuthPrimaryButton type="submit" disabled={btnloading}>
                      {btnloading ? "Sending code..." : "Sign In"}
                    </AuthPrimaryButton>
                  </div>
                </form>

                <div className="mt-9 border-t border-dashed border-[var(--owner-border)] pt-8">
                  <p className="text-sm text-[var(--owner-fg-3)]">
                    By using the Hoizr dashboard, you accept our{" "}
                    <Link
                      href="https://hoizr.in/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--owner-blue-500)] focus:outline-none focus:underline hover:underline"
                    >
                      terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="https://hoizr.in/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--owner-blue-500)] focus:outline-none focus:underline hover:underline"
                    >
                      privacy
                    </Link>
                    .
                  </p>
                </div>

                <p className="mt-8 text-sm text-[var(--owner-fg-3)]">
                  {`Don't have an account yet?`}{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-[var(--owner-blue-500)] focus:outline-none focus:underline hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <AuthBrandPanel />
        </div>
      </div>

      <ReusableModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={otpId === "" ? "Authenticator Code" : "Verification Code"}
        width="sm"
        comments="For your security, we want to make sure it's really you."
      >
        <form onSubmit={handleSubmit(onSubmitOtp)}>
          <div className="flex flex-col">
            <div className="flex flex-col mt-3 mb-6">
              <input
                type="text"
                value={otp}
                maxLength={6}
                autoFocus={true}
                onChange={(e) => {
                  let input = e.target.value.replace(/\D/g, "");
                  if (input.length > 6) {
                    input = input.slice(0, 6);
                  }
                  setOtp(input);
                }}
                className="input input-primary mb-1"
                placeholder="Enter 6-digit verification code"
              />
              {otpId !== "" ? (
                <div className="self-end">
                  {showResendButton ? (
                    <button
                      type="button"
                      className="text-primary text-end focus:outline-none focus:underline hover:underline text-sm"
                      onClick={resendOtp}
                    >
                      Resend Code
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Resend Code in {timer}s
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            <CButton
              loading={btnloading}
              variant={ButtonType.Primary}
              disabled={otp.length !== 6}
              className="btn btn-primary"
            >
              Submit
            </CButton>
          </div>
        </form>
      </ReusableModal>

      <ReusableModal
        isOpen={showMultiAccount}
        onClose={() => setShowMultiAccount(false)}
        title={"Select a venue to manage"}
        width="md"
      >
        {multiAccountLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin text-gray-500">
              <FaSpinner className="text-primary" size={39} />
            </div>
          </div>
        ) : (
          <div className="py-4">
            {multiAccounts.map((e) => (
              <div
                key={e._id}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent p-4 last:border-none hover:border-[var(--owner-border)] hover:bg-[var(--owner-bg-subtle)]"
                onClick={() => {
                  handleAccountSelect(e._id);
                }}
              >
                <div className="flex w-full items-center justify-between space-x-4">
                  <div className="flex w-full items-center justify-start space-x-4">
                    <StoreIcon
                      size={32}
                      className="rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] p-2 text-[var(--owner-fg-2)]"
                    />
                    <div className="flex flex-col items-start justify-start">
                      <h4 className="text-sm font-semibold text-[var(--owner-fg-1)]">
                        {e.businessName}
                      </h4>
                      <p className="text-xs font-normal text-[var(--owner-fg-3)]">
                        Click to manage this business
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon
                    size={32}
                    className="rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] p-2 text-[var(--owner-fg-2)]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ReusableModal>
    </>
  );
};
