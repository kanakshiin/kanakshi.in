import Link from "next/link";
import { notFound } from "next/navigation";

import { formatPrice, getPrimaryImage, getProduct, getSettings, parseProductImages } from "../../../lib/api";

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

  const currencySymbol = settings.site_currency_symbol || "Rs.";
  const gallery = parseProductImages(product.images);
  const images = gallery.length ? gallery : [getPrimaryImage(product)];

  return (
    <main className="page-shell">
      <section className="content-section">
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
            {product.description ? <p className="detail-body">{product.description}</p> : null}

            <div className="hero-actions">
              <Link href="/shop" className="primary-button">
                Continue Shopping
              </Link>
              <a href={process.env.NEXT_PUBLIC_BACKEND_SITE_URL || "http://127.0.0.1:8000"} className="secondary-button">
                Visit Backend
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
