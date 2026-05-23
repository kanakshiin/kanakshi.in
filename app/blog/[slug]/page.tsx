import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPost, getLayoutData, getPrimaryImage } from "../../../lib/api";
import { getAbsoluteMediaUrl, getSiteUrl, getSiteName, getProductPath } from "../../../lib/site";
import { StructuredData } from "../../../components/structured-data";
import { AddToCartButton } from "../../../components/add-to-cart-button";
import {
  BlogReadingProgress,
  BlogTableOfContents,
  BlogFaqAccordion,
} from "../../../components/blog-client-elements";
import { BlogSocialShare } from "../../../components/blog-social-share";


type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const [{ data: post }, { settings }] = await Promise.all([
    getBlogPost(resolvedParams.slug),
    getLayoutData(),
  ]);
  if (!post) {
    return {
      title: "Journal Not Found",
    };
  }

  const absoluteCanonical = post.canonical_url || getSiteUrl(settings) + `/blog/${post.slug}`;
  const socialImage = getAbsoluteMediaUrl(post.og_image || post.featured_image, settings);

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    alternates: {
      canonical: absoluteCanonical,
    },
    openGraph: {
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt,
      images: socialImage ? [{ url: socialImage }] : undefined,
      type: "article",
      publishedTime: post.published_at || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.twitter_title || post.meta_title || post.title,
      description: post.twitter_description || post.meta_description || post.excerpt,
      images: socialImage ? [socialImage] : undefined,
    },
    robots: {
      index: !post.seo_noindex,
      follow: !post.seo_nofollow,
    },
  };
}

export default async function BlogDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { data: post } = await getBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const { settings } = await getLayoutData();
  const siteUrl = getSiteUrl(settings);
  const brandName = getSiteName(settings);
  const currencySymbol = settings?.site_currency_symbol || "₹";

  const articleUrl = `${siteUrl}/blog/${post.slug}`;
  const articleImage = getAbsoluteMediaUrl(post.featured_image, settings);
  const publisherLogo = getAbsoluteMediaUrl(settings?.logo_url || "/logo.jpg", settings);

  // Structured Schema Mappings
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": post.schema_type || "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: articleImage ? [articleImage] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: [
      {
        "@type": "Person",
        name: post.author?.name || "Editorial Staff",
        url: post.author?.slug ? `${siteUrl}/blog/author/${post.author.slug}` : undefined,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: brandName,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo || `${siteUrl}/logo.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: articleUrl,
      },
    ],
  };

  const relatedProducts = post.related_products || [];
  const relatedPosts = post.related_posts || [];

  return (
    <>
      <StructuredData data={[articleJsonLd, breadcrumbJsonLd]} />
      <BlogReadingProgress />

      <main className="page-shell blog-shell">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: "2rem", fontSize: "0.85rem", color: "var(--muted)" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
          <span style={{ margin: "0 0.5rem", opacity: 0.5 }}>/</span>
          <Link href="/blog" style={{ textDecoration: "none", color: "inherit" }}>Blog</Link>
          {post.category && (
            <>
              <span style={{ margin: "0 0.5rem", opacity: 0.5 }}>/</span>
              <Link href={`/blog/category/${post.category.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                {post.category.name}
              </Link>
            </>
          )}
          <span style={{ margin: "0 0.5rem", opacity: 0.5 }}>/</span>
          <span style={{ color: "var(--accent)" }}>{post.title}</span>
        </nav>

        {/* Article Header */}
        <header className="blog-article-header">
          {post.category && (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="blog-badge"
              style={{ textDecoration: "none" }}
            >
              {post.category.name}
            </Link>
          )}
          <h1 className="blog-article-title">{post.title}</h1>
          <div className="blog-meta-strip" style={{ justifyContent: "center" }}>
            {post.author && (
              <span style={{ display: "flex", alignItems: "center" }}>
                ✍ By &nbsp;
                <Link
                  href={`/blog/author/${post.author.slug}`}
                  style={{ textDecoration: "none", fontWeight: 700, color: "var(--accent-deep)" }}
                >
                  {post.author.name}
                </Link>
              </span>
            )}
            <span className="blog-meta-dot" />
            <span>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Editorial Staff"}
            </span>
            <span className="blog-meta-dot" />
            <span>{post.reading_time || 5} min read</span>
          </div>
        </header>

        {/* Big Featured Image */}
        {post.featured_image && (
          <section className="blog-article-hero-frame">
            <Image
              src={articleImage || post.featured_image}
              alt={post.featured_image_alt || post.title}
              fill
              priority
              sizes="100vw"
            />
          </section>
        )}

        {/* Dynamic Dual Column Editorial Layout */}
        <div className="blog-article-layout">
          {/* Main Content Column */}
          <article>
            <div
              className="prose-heritage"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Social Media Sharing */}
            <BlogSocialShare
              url={articleUrl}
              title={post.title}
              media={articleImage || post.featured_image}
            />

            {/* Tags Strip */}

            {post.tags && post.tags.length > 0 && (
              <section className="blog-article-tags" aria-label="Article tags">
                <span>Tagged in:</span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="blog-tag-pill"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </section>
            )}

            {/* Accordion FAQ Section */}
            {post.faq_json && post.faq_json.length > 0 && (
              <BlogFaqAccordion faqs={post.faq_json} />
            )}
          </article>

          {/* Sticky Sidebar Column */}
          <aside className="blog-sidebar-sticky">
            {/* Dynamic TOC widget */}
            <BlogTableOfContents />

            {/* Author Profile widget */}
            {post.author && (
              <div className="blog-sidebar-widget blog-author-card">
                <h3>About The Author</h3>
                {post.author.avatar && (
                  <img
                    src={getAbsoluteMediaUrl(post.author.avatar, settings) || post.author.avatar}
                    alt={post.author.avatar_alt || post.author.name}
                    className="blog-author-avatar-large"
                  />
                )}
                <h4>{post.author.name}</h4>
                {post.author.bio && <p>{post.author.bio}</p>}
                {post.author.twitter_handle && (
                  <a
                    href={`https://twitter.com/${post.author.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blog-author-social"
                  >
                    🐦 @{post.author.twitter_handle}
                  </a>
                )}
              </div>
            )}

            {/* Linked E-commerce conversion widget */}
            {relatedProducts.length > 0 && (
              <div className="blog-sidebar-widget">
                <h3>Shop Featured Pieces</h3>
                <div className="related-products-list">
                  {relatedProducts.map((prod) => {
                    const primaryImage =
                      prod.images && Array.isArray(prod.images) && prod.images.length > 0
                        ? prod.images[0]
                        : (typeof prod.images === "string" ? JSON.parse(prod.images)[0] : "/logo.jpg");

                    const finalPrice =
                      Number(prod.sale_price) > 0 && Number(prod.sale_price) < Number(prod.price)
                        ? prod.sale_price
                        : prod.price;

                    return (
                      <div key={prod.id} className="related-product-card">
                        <div className="related-product-image">
                          <Image
                            src={getPrimaryImage(prod)}
                            alt={prod.name}
                            fill
                            sizes="64px"
                          />
                        </div>
                        <div className="related-product-info">
                          <Link href={getProductPath(prod)} className="related-product-name" title={prod.name}>
                            {prod.name}
                          </Link>
                          <div className="related-product-price">
                            {currencySymbol}{Number(finalPrice).toLocaleString()}
                          </div>
                          <div className="related-product-buy">
                            <AddToCartButton product={prod} className="button small" label="Shop Now" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer Related Editorial Grid */}
      {relatedPosts.length > 0 && (
        <section className="blog-related-posts-section">
          <div className="blog-related-posts-container">
            <h2>Recommended Journals</h2>
            <div className="blog-grid" style={{ marginBottom: 0 }}>
              {relatedPosts.map((rPost) => (
                <article key={rPost.id} className="blog-card" style={{ background: "#fff" }}>
                  <div className="blog-card-media">
                    <Link href={`/blog/${rPost.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                      <Image
                        src={getAbsoluteMediaUrl(rPost.featured_image, settings) || "/demo-products/little-divinity-real-1.jpg"}
                        alt={rPost.featured_image_alt || rPost.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 991px) 50vw, 33vw"
                      />
                    </Link>
                  </div>
                  <div className="blog-card-content">
                    <span className="blog-card-category">{rPost.category?.name || "Journal"}</span>
                    <Link href={`/blog/${rPost.slug}`} className="blog-card-title">
                      {rPost.title}
                    </Link>
                    <p className="blog-card-excerpt">{rPost.excerpt}</p>
                    <div className="blog-card-footer">
                      <span>By {rPost.author?.name || "Staff"}</span>
                      <span>{rPost.reading_time || 4} min read</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
