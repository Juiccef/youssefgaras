import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content";

// One public page. /preview is a second address for it and keeps itself out of
// search results with its own noindex (preview/page.tsx), which a crawler has
// to be allowed to read, so it isn't disallowed here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
