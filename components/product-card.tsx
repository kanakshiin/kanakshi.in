"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { discountPercent, formatPrice, getPrimaryImage } from "../lib/api";
import { getProductPath } from "../lib/site";
import { Product } from "../lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { QuickViewModal } from "./quick-view-modal";

import { useWishlist } from "./wishlist-provider";

type ProductCardProps = {
  product: Product;
  currencySymbol: string;
};

export function ProductCard({ product, currencySymbol }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const discount = discountPercent(product);
  const currentPrice = formatPrice(product.effective_price ?? product.price, currencySymbol);
  const productPath = getProductPath(product);
  const comparePrice =
    Number(product.sale_price || 0) > 0 && Number(product.sale_price || 0) < Number(product.price)
      ? formatPrice(product.price, currencySymbol)
      : null;

  const { toggleItem, hasItem } = useWishlist();
  const isWishlisted = hasItem(product.slug);

  return (
    <article className="product-card">
      <div className="product-media">
        <Link href={productPath} className="product-media-link" style={{ display: "block", width: "100%", height: "100%", position: "relative" }}>
          <Image
            src={getPrimaryImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </Link>
        <div className="product-corner-actions">
          <button
            type="button"
            className={`product-icon-button${isWishlisted ? " wishlisted-active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product);
            }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
          >
            {isWishlisted ? "♥" : "♡"}
          </button>
          <span className="product-icon-button">◌</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsQuickViewOpen(true);
          }}
          className="product-overlay-actions"
          style={{ border: "none", cursor: "pointer" }}
        >
          Quick View
        </button>
        {discount ? <span className="product-badge">Sale {discount}%</span> : null}
      </div>

      <div className="product-copy">
        <p className="product-category">{product.category_name || "Signature Edit"}</p>
        <Link href={productPath} className="product-title">
          {product.name}
        </Link>
        {product.short_desc ? <p className="product-snippet">{product.short_desc}</p> : null}
        <div className="price-row">
          <strong>{currentPrice}</strong>
          {comparePrice ? <span>{comparePrice}</span> : null}
        </div>
        <div className="product-card-actions">
          <AddToCartButton product={product} />
          <button
            type="button"
            className={`product-card-action ${isWishlisted ? "wishlisted-active" : "muted"}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product);
            }}
          >
            {isWishlisted ? "Wishlisted" : "Wishlist"}
          </button>
        </div>
      </div>

      {/* Quick View Popup Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        currencySymbol={currencySymbol}
      />
    </article>
  );
}

