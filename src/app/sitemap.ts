import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content";

// The site is the one page; its date is the day it was last built.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
