import { notFound } from "next/navigation";

import { BlogArchiveShell } from "../../../../components/blog-archive-shell";
import { getBlogCategories, getBlogPosts, getBlogTag, getLayoutData } from "../../../../lib/api";
import { getCanonicalUrl, getSiteName } from "../../../../lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const [{ data: tag }, { settings }] = await Promise.all([
    getBlogTag(resolvedParams.slug),
    getLayoutData(),
  ]);

  if (!tag) {
    return {
      title: "Tag Not Found",
    };
  }

  const brandName = getSiteName(settings);
  const title = `${tag.name} Articles | ${brandName}`;
  const description = `Browse ${tag.name} articles, ideas, and guides from ${brandName}.`;

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(`/blog/tag/${tag.slug}`, settings),
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function BlogTagPage({ params }: PageProps) {
  const resolvedParams = await params;
  const [{ data: tag }, { data: categories }, { data: paginatedPosts }] = await Promise.all([
    getBlogTag(resolvedParams.slug),
    getBlogCategories(),
    getBlogPosts({ tag: resolvedParams.slug, per_page: 24 }),
  ]);

  if (!tag) {
    notFound();
  }

  return (
    <BlogArchiveShell
      eyebrow="Tag Archive"
      title={`#${tag.name}`}
      description={`Published articles tagged with ${tag.name}.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: `#${tag.name}` },
      ]}
      posts={paginatedPosts.data || []}
      categories={categories}
      emptyDescription={`No published posts are tagged with ${tag.name} yet.`}
    />
  );
}
