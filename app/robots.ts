import { MetadataRoute } from "next";
import { getSettings } from "../lib/api";
import { getSiteUrl } from "../lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const baseUrl = getSiteUrl(settings);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/account", "/checkout", "/api/*"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/jewellery/*", "/images/*", "/*.jpg", "/*.png", "/*.svg"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/api/google-shopping-feed`
    ],
  };
}
