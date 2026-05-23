import { notFound } from "next/navigation";

import { BlogArchiveShell } from "../../../../components/blog-archive-shell";
import { getBlogAuthor, getBlogCategories, getBlogPosts, getLayoutData } from "../../../../lib/api";
import { getCanonicalUrl, getSiteName } from "../../../../lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const [{ data: author }, { settings }] = await Promise.all([
    getBlogAuthor(resolvedParams.slug),
    getLayoutData(),
  ]);

  if (!author) {
    return {
      title: "Author Not Found",
    };
  }

  const brandName = getSiteName(settings);
  const title = `${author.name} Articles | ${brandName}`;
  const description = author.bio || `Read handcrafted editorial insights by ${author.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(`/blog/author/${author.slug}`, settings),
    },
    openGraph: {
      title,
      description,
      type: "profile",
    },
  };
}

export default async function BlogAuthorPage({ params }: PageProps) {
  const resolvedParams = await params;
  const [{ data: author }, { data: categories }, { data: paginatedPosts }] = await Promise.all([
    getBlogAuthor(resolvedParams.slug),
    getBlogCategories(),
    getBlogPosts({ author: resolvedParams.slug, per_page: 24 }),
  ]);

  if (!author) {
    notFound();
  }

  return (
    <BlogArchiveShell
      eyebrow="Author Archive"
      title={author.name}
      description={author.bio}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: author.name },
      ]}
      posts={paginatedPosts.data || []}
      categories={categories}
      emptyDescription={`No published posts are available for ${author.name} yet.`}
    />
  );
}
