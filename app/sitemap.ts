import type { MetadataRoute } from "next";

import { getBlogAuthors, getBlogCategories, getBlogPosts, getBlogTags, getCategories, getProducts, getSettings } from "../lib/api";
import { getProductPath, getSiteUrl } from "../lib/site";

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
  const [settings, categories, products, blogPosts, blogCategoriesData, blogTagsData, blogAuthorsData] = await Promise.all([
    getSettings(),
    getCategories(50),
    getProducts("per_page=100&sort=popular"),
    getAllBlogPosts(),
    getBlogCategories(),
    getBlogTags(),
    getBlogAuthors()
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
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now
    }
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/shop?category=${category.slug}`,
    lastModified: now
  }));

  const productRoutes: MetadataRoute.Sitemap = products.items.map((product) => ({
    url: `${siteUrl}${getProductPath(product)}`,
    lastModified: now
  }));

  const blogPostRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : now
  }));

  // Blog Categories sitemap mapping
  const blogCategories = (blogCategoriesData.data || []).filter((category) => (category.posts_count || 0) > 0);
  const blogCategoryRoutes: MetadataRoute.Sitemap = blogCategories.map((category) => ({
    url: `${siteUrl}/blog/category/${category.slug}`,
    lastModified: now
  }));

  // Blog Tags sitemap mapping
  const blogTags = (blogTagsData.data || []).filter((tag) => (tag.posts_count || 0) > 0);
  const blogTagRoutes: MetadataRoute.Sitemap = blogTags.map((tag) => ({
    url: `${siteUrl}/blog/tag/${tag.slug}`,
    lastModified: now
  }));

  const blogAuthors = (blogAuthorsData.data || []).filter((author) => (author.posts_count || 0) > 0);
  const blogAuthorRoutes: MetadataRoute.Sitemap = blogAuthors.map((author) => ({
    url: `${siteUrl}/blog/author/${author.slug}`,
    lastModified: now
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
