import Link from "next/link";

import { discountPercent, formatPrice, getPrimaryImage } from "../lib/api";
import { Product } from "../lib/types";

type ProductCardProps = {
  product: Product;
  currencySymbol: string;
};

export function ProductCard({ product, currencySymbol }: ProductCardProps) {
  const discount = discountPercent(product);
  const currentPrice = formatPrice(product.effective_price ?? product.price, currencySymbol);
  const comparePrice =
    Number(product.sale_price || 0) > 0 && Number(product.sale_price || 0) < Number(product.price)
      ? formatPrice(product.price, currencySymbol)
      : null;

  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-media">
        <img src={getPrimaryImage(product)} alt={product.name} />
        <div className="product-corner-actions">
          <span className="product-icon-button">♡</span>
          <span className="product-icon-button">◌</span>
        </div>
        <div className="product-overlay-actions">
          <span>Quick View</span>
        </div>
        {discount ? <span className="product-badge">Sale {discount}%</span> : null}
      </Link>

      <div className="product-copy">
        <p className="product-category">{product.category_name || "Signature Edit"}</p>
        <Link href={`/product/${product.slug}`} className="product-title">
          {product.name}
        </Link>
        {product.short_desc ? <p className="product-snippet">{product.short_desc}</p> : null}
        <div className="price-row">
          <strong>{currentPrice}</strong>
          {comparePrice ? <span>{comparePrice}</span> : null}
        </div>
        <div className="product-card-actions">
          <span className="product-card-action">Add To Cart</span>
          <span className="product-card-action muted">Wishlist</span>
        </div>
      </div>
    </article>
  );
}
