"use client";

import Image from "next/image";
import Link from "next/link";

import { formatPrice, resolveAssetUrl } from "../lib/api";
import { getProductPath } from "../lib/site";
import { SiteSettings } from "../lib/types";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";

export function WishlistView({ settings }: { settings: SiteSettings }) {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem, getItemQuantity } = useCart();
  const currencySymbol = settings.site_currency_symbol || "₹";

  if (!items.length) {
    return (
      <div className="cart-empty-state">
        <div className="empty-cart-icon-container" style={{ background: "rgba(168, 127, 67, 0.1)" }}>
          <svg
            viewBox="0 0 24 24"
            className="empty-cart-svg"
            aria-hidden="true"
            style={{ color: "#a87f43" }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <p className="eyebrow">Your Favorites</p>
        <h1 className="page-title">Your Wishlist is Empty</h1>
        <p className="shop-intro">Browse our catalog to shortlist your favorite handcrafted brass pooja articles, home decor, and premium gifting pieces.</p>
        <Link href="/shop" className="primary-button continue-shopping-btn" style={{ background: "linear-gradient(135deg, #a87f43, #d4af37)", border: "none" }}>
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout" style={{ display: "block", maxWidth: "880px", margin: "0 auto" }}>
      <div className="cart-list-container" style={{ width: "100%" }}>
        <div className="cart-header">
          <h1 className="cart-title">Your Wishlist</h1>
          <span className="cart-count-badge" style={{ background: "linear-gradient(135deg, #a87f43, #d4af37)" }}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="cart-list">
          {items.map((item) => {
            const quantityInCart = getItemQuantity(item.slug);

            return (
              <article key={item.slug} className="cart-item-card">
                <div className="cart-item-media">
                  <Link href={getProductPath({ slug: item.slug, category_slug: null })} className="cart-item-media-shell">
                    <Image
                      src={resolveAssetUrl(item.image)}
                      alt={item.name}
                      fill
                      sizes="(max-width: 760px) 80px, 120px"
                      className="cart-item-image"
                      priority
                    />
                  </Link>
                </div>

                <div className="cart-item-copy">
                  <div className="cart-item-head">
                    <div className="product-info">
                      <p className="product-category">{item.categoryName || "Signature Edit"}</p>
                      <Link href={getProductPath({ slug: item.slug, category_slug: null })} className="product-title-link">
                        <h2 className="product-name">{item.name}</h2>
                      </Link>
                    </div>
                    
                    <div className="price-and-delete">
                      <p className="detail-price">{formatPrice(item.price, currencySymbol)}</p>
                      <button
                        type="button"
                        className="cart-item-delete-btn"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.slug)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="trash-icon"
                          aria-hidden="true"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-foot" style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      type="button"
                      className="primary-button"
                      style={{
                        padding: "0.6rem 1.4rem",
                        fontSize: "0.75rem",
                        minHeight: "auto",
                        borderRadius: "999px",
                        background: "linear-gradient(135deg, #a87f43, #d4af37)",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        // Cast WishlistItem to format accepted by useCart
                        addItem({
                          id: item.id,
                          slug: item.slug,
                          name: item.name,
                          price: item.price,
                          images: [{ image_path: item.image, is_primary: true }],
                          category_name: item.categoryName,
                        } as any);
                      }}
                    >
                      {quantityInCart > 0 ? `In Cart (${quantityInCart})` : "Add to Cart"}
                    </button>
                    
                    <Link href={getProductPath({ slug: item.slug, category_slug: null })} className="text-link view-product-link" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        
        <div className="cart-actions-bottom" style={{ borderTop: "1px solid var(--line)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
          <Link href="/shop" className="secondary-button back-to-shop-btn">
            ← Continue Shopping
          </Link>
          <button type="button" className="clear-cart-text-btn" onClick={clearWishlist} style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>
            Clear Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
