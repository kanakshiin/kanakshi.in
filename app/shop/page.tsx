import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { StructuredData } from "../../components/structured-data";
import { ProductCard } from "../../components/product-card";
import { getCategories, getProducts, getSettings } from "../../lib/api";
import { getCanonicalUrl, getProductPath, getProductRenderKey, getSiteDescription, getSiteName } from "../../lib/site";
import { referenceAssets } from "../../lib/reference-assets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
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

  query.set("per_page", "24");
  query.set("sort", "newest");

  if (params.category) {
    query.set("category", params.category);
  }

  const products = await getProducts(query.toString());
  const currencySymbol = settings.site_currency_symbol || "₹";
  const activeCategory = categories.find((category) => category.slug === params.category);
  const heroImage =
    activeCategory?.image ||
    referenceAssets.collections.homeDecor;
  const shopItems = products.items;
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
    : "Browse handcrafted idols, wall accents, pooja decor, gifting edits, and lifestyle pieces in a denser handcrafted storefront flow inspired by the reference retail rhythm.";

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

      <section className="content-section shop-layout-section">
        <div className="container">
          <div className="shop-layout">
            <aside className="shop-sidebar">
              <div className="shop-filter-card">
                <p className="eyebrow">Browse By</p>
                <h3>Categories</h3>
                <div className="shop-filter-list">
                  {featuredCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/shop?category=${category.slug}`}
                      className={category.slug === params.category ? "shop-filter-link active" : "shop-filter-link"}
                    >
                      <span>{category.name}</span>
                      <small>Explore</small>
                    </Link>
                  ))}
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
                  <span className="listing-meta">Sorted by popularity</span>
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
