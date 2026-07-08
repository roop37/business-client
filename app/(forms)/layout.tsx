import type { ReactNode } from "react";

// The (forms) route group deliberately skips MarketingShell so the
// conversational forms render full-bleed dark with no light nav/footer.
// The root layout (app/layout.tsx) already provides <html>/<body> +
// AppGlobals, so this layout only adds the dark scope wrapper.
export default function FormsLayout({ children }: { children: ReactNode }) {
  return <div className="pcf-root">{children}</div>;
}
