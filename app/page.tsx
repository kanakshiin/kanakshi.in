import Link from "next/link";

import { ProductCard } from "../components/product-card";
import { formatPrice, getHomePageData, resolveAssetUrl } from "../lib/api";
import { referenceAssets } from "../lib/reference-assets";

export default async function HomePage() {
  const { settings, categories, featuredProducts, newestProducts } = await getHomePageData();
  const brandName = settings.site_name || "Little Divinity";
  const tagline =
    settings.site_tagline ||
    "Handcrafted brass decor, pooja accents, and meaningful gifting pieces with a category-first storefront.";
  const currencySymbol = settings.site_currency_symbol || "₹";
  const freeShipping = formatPrice(settings.min_order_free_shipping || "499", currencySymbol);
  const spotlightCategory = categories[0];

  const curatedCollections = [
    {
      title: "God Idols",
      subtitle: "Temple-inspired classics",
      image: referenceAssets.collections.godIdols,
      href: "/shop?category=god-idols"
    },
    {
      title: "Home Decor",
      subtitle: "Statement brass accents",
      image: referenceAssets.collections.homeDecor,
      href: "/shop?category=wall-decor"
    },
    {
      title: "Pooja Decor",
      subtitle: "Sacred corner essentials",
      image: referenceAssets.collections.poojaDecor,
      href: "/shop?category=pooja-decor"
    },
    {
      title: "Kitchen & Utility",
      subtitle: "Functional heirloom pieces",
      image: referenceAssets.collections.homeKitchen,
      href: "/shop?category=home-kitchen"
    }
  ];

  const festiveMoments = [
    { title: "Ganesh Chaturthi Edit", image: referenceAssets.occasions.ganeshChaturthi },
    { title: "Diwali Styling Picks", image: referenceAssets.occasions.diwali },
    { title: "Wedding Gifting", image: referenceAssets.founderAndBrand.weddingGift },
    { title: "Artisan Craft Story", image: referenceAssets.founderAndBrand.artisans }
  ];

  return (
    <main>
      <section className="announce-bar">
        <div className="container announce-inner">
          <span>Handcrafted brass collectibles</span>
          <span>Festive gifting edits</span>
          <span>Pan India delivery above {freeShipping}</span>
        </div>
      </section>

      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Little Divinity</p>
            <h1>{brandName}</h1>
            <p className="hero-text">{tagline}</p>

            <div className="hero-actions">
              <Link href="/shop" className="primary-button">
                Shop Collection
              </Link>
              <a href="#bestsellers" className="secondary-button">
                Explore Bestsellers
              </a>
            </div>

            <div className="trust-row">
              <span>Hand-finished brass decor</span>
              <span>Free shipping above {freeShipping}</span>
              <span>Wedding and festive gifting</span>
            </div>
          </div>

          <div className="hero-visual">
            <img src={referenceAssets.hero.primary} alt={spotlightCategory?.name || "Storefront spotlight"} />
            <div className="hero-panel">
              <small>Signature Collection</small>
              <strong>{spotlightCategory?.name || "Brass & Sacred Decor"}</strong>
              <span>Warm textures, devotional accents, and statement pieces styled like an elevated handcrafted store.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container hero-feature-grid">
          <article className="hero-feature-card feature-tall">
            <img src={referenceAssets.hero.wallDecor} alt="Wall decor collection" />
            <div className="feature-copy">
              <small>Wall Statements</small>
              <h3>Layer Sculptural Brass Across Foyers And Living Rooms</h3>
            </div>
          </article>
          <article className="hero-feature-card">
            <img src={referenceAssets.hero.candleStand} alt="Candle stand detail" />
            <div className="feature-copy">
              <small>Table Accents</small>
              <h3>Console, Coffee Table, And Dining Styling Pieces</h3>
            </div>
          </article>
          <article className="hero-feature-card">
            <img src={referenceAssets.hero.stonework} alt="Craft detail" />
            <div className="feature-copy">
              <small>Craft Details</small>
              <h3>Textured Surfaces And Heirloom-Like Finishes</h3>
            </div>
          </article>
        </div>
      </section>

      <section className="content-section" id="collections">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Collections</p>
              <h2>Shop By Category</h2>
            </div>
            <Link href="/shop" className="text-link">
              View all
            </Link>
          </div>

          <div className="category-grid">
            {curatedCollections.map((collection) => (
              <Link key={collection.title} href={collection.href} className="category-card">
                <img src={collection.image} alt={collection.title} />
                <div>
                  <small>{collection.subtitle}</small>
                  <strong>{collection.title}</strong>
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
              <img
                src={
                  [
                    referenceAssets.collections.godIdols,
                    referenceAssets.founderAndBrand.woodenDecor,
                    referenceAssets.productHighlights.superfineShiva
                  ][index] || resolveAssetUrl(category.image || null)
                }
                alt={category.name}
              />
              <div className="story-overlay" />
              <div className="story-copy">
                <small>Editorial Pick</small>
                <h3>{category.name}</h3>
                <p>Styled with stronger storytelling, warmer overlays, and a more premium discovery rhythm.</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section white-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Festive Edits</p>
              <h2>Occasions, Gifting, And Seasonal Stories</h2>
            </div>
          </div>

          <div className="occasion-grid">
            {festiveMoments.map((moment) => (
              <article key={moment.title} className="occasion-card">
                <img src={moment.image} alt={moment.title} />
                <div>
                  <small>Curated Edit</small>
                  <strong>{moment.title}</strong>
                </div>
              </article>
            ))}
          </div>
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

      <section className="content-section artisan-section">
        <div className="container artisan-grid">
          <div className="artisan-copy">
            <p className="eyebrow">The Craft Story</p>
            <h2>Built To Feel Personal, Not Generic</h2>
            <p className="hero-text">
              The storefront now leans into warmer editorial imagery, stronger category merchandising, calmer typography,
              and product moments that feel closer to a premium handcrafted brand.
            </p>
            <Link href="/shop" className="primary-button">
              Discover More
            </Link>
          </div>
          <div className="artisan-stack">
            <img src={referenceAssets.founderAndBrand.artisans} alt="Artisans" className="artisan-main" />
            <img src={referenceAssets.founderAndBrand.founder} alt="Founder" className="artisan-side" />
          </div>
        </div>
      </section>
    </main>
  );
}
