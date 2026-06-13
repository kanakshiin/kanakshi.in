"use client";

import { useRouter } from "next/navigation";

import { Product } from "../lib/types";
import { formatPrice, isProductSellable } from "../lib/api";
import { CartQuantityControl } from "./cart-quantity-control";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, getItemQuantity } = useCart();
  const { toggleItem, hasItem } = useWishlist();
  const quantity = getItemQuantity(product.slug);
  const isWishlisted = hasItem(product.slug);
  const isSellable = isProductSellable(product);
  const showAmazonButton = Boolean(product.amazon_button_enabled && product.amazon_link);
  const amazonPriceLabel = product.amazon_price ? formatPrice(product.amazon_price, "₹") : null;

  return (
    <div className="detail-actions-deck">
      <button
        type="button"
        onClick={() => toggleItem(product)}
        className={`wishlist-deck-btn ${isWishlisted ? "active" : ""}`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isWishlisted ? "var(--error, #e53e3e)" : "none"}
          stroke={isWishlisted ? "var(--error, #e53e3e)" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`wishlist-heart-icon ${isWishlisted ? "active-heart" : ""}`}
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      <div className={`action-buttons-grid${showAmazonButton ? " action-buttons-grid--with-amazon" : ""}`}>
        {isSellable ? (
          <>
            {quantity > 0 ? (
              <CartQuantityControl slug={product.slug} className="detail-quantity-wrap" />
            ) : (
              <button
                type="button"
                className="secondary-button"
                style={{ width: "100%", margin: 0 }}
                onClick={() => addItem(product, 1)}
              >
                Add To Cart
              </button>
            )}

            <button
              type="button"
              className="primary-button"
              style={{ width: "100%", margin: 0 }}
              onClick={() => {
                if (quantity === 0) {
                  addItem(product, 1);
                }
                router.push("/checkout");
              }}
            >
              Buy Now
            </button>

            {showAmazonButton ? (
              <a
                href={product.amazon_link as string}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="secondary-button amazon-buy-button"
                style={{ width: "100%", margin: 0, textDecoration: "none" }}
              >
                <span>Buy on Amazon</span>
                {amazonPriceLabel ? <small>{amazonPriceLabel}</small> : null}
              </a>
            ) : null}
          </>
        ) : (
          <>
            <button type="button" className="secondary-button action-button-disabled" style={{ width: "100%", margin: 0 }} disabled aria-disabled="true">
              Coming Soon
            </button>
            <div className="coming-soon-note">
              Add final images and price from admin to make this product buyable.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
