import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "../../../../components/structured-data";
import { ProductDetailActions } from "../../../../components/product-detail-actions";
import { ProductCard } from "../../../../components/product-card";
import { OffersWidget } from "../../../../components/offers-widget";
import { ProductGallery } from "../../../../components/product-gallery";
import { UrgencyTimer } from "../../../../components/urgency-timer";
import { ProductReviews } from "../../../../components/product-reviews";
import { PRODUCT_PLACEHOLDER_IMAGE, formatPrice, getPrimaryImage, getProduct, getProducts, getSettings, parseProductImages, resolveAssetUrl, parseBulletPoints, getActiveCoupons, isProductSellable } from "../../../../lib/api";
import { referenceAssets } from "../../../../lib/reference-assets";
import { getCanonicalUrl, getProductPath, getSiteDescription, getSiteName, getProductRenderKey } from "../../../../lib/site";

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
      slug: product.slug
    }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const [settings, product] = await Promise.all([getSettings(), getProduct(slug)]);
  const siteName = getSiteName(settings);
  const fallbackDescription = getSiteDescription(settings);

  if (!product || product.category_slug !== category) {
    return {
      title: "Product Not Found",
      description: fallbackDescription
    };
  }

  const description = product.meta_desc || product.short_desc || product.description || fallbackDescription;
  const image = getPrimaryImage(product);
  const canonicalPath = getProductPath(product);

  return {
    title: product.meta_title || product.name,
    description,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title: `${product.name} | ${siteName}`,
      description,
      url: getCanonicalUrl(canonicalPath, settings),
      images: [
        {
          url: image,
          alt: product.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteName}`,
      description,
      images: [image]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, category } = await params;
  const [settings, product, activeCoupons] = await Promise.all([
    getSettings(),
    getProduct(slug),
    getActiveCoupons()
  ]);

  if (!product || product.category_slug !== category) {
    notFound();
  }

  // Fetch related products in the same category
  const relatedProductsResponse = await getProducts(`category=${encodeURIComponent(product.category_slug || category)}&per_page=4`);
  const relatedProducts = relatedProductsResponse.items
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  const currencySymbol = settings.site_currency_symbol || "₹";
  const isSellable = isProductSellable(product);
  const gallery = parseProductImages(product.images);
  const images = gallery.length
    ? gallery.map((image) => resolveAssetUrl(image))
    : [PRODUCT_PLACEHOLDER_IMAGE];
  const description = product.meta_desc || product.short_desc || product.description || getSiteDescription(settings);
  const canonicalPath = getProductPath(product);
  const bulletPoints = parseBulletPoints(product.bullet_points);
  const productSpecs = [
    product.material ? { label: "Material", value: product.material } : null,
    product.size_label ? { label: "Size", value: product.size_label } : null,
    product.length ? { label: "Length", value: `${product.length} ${product.dimension_unit || "cm"}` } : null,
    product.width ? { label: "Width", value: `${product.width} ${product.dimension_unit || "cm"}` } : null,
    product.height ? { label: "Height", value: `${product.height} ${product.dimension_unit || "cm"}` } : null,
    product.weight ? { label: "Weight", value: `${product.weight} ${product.weight_unit || "kg"}` } : null,
  ].filter(Boolean) as Array<{ label: string; value: string | number }>;

  let productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.meta_title || product.name,
    description,
    image: images,
    category: product.category_name || undefined,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: getSiteName(settings)
    },
    offers: {
      "@type": "Offer",
      priceCurrency: settings.site_currency || "INR",
      price: Number(product.effective_price ?? product.price ?? 0),
      availability: isSellable ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: getCanonicalUrl(canonicalPath, settings)
    }
  };

  if (product.custom_schema) {
    try {
      productJsonLd = JSON.parse(product.custom_schema) as Record<string, unknown>;
    } catch {
      // Ignore invalid custom schema and fall back to generated JSON-LD.
    }
  }

  const relatedMoments = [
    {
      title: "Crafted For Sacred Corners",
      copy: "Use it to create a richer altar, console story, or celebratory vignette at home.",
      image: referenceAssets.collections.poojaDecor
    },
    {
      title: "Meaningful Gifting",
      copy: "A strong choice for housewarmings, wedding hampers, festive exchanges, and milestone keepsakes.",
      image: referenceAssets.founderAndBrand.weddingGift
    }
  ];

  return (
    <main className="page-shell">
      <StructuredData data={productJsonLd} />
      
      {/* Breadcrumb Navigation Trail */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <div className="container">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/shop">Shop</Link>
          <span className="separator">/</span>
          <Link href={`/shop?category=${product.category_slug || category}`} style={{ textTransform: "capitalize" }}>
            {product.category_name || (product.category_slug || category).replace(/-/g, " ")}
          </Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </div>
      </nav>

      <section className="product-hero">
        <div className="container product-detail-grid">
          {/* Interactive Multi-Image Gallery component with fullscreen lightbox option */}
          <ProductGallery images={images} productName={product.name} />

          <div className="product-detail-copy">
            <p className="eyebrow">{product.category_name || "Signature Product"}</p>
            <h1 className="page-title">{product.name}</h1>
            <div className="product-rating-inline">
              <span>{`${"★".repeat(Math.max(0, Math.min(5, Math.round(Number(product.avg_rating || 0))))) || "☆☆☆☆☆"}`}</span>
              <strong>{Number(product.avg_rating || 0).toFixed(1)}</strong>
              <small>{Number(product.review_count || 0)} verified review{Number(product.review_count || 0) === 1 ? "" : "s"}</small>
            </div>
            <p className={`detail-price${isSellable ? "" : " detail-price-coming-soon"}`}>
              {isSellable ? formatPrice(product.effective_price ?? product.price, currencySymbol) : "Coming Soon"}
            </p>
            {product.short_desc ? <p className="detail-lead">{product.short_desc}</p> : null}

            {/* Boutique Trust Stamps / Badges Strip */}
            <div className="luxury-trust-badges">
              <div className="trust-badge-card">
                <div className="badge-stamp-wrapper">
                  <svg className="badge-stamp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span className="badge-stamp-ring"></span>
                </div>
                <div className="badge-label-stack">
                  <span className="badge-title">Pure Solid Brass</span>
                  <span className="badge-subtitle">Authentic & Everlasting</span>
                </div>
              </div>

              <div className="trust-badge-card">
                <div className="badge-stamp-wrapper">
                  <svg className="badge-stamp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="badge-stamp-ring"></span>
                </div>
                <div className="badge-label-stack">
                  <span className="badge-title">Artisan Handcrafted</span>
                  <span className="badge-subtitle">Generational Legacy</span>
                </div>
              </div>

              <div className="trust-badge-card">
                <div className="badge-stamp-wrapper">
                  <svg className="badge-stamp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                  <span className="badge-stamp-ring"></span>
                </div>
                <div className="badge-label-stack">
                  <span className="badge-title">Premium Gift Box</span>
                  <span className="badge-subtitle">Festive Ready Presentation</span>
                </div>
              </div>
            </div>

            <div className="detail-meta-strip">
              <span>Hand-finished aesthetic</span>
              <span>Premium gifting appeal</span>
              <span>Pan India delivery</span>
            </div>

            {product.description ? <p className="detail-body">{product.description}</p> : null}

            {productSpecs.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: "0.8rem",
                  padding: "1.1rem 1.2rem",
                  border: "1px solid var(--line)",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.66)",
                  marginTop: "1.1rem",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1rem" }}>Product Specifications</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "0.7rem",
                  }}
                >
                  {productSpecs.map((spec) => (
                    <div
                      key={spec.label}
                      style={{
                        padding: "0.85rem 0.9rem",
                        borderRadius: "16px",
                        border: "1px solid var(--line)",
                        background: "rgba(255,255,255,0.72)",
                      }}
                    >
                      <small style={{ display: "block", color: "var(--muted)", marginBottom: "0.25rem" }}>{spec.label}</small>
                      <strong style={{ fontSize: "0.96rem" }}>{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Bullet Points Checklist */}
            {bulletPoints.length > 0 && (
              <div className="product-bullets-container">
                <h3 className="bullets-title">Key Elements</h3>
                <ul className="bullet-list">
                  {bulletPoints.map((point, index) => (
                    <li key={index} className="bullet-item">
                      <svg className="bullet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="bullet-text">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exclusive Offers Widget */}
            {isSellable ? (
              <div className="product-offers-container" style={{ marginTop: "1.5rem" }}>
                <OffersWidget coupons={activeCoupons} />
              </div>
            ) : (
              <div className="coming-soon-panel">
                <strong>Catalog listing is live</strong>
                <p>This product is visible now and will become buyable automatically once final images and pricing are completed in admin.</p>
              </div>
            )}

            <div className="detail-callout">
              <strong>Why it stands out</strong>
              <p>
                Rich texture, ceremonial warmth, and display-ready proportions make this piece ideal for premium homes and
                festive gifting edits.
              </p>
            </div>

            <ProductDetailActions product={product} />
            
            {/* Scarcity Ticking Countdown Timer */}
            {isSellable ? <UrgencyTimer /> : null}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container product-story-layout">
          <div className="product-story-copy">
            <p className="eyebrow">Crafted With Purpose</p>
            <h2>Designed To Feel Special The Moment It Is Placed</h2>
            <p>
              Each piece from Little Divinity is carefully selected for its finish quality, weight, and display
              presence. Whether placed on an altar, gifted at a celebration, or styled as a statement piece — our
              brass and heritage decor is built to last a lifetime and tell a story worth sharing.
            </p>
          </div>

          <div className="product-story-grid">
            {relatedMoments.map((moment) => (
              <article key={moment.title} className="product-story-card">
                <Image src={moment.image} alt={moment.title} width={800} height={800} sizes="(max-width: 900px) 100vw, 33vw" />
                <div>
                  <h3>{moment.title}</h3>
                  <p>{moment.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products Accents Tray */}
      {relatedProducts.length > 0 && (
        <section className="content-section related-products-section" style={{ borderTop: "1px solid var(--line)", paddingTop: "4rem" }}>
          <div className="container">
            <div className="section-header" style={{ marginBottom: "2.5rem" }}>
              <p className="eyebrow">Complete The Altar</p>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", color: "var(--accent-deep)", fontWeight: 600 }}>Related Accents</h2>
            </div>
            <div className="product-grid shop-product-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {relatedProducts.map((item) => (
                <ProductCard key={getProductRenderKey(item)} product={item} currencySymbol={currencySymbol} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <ProductReviews
        productName={product.name}
        productSlug={product.slug}
        initialAverage={Number(product.avg_rating || 0)}
        initialCount={Number(product.review_count || 0)}
      />
    </main>
  );
}
