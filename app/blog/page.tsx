import Link from "next/link";
import Image from "next/image";
import { getBlogPosts, getBlogCategories, getLayoutData } from "../../lib/api";
import { getAbsoluteMediaUrl, getSiteName } from "../../lib/site";

type PageProps = {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    author?: string;
    search?: string;
    page?: string;
  }>;
};

export async function generateMetadata() {
  const { settings } = await getLayoutData();
  const brandName = getSiteName(settings);
  return {
    title: `Spiritual & Editorial Blog | ${brandName}`,
    description: "Discover handcrafted styling tips, spiritual wellness insights, pooja room decoration ideas, and heritage blogs from Kanakshi.in.",
    openGraph: {
      title: `Spiritual & Editorial Blog | ${brandName}`,
      description: "Discover handcrafted styling tips, spiritual wellness insights, pooja room decoration ideas, and heritage blogs from Kanakshi.in.",
      type: "website",
    },
  };
}

export default async function BlogListingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams.category;
  const tagSlug = resolvedSearchParams.tag;
  const authorSlug = resolvedSearchParams.author;
  const searchKeyword = resolvedSearchParams.search;
  const currentPage = Number(resolvedSearchParams.page || "1");

  // Fetch posts from API
  const { data: paginatedPosts } = await getBlogPosts({
    category: categorySlug,
    tag: tagSlug,
    author: authorSlug,
    search: searchKeyword,
    page: currentPage,
    per_page: 9,
  });

  // Fetch categories
  const { data: categories } = await getBlogCategories();

  const posts = paginatedPosts.data || [];
  const totalPosts = paginatedPosts.total || 0;
  const lastPage = paginatedPosts.last_page || 1;

  // Header display details
  let activeFilterLabel = "";
  if (categorySlug) {
    const activeCat = categories.find((c) => c.slug === categorySlug);
    activeFilterLabel = activeCat ? `Category: ${activeCat.name}` : `Category: ${categorySlug}`;
  } else if (tagSlug) {
    activeFilterLabel = `Tag: #${tagSlug}`;
  } else if (authorSlug) {
    activeFilterLabel = `Author posts`;
  } else if (searchKeyword) {
    activeFilterLabel = `Search results for "${searchKeyword}"`;
  }

  // The very first post will act as the featured hero if on page 1 and no filters are applied
  const showHero = currentPage === 1 && !categorySlug && !tagSlug && !authorSlug && !searchKeyword && posts.length > 0;
  const featuredPost = showHero ? posts[0] : null;
  const gridPosts = showHero ? posts.slice(1) : posts;

  return (
    <main className="page-shell blog-shell">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
        <span style={{ margin: "0 0.5rem", opacity: 0.5 }}>/</span>
        <span style={{ color: "var(--accent)" }}>Blog</span>
        {activeFilterLabel && (
          <>
            <span style={{ margin: "0 0.5rem", opacity: 0.5 }}>/</span>
            <span>{activeFilterLabel}</span>
          </>
        )}
      </nav>

      {/* Hero Header */}
      <header className="blog-toolbar-row">
        <div>
          <span className="eyebrow" style={{ display: "block", marginBottom: "0.3rem", color: "var(--accent)", textTransform: "uppercase", fontSize: "0.78rem", fontWeight: "800", letterSpacing: "0.14em" }}>
            The Journal
          </span>
          <h1 className="page-title" style={{ margin: 0, color: "var(--accent-deep)", fontFamily: "var(--font-heading)" }}>
            {activeFilterLabel || "Kanakshi.in Blog"}
          </h1>
        </div>

        {/* Search Bar */}
        <form action="/blog" method="GET" className="blog-search-bar">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          {tagSlug && <input type="hidden" name="tag" value={tagSlug} />}
          <input
            type="search"
            name="search"
            placeholder="Search articles..."
            defaultValue={searchKeyword || ""}
            aria-label="Search articles"
          />
          <button type="submit" aria-label="Submit search">
            Search
          </button>
        </form>
      </header>

      {/* Category Navigation Pills */}
      <nav className="blog-categories-scroll" aria-label="Blog categories">
        <Link
          href="/blog"
          className={`blog-category-pill ${!categorySlug ? "active" : ""}`}
        >
          All Journals
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/blog/category/${cat.slug}`}
            className={`blog-category-pill ${categorySlug === cat.slug ? "active" : ""}`}
          >
            {cat.name} ({cat.posts_count || 0})
          </Link>
        ))}
      </nav>

      {/* Featured Editorial Post */}
      {featuredPost && (
        <section className="blog-featured-hero" aria-label="Featured article">
          <div className="blog-featured-media">
            <Link href={`/blog/${featuredPost.slug}`}>
              <Image
                src={getAbsoluteMediaUrl(featuredPost.featured_image) || "/demo-products/little-divinity-real-1.jpg"}
                alt={featuredPost.featured_image_alt || featuredPost.title}
                fill
                priority
                sizes="(max-width: 991px) 100vw, 60vw"
              />
            </Link>
          </div>
          <div className="blog-featured-copy">
            <span className="blog-badge">{featuredPost.category?.name || "Spiritual"}</span>
            <Link href={`/blog/${featuredPost.slug}`} className="blog-featured-title">
              {featuredPost.title}
            </Link>
            <div className="blog-meta-strip">
              <span>By {featuredPost.author?.name || "Editorial Staff"}</span>
              <span className="blog-meta-dot" />
              <span>{featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}</span>
              <span className="blog-meta-dot" />
              <span>{featuredPost.reading_time || 5} min read</span>
            </div>
            <p className="blog-featured-excerpt">{featuredPost.excerpt}</p>
            <div>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="button"
                style={{ display: "inline-block", textDecoration: "none" }}
              >
                Read Journal
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Main Articles Grid */}
      {posts.length === 0 ? (
        <section className="blog-empty-state">
          <h3>No articles found</h3>
          <p>We are currently writing new editorial journals. Please check back soon or try adjusting your filters.</p>
          <Link href="/blog" className="button" style={{ display: "inline-block", textDecoration: "none" }}>
            View All Journals
          </Link>
        </section>
      ) : (
        <>
          <section className="blog-grid" aria-label="Articles list">
            {gridPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-media">
                  <Link href={`/blog/${post.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                    <Image
                      src={getAbsoluteMediaUrl(post.featured_image) || "/demo-products/little-divinity-real-1.jpg"}
                      alt={post.featured_image_alt || post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 991px) 50vw, 33vw"
                    />
                  </Link>
                </div>
                <div className="blog-card-content">
                  <span className="blog-card-category">{post.category?.name || "Insight"}</span>
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
                      ) : null}
                      <span>{post.author?.name || "Editorial"}</span>
                    </div>
                    <span>{post.reading_time || 4} min read</span>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Pagination Controls */}
          {lastPage > 1 && (
            <nav className="pagination" aria-label="Pagination Navigation" style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "4rem" }}>
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}${categorySlug ? `&category=${categorySlug}` : ""}${tagSlug ? `&tag=${tagSlug}` : ""}${authorSlug ? `&author=${authorSlug}` : ""}${searchKeyword ? `&search=${searchKeyword}` : ""}`}
                  className="button secondary"
                  style={{ textDecoration: "none" }}
                >
                  ← Prev
                </Link>
              )}
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => {
                const isCurrent = p === currentPage;
                return (
                  <Link
                    key={p}
                    href={`/blog?page=${p}${categorySlug ? `&category=${categorySlug}` : ""}${tagSlug ? `&tag=${tagSlug}` : ""}${authorSlug ? `&author=${authorSlug}` : ""}${searchKeyword ? `&search=${searchKeyword}` : ""}`}
                    className={`button ${isCurrent ? "" : "secondary"}`}
                    style={{
                      textDecoration: "none",
                      minWidth: "42px",
                      textAlign: "center",
                      background: isCurrent ? "var(--accent)" : "rgba(255,255,255,0.72)",
                      borderColor: isCurrent ? "var(--accent)" : "var(--line-strong)",
                      color: isCurrent ? "#fff" : "var(--accent-deep)",
                    }}
                  >
                    {p}
                  </Link>
                );
              })}
              {currentPage < lastPage && (
                <Link
                  href={`/blog?page=${currentPage + 1}${categorySlug ? `&category=${categorySlug}` : ""}${tagSlug ? `&tag=${tagSlug}` : ""}${authorSlug ? `&author=${authorSlug}` : ""}${searchKeyword ? `&search=${searchKeyword}` : ""}`}
                  className="button secondary"
                  style={{ textDecoration: "none" }}
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </main>
  );
}
