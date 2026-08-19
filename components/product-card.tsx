"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { discountPercent, formatPrice, getPrimaryImage, isProductSellable } from "../lib/api";
import { getProductPath } from "../lib/site";
import { Product } from "../lib/types";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";
import { QuickViewModal } from "./quick-view-modal";

type ProductCardProps = {
  product: Product;
  currencySymbol: string;
};

export function ProductCard({ product, currencySymbol }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addItem, getItemQuantity } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  const isSellable = isProductSellable(product);
  const discount = discountPercent(product);
  const currentPrice = isSellable
    ? formatPrice(product.effective_price ?? product.price, currencySymbol)
    : "Coming Soon";
  const productPath = getProductPath(product);
  const comparePrice =
    isSellable && Number(product.sale_price || 0) > 0 && Number(product.sale_price || 0) < Number(product.price)
      ? formatPrice(product.price, currencySymbol)
      : null;

  const isWishlisted = hasItem(product.slug);
  const inCartQty = getItemQuantity(product.slug);

  // Extract images for dual hover
  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
    ? JSON.parse(product.images || "[]")
    : [];

  const primaryImg = getPrimaryImage(product);
  const secondaryImg = images.length > 1 ? images[1] : primaryImg;

  // Derive purity badge from product material or category
  const materialText = (product.material || "").toLowerCase();
  let purityBadge = "925 Silver";
  if (materialText.includes("18k") || materialText.includes("gold") || (product.category_slug || "").includes("gold")) {
    purityBadge = "18K Gold";
  } else if (materialText.includes("diamond") || (product.category_slug || "").includes("diamond")) {
    purityBadge = "Lab Diamond";
  } else if (materialText.includes("rose")) {
    purityBadge = "Rose Gold";
  }

  const ratingVal = product.avg_rating || "4.8";
  const reviewCount = product.review_count ? `${product.review_count}` : "1.2k";

  return (
    <article className="kanakshi-card">
      <div className="kanakshi-card-media">
        <Link href={productPath} style={{ display: "block", position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <Image
            src={primaryImg}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="kanakshi-card-img-primary"
            priority={false}
          />
          {secondaryImg && secondaryImg !== primaryImg && (
            <Image
              src={secondaryImg}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="kanakshi-card-img-secondary"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="kanakshi-card-badges">
          {product.is_featured && (
            <span className="kanakshi-badge kanakshi-badge-bestseller">Best Seller</span>
          )}
          <span className="kanakshi-badge kanakshi-badge-silver">{purityBadge}</span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`kanakshi-card-wishlist${isWishlisted ? " active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem(product);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Rating Chip */}
        <div className="kanakshi-card-rating">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" className="kanakshi-card-rating-star">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{ratingVal}</span>
          <span style={{ color: "var(--kanakshi-text-muted)", marginLeft: "2px" }}>({reviewCount})</span>
        </div>
      </div>

      <div className="kanakshi-card-body">
        <div className="kanakshi-card-material">
          {product.material || `${purityBadge} • AAA+ CZ`}
        </div>

        <Link href={productPath} className="kanakshi-card-title">
          {product.name}
        </Link>

        <div className="kanakshi-card-price-row">
          <span className="kanakshi-card-sale-price">{currentPrice}</span>
          {comparePrice && (
            <span className="kanakshi-card-regular-price">{comparePrice}</span>
          )}
          {discount ? (
            <span className="kanakshi-card-discount-pill">{discount}% OFF</span>
          ) : null}
        </div>

        <div className="kanakshi-card-delivery-tag">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>Express 2-Day Delivery</span>
        </div>

        {isSellable && (
          <button
            type="button"
            className="kanakshi-card-quick-add"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product, 1);
            }}
          >
            {inCartQty > 0 ? `In Bag (${inCartQty}) +` : "Add to Cart"}
          </button>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        currencySymbol={currencySymbol}
      />
    </article>
  );
}
