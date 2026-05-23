"use client";

import PayoutModals from "@/components/common/payout/PayoutModals";
import Toast from "@/components/common/toast/toast";
import useGlobalStore from "@/store/global";
import NextNProgress from "nextjs-progressbar";
import { useEffect } from "react";

/**
 * Client wrapper that mounts the things that need browser APIs:
 * the route-change progress bar, the global toast portal, and a
 * one-off event listener that prevents number inputs from
 * incrementing on wheel scroll. Lives directly under the root layout
 * so every page gets it.
 */
export const AppGlobals = ({ children }: { children: React.ReactNode }) => {
  const { toastData } = useGlobalStore();

  useEffect(() => {
    const preventNumberWheel = (event: WheelEvent) => {
      const el = document.activeElement as HTMLInputElement | null;
      if (el?.tagName === "INPUT" && el.type === "number") {
        event.preventDefault();
      }
    };
    document.addEventListener("wheel", preventNumberWheel, { passive: false });
    return () => document.removeEventListener("wheel", preventNumberWheel);
  }, []);

  return (
    <>
      <NextNProgress color="#191C24" />
      {children}
      <PayoutModals />
      {toastData ? (
        <Toast message={toastData.message} type={toastData.type} />
      ) : null}
    </>
  );
};
