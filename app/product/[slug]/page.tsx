import Link from "next/link";
import { notFound } from "next/navigation";

import { formatPrice, getPrimaryImage, getProduct, getSettings, parseProductImages } from "../../../lib/api";
import { referenceAssets } from "../../../lib/reference-assets";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [settings, product] = await Promise.all([getSettings(), getProduct(slug)]);

  if (!product) {
    notFound();
  }

  const currencySymbol = settings.site_currency_symbol || "₹";
  const gallery = parseProductImages(product.images);
  const images = gallery.length
    ? gallery
    : [getPrimaryImage(product), referenceAssets.productHighlights.candleStand, referenceAssets.productHighlights.frame];

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
      <section className="product-hero">
        <div className="container product-detail-grid">
          <div className="product-detail-media">
            <img src={getPrimaryImage(product)} alt={product.name} className="product-detail-main" />
            <div className="product-thumb-row">
              {images.slice(0, 4).map((image, index) => (
                <img key={`${product.slug}-${index}`} src={image} alt={`${product.name} ${index + 1}`} />
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
                <img src={moment.image} alt={moment.title} />
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
