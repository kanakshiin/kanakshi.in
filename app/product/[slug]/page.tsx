import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "../../../components/structured-data";
import { formatPrice, getPrimaryImage, getProduct, getProducts, getSettings, parseProductImages, resolveAssetUrl } from "../../../lib/api";
import { referenceAssets } from "../../../lib/reference-assets";
import { getCanonicalUrl, getSiteDescription, getSiteName } from "../../../lib/site";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProducts("per_page=24&sort=popular");
  return products.items.slice(0, 24).map((product) => ({
    slug: product.slug
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [settings, product] = await Promise.all([getSettings(), getProduct(slug)]);
  const siteName = getSiteName(settings);
  const fallbackDescription = getSiteDescription(settings);

  if (!product) {
    return {
      title: "Product Not Found",
      description: fallbackDescription
    };
  }

  const description = product.meta_desc || product.short_desc || product.description || fallbackDescription;
  const image = getPrimaryImage(product);

  return {
    title: product.meta_title || product.name,
    description,
    alternates: {
      canonical: `/product/${product.slug}`
    },
    openGraph: {
      title: `${product.name} | ${siteName}`,
      description,
      url: getCanonicalUrl(`/product/${product.slug}`, settings),
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
  const { slug } = await params;
  const [settings, product] = await Promise.all([getSettings(), getProduct(slug)]);

  if (!product) {
    notFound();
  }

  const currencySymbol = settings.site_currency_symbol || "₹";
  const gallery = parseProductImages(product.images);
  const images = gallery.length
    ? gallery.map((image) => resolveAssetUrl(image))
    : [getPrimaryImage(product), referenceAssets.productHighlights.candleStand, referenceAssets.productHighlights.frame];
  const description = product.meta_desc || product.short_desc || product.description || getSiteDescription(settings);
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
      availability: "https://schema.org/InStock",
      url: getCanonicalUrl(`/product/${product.slug}`, settings)
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
      <section className="product-hero">
        <div className="container product-detail-grid">
          <div className="product-detail-media">
            <Image
              src={getPrimaryImage(product)}
              alt={product.name}
              className="product-detail-main"
              width={1200}
              height={1344}
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className="product-thumb-row">
              {images.slice(0, 4).map((image, index) => (
                <Image
                  key={`${product.slug}-${index}`}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={320}
                  height={320}
                  sizes="(max-width: 900px) 25vw, 12vw"
                />
              ))}
            </div>
          </div>

          <div className="product-detail-copy">
            <p className="eyebrow">{product.category_name || "Signature Product"}</p>
            <h1 className="page-title">{product.name}</h1>
            <p className="detail-price">{formatPrice(product.effective_price ?? product.price, currencySymbol)}</p>
            {product.short_desc ? <p className="detail-lead">{product.short_desc}</p> : null}

            <div className="detail-meta-strip">
              <span>Hand-finished aesthetic</span>
              <span>Premium gifting appeal</span>
              <span>Pan India delivery</span>
            </div>

            {product.description ? <p className="detail-body">{product.description}</p> : null}

            <div className="detail-callout">
              <strong>Why it stands out</strong>
              <p>
                Rich texture, ceremonial warmth, and display-ready proportions make this piece ideal for premium homes and
                festive gifting edits.
              </p>
            </div>

            <div className="hero-actions">
              <Link href="/shop" className="primary-button">
                Shop Similar Pieces
              </Link>
              <button type="button" className="secondary-button">
                Add To Wishlist
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container product-story-layout">
          <div className="product-story-copy">
            <p className="eyebrow">Display Story</p>
            <h2>Designed To Feel Special The Moment It Is Placed</h2>
            <p>
              This product page is shaped like a premium handcrafted decor storefront: strong imagery first, quieter details
              second, and enough breathing room for the object to feel elevated.
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
    </main>
  );
}
