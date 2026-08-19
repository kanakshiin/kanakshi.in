import type { Metadata } from "next";
import Link from "next/link";

import { StructuredData } from "../../components/structured-data";
import { ShopProductList } from "../../components/shop-product-list";
import { ShopSortSelect, ShopPriceFilter } from "../../components/shop-controls";
import { HeroSlider } from "../../components/hero-slider";
import { KanakshiTrustBadges } from "../../components/kanakshi-trust-badges";
import { getCategories, getProducts, getSettings, resolveAssetUrl } from "../../lib/api";
import { getAbsoluteMediaUrl, getCanonicalUrl, getSiteDescription, getSiteName, getSiteUrl } from "../../lib/site";
import { referenceAssets } from "../../lib/reference-assets";

export const revalidate = 60;

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
    q?: string;
  }>;
};

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const [settings, categories] = await Promise.all([getSettings(), getCategories(24)]);
  const activeCategory = categories.find((category) => category.slug === params.category);
  const siteName = getSiteName(settings) || "Kanakshi Fine Jewellery";
  const description = activeCategory
    ? `Shop ${activeCategory.name.toLowerCase()} in 925 sterling silver, gold, and certified lab diamonds from ${siteName}.`
    : getSiteDescription(settings);

  const canonicalPath = activeCategory ? `/shop?category=${activeCategory.slug}` : "/shop";
  const siteUrl = getSiteUrl(settings);
  const ogImage = getAbsoluteMediaUrl(settings?.og_image || "/og-image.jpg", settings) || `${siteUrl}/og-image.jpg`;
  const pageTitle = activeCategory ? `${activeCategory.name} Collection | ${siteName}` : `Fine Jewellery Shop | ${siteName}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: getCanonicalUrl(canonicalPath, settings),
      siteName,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${pageTitle} - ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
      site: "@KanakshiJewels",
      creator: "@KanakshiJewels",
    },
  };
}

const categorySubtitles: Record<string, string> = {
  rings: "Solitaire rings, matching couple promise bands, cocktail accents & daily-wear 925 silver rings.",
  earrings: "Brilliant solitaires, hoops, huggies, teardrop danglers, and heritage jhumkas.",
  necklaces: "Heart lockets, chains, chokers, personalised name necklaces & solitaire pendants.",
  bracelets: "Continuous tennis bracelets, charm cuffs, evil eye talismans & mangalsutra bracelets.",
  "gold-lab-diamonds": "14K & 18K solid real gold certified with ethically grown DEF color lab diamonds.",
  "silver-jewellery": "Pure 925 sterling silver hallmarked with anti-tarnish rhodium protective coating.",
  mangalsutra: "Contemporary minimalist and everyday solitaires for modern brides.",
  "mens-jewellery": "Diamond-cut Cuban chains, rugged oxidized rings, and masculine silver bracelets.",
  "gifting-edits": "Curated luxury gift boxes with velvet pouch, certificate card, and personal note."
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [settings, categories] = await Promise.all([getSettings(), getCategories(12)]);
  const query = new URLSearchParams();
  const activeSort = params.sort || "popularity";
  const sortMap: Record<string, string> = {
    newest: "newest",
    "price-asc": "price_asc",
    "price-desc": "price_desc",
    popularity: "popular",
    bestseller: "bestseller"
  };

  query.set("per_page", "24");
  query.set("sort", sortMap[activeSort] || "popular");

  if (params.category) {
    query.set("category", params.category);
  }

  if (params.min_price) {
    query.set("min_price", params.min_price);
  }

  if (params.max_price) {
    query.set("max_price", params.max_price);
  }

  if (params.q) {
    query.set("q", params.q);
  }

  const products = await getProducts(query.toString());
  const currencySymbol = settings.site_currency_symbol || "₹";
  const activeCategory = categories.find((category) => category.slug === params.category);

  const curatedShopSlides = [
    {
      alt: "Fine Jewellery Bestsellers Collection",
      title: activeCategory ? `${activeCategory.name} Collection` : "Fine Jewellery Edit",
      eyebrow: "Certified 925 Silver & Real Gold",
      subtitle: activeCategory?.slug && categorySubtitles[activeCategory.slug]
        ? categorySubtitles[activeCategory.slug]
        : "Discover fine everyday jewellery crafted in pure hallmarked 925 Sterling Silver & Lab Diamonds.",
      image: activeCategory?.image ? resolveAssetUrl(activeCategory.image) : referenceAssets.hero.primary,
      href: "/shop?sort=bestseller"
    }
  ];

  const quickFilterChips = [
    { label: "All Jewellery", href: "/shop", active: !params.category },
    { label: "Rings", href: "/shop?category=rings", active: params.category === "rings" },
    { label: "Earrings", href: "/shop?category=earrings", active: params.category === "earrings" },
    { label: "Necklaces", href: "/shop?category=necklaces", active: params.category === "necklaces" },
    { label: "Bracelets", href: "/shop?category=bracelets", active: params.category === "bracelets" },
    { label: "Gold & Lab Diamonds", href: "/shop?category=gold-lab-diamonds", active: params.category === "gold-lab-diamonds" },
    { label: "925 Silver", href: "/shop?category=silver-jewellery", active: params.category === "silver-jewellery" },
    { label: "Men's", href: "/shop?category=mens-jewellery", active: params.category === "mens-jewellery" },
    { label: "Gifts & Hampers", href: "/shop?category=gifting-edits", active: params.category === "gifting-edits" }
  ];

  return (
    <div className="shop-page-wrapper">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: activeCategory ? activeCategory.name : "Fine Jewellery Collection",
          description: activeCategory ? categorySubtitles[activeCategory.slug] || activeCategory.description : "All Fine Jewellery",
          url: getCanonicalUrl(activeCategory ? `/shop?category=${activeCategory.slug}` : "/shop", settings)
        }}
      />

      {/* Header Banner */}
      <HeroSlider slides={curatedShopSlides} />

      <div className="kanakshi-container" style={{ paddingTop: "28px", paddingBottom: "72px" }}>
        {/* Breadcrumbs & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "16px" }}>
          <Link href="/" style={{ color: "var(--kanakshi-text-muted)" }}>Home</Link>
          <span>/</span>
          <Link href="/shop" style={{ color: "var(--kanakshi-text-muted)" }}>Shop</Link>
          {activeCategory && (
            <>
              <span>/</span>
              <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>{activeCategory.name}</span>
            </>
          )}
          {params.q && (
            <>
              <span>/</span>
              <span style={{ color: "var(--kanakshi-black)", fontWeight: "600" }}>Search: &ldquo;{params.q}&rdquo;</span>
            </>
          )}
        </div>

        {/* Quick Filter Pill Chips */}
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "12px", marginBottom: "28px" }}>
          {quickFilterChips.map((chip, idx) => (
            <Link
              key={idx}
              href={chip.href}
              className={`kanakshi-pdp-pill${chip.active ? " active" : ""}`}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {chip.label}
            </Link>
          ))}
        </div>

        {/* Controls Bar: Count & Sort */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            padding: "16px 20px",
            background: "var(--kanakshi-bg-alt)",
            borderRadius: "var(--radius-md)",
            marginBottom: "32px",
            border: "1px solid var(--kanakshi-border)"
          }}
        >
          <div style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--kanakshi-black)" }}>
            Showing <strong>{products.items.length}</strong> items in fine jewellery
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <ShopPriceFilter />
            <ShopSortSelect />
          </div>
        </div>

        {/* Product Grid */}
        <ShopProductList
          initialProducts={products.items}
          initialPagination={products.pagination}
          baseQuery={query.toString()}
          currencySymbol={currencySymbol}
        />

        {/* Trust Guarantees */}
        <div style={{ marginTop: "64px" }}>
          <KanakshiTrustBadges />
        </div>
      </div>
    </div>
  );
}
