import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { StructuredData } from "../../components/structured-data";
import { ProductCard } from "../../components/product-card";
import { ShopSortSelect, ShopPriceFilter } from "../../components/shop-controls";
import { getCategories, getProducts, getSettings } from "../../lib/api";
import { getCanonicalUrl, getProductPath, getProductRenderKey, getSiteDescription, getSiteName } from "../../lib/site";
import { referenceAssets } from "../../lib/reference-assets";

export const revalidate = 60;

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
};

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const [settings, categories] = await Promise.all([getSettings(), getCategories(24)]);
  const activeCategory = categories.find((category) => category.slug === params.category);
  const siteName = getSiteName(settings);
  const description = activeCategory
    ? `Shop ${activeCategory.name.toLowerCase()} from ${siteName}. ${getSiteDescription(settings)}`
    : getSiteDescription(settings);

  return {
    title: activeCategory ? `${activeCategory.name} Collection` : "Shop",
    description,
    alternates: {
      canonical: activeCategory ? `/shop?category=${activeCategory.slug}` : "/shop"
    },
    openGraph: {
      title: activeCategory ? `${activeCategory.name} Collection | ${siteName}` : `${siteName} Shop`,
      description,
      url: getCanonicalUrl(activeCategory ? `/shop?category=${activeCategory.slug}` : "/shop", settings)
    }
  };
}

const categorySubtitles: Record<string, string> = {
  "god-idols": "Sacred deities handcrafted in heavy antique brass to center meditation spaces and home altars.",
  "wall-decor": "Detailed brass plates, hanging lamps, and vintage brackets that weave structural stories.",
  "table-decor": "Fine-art frames, ornate candle holders, and intricate showpieces curated for focal consoles.",
  "pooja-decor": "Ritual singhasans, bells, incense holders, and brass vessels designed for peaceful ceremonies.",
  "home-kitchen": "Ornate spice jars, serving trays, and heritage vessels blending luxury and utility.",
  "gifting-edit": "Thoughtfully bundled brass coordinates, ideal for housewarmings, weddings, and milestones."
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [settings, categories] = await Promise.all([getSettings(), getCategories(12)]);
  const query = new URLSearchParams();
  const activeSort = params.sort || "popularity";

  query.set("per_page", "24");
  query.set("sort", activeSort === "newest" ? "newest" : "popular");

  if (params.category) {
    query.set("category", params.category);
  }

  const products = await getProducts(query.toString());
  const currencySymbol = settings.site_currency_symbol || "₹";
  const activeCategory = categories.find((category) => category.slug === params.category);
  const heroImage =
    activeCategory?.image ||
    referenceAssets.collections.homeDecor;

  // In-memory sorting and price filtering for guaranteed functionality
  const minPrice = params.min_price ? Number(params.min_price) : 0;
  const maxPrice = params.max_price ? Number(params.max_price) : Infinity;

  const filteredItems = products.items.filter((item) => {
    const price = Number(item.effective_price ?? item.price ?? 0);
    return price >= minPrice && price <= maxPrice;
  });

  if (activeSort === "price-asc") {
    filteredItems.sort((a, b) => Number(a.effective_price ?? a.price ?? 0) - Number(b.effective_price ?? b.price ?? 0));
  } else if (activeSort === "price-desc") {
    filteredItems.sort((a, b) => Number(b.effective_price ?? b.price ?? 0) - Number(a.effective_price ?? a.price ?? 0));
  } else if (activeSort === "newest") {
    filteredItems.sort((a, b) => Number(b.id) - Number(a.id));
  }

  const shopItems = filteredItems;
  const featuredCategories = categories.slice(0, 8);
  const pageTitle = activeCategory ? `${activeCategory.name} Picks` : "Most Loved Pieces";
  const storePromises = [
    "Handcrafted accents and idols",
    "Festive gifting friendly picks",
    `Free shipping over ${currencySymbol}${settings.min_order_free_shipping || "499"}`,
    "Curated with warm brass styling"
  ];
  const shopPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: activeCategory ? `${activeCategory.name} Collection` : `${getSiteName(settings)} Shop`,
    url: getCanonicalUrl(activeCategory ? `/shop?category=${activeCategory.slug}` : "/shop", settings),
    description: activeCategory
      ? `Browse ${activeCategory.name.toLowerCase()} and handcrafted gifting pieces from ${getSiteName(settings)}.`
      : getSiteDescription(settings),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: shopItems.slice(0, 24).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getCanonicalUrl(getProductPath(product), settings),
        name: product.name
      }))
    }
  };

  const subtitleText = activeCategory && categorySubtitles[activeCategory.slug]
    ? categorySubtitles[activeCategory.slug]
    : "Browse our complete collection of handcrafted brass idols, wall accents, pooja decor, gifting edits, and lifestyle pieces — curated for sacred spaces, meaningful gifting, and premium home styling.";

  return (
    <main className="page-shell">
      <StructuredData data={shopPageJsonLd} />
      <section className="shop-hero">
        <div className="container">
          <div className="shop-hero-grid">
            <div className="shop-hero-copy">
              <p className="eyebrow">Shop The Collection</p>
              <h1 className="page-title">{activeCategory ? activeCategory.name : "Premium Decor For Home, Ritual, And Gifting"}</h1>
              <p className="shop-intro">{subtitleText}</p>
              <div className="shop-chip-row">
                <Link
                  href="/shop"
                  className={!params.category ? "shop-chip active" : "shop-chip"}
                >
                  All Pieces
                </Link>
                {featuredCategories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className={category.slug === params.category ? "shop-chip active" : "shop-chip"}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="shop-hero-visual-frame">
              <div className="shop-hero-visual-inner">
                <Image
                  src={heroImage}
                  alt={activeCategory?.name || "Shop the collection"}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 40vw"
                  className="shop-hero-img"
                />
                <div className="shop-summary-card">
                  <span>{products.pagination.total} products ready to browse</span>
                  <strong>Curated around festive display, sacred corners, and meaningful gifting.</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Horizontal Category Pill Bar */}
      <div className="shop-sticky-category-bar">
        <div className="container">
          <div className="shop-category-horizontal-list">
            <Link
              href="/shop"
              className={!params.category ? "shop-category-pill active" : "shop-category-pill"}
            >
              <strong>All Pieces</strong>
            </Link>
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className={category.slug === params.category ? "shop-category-pill active" : "shop-category-pill"}
              >
                <strong>{category.name}</strong>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="content-section shop-layout-section">
        <div className="container">
          <div className="shop-layout">
            <aside className="shop-sidebar">
              <div className="shop-filter-card">
                <p className="eyebrow">Filter By</p>
                <h3>Price Range</h3>
                <div className="shop-filter-block">
                  <ShopPriceFilter />
                </div>
              </div>

              <div className="shop-filter-card">
                <p className="eyebrow">Store Promise</p>
                <h3>Why Browse Here</h3>
                <ul className="shop-promise-list">
                  {storePromises.map((promise) => (
                    <li key={promise}>{promise}</li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="shop-results">
              <div className="shop-results-toolbar">
                <div>
                  <p className="eyebrow">Featured Listing</p>
                  <h2>{pageTitle}</h2>
                </div>
                <div className="shop-results-meta">
                  <span className="listing-meta">{shopItems.length} visible now</span>
                  <ShopSortSelect />
                </div>
              </div>

              <div className="product-grid shop-product-grid">
                {shopItems.map((product) => (
                  <ProductCard key={getProductRenderKey(product)} product={product} currencySymbol={currencySymbol} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
