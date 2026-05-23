import Image from "next/image";
import Link from "next/link";

import { getAbsoluteMediaUrl } from "../lib/site";
import { BlogCategory, BlogPost } from "../lib/types";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BlogArchiveShellProps = {
  eyebrow?: string;
  title: string;
  description?: string | null;
  breadcrumbs: BreadcrumbItem[];
  posts: BlogPost[];
  categories?: BlogCategory[];
  activeCategorySlug?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function BlogArchiveShell({
  eyebrow = "The Journal",
  title,
  description,
  breadcrumbs,
  posts,
  categories = [],
  activeCategorySlug = null,
  emptyTitle = "No articles found",
  emptyDescription = "There are no published posts available in this archive yet.",
}: BlogArchiveShellProps) {
  return (
    <main className="page-shell blog-shell">
      <nav
        className="breadcrumbs"
        aria-label="Breadcrumb"
        style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}
      >
        {breadcrumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`}>
            {index > 0 && <span style={{ margin: "0 0.5rem", opacity: 0.5 }}>/</span>}
            {crumb.href ? (
              <Link href={crumb.href} style={{ textDecoration: "none", color: "inherit" }}>
                {crumb.label}
              </Link>
            ) : (
              <span style={{ color: "var(--accent)" }}>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <header className="blog-toolbar-row">
        <div>
          <span
            className="eyebrow"
            style={{
              display: "block",
              marginBottom: "0.3rem",
              color: "var(--accent)",
              textTransform: "uppercase",
              fontSize: "0.78rem",
              fontWeight: "800",
              letterSpacing: "0.14em",
            }}
          >
            {eyebrow}
          </span>
          <h1
            className="page-title"
            style={{ margin: 0, color: "var(--accent-deep)", fontFamily: "var(--font-heading)" }}
          >
            {title}
          </h1>
          {description ? (
            <p style={{ marginTop: "0.9rem", maxWidth: "760px", color: "var(--muted)" }}>{description}</p>
          ) : null}
        </div>
      </header>

      {categories.length > 0 ? (
        <nav className="blog-categories-scroll" aria-label="Blog categories">
          <Link href="/blog" className={`blog-category-pill ${!activeCategorySlug ? "active" : ""}`}>
            All Journals
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog/category/${category.slug}`}
              className={`blog-category-pill ${activeCategorySlug === category.slug ? "active" : ""}`}
            >
              {category.name}
              {typeof category.posts_count === "number" ? ` (${category.posts_count})` : ""}
            </Link>
          ))}
        </nav>
      ) : null}

      {posts.length === 0 ? (
        <section className="blog-empty-state">
          <h3>{emptyTitle}</h3>
          <p>{emptyDescription}</p>
          <Link href="/blog" className="button" style={{ display: "inline-block", textDecoration: "none" }}>
            View All Journals
          </Link>
        </section>
      ) : (
        <section className="blog-grid" aria-label="Articles list">
          {posts.map((post, index) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-media">
                <Link href={`/blog/${post.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                  <Image
                    src={getAbsoluteMediaUrl(post.featured_image) || "/demo-products/little-divinity-real-1.jpg"}
                    alt={post.featured_image_alt || post.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 991px) 50vw, 33vw"
                  />
                </Link>
              </div>
              <div className="blog-card-content">
                <span className="blog-card-category">{post.category?.name || "Journal"}</span>
                <Link href={`/blog/${post.slug}`} className="blog-card-title">
                  {post.title}
                </Link>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {post.author?.avatar ? (
                      <img
                        src={getAbsoluteMediaUrl(post.author.avatar) || post.author.avatar}
                        alt={post.author.avatar_alt || post.author.name}
                        className="blog-author-avatar-small"
                      />
                    ) : (
                      <span style={{ fontSize: "1.1rem", marginRight: "0.45rem" }}>✍</span>
                    )}
                    <span>{post.author?.name || "Editorial"}</span>
                  </div>
                  <span>{post.reading_time || 4} min read</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
