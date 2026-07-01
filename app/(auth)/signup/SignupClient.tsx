"use client";

import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import AuthConsentBox from "@/components/common/auth/AuthConsentBox";
import AuthBrandPanel from "@/components/common/auth/AuthBrandPanel";
import AuthLogo from "@/components/common/auth/AuthLogo";
import AuthPrimaryButton from "@/components/common/auth/AuthPrimaryButton";
import { AuthTextField } from "@/components/common/auth/AuthTextField";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, sanitizeText } from "@/utils/utilFUncs";
import {
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface IFormInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  communicationConsent: boolean;
}

interface IOTPFormInput {
  emailOtp: string;
  numberOtp: string;
}

export const SignupClient: FC = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [communicationConsent, setCommunicationConsent] =
    useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [otpEmail, setOtpEmail] = useState<string>("");
  const [otpWhatsApp, setOtpWhatsApp] = useState<string>("");
  const [otpError] = useState<string>("");
  const [otpId, setOTPId] = useState<string>("");
  const [timer, setTimer] = useState(30);
  const [showResendButton, setShowResendButton] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({});

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    reset,
  } = useForm<IOTPFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const { firstName, lastName, email, phone } = data;

    const accountPreferences = {
      email: communicationConsent,
      sms: communicationConsent,
      whatsapp: communicationConsent,
    };

    if (
      sanitizeText(firstName).length > 20 ||
      sanitizeText(lastName).length > 20
    ) {
      setToastData({
        message: "First name or last name should be of maximum 20 characters",
        type: "error",
      });
      return;
    }

    try {
      const response = await sdk.UserSignUp({
        input: {
          firstName: sanitizeText(firstName),
          lastName: sanitizeText(lastName),
          email: sanitizeText(email),
          phone,
          accountPreferences,
        },
      });

      if (response && response.userSignup) {
        setToastData({
          message: "Verification code sent to your email",
          type: "success",
        });
        setOTPId(response.userSignup);
        setShowModal(true);
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
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const resendOtp = async () => {
    await onSubmit({
      firstName,
      lastName,
      email,
      phone,
      communicationConsent,
    });
    reset();
    setOtpEmail("");
    setOtpWhatsApp("");
    setToastData({
      message: "Verification code sent successfully",
      type: "success",
    });
  };

  const onSubmitOtp: SubmitHandler<IOTPFormInput> = async (data) => {
    const { emailOtp } = data;

    try {
      const response = await sdk.userSignupVerification({
        input: {
          otpId: otpId,
          email: sanitizeText(email),
          phone,
          otp: emailOtp,
          firstName: sanitizeText(firstName),
          lastName: sanitizeText(lastName),
          accountPreferences: {
            email: communicationConsent,
            sms: communicationConsent,
            whatsapp: communicationConsent,
          },
        },
      });

      if (response && response.userSignupVerification) {
        setShowModal(false);
        setToastData({ message: "Verification Successful", type: "success" });
        router.replace("/onboarding-host/host-type");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
      reset();
      setOtpEmail("");
      setOtpWhatsApp("");
    }
  };

  useEffect(() => {
    if (timer === 0) {
      setShowResendButton(true);
    } else if (timer < 0) {
      setTimer(0);
    } else {
      setShowResendButton(false);
    }
  }, [timer]);

  useEffect(() => {
    setOtpEmail("");
    setOtpWhatsApp("");
  }, [showModal]);

  return (
    <div className="min-h-screen bg-[var(--owner-bg)] text-[var(--owner-fg-1)] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-screen lg:min-h-0 lg:grid-cols-[57%_43%]">
        <div className="relative flex min-h-screen overflow-y-auto bg-[var(--owner-bg)] px-6 py-6 md:px-10 lg:h-screen lg:min-h-0 xl:px-14">
          <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-col">
            <div className="lg:hidden">
              <Link href="/" aria-label="Go to Hoizr landing page">
                <AuthLogo width={132} />
              </Link>
            </div>

            <div className="my-auto py-0">
              <h1 className="max-w-[520px] text-[26px] font-semibold leading-tight tracking-[-0.02em]">
                Create your Hoizr account
              </h1>
              <p className="mt-2.5 max-w-[540px] text-[14.5px] leading-6 text-[var(--owner-fg-3)]">
                Start with your event rate, then use one dashboard for
                marketing, tracking, collaborators, and revenue operations.
              </p>

              <div className="mt-5">
                <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                  <AuthTextField
                    label="First Name"
                    id="firstName"
                    type="text"
                    icon={User}
                    registration={register("firstName", {
                      required: "First Name is required",
                      minLength: {
                        value: 3,
                        message:
                          "First Name must be at least 3 characters long",
                      },
                      pattern: {
                        value: /^[a-zA-Z.'\s]{3,}$/,
                        message: "Only alphabets are allowed",
                      },
                    })}
                    placeholder="Enter your first name"
                    className="h-11 text-[14px]"
                    value={firstName}
                    onInputChange={(e) => {
                      const input = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      e.target.value = input;
                      setFirstName(input);
                    }}
                    error={errors.firstName?.message}
                  />

                  <AuthTextField
                    label="Last Name"
                    id="lastName"
                    type="text"
                    icon={User}
                    registration={register("lastName", {
                      required: "Last Name is required",
                      minLength: {
                        value: 3,
                        message:
                          "Last Name must be at least 3 characters long",
                      },
                      pattern: {
                        value: /^[a-zA-Z.'\s]{3,}$/,
                        message: "Only alphabets are allowed",
                      },
                    })}
                    placeholder="Enter your last name"
                    className="h-11 text-[14px]"
                    value={lastName}
                    onInputChange={(e) => {
                      const input = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      e.target.value = input;
                      setLastName(input);
                    }}
                    error={errors.lastName?.message}
                  />

                  <AuthTextField
                    label="Email Address"
                    id="email"
                    type="email"
                    icon={Mail}
                    registration={register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    })}
                    placeholder="Enter your email address"
                    className="h-11 text-[14px]"
                    value={email}
                    onInputChange={(e) => setEmail(e.target.value)}
                    error={errors.email?.message}
                  />

                  <AuthTextField
                    label="Phone Number"
                    id="phone"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    leftAddon={
                      <div className="flex h-11 w-20 items-center justify-center gap-2 rounded-xl border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] text-sm font-medium xl:w-24">
                        <Phone
                          size={16}
                          className="text-[var(--owner-fg-4)]"
                        />
                        +91
                      </div>
                    }
                    style={{ appearance: "textfield" }}
                    registration={register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Invalid phone number",
                      },
                    })}
                    placeholder="Enter your phone number"
                    className="h-11 text-[14px]"
                    value={phone}
                    onInputChange={(e) => {
                      let input = e.target.value.replace(/\D/g, "");
                      if (input.length > 10) {
                        input = input.slice(0, 10);
                      }
                      e.target.value = input;
                      setPhone(input);
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === "e" || e.key === "-" || e.key === "+") {
                        e.preventDefault();
                      }
                    }}
                    error={errors.phone?.message}
                  />

                  <AuthConsentBox
                    label="Communication Preferences"
                    checked={communicationConsent}
                    registration={register("communicationConsent")}
                    onCheckedChange={setCommunicationConsent}
                  >
                    I consent to receive email updates, SMS notifications, and
                    WhatsApp notifications from Hoizr for account, event, and
                    marketing updates. I can unsubscribe from marketing
                    communications at any time.
                  </AuthConsentBox>

                  <div className="flex flex-col space-y-2">
                    <p className="text-xs leading-[1.35] text-[var(--owner-fg-3)]">
                      {`By signing up, you agree to Hoizr's`}{" "}
                      <Link
                        href="https://business.hoizr.com/legal/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--owner-blue-500)] focus:outline-none focus:underline hover:underline"
                      >
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="https://business.hoizr.com/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--owner-blue-500)] focus:outline-none focus:underline hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </p>

                    <div className="pt-1">
                      <AuthPrimaryButton type="submit">
                        Create Account
                      </AuthPrimaryButton>
                    </div>
                  </div>
                </form>

                <p className="mt-2.5 text-center text-sm text-[var(--owner-fg-3)]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-[var(--owner-blue-500)] focus:outline-none focus:underline hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <AuthBrandPanel />
      </div>
      {showModal && (
        <ReusableModal
          title={"Verification Code"}
          width="sm"
          comments="For your security, we want to make sure it's really you."
          onClose={() => setShowModal(false)}
          isOpen={showModal}
        >
          <form onSubmit={handleSubmitOtp(onSubmitOtp)}>
            <div className="flex flex-col">
              <input
                type="text"
                id="otpEmail"
                placeholder="Enter Verification Code"
                className="input input-primary mb-1"
                {...registerOtp("emailOtp", { required: true })}
                value={otpEmail}
                maxLength={6}
                autoFocus={true}
                onChange={(e) => {
                  let input = e.target.value.replace(/\D/g, "");
                  if (input.length > 6) {
                    input = input.slice(0, 6);
                  }
                  setOtpEmail(input);
                }}
              />
              {showResendButton ? (
                <button
                  type="button"
                  className="text-primary text-start focus:outline-none focus:underline hover:underline text-sm mb-3 self-end"
                  onClick={resendOtp}
                >
                  Resend Code
                </button>
              ) : (
                <p className="text-sm text-gray-500 mb-6 self-end">
                  Resend Code in {timer}s
                </p>
              )}
            </div>

            {otpError && (
              <p className="text-red-500 text-sm mt-2">{otpError}</p>
            )}

            <CButton
              variant={ButtonType.Primary}
              type="submit"
              className="w-full"
              disabled={otpEmail.length !== 6}
            >
              Submit
            </CButton>
          </form>
        </ReusableModal>
      )}
    </div>
  );
};
