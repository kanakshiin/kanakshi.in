import Link from "next/link";

import { ProductCard } from "../components/product-card";
import { formatPrice, getHomePageData, resolveAssetUrl } from "../lib/api";

export default async function HomePage() {
  const { settings, categories, featuredProducts, newestProducts } = await getHomePageData();
  const brandName = settings.site_name || "Premium Brass Artifacts Store";
  const tagline =
    settings.site_tagline ||
    "Curated decor, pooja accents, and handcrafted gifting pieces with a category-first storefront.";
  const currencySymbol = settings.site_currency_symbol || "Rs.";
  const freeShipping = formatPrice(settings.min_order_free_shipping || "499", currencySymbol);
  const spotlightCategory = categories[0];

  return (
    <main>
      <section className="announce-bar">
        <div className="container announce-inner">
          <span>Curated festive storefront</span>
          <span>Craft-led gifting edits</span>
          <span>Vercel-ready Next.js frontend</span>
        </div>
      </section>

      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Frontend migration</p>
            <h1>{brandName}</h1>
            <p className="hero-text">{tagline}</p>

            <div className="hero-actions">
              <Link href="/shop" className="primary-button">
                Explore Store
              </Link>
              <a href="#bestsellers" className="secondary-button">
                Shop Bestsellers
              </a>
            </div>

            <div className="trust-row">
              <span>Handcrafted collections</span>
              <span>Free shipping above {freeShipping}</span>
              <span>API-driven storefront</span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src={resolveAssetUrl(spotlightCategory?.image || null)}
              alt={spotlightCategory?.name || "Storefront spotlight"}
            />
            <div className="hero-panel">
              <small>Featured category</small>
              <strong>{spotlightCategory?.name || "Signature Collection"}</strong>
              <span>Category-led discovery inspired by your existing brass and decor catalog.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section" id="collections">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Collections</p>
              <h2>Browse Signature Categories</h2>
            </div>
            <Link href="/shop" className="text-link">
              View all
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`} className="category-card">
                <img src={resolveAssetUrl(category.image || null)} alt={category.name} />
                <div>
                  <small>Curated Collection</small>
                  <strong>{category.name}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section soft-section">
        <div className="container story-grid">
          {categories.slice(0, 3).map((category, index) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`} className={`story-card story-card-${index}`}>
              <img src={resolveAssetUrl(category.image || null)} alt={category.name} />
              <div className="story-overlay" />
              <div className="story-copy">
                <small>Editorial Pick</small>
                <h3>{category.name}</h3>
                <p>Built to surface stronger category discovery and a richer premium feel.</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section" id="bestsellers">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Best Sellers</p>
              <h2>Most Loved Across The Storefront</h2>
            </div>
            <Link href="/shop" className="text-link">
              Shop all
            </Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section white-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">New Arrivals</p>
              <h2>Fresh Pieces Worth A First Look</h2>
            </div>
          </div>

          <div className="product-grid">
            {newestProducts.map((product) => (
              <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
