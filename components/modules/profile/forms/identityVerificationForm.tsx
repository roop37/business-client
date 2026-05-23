import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import useGlobalStore from "@/store/global";
import { useBasicProfileStore } from "@/store/profileBasicEditStore";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";

const IdentityVerificationForm: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { twoFactorAuth, setProfileData } = useBasicProfileStore();
  const { setToastData } = useGlobalStore();
  const [isEnabling2fa, setIsEnabling2fa] = useState(false);
  const [isDisabling2fa, setIsDisabling2fa] = useState(false);

  const [isShowtfaQR, setIsShowtfaQR] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const [authCode, setAuthCode] = useState<string>();
  const [isAuthCodeModalOpen, setIsAuthCodeModalOpen] = useState(false);

  const handleSignOutEverywhere = async () => {
    try {
      const response = await sdk.userLogoutFromEverywhere();

      if (response && response.userLogoutFromEverywhere) {
        setToastData({
          message: "Successfully logged out from every other device",
          type: "success",
        });
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleVerify2fA = async () => {
    setIsEnabling2fa(true);
    try {
      if (authCode?.length !== 6) {
        setToastData({
          message: "Please enter a 6-digit code and try again!",
          type: "error",
        });
        return;
      }

      const response = await sdk.verify2FASetup({ authCode: authCode });

      if (!response.verify2FASetup) {
        setToastData({
          message: "Please enter valid code and try again!",
          type: "error",
        });
        return;
      }

      setToastData({
        message:
          "Two factor authentication for your account is verified successfully!",
        type: "success",
      });
      setIsShowtfaQR(false);
      setAuthCode(undefined);
      setProfileData({ twoFactorAuth: true });
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsEnabling2fa(false);
    }
  };

  const handleEnable2fa = async () => {
    setIsEnabling2fa(true);
    try {
      const response = await sdk.enable2FA();
      if (response && response.enable2FA) {
        const qrCode = response.enable2FA;

        setIsShowtfaQR(true);
        setQrCode(qrCode);
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsEnabling2fa(false);
    }
  };

  const handleDisable2faSubmit = async () => {
    setIsDisabling2fa(true);
    try {
      if (authCode?.length !== 6) {
        setToastData({
          message: "Please enter a 6-digit code and try again!",
          type: "error",
        });
        return;
      }

      const response = await sdk.disable2F({ authCode: authCode });

      if (!response.disable2FA) {
        setToastData({
          message: "Please enter valid code and try again!",
          type: "error",
        });
        return;
      }

      setToastData({
        message:
          "Two factor authentication for your account is disabled successfully!",
        type: "success",
      });
      setIsAuthCodeModalOpen(false);
      setAuthCode(undefined);
      setProfileData({ twoFactorAuth: false });
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsDisabling2fa(false);
    }
  };

  const handleDisable2fa = () => {
    setIsAuthCodeModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 space-y-6 w-full ">
      <div className="space-y-4">
        {/* <div className="border p-4 rounded-xl bg-gray-50">
          <h3 className="text-md font-semibold text-gray-900">
            Personal POS Passcode for {selectedHost}
          </h3>
          <p className="text-sm text-gray-600">
            Your personal POS passcode is used to log in and clock in on the
            {selectedHost} point of sale. Please don’t share this passcode
            with anyone.
          </p>
          <button className="mt-2 text-primary hover:underline text-md">
            Add passcode
          </button>
        </div> */}

        <div className="border p-4 rounded-xl bg-gray-50 space-y-2">
          <h3 className="text-gray-900">Two-step verification</h3>
          <p className="text-sm text-gray-600">
            {
              "An extra layer to boost your account security. A verification code will be required each time you sign in."
            }
          </p>
          {twoFactorAuth ? (
            <button
              className="text-red-500 hover:underline text-sm"
              onClick={handleDisable2fa}
              disabled={isDisabling2fa}
            >
              Disable
            </button>
          ) : (
            <>
              <button
                className="mt-2 text-primary hover:underline text-sm"
                onClick={handleEnable2fa}
                disabled={isEnabling2fa}
              >
                Enable
              </button>
            </>
          )}
        </div>

        <div className="border p-4 rounded-xl bg-gray-50 space-y-2">
          <h3 className="text-sm">Sign out everywhere</h3>
          <p className="text-sm text-gray-600">
            If you lost a device or left logged in to a public computer, you can
            sign out everywhere except your current browser.
          </p>
          <button
            className="mt-2 text-red-500 hover:underline text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            Sign out
          </button>
        </div>

        {/* <div className="border p-4 rounded-xl bg-gray-50">
          <h3 className="text-md font-semibold text-gray-900">Security</h3>
          <p className="text-md text-gray-600">
            Hoizr can contact you if there’s unusual activity in your account,
            help you access and recover your account and send you other
            transactional messages about your account.
          </p>
          <button className="mt-2 text-primary hover:underline text-md">
            Add phone number
          </button>
          <button className="mt-2 ml-4 text-primary hover:underline text-md">
            Add email address
          </button>
        </div> */}
      </div>
      {/* Transfer Business Section */}
      {/* <div className="border rounded-xl p-4 space-y-2">
        <h2 className="text-md font-semibold">Transfer business</h2>
        <p className="text-md text-gray-600">
          This transfers the business to a new person within your organization.
          To process payments, Square needs to verify their identity. Don’t
          worry, you’ll still be able to process payments during the transfer
          process.
        </p>
        <p className="text-md text-red-500 font-semibold">
          NOTE: This feature is not supported when selling a business.
        </p>
        <button className="w-full text-start text-primary hover:underline text-md">
          Transfer business
        </button>
      </div> */}
      {/* 
      <div className="border rounded-xl p-4 space-y-2">
        <h2 className="text-md font-semibold">Deactivate your business</h2>
        <p className="text-md text-gray-600">
          Deactivating your business means that you will be unable to receive or
          recover any of your payment history or account information.
        </p>
        <button className="w-full text-start text-red-500 hover:underline text-md">
          Deactivate
        </button>
      </div> */}
      <div className="bg-white  rounded-xl space-y-4 w-full">
        {/* <div className="bg-white p-4 rounded-xl border text-left space-y-2">
          <h3 className="text-sm font-semibold">Order Hardware</h3>
          <p className="text-md text-gray-600">
            Need a new POS system? Order now to enhance your business
            operations.
          </p>
          <button className="w-full text-start text-primary hover:underline text-md">
            Order Hardware
          </button>
        </div> */}
        {/* Request Servicing */}
        {/* <div className="bg-white border text-left p-4 rounded-xl space-y-2">
          <h3 className="text-sm font-semibold">Request Servicing</h3>
          <p className="text-md text-gray-600">
            Is your equipment malfunctioning? Request a service call today.
          </p>
          <button className="w-full text-start text-primary hover:underline text-md">
            Request Servicing
          </button>
        </div> */}
      </div>
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Sign Out"
        comments="Are you sure you want to sign out from every other logged-in device?"
        width="sm"
      >
        <div className="flex justify-end space-x-2">
          <CButton
            variant={ButtonType.Primary}
            type="button"
            onClick={handleSignOutEverywhere}
          >
            Yes
          </CButton>
        </div>
      </ReusableModal>
      <ReusableModal
        isOpen={isShowtfaQR}
        onClose={() => {
          setAuthCode(undefined);
          setIsShowtfaQR(false);
        }}
        title="Enable 2FA"
        width="sm"
      >
        <div className="text-center flex flex-col justify-center items-start">
          <p className="mb-4 text-md text-gray-600 text-start">
            Open Google Authenticator app and scan the QR code given below.
          </p>
          {qrCode && (
            <div className="relative w-full h-48">
              <Image
                src={qrCode}
                alt="Authenticator QR Code"
                fill
                className="object-contain"
              />
            </div>
          )}
          <br />
          <input
            type="text"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            maxLength={6}
            className="input input-primary mb-1"
            placeholder="Enter verification code"
          />
          <p className="text-gray-500 text-xs mx-1 text-start">
            Verify the two factor authentication by entering the latest code
            from the authenticator app.
          </p>
          <br />
          <div className="flex w-full justify-end space-x-2 mt-4">
            <CButton
              loading={isEnabling2fa}
              variant={ButtonType.Primary}
              disabled={authCode?.length !== 6 || isEnabling2fa}
              className="btn btn-primary"
              onClick={handleVerify2fA}
            >
              Verify Details
            </CButton>
          </div>
        </div>
      </ReusableModal>
      <ReusableModal
        isOpen={isAuthCodeModalOpen}
        onClose={() => {
          setAuthCode(undefined);
          setIsAuthCodeModalOpen(false);
        }}
        title="Disable Two-Factor Authentication"
        width="ml"
      >
        <div className="space-y-4 mt-4">
          <div>
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              maxLength={6}
              className="input input-primary mb-1"
              placeholder="Enter verification code"
            />
            <p className="text-gray-500 text-xs mx-1 text-start">
              {
                "Verify your details by entering the latest code from the authenticator app."
              }
            </p>
          </div>
          <div className="text-red-500 text-sm">
            <p>Warning: Disabling 2FA will reduce your account security.</p>
            <p>
              Please ensure you want to proceed before submitting the auth code.
            </p>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <CButton
              variant={ButtonType.Primary}
              type="button"
              onClick={handleDisable2faSubmit}
              disabled={isDisabling2fa || authCode?.length !== 6}
            >
              Submit
            </CButton>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default IdentityVerificationForm;
