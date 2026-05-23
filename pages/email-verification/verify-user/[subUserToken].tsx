import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import BlockerLayout from "@/components/layouts/blockerLayout";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import errorIcon from "../../../assets/svg/blocked.svg";
import successIcon from "../../../assets/svg/success.svg";

type NextPageWithLayout = React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

const SubUserVerify: NextPageWithLayout = () => {
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = router.query.subUserToken?.toString() ?? "";
        if (token) {
          const response = await sdk.verifyTeamEmail({ token }, {});
          if (response?.verifyTeamEmail) {
            const timer = setInterval(() => {
              setCountdown((prevCount) => {
                if (prevCount <= 1) {
                  clearInterval(timer);
                  router.push("/login");
                  return 0;
                }
                return prevCount - 1;
              });
            }, 1000);
          } else {
            throw new Error("Verification failed");
          }
        } else if (router.isReady) {
          throw new Error("Verification token is missing");
        }
      } catch (error) {
        setError(extractErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-2 py-3 w-full max-w-xl mx-auto flex flex-col space-y-8">
          <div className="flex flex-col items-center justify-center h-64">
            <FaSpinner className="animate-spin h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-2 py-3 w-full max-w-xl mx-auto flex flex-col space-y-8">
        <div className="flex flex-col items-center text-center p-4 space-y-5">
          {error ? (
            <Image src={errorIcon} alt="Error Icon" width={64} height={64} />
          ) : (
            <Image
              src={successIcon}
              alt="Success Icon"
              width={80}
              height={80}
            />
          )}

          <div className="flex flex-col items-center text-center">
            {error && (
              <div className="mb-4">
                <p className="text-red-500 mb-2">{error}</p>
                <CButton
                  variant={ButtonType.Primary}
                  onClick={() => router.replace("/login")}
                >
                  Go Back to Login
                </CButton>
              </div>
            )}

            {!error && (
              <>
                <p className="text-gray-800 mb-2">
                  Account verified successfully.
                </p>
                <p className="text-gray-600 text-sm">
                  Redirecting to login in {countdown} seconds...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

SubUserVerify.getLayout = function getLayout(page: React.ReactNode) {
  return <BlockerLayout>{page}</BlockerLayout>;
};

export default SubUserVerify;

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  return {
    props: {},
  };
};
