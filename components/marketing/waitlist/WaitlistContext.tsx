"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { WaitlistModal } from "./WaitlistModal";

/**
 * Global "Join the waitlist" controller. Pre-launch the marketing
 * site shows a single waitlist CTA in place of login/signup; every
 * CTA on every page opens the same modal via useWaitlist().open().
 *
 * When the main API server comes online and the dashboard reopens to
 * the public, remove the provider mount in AppGlobals and restore the
 * commented login/signup links across the marketing components.
 */

type WaitlistCtx = {
  open: (source?: string) => void;
  close: () => void;
};

const Ctx = createContext<WaitlistCtx | null>(null);

export const WaitlistProvider = ({ children }: { children: ReactNode }) => {
  const [openState, setOpenState] = useState<{ open: boolean; source?: string }>(
    { open: false },
  );

  const open = useCallback(
    (source?: string) => setOpenState({ open: true, source }),
    [],
  );
  const close = useCallback(() => setOpenState({ open: false }), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <WaitlistModal
        open={openState.open}
        source={openState.source}
        onClose={close}
      />
    </Ctx.Provider>
  );
};

export const useWaitlist = (): WaitlistCtx => {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return { open: () => undefined, close: () => undefined };
  }
  return ctx;
};
