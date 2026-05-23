import { notFound } from "next/navigation";

import { BlogArchiveShell } from "../../../../components/blog-archive-shell";
import { getBlogCategory, getBlogCategories, getBlogPosts, getLayoutData } from "../../../../lib/api";
import { getCanonicalUrl, getSiteName } from "../../../../lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const [{ data: category }, { settings }] = await Promise.all([
    getBlogCategory(resolvedParams.slug),
    getLayoutData(),
  ]);

  if (!category) {
    return {
      title: "Blog Category Not Found",
    };
  }

  const brandName = getSiteName(settings);
  const title = category.meta_title || `${category.name} Articles | ${brandName}`;
  const description =
    category.meta_description ||
    category.description ||
    `Explore ${category.name} articles from ${brandName}.`;

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(`/blog/category/${category.slug}`, settings),
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const [{ data: category }, { data: categories }, { data: paginatedPosts }] = await Promise.all([
    getBlogCategory(resolvedParams.slug),
    getBlogCategories(),
    getBlogPosts({ category: resolvedParams.slug, per_page: 24 }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <BlogArchiveShell
      eyebrow="Category Archive"
      title={category.name}
      description={category.description || category.meta_description}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: category.name },
      ]}
      posts={paginatedPosts.data || []}
      categories={categories}
      activeCategorySlug={category.slug}
      emptyDescription={`No published posts are available in ${category.name} yet.`}
    />
  );
}
