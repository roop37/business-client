import { ReactNode } from "react";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
} from "./seo/SchemaJsonLd";

type Props = { children: ReactNode };

/**
 * Wraps every public marketing page (landing, pricing, product detail,
 * blog) with the shared nav + footer and the `.hoizr-marketing` token
 * scope. Also emits site-wide JSON-LD so search engines can pick up
 * Hoizr's organization + website schema once per page render.
 */
export const MarketingShell = ({ children }: Props) => {
  return (
    <div className="hoizr-marketing min-h-screen flex flex-col">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <MarketingNav />
      <main className="hm-main flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
};
