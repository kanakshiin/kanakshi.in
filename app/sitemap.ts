import { MetadataRoute } from "next";
import { getCategories, getProducts, getSettings } from "../lib/api";
import { getProductPath, getSiteUrl } from "../lib/site";

export const revalidate = 3600; // revalidate every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, categories, productsResponse] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts("per_page=1000&sort=newest"),
  ]);

  const baseUrl = getSiteUrl(settings);

  // 1. Static high priority marketing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/live-auctions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // 2. Category routes
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/shop/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // 3. Product detail pages
  const productRoutes: MetadataRoute.Sitemap = productsResponse.items.map((prod) => {
    const path = getProductPath(prod);
    return {
      url: `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
