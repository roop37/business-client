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
 * Public marketing modal controller. Account creation stays hidden
 * while Hoizr is in waitlist mode.
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
