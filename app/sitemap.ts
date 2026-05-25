import { MetadataRoute } from "next";
import {
  getBlogAuthors,
  getBlogCategories,
  getBlogPosts,
  getBlogTags,
  getCategories,
  getProducts,
  getSettings
} from "../lib/api";
import { getSiteUrl } from "../lib/site";

async function getAllBlogPosts() {
  const firstPage = await getBlogPosts({ page: 1, per_page: 100 });
  const initialPosts = firstPage.data?.data || [];
  const lastPage = Math.max(firstPage.data?.last_page || 1, 1);

  if (lastPage === 1) {
    return initialPosts;
  }

  const requests: Promise<Awaited<ReturnType<typeof getBlogPosts>>>[] = [];
  for (let page = 2; page <= lastPage; page += 1) {
    requests.push(getBlogPosts({ page, per_page: 100 }));
  }

  const pages = await Promise.all(requests);
  const allPosts = [...initialPosts];
  for (const page of pages) {
    allPosts.push(...(page.data?.data || []));
  }

  const seen = new Set<string>();
  return allPosts.filter((post) => {
    if (seen.has(post.slug)) {
      return false;
    }
    seen.add(post.slug);
    return true;
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, products, categories, blogPosts, blogCategoriesData, blogTagsData, blogAuthorsData] = await Promise.all([
    getSettings(),
    getProducts("per_page=100&sort=popular"),
    getCategories(24),
    getAllBlogPosts(),
    getBlogCategories(),
    getBlogTags(),
    getBlogAuthors()
  ]);

  const siteUrl = getSiteUrl(settings);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/track-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/account/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/account/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/pages/shipping-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/pages/refund-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/pages/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/shop?category=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  const productRoutes: MetadataRoute.Sitemap = products.items
    .filter((product) => product.category_slug && product.slug)
    .map((product) => ({
      url: `${siteUrl}/shop/${product.category_slug}/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75
    }));

  const blogPostRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));

  const blogCategoryRoutes: MetadataRoute.Sitemap = (blogCategoriesData.data || [])
    .filter((category) => (category.posts_count || 0) > 0)
    .map((category) => ({
      url: `${siteUrl}/blog/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6
    }));

  const blogTagRoutes: MetadataRoute.Sitemap = (blogTagsData.data || [])
    .filter((tag) => (tag.posts_count || 0) > 0)
    .map((tag) => ({
      url: `${siteUrl}/blog/tag/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.55
    }));

  const blogAuthorRoutes: MetadataRoute.Sitemap = (blogAuthorsData.data || [])
    .filter((author) => (author.posts_count || 0) > 0)
    .map((author) => ({
      url: `${siteUrl}/blog/author/${author.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.55
    }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...blogPostRoutes,
    ...blogCategoryRoutes,
    ...blogTagRoutes,
    ...blogAuthorRoutes
  ];
}
