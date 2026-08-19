import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "../../../components/structured-data";
import { ShopProductList } from "../../../components/shop-product-list";
import { ShopSortSelect, ShopPriceFilter } from "../../../components/shop-controls";
import { KanakshiTrustBadges } from "../../../components/kanakshi-trust-badges";
import { getCategories, getProducts, getSettings } from "../../../lib/api";
import { getCanonicalUrl, getSiteDescription, getSiteName } from "../../../lib/site";
import { referenceAssets } from "../../../lib/reference-assets";

export const revalidate = 60;

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
};

const categoryMetaMap: Record<string, { title: string; subtitle: string; description: string; banner: string }> = {
  rings: {
    title: "Designer Rings & Solitaires",
    subtitle: "Everyday 925 Silver, Solitaire Diamonds & Couple Bands",
    description: "Discover handcrafted 925 sterling silver rings, 18K gold statement rings, and certified solitaire bands made for every special moment.",
    banner: referenceAssets.categories.rings,
  },
  earrings: {
    title: "Fine Earrings & Studs",
    subtitle: "Solitaire Studs, Huggies, Danglers & Jhumkas",
    description: "Elevate your look with lightweight 925 sterling silver and 18K rose gold earrings with AAA+ Swiss crystals.",
    banner: referenceAssets.categories.earrings,
  },
  necklaces: {
    title: "Necklaces & Pendants",
    subtitle: "Heart Pendants, Solitaires, Chokers & Chains",
    description: "Timeless necklaces and pendants in pure 925 silver and 18K gold. Anti-tarnish coated for lasting sparkle.",
    banner: referenceAssets.categories.necklaces,
  },
  bracelets: {
    title: "Bracelets & Cuffs",
    subtitle: "Tennis Bracelets, Charm Cuffs & Evil Eye Talismans",
    description: "Make a statement with sparkling continuous tennis bracelets, adjustable charm cuffs, and protection evil eye talismans.",
    banner: referenceAssets.categories.bracelets,
  },
  "gold-lab-diamonds": {
    title: "Gold & Lab-Grown Diamonds",
    subtitle: "Certified 14K & 18K Real Gold with IGI Lab Diamonds",
    description: "Conscious everyday luxury. Real solid hallmarked gold studded with ethical DEF color, VVS clarity lab-grown diamonds.",
    banner: referenceAssets.categories.labDiamonds,
  },
  "silver-jewellery": {
    title: "925 Pure Sterling Silver",
    subtitle: "BIS Hallmarked & Rhodium Anti-Tarnish Finish",
    description: "Classic and contemporary silver jewellery crafted with authentic 925 sterling silver and protective plating.",
    banner: referenceAssets.categories.silver,
  },
  mangalsutra: {
    title: "Modern Mangalsutra Collection",
    subtitle: "Minimalist Elegance for the Modern Bride",
    description: "Delicate 18K gold and 925 silver mangalsutra designs crafted for everyday comfort and everlasting devotion.",
    banner: referenceAssets.categories.mangalsutra,
  },
  "mens-jewellery": {
    title: "Men's Fine Jewellery",
    subtitle: "Cuban Link Chains, Oxidised Rings & Solid Silver Cuffs",
    description: "Bold and masculine solid 925 sterling silver accessories crafted with precision Italian diamond cuts.",
    banner: referenceAssets.categories.men,
  },
  "gifting-edits": {
    title: "Gifts & Curated Luxury Hampers",
    subtitle: "Pre-Packaged in Velvet Gift Boxes with Certificate",
    description: "Express your deepest emotions with our finest jewellery gift hampers, greeting cards, and gift bags.",
    banner: referenceAssets.categories.gifts,
  },
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const catData = categories.find((c) => c.slug === category);
  const siteName = getSiteName(settings) || "Kanakshi Fine Jewellery";
  const fallback = categoryMetaMap[category] || {
    title: catData?.name || "Fine Jewellery",
    subtitle: "Everyday Luxury Jewellery",
    description: catData?.description || getSiteDescription(settings),
  };

  const title = `${fallback.title} | ${siteName}`;
  const canonicalPath = `/shop/${category}`;

  return {
    title,
    description: fallback.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description: fallback.description,
      url: getCanonicalUrl(canonicalPath, settings),
    },
  };
}

export default async function CategoryShopPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const search = await searchParams;

  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  const categoryMeta = categoryMetaMap[category] || {
    title: category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: "Handcrafted Everyday Fine Jewellery",
    description: "Explore our hallmarked 925 sterling silver and 18K gold jewellery collections.",
    banner: referenceAssets.hero.primary,
  };

  const query = new URLSearchParams();
  query.set("category", category);
  if (search.page) query.set("page", search.page);
  if (search.sort) query.set("sort", search.sort);
  if (search.min_price) query.set("min_price", search.min_price);
  if (search.max_price) query.set("max_price", search.max_price);
  query.set("per_page", "24");

  const products = await getProducts(query.toString());
  const currencySymbol = settings.site_currency_symbol || "₹";

  return (
    <div className="kanakshi-container" style={{ paddingTop: "24px", paddingBottom: "72px" }}>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: categoryMeta.title,
          description: categoryMeta.description,
          url: getCanonicalUrl(`/shop/${category}`, settings),
        }}
      />

      {/* Breadcrumbs */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "20px" }}>
        <Link href="/" style={{ color: "var(--kanakshi-text-muted)" }}>Home</Link>
        <span>/</span>
        <Link href="/shop" style={{ color: "var(--kanakshi-text-muted)" }}>Shop</Link>
        <span>/</span>
        <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>{categoryMeta.title}</span>
      </nav>

      {/* Category Hero Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #fff0f3 0%, #fff9fa 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "36px 32px",
          marginBottom: "32px",
          border: "1px solid rgba(233, 113, 139, 0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        <div style={{ maxWidth: "600px" }}>
          <span className="kanakshi-badge kanakshi-badge-pink" style={{ marginBottom: "12px", display: "inline-block" }}>
            Certified Fine Jewellery
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: "600", color: "var(--kanakshi-black)", lineHeight: "1.2", marginBottom: "8px" }}>
            {categoryMeta.title}
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--kanakshi-pink-dark)", fontWeight: "600", marginBottom: "8px" }}>
            {categoryMeta.subtitle}
          </p>
          <p style={{ fontSize: "0.88rem", color: "var(--kanakshi-text-muted)", lineHeight: "1.5" }}>
            {categoryMeta.description}
          </p>
        </div>

        {/* Quick Trust Pill */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#ffffff", padding: "16px 20px", borderRadius: "var(--radius-md)", border: "1px solid var(--kanakshi-border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", fontWeight: "600" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            BIS Hallmarked 925 Silver
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", fontWeight: "600" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Anti-Tarnish Rhodium Polish
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", fontWeight: "600" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            7-Day Easy Returns
          </div>
        </div>
      </div>

      {/* Quick Category Filter Pills */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "16px", marginBottom: "24px", scrollbarWidth: "none" }}>
        <Link
          href="/shop"
          className="kanakshi-pdp-pill"
          style={{ textDecoration: "none", whiteSpace: "nowrap" }}
        >
          All Jewellery
        </Link>
        {categories.map((cat) => {
          const isActive = cat.slug === category;
          return (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className={`kanakshi-pdp-pill ${isActive ? "active" : ""}`}
              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
            >
              {cat.name}
            </Link>
          );
        })}
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
          Showing <strong>{products.items.length}</strong> items in {categoryMeta.title}
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

      {/* Trust Badges */}
      <div style={{ marginTop: "64px" }}>
        <KanakshiTrustBadges />
      </div>
    </div>
  );
}
