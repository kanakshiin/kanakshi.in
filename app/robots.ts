import type { MetadataRoute } from "next";

import { getSettings } from "../lib/api";
import { getSiteUrl } from "../lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const siteUrl = getSiteUrl(settings);

  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
