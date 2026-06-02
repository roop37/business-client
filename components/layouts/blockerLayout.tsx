import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { AnimatePresence } from "framer-motion";
import { LogOutIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import logo1 from "../../assets/logo/logoDark.png";
import CButton from "../common/button/button";
import { ButtonType } from "../common/button/interface";

type Props = {
  children: ReactNode;
};

const BlockerLayouout = ({ children }: Props) => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const handleLogout = async () => {
    try {
      const response = await sdk.userLogout();
      if (response && response.userLogout) {
        router.replace("/login");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2947C20F] to-[#FFFFFF] text-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div></div>

        <div>
          <CButton
            variant={ButtonType.Text}
            onClick={handleLogout}
            type="button"
          >
            <div className="flex flex-row justify-between items-center space-x-2 text-red-500 transition-all hover:scale-[1.05]">
              <LogOutIcon size={15} />
              <span>Log Out</span>
            </div>
          </CButton>
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </main>
      <div className="flex w-full items-center justify-between border-t px-6 py-3">
        <Image src={logo1} alt="Logo" width={140} height={140} />
        <div className=" flex flex-col justify-start items-end space-y-1 text-xs">
          <Link
            className="text-primary hover:underline"
            href="mailto:contact@hoizr.com"
            target="_blank"
          >
            Need Help? <span className="text-black">contact@hoizr.com</span>
          </Link>
          <div className="flex space-x-2">
            <Link
              className="text-primary hover:underline"
              href="https://www.hoizr.com/terms-conditions"
              target="_blank"
            >
              {" "}
              Terms and Conditions{" "}
            </Link>
            <Link
              className="text-primary hover:underline"
              href="https://www.hoizr.com/privacy-policy"
              target="_blank"
            >
              {" "}
              Privacy Policy{" "}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockerLayouout;
