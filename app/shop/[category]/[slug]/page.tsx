import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "../../../../components/structured-data";
import { ProductDetailActions } from "../../../../components/product-detail-actions";
import { ProductCard } from "../../../../components/product-card";
import { OffersWidget } from "../../../../components/offers-widget";
import { ProductGallery } from "../../../../components/product-gallery";
import { ProductReviews } from "../../../../components/product-reviews";
import { PdpPincodeChecker } from "../../../../components/pdp-pincode-checker";
import {
  PRODUCT_PLACEHOLDER_IMAGE,
  formatPrice,
  getPrimaryImage,
  getProduct,
  getProducts,
  getSettings,
  parseProductImages,
  resolveAssetUrl,
  parseBulletPoints,
  getActiveCoupons,
  isProductSellable,
} from "../../../../lib/api";
import { getAbsoluteMediaUrl, getCanonicalUrl, getProductPath, getSiteDescription, getSiteName, getSiteUrl } from "../../../../lib/site";
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "../../../../lib/schema-generator";

export const revalidate = 60;

type ProductPageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProducts("per_page=24&sort=popular");
  return products.items
    .filter((product) => product.category_slug)
    .slice(0, 24)
    .map((product) => ({
      category: product.category_slug as string,
      slug: product.slug,
    }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const [settings, product] = await Promise.all([getSettings(), getProduct(slug)]);
  const siteName = getSiteName(settings) || "Kanakshi Fine Jewellery";
  const fallbackDescription = getSiteDescription(settings);

  if (!product || product.category_slug !== category) {
    return { title: "Product Not Found", description: fallbackDescription };
  }

  const description = product.meta_desc || product.short_desc || product.description || fallbackDescription;
  const rawImage = getPrimaryImage(product);
  const absoluteImage = getAbsoluteMediaUrl(rawImage, settings) || rawImage;
  const canonicalPath = getProductPath(product);
  const pageUrl = getCanonicalUrl(canonicalPath, settings);

  return {
    title: `${product.name} | ${siteName}`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${product.name} | ${siteName}`,
      description,
      url: pageUrl,
      siteName,
      type: "website",
      images: [
        {
          url: absoluteImage,
          alt: product.name,
          width: 800,
          height: 800,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteName}`,
      description,
      images: [absoluteImage],
      site: "@KanakshiJewels",
      creator: "@KanakshiJewels",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, category } = await params;
  const [settings, product, activeCoupons] = await Promise.all([
    getSettings(),
    getProduct(slug),
    getActiveCoupons(),
  ]);

  if (!product || product.category_slug !== category) {
    notFound();
  }

  const relatedProductsResponse = await getProducts(
    `category=${encodeURIComponent(product.category_slug || category)}&per_page=8`
  );
  const relatedProducts = relatedProductsResponse.items
    .filter((item) => item.id !== product.id)
    .filter((item) => {
      const imgs = parseProductImages(item.images);
      return imgs.length > 0;
    })
    .slice(0, 4);

  const currencySymbol = settings.site_currency_symbol || "₹";
  const isSellable = isProductSellable(product);
  const gallery = parseProductImages(product.images);
  const images = gallery.length
    ? gallery.map((image) => resolveAssetUrl(image))
    : [PRODUCT_PLACEHOLDER_IMAGE];

  const description = product.meta_desc || product.short_desc || product.description || getSiteDescription(settings);
  const canonicalPath = getProductPath(product);
  const bulletPoints = parseBulletPoints(product.bullet_points);

  const hasDiscount =
    product.sale_price &&
    Number(product.sale_price) > 0 &&
    Number(product.sale_price) < Number(product.price);
  const savingsAmount = hasDiscount
    ? Number(product.price) - Number(product.sale_price)
    : 0;
  const savingsPct = hasDiscount
    ? Math.round((savingsAmount / Number(product.price)) * 100)
    : 0;

  const emiPerMonth = Math.round(Number(product.effective_price ?? product.price) / 3);
  const isRingCategory = category.toLowerCase().includes("ring") || (product.category_name || "").toLowerCase().includes("ring");

  const productJsonLd = generateProductJsonLd(product, settings);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: getCanonicalUrl("/", settings) },
    { name: "Shop", url: getCanonicalUrl("/shop", settings) },
    { name: product.category_name || category, url: getCanonicalUrl(`/shop?category=${product.category_slug || category}`, settings) },
    { name: product.name, url: getCanonicalUrl(canonicalPath, settings) },
  ]);

  return (
    <main className="kanakshi-container" style={{ paddingTop: "24px", paddingBottom: "72px" }}>
      <StructuredData data={[productJsonLd, breadcrumbJsonLd]} />

      {/* Breadcrumb Navigation */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "20px" }}>
        <Link href="/" style={{ color: "var(--kanakshi-text-muted)", textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <Link href="/shop" style={{ color: "var(--kanakshi-text-muted)", textDecoration: "none" }}>Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category_slug || category}`} style={{ color: "var(--kanakshi-text-muted)", textDecoration: "none" }}>
          {product.category_name || category}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>{product.name}</span>
      </nav>

      {/* PDP Main 2-Column Grid */}
      <div className="kanakshi-pdp-layout">
        {/* Left Column: Interactive Image Gallery */}
        <div className="kanakshi-pdp-gallery-wrap">
          <ProductGallery images={images} productName={product.name} />
        </div>

        {/* Right Column: Product Info & Actions */}
        <div>
          {/* Collection / Metal Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="kanakshi-badge kanakshi-badge-pink">
              {product.material || "925 Sterling Silver"}
            </span>
            <span className="kanakshi-badge kanakshi-badge-bestseller">
              ★ 4.9 ({product.review_count || "1.2k"} Verified Reviews)
            </span>
          </div>

          {/* Title */}
          <h1 className="kanakshi-pdp-title">{product.name}</h1>

          {/* Luxury Demand Pulse */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--kanakshi-pink-dark)", marginBottom: "16px" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#e9718b" />
            </svg>
            <span><strong>Handcrafted in Limited Studio Batches</strong> • High Demand</span>
          </div>

          {/* Price Block */}
          <div className="kanakshi-pdp-price-box">
            <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", marginBottom: "4px" }}>
              <span className="kanakshi-pdp-current-price">
                {formatPrice(product.effective_price ?? product.price, currencySymbol)}
              </span>
              {hasDiscount && (
                <>
                  <span className="kanakshi-pdp-original-price">
                    {formatPrice(product.price, currencySymbol)}
                  </span>
                  <span className="kanakshi-pdp-discount-tag">
                    {savingsPct}% OFF
                  </span>
                </>
              )}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--kanakshi-text-muted)" }}>
              Inclusive of all taxes • or <strong>₹{emiPerMonth.toLocaleString("en-IN")}/mo</strong> with Cardless 0% EMI
            </div>
          </div>

          {/* Ring Size Selector (Only rendered when viewing Rings) */}
          {isRingCategory && (
            <div className="kanakshi-pdp-selector-group">
              <div className="kanakshi-pdp-selector-title">
                <span>Ring Size</span>
                <span style={{ fontSize: "0.78rem", color: "var(--kanakshi-pink-dark)", fontWeight: "600" }}>
                  Standard Indian Sizing
                </span>
              </div>
              <div className="kanakshi-pdp-pills">
                <button type="button" className="kanakshi-pdp-pill active">Free Size / Adjustable</button>
                <button type="button" className="kanakshi-pdp-pill">Size 10</button>
                <button type="button" className="kanakshi-pdp-pill">Size 12</button>
                <button type="button" className="kanakshi-pdp-pill">Size 14</button>
                <button type="button" className="kanakshi-pdp-pill">Size 16</button>
              </div>
            </div>
          )}

          {/* Action Buttons: Add to Cart / Buy Now / Wishlist / WhatsApp */}
          <ProductDetailActions product={product} />

          {/* Interactive Pincode Delivery Availability Checker */}
          <PdpPincodeChecker />

          {/* Trust Guarantees Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", margin: "20px 0", padding: "16px", background: "var(--kanakshi-bg-alt)", borderRadius: "var(--radius-md)", border: "1px solid var(--kanakshi-border)" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>100% BIS Hallmarked</span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>Anti-Tarnish Rhodium</span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>7-Day Easy Doorstep Return</span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
              <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>Luxury Velvet Gift Box</span>
            </div>
          </div>

          {/* Active Offers & Coupons Widget */}
          {activeCoupons.length > 0 && <OffersWidget coupons={activeCoupons} />}

          {/* Accordion: Specifications & Details */}
          <div style={{ marginTop: "24px" }}>
            <details className="kanakshi-accordion-item" open>
              <summary className="kanakshi-accordion-header">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="6 2 18 2 22 8 12 22 2 8 6 2" />
                    <line x1="2" y1="8" x2="22" y2="8" />
                    <line x1="12" y1="2" x2="8" y2="8" />
                    <line x1="12" y1="2" x2="16" y2="8" />
                    <line x1="8" y1="8" x2="12" y2="22" />
                    <line x1="16" y1="8" x2="12" y2="22" />
                  </svg>
                  Product Specifications
                </span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="kanakshi-accordion-content">
                <table className="kanakshi-specs-table">
                  <tbody>
                    <tr>
                      <td>Precious Metal</td>
                      <td>{product.material || "BIS Hallmarked 925 Sterling Silver"}</td>
                    </tr>
                    <tr>
                      <td>Stone &amp; Sparkle</td>
                      <td>AAA+ Certified Swiss Zirconia / Ethical Lab Diamond</td>
                    </tr>
                    <tr>
                      <td>Plating Coating</td>
                      <td>Anti-Tarnish Rhodium / 18K Real Gold E-Coat</td>
                    </tr>
                    <tr>
                      <td>Gross Weight</td>
                      <td>{product.weight ? `${product.weight} ${product.weight_unit || "g"}` : "Lightweight & Daily Comfort Fit"}</td>
                    </tr>
                    <tr>
                      <td>Purity Hallmark</td>
                      <td>100% Certified with Authenticity Card Included</td>
                    </tr>
                    <tr>
                      <td>Skin Safety</td>
                      <td>100% Hypoallergenic, Lead &amp; Nickel Free</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>

            <details className="kanakshi-accordion-item">
              <summary className="kanakshi-accordion-header">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Story &amp; Craftsmanship
                </span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="kanakshi-accordion-content">
                <p style={{ margin: 0, lineHeight: 1.6 }}>{description}</p>
                {bulletPoints.length > 0 && (
                  <ul style={{ paddingLeft: "18px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {bulletPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            </details>

            <details className="kanakshi-accordion-item">
              <summary className="kanakshi-accordion-header">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  Shipping &amp; 7-Day Doorstep Returns
                </span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="kanakshi-accordion-content">
                <p>
                  • <strong>Free Insured Express Delivery</strong>: Dispatches within 24 hours. Delivered safely in 2-3 business days across India.
                </p>
                <p style={{ marginTop: "6px" }}>
                  • <strong>7-Day Easy Doorstep Returns</strong>: Return or exchange this item within 7 days with complimentary doorstep pickup.
                </p>
                <p style={{ marginTop: "6px" }}>
                  • <strong>Certified Purity Card</strong>: Every jewellery piece is delivered in our plush signature velvet box with an individual authenticity certificate.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div style={{ marginTop: "48px" }}>
        <ProductReviews
          productName={product.name}
          productSlug={product.slug}
          initialAverage={Number(product.avg_rating || 4.9)}
          initialCount={Number(product.review_count || 128)}
        />
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: "64px" }}>
          <div className="kanakshi-section-header">
            <span className="kanakshi-section-eyebrow">Pair It With</span>
            <h2 className="kanakshi-section-title">Complete Your Jewellery Set</h2>
          </div>
          <div className="kanakshi-product-grid">
            {relatedProducts.map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                currencySymbol={currencySymbol}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
