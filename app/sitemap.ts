import type { MetadataRoute } from "next";

import { getCategories, getProducts, getSettings } from "../lib/api";
import { getSiteUrl } from "../lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, categories, products] = await Promise.all([
    getSettings(),
    getCategories(50),
    getProducts("per_page=100&sort=popular")
  ]);

  const siteUrl = getSiteUrl(settings);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: now
    }
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/shop?category=${category.slug}`,
    lastModified: now
  }));

  const productRoutes: MetadataRoute.Sitemap = products.items.map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: now
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
