import { blogRssResponse } from "@/components/marketing/seo/rss";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return blogRssResponse("/rss.xml");
}
